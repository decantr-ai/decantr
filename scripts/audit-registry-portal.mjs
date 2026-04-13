#!/usr/bin/env node

/**
 * Audit the hosted Decantr registry portal surface.
 *
 * Usage:
 *   node scripts/audit-registry-portal.mjs
 *   node scripts/audit-registry-portal.mjs --report-json=./registry-portal-report.json
 *   node scripts/audit-registry-portal.mjs --summary-markdown=./registry-portal-summary.md
 *   node scripts/audit-registry-portal.mjs --fail-on-error
 *
 * Environment variables:
 *   REGISTRY_PORTAL_URL - Portal base URL (default: https://registry.decantr.ai)
 *   REGISTRY_PORTAL_EXPECTED_BLUEPRINT - Detail slug to verify (default: ai-copilot-shell)
 *   REGISTRY_PORTAL_EXPECTED_NAMESPACE - Detail namespace to verify (default: @official)
 *   FAIL_ON_REGISTRY_PORTAL_ERROR - Set to "true" to exit non-zero when any check fails
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const args = process.argv.slice(2);
const PORTAL_URL = process.env.REGISTRY_PORTAL_URL || 'https://registry.decantr.ai';
const EXPECTED_BLUEPRINT = process.env.REGISTRY_PORTAL_EXPECTED_BLUEPRINT || 'ai-copilot-shell';
const EXPECTED_NAMESPACE = process.env.REGISTRY_PORTAL_EXPECTED_NAMESPACE || '@official';
const REPORT_PATH =
  args.find((arg) => arg.startsWith('--report-json='))?.slice('--report-json='.length) || null;
const SUMMARY_PATH =
  args.find((arg) => arg.startsWith('--summary-markdown='))?.slice('--summary-markdown='.length) || null;
const FAIL_ON_ERROR =
  args.includes('--fail-on-error') || process.env.FAIL_ON_REGISTRY_PORTAL_ERROR === 'true';

function ensureParentDir(path) {
  mkdirSync(dirname(path), { recursive: true });
}

async function fetchText(path, options = {}) {
  const response = await fetch(`${PORTAL_URL}${path}`, options);
  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    path,
    text,
    location: response.headers.get('location'),
  };
}

function summarizeResult(check, response, passed, details) {
  return {
    name: check.name,
    path: check.path,
    status: response.status,
    ok: response.ok,
    passed,
    details,
    location: response.location ?? null,
  };
}

const CHECKS = [
  {
    name: 'homepage',
    path: '/',
    options: {},
    validate(response) {
      return response.ok && response.text.includes('Decantr Registry');
    },
    details(response) {
      return response.text.includes('Decantr Registry') ? 'title present' : 'missing homepage title';
    },
  },
  {
    name: 'legacy-registry-redirect',
    path: '/registry',
    options: { redirect: 'manual' },
    validate(response) {
      return [301, 302, 307, 308].includes(response.status) && response.location === '/';
    },
    details(response) {
      return `location=${response.location ?? 'n/a'}`;
    },
  },
  {
    name: 'blueprint-detail',
    path: `/blueprints/${encodeURIComponent(EXPECTED_NAMESPACE)}/${EXPECTED_BLUEPRINT}`,
    options: {},
    validate(response) {
      return response.ok && response.text.includes('AI Copilot Shell');
    },
    details(response) {
      return response.text.includes('AI Copilot Shell') ? 'detail title present' : 'missing blueprint title';
    },
  },
  {
    name: 'browse-page',
    path: `/browse?type=blueprints&namespace=${encodeURIComponent(EXPECTED_NAMESPACE)}`,
    options: {},
    validate(response) {
      return response.ok && response.text.includes('Registry');
    },
    details(response) {
      return response.text.includes('Registry') ? 'browse shell present' : 'missing browse shell';
    },
  },
  {
    name: 'login-page',
    path: '/login',
    options: {},
    validate(response) {
      return response.ok && (response.text.includes('Sign In') || response.text.includes('Continue with GitHub'));
    },
    details(response) {
      if (response.text.includes('Sign In')) {
        return 'sign-in CTA present';
      }
      if (response.text.includes('Continue with GitHub')) {
        return 'social auth CTA present';
      }
      return 'missing login CTA';
    },
  },
];

function buildMarkdownSummary(report) {
  const lines = [
    '# Registry Portal Audit',
    '',
    `- Audited at: ${report.auditedAt}`,
    `- Portal: ${report.portalUrl}`,
    '',
    '| Check | Status | Passed | Details |',
    '| --- | ---: | :---: | --- |',
  ];

  for (const result of report.results) {
    lines.push(`| ${result.name} | ${result.status} | ${result.passed ? 'yes' : 'no'} | ${String(result.details).replace(/\|/g, '\\|')} |`);
  }

  lines.push('');
  lines.push(`- Passed: ${report.summary.passed}`);
  lines.push(`- Failed: ${report.summary.failed}`);

  if (report.failures.length > 0) {
    lines.push('');
    lines.push('## Failures');
    for (const failure of report.failures) {
      lines.push(`- ${failure.name} (${failure.status}) — ${failure.details}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const results = [];
  const failures = [];

  for (const check of CHECKS) {
    try {
      const response = await fetchText(check.path, check.options);
      const passed = check.validate(response);
      const details = check.details(response);
      const result = summarizeResult(check, response, passed, details);
      results.push(result);
      if (!passed) {
        failures.push(result);
      }
    } catch (error) {
      const result = {
        name: check.name,
        path: check.path,
        status: 'error',
        ok: false,
        passed: false,
        details: error.message,
      };
      results.push(result);
      failures.push(result);
    }
  }

  const report = {
    auditedAt: new Date().toISOString(),
    portalUrl: PORTAL_URL,
    expectedNamespace: EXPECTED_NAMESPACE,
    expectedBlueprint: EXPECTED_BLUEPRINT,
    summary: {
      total: results.length,
      passed: results.filter((result) => result.passed).length,
      failed: failures.length,
    },
    results,
    failures,
  };

  if (REPORT_PATH) {
    ensureParentDir(REPORT_PATH);
    writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  }

  const summaryMarkdown = buildMarkdownSummary(report);
  if (SUMMARY_PATH) {
    ensureParentDir(SUMMARY_PATH);
    writeFileSync(SUMMARY_PATH, summaryMarkdown);
  }

  console.log(summaryMarkdown.trimEnd());

  if (FAIL_ON_ERROR && failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
