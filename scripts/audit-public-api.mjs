#!/usr/bin/env node

/**
 * Audit the hosted Decantr content API surfaces that power CLI/MCP reads.
 *
 * Usage:
 *   node scripts/audit-public-api.mjs
 *   node scripts/audit-public-api.mjs --report-json=./public-api-report.json
 *   node scripts/audit-public-api.mjs --summary-markdown=./public-api-summary.md
 *   node scripts/audit-public-api.mjs --core-only
 *   node scripts/audit-public-api.mjs --fail-on-error
 *
 * Environment variables:
 *   DECANTR_API_URL - Public content API base URL (default: https://api.decantr.ai/v1)
 *   REGISTRY_URL - Legacy compatibility alias for DECANTR_API_URL
 *   CONTENT_NAMESPACE - Namespace used for content list/summary checks (default: @official)
 *   FAIL_ON_PUBLIC_API_ERROR - Set to "true" to exit non-zero when any check fails
 *   PUBLIC_API_AUDIT_CORE_ONLY - Set to "true" to skip hosted pack-select
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const args = process.argv.slice(2);
const DECANTR_API_URL = process.env.DECANTR_API_URL || process.env.REGISTRY_URL || 'https://api.decantr.ai/v1';
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

function ensureParentDir(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function fetchJson(path, init) {
  const response = await fetch(`${DECANTR_API_URL}${path}`, init);
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
  version: '4.0.0',
  dna: {
    theme: { id: 'auradecantism', mode: 'dark', shape: 'rounded' },
    spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
    typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
    color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
    radius: { philosophy: 'rounded', base: 8 },
    elevation: { system: 'layered', max_levels: 3 },
    motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
    accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
    personality: ['professional'],
  },
  blueprint: {
    shell: 'sidebar-main',
    sections: [
      {
        id: 'dashboard',
        role: 'primary',
        shell: 'sidebar-main',
        features: ['auth'],
        description: 'Dashboard section',
        pages: [{ id: 'home', route: '/', layout: ['hero'] }],
      },
    ],
    features: ['auth'],
    routes: {
      '/': { section: 'dashboard', page: 'home' },
    },
  },
  meta: {
    archetype: 'dashboard',
    target: 'react',
    platform: { type: 'spa', routing: 'history' },
    guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
  },
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
    name: 'content-intelligence-summary',
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

function escapeMarkdownCell(value) {
  let escaped = '';
  for (const char of String(value ?? '-')) {
    if (char === '\\') escaped += '\\\\';
    else if (char === '|') escaped += '\\|';
    else if (char === '\n' || char === '\r') escaped += ' ';
    else escaped += char;
  }
  return escaped;
}

function buildMarkdownSummary(report) {
  const lines = [
    '# Public API Audit',
    '',
    `- Audited at: ${report.auditedAt}`,
    `- Content API: ${report.apiUrl}`,
    `- Namespace: ${report.namespace}`,
    '',
    '| Check | Status | Passed | Details |',
    '| --- | ---: | :---: | --- |',
  ];

  for (const result of report.results) {
    lines.push(`| ${result.name} | ${result.status} | ${result.passed ? 'yes' : 'no'} | ${escapeMarkdownCell(result.details)} |`);
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
    apiUrl: DECANTR_API_URL,
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
