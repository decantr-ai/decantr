#!/usr/bin/env node

/**
 * Audit the hosted Decantr public API surfaces that power portal/CLI/MCP reads.
 *
 * Usage:
 *   node scripts/audit-public-api.mjs
 *   node scripts/audit-public-api.mjs --report-json=./public-api-report.json
 *   node scripts/audit-public-api.mjs --summary-markdown=./public-api-summary.md
 *   node scripts/audit-public-api.mjs --core-only
 *   node scripts/audit-public-api.mjs --fail-on-error
 *
 * Environment variables:
 *   REGISTRY_URL - Public API base URL (default: https://api.decantr.ai/v1)
 *   CONTENT_NAMESPACE - Namespace used for registry list/summary checks (default: @official)
 *   FAIL_ON_PUBLIC_API_ERROR - Set to "true" to exit non-zero when any check fails
 *   PUBLIC_API_AUDIT_CORE_ONLY - Set to "true" to skip hosted pack-select and verifier endpoints
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const args = process.argv.slice(2);
const REGISTRY_URL = process.env.REGISTRY_URL || 'https://api.decantr.ai/v1';
const CONTENT_NAMESPACE = process.env.CONTENT_NAMESPACE || '@official';
const REPORT_PATH =
  args.find((arg) => arg.startsWith('--report-json='))?.slice('--report-json='.length) || null;
const SUMMARY_PATH =
  args.find((arg) => arg.startsWith('--summary-markdown='))?.slice('--summary-markdown='.length) || null;
const FAIL_ON_ERROR =
  args.includes('--fail-on-error') || process.env.FAIL_ON_PUBLIC_API_ERROR === 'true';
const CORE_ONLY =
  args.includes('--core-only') || process.env.PUBLIC_API_AUDIT_CORE_ONLY === 'true';
const INCLUDE_HOSTED_PACK_SELECT = !CORE_ONLY;
const INCLUDE_HOSTED_CRITIQUE = !CORE_ONLY;
const INCLUDE_HOSTED_PROJECT_AUDIT = !CORE_ONLY;

function ensureParentDir(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function fetchJson(path, init) {
  const response = await fetch(`${REGISTRY_URL}${path}`, init);
  const text = await response.text();
  let json = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    path,
    json,
    text,
  };
}

const SAMPLE_ESSENCE = {
  version: '2.0.0',
  archetype: 'dashboard',
  theme: {
    id: 'clean',
    mode: 'light',
  },
  personality: ['professional'],
  platform: {
    type: 'spa',
    routing: 'history',
  },
  structure: [
    {
      id: 'home',
      shell: 'sidebar-main',
      layout: ['hero'],
    },
  ],
  features: ['auth'],
  density: {
    level: 'comfortable',
    content_gap: '1.5rem',
  },
  guard: {
    mode: 'guided',
  },
  target: 'react',
};

function summarizeResult(check, response, passed, details) {
  return {
    name: check.name,
    path: check.path,
    status: response.status,
    ok: response.ok,
    passed,
    details,
  };
}

const CHECKS = [
  {
    name: 'schema-search-response',
    path: '/schema/search-response.v1.json',
    validate(response) {
      return response.ok &&
        isObject(response.json) &&
        response.json.$id === 'https://decantr.ai/schemas/search-response.v1.json';
    },
    details(response) {
      return response.json?.$id ?? response.text;
    },
  },
  {
    name: 'execution-pack-compile',
    path: `/packs/compile?namespace=${encodeURIComponent(CONTENT_NAMESPACE)}`,
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(SAMPLE_ESSENCE),
    },
    validate(response) {
      return response.ok &&
        isObject(response.json) &&
        response.json.$schema === 'https://decantr.ai/schemas/execution-pack-bundle.v1.json';
    },
    details(response) {
      if (isObject(response.json?.scaffold?.target)) {
        return `adapter=${response.json.scaffold.target.adapter ?? 'n/a'} pages=${Array.isArray(response.json?.pages) ? response.json.pages.length : 'n/a'}`;
      }
      return response.text;
    },
  },
  ...(INCLUDE_HOSTED_PACK_SELECT ? [
    {
      name: 'execution-pack-select',
      path: `/packs/select?namespace=${encodeURIComponent(CONTENT_NAMESPACE)}`,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          essence: SAMPLE_ESSENCE,
          pack_type: 'page',
          id: 'home',
        }),
      },
      validate(response) {
        return response.ok &&
          isObject(response.json) &&
          response.json.$schema === 'https://decantr.ai/schemas/selected-execution-pack.v1.json';
      },
      details(response) {
        if (isObject(response.json?.selector)) {
          return `pack_type=${response.json.selector.packType ?? 'n/a'} id=${response.json.selector.id ?? 'n/a'}`;
        }
        return response.text;
      },
    },
  ] : []),
  ...(INCLUDE_HOSTED_CRITIQUE ? [
    {
      name: 'hosted-file-critique',
      path: `/critique/file?namespace=${encodeURIComponent(CONTENT_NAMESPACE)}`,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          essence: SAMPLE_ESSENCE,
          filePath: 'src/pages/Home.tsx',
          code: '<button style={{ color: "#ff00ff" }}>Click me</button>',
        }),
      },
      validate(response) {
        return response.ok &&
          isObject(response.json) &&
          response.json.$schema === 'https://decantr.ai/schemas/file-critique-report.v1.json';
      },
      details(response) {
        if (isObject(response.json)) {
          return `overall=${response.json.overall ?? 'n/a'} findings=${Array.isArray(response.json.findings) ? response.json.findings.length : 'n/a'}`;
        }
        return response.text;
      },
    },
  ] : []),
  ...(INCLUDE_HOSTED_PROJECT_AUDIT ? [
    {
      name: 'hosted-project-audit',
      path: `/audit/project?namespace=${encodeURIComponent(CONTENT_NAMESPACE)}`,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          essence: SAMPLE_ESSENCE,
          dist: {
            indexHtml: '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Audit</title></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>',
            assets: {
              '/assets/app.js': 'console.log("/");',
            },
          },
        }),
      },
      validate(response) {
        return response.ok &&
          isObject(response.json) &&
          response.json.$schema === 'https://decantr.ai/schemas/project-audit-report.v1.json';
      },
      details(response) {
        if (isObject(response.json?.summary)) {
          return `runtime_checked=${response.json.summary.runtimeAuditChecked ?? 'n/a'} warnings=${response.json.summary.warnCount ?? 'n/a'}`;
        }
        return response.text;
      },
    },
  ] : []),
  {
    name: 'public-search',
    path: '/search?q=portfolio&type=blueprint&limit=1',
    validate(response) {
      return response.ok &&
        isObject(response.json) &&
        typeof response.json.total === 'number' &&
        Array.isArray(response.json.results);
    },
    details(response) {
      return `total=${response.json?.total ?? 'n/a'} results=${Array.isArray(response.json?.results) ? response.json.results.length : 'n/a'}`;
    },
  },
  {
    name: 'public-blueprint-list',
    path: `/blueprints?namespace=${encodeURIComponent(CONTENT_NAMESPACE)}&limit=1`,
    validate(response) {
      return response.ok &&
        isObject(response.json) &&
        typeof response.json.total === 'number' &&
        Array.isArray(response.json.items);
    },
    details(response) {
      return `total=${response.json?.total ?? 'n/a'} items=${Array.isArray(response.json?.items) ? response.json.items.length : 'n/a'}`;
    },
  },
  {
    name: 'showcase-shortlist-verification',
    path: '/showcase/shortlist-verification',
    validate(response) {
      return response.ok &&
        isObject(response.json) &&
        response.json.$schema === 'https://decantr.ai/schemas/showcase-shortlist-report.v1.json';
    },
    details(response) {
      return response.json?.$schema ?? response.text;
    },
  },
  {
    name: 'registry-intelligence-summary',
    path: `/intelligence/summary?namespace=${encodeURIComponent(CONTENT_NAMESPACE)}`,
    validate(response) {
      return response.ok &&
        isObject(response.json) &&
        isObject(response.json.totals) &&
        isObject(response.json.by_type);
    },
    details(response) {
      if (isObject(response.json?.totals)) {
        return `total_public_items=${response.json.totals.total_public_items ?? 'n/a'} with_intelligence=${response.json.totals.with_intelligence ?? 'n/a'}`;
      }
      return response.text;
    },
  },
];

function buildMarkdownSummary(report) {
  const lines = [
    '# Public API Audit',
    '',
    `- Audited at: ${report.auditedAt}`,
    `- Registry: ${report.registryUrl}`,
    `- Namespace: ${report.namespace}`,
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
      const normalizedResponse = await fetchJson(check.path, check.init);
      const passed = check.validate(normalizedResponse);
      const details = check.details(normalizedResponse);
      const result = summarizeResult(check, normalizedResponse, passed, details);
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
    registryUrl: REGISTRY_URL,
    namespace: CONTENT_NAMESPACE,
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
