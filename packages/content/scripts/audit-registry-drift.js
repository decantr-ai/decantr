#!/usr/bin/env node

/**
 * Audit repo content against the live Decantr registry.
 *
 * Usage:
 *   node scripts/audit-registry-drift.js
 *   node scripts/audit-registry-drift.js --report-json=./registry-drift-report.json
 *   node scripts/audit-registry-drift.js --summary-markdown=./registry-drift-summary.md
 *   node scripts/audit-registry-drift.js --fail-on-drift
 *
 * Environment variables:
 *   REGISTRY_URL          - API base URL (default: https://api.decantr.ai/v1)
 *   CONTENT_NAMESPACE     - Namespace to audit (default: @official)
 *   AUDIT_CONCURRENCY     - Concurrent live item fetches (default: 20)
 *   FAIL_ON_DRIFT         - Set to "true" to exit non-zero when drift is detected
 */

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import {
  CONTENT_DIRECTORIES,
  DIRECTORY_TO_CONTENT_TYPE,
  isIgnoredLocalContentFile,
} from './content-contract.js';

const args = process.argv.slice(2);
const REGISTRY_URL = process.env.REGISTRY_URL || 'https://api.decantr.ai/v1';
const CONTENT_NAMESPACE = process.env.CONTENT_NAMESPACE || '@official';
const CONCURRENCY = Number.parseInt(process.env.AUDIT_CONCURRENCY || '20', 10);
const REPORT_PATH = args.find(arg => arg.startsWith('--report-json='))?.slice('--report-json='.length) || null;
const SUMMARY_PATH = args.find(arg => arg.startsWith('--summary-markdown='))?.slice('--summary-markdown='.length) || null;
const FAIL_ON_DRIFT = args.includes('--fail-on-drift') || process.env.FAIL_ON_DRIFT === 'true';

function ensureParentDir(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function loadRepoItems() {
  const itemsByType = new Map();
  const repoSlugsByType = new Map();
  const loadErrors = [];

  for (const dir of CONTENT_DIRECTORIES) {
    const type = DIRECTORY_TO_CONTENT_TYPE[dir];
    const items = new Map();
    const slugs = new Set();

    try {
      const files = readdirSync(dir).filter(file => file.endsWith('.json') && !isIgnoredLocalContentFile(file));
      for (const file of files) {
        const path = `${dir}/${file}`;
        try {
          const item = JSON.parse(readFileSync(path, 'utf-8'));
          const slug = item.id || item.slug;
          if (!slug) {
            loadErrors.push(`${path}: missing id or slug`);
            continue;
          }
          items.set(slug, item);
          slugs.add(slug);
        } catch (error) {
          loadErrors.push(`${path}: ${error.message}`);
        }
      }
    } catch {
      // Missing directories are treated as empty.
    }

    itemsByType.set(type, items);
    repoSlugsByType.set(type, slugs);
  }

  return { itemsByType, repoSlugsByType, loadErrors };
}

function sortValue(value) {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, sortValue(nestedValue)])
    );
  }

  return value;
}

function stableStringify(value) {
  return JSON.stringify(sortValue(value));
}

function ensureTypeStats(statsByType, type, repoCount = 0) {
  if (!statsByType.has(type)) {
    statsByType.set(type, {
      repo: repoCount,
      live: 0,
      matched: 0,
      missingLive: 0,
      extraLive: 0,
      changed: 0,
      failed: 0,
    });
  }
  return statsByType.get(type);
}

async function fetchLiveSlugs(dir) {
  const slugs = new Set();
  let offset = 0;

  while (true) {
    const url = `${REGISTRY_URL}/${dir}?namespace=${encodeURIComponent(CONTENT_NAMESPACE)}&limit=100&offset=${offset}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to list ${dir}: ${response.status} ${await response.text()}`);
    }

    const body = await response.json();
    const batch = Array.isArray(body.items) ? body.items : [];
    for (const item of batch) {
      if (item?.slug) {
        slugs.add(item.slug);
      }
    }

    if (batch.length < 100) break;
    offset += batch.length;
  }

  return slugs;
}

async function fetchLiveItem(dir, slug) {
  const url = `${REGISTRY_URL}/${dir}/${encodeURIComponent(CONTENT_NAMESPACE)}/${encodeURIComponent(slug)}`;
  const response = await fetch(url);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch ${dir}/${slug}: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function formatChangedReason(live, repo) {
  const reasons = [];
  if (repo && Object.hasOwn(repo, 'version') && live?.version !== repo?.version) {
    reasons.push('version');
  }
  if (stableStringify(live?.data) !== stableStringify(repo)) {
    reasons.push('data');
  }
  return reasons;
}

function buildMarkdownSummary(report) {
  const lines = [
    '# Registry Drift Audit',
    '',
    `- Audited at: ${report.auditedAt}`,
    `- Registry: ${report.registryUrl}`,
    `- Namespace: ${report.namespace}`,
    '',
    '| Type | Repo | Live | Matched | Missing Live | Extra Live | Changed | Failed |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  for (const [type, stats] of Object.entries(report.byType)) {
    lines.push(`| ${type} | ${stats.repo} | ${stats.live} | ${stats.matched} | ${stats.missingLive} | ${stats.extraLive} | ${stats.changed} | ${stats.failed} |`);
  }

  lines.push('');
  lines.push(`- Totals: repo ${report.totals.repo}, live ${report.totals.live}, matched ${report.totals.matched}, missing ${report.totals.missingLive}, extra ${report.totals.extraLive}, changed ${report.totals.changed}, failed ${report.totals.failed}`);

  const sections = [
    ['Missing Live', report.missingLive],
    ['Extra Live', report.extraLive],
    ['Changed', report.changed.map(item => `${item.type}/${item.slug} (${item.reasons.join(', ')})`)],
    ['Failures', report.failures],
  ];

  for (const [title, entries] of sections) {
    if (entries.length === 0) continue;
    lines.push('');
    lines.push(`## ${title}`);
    for (const entry of entries) {
      lines.push(`- ${entry}`);
    }
  }

  return lines.join('\n') + '\n';
}

async function main() {
  const { itemsByType, repoSlugsByType, loadErrors } = loadRepoItems();
  const statsByType = new Map();
  const missingLive = [];
  const extraLive = [];
  const changed = [];
  const failures = [...loadErrors];

  for (const dir of CONTENT_DIRECTORIES) {
    const type = DIRECTORY_TO_CONTENT_TYPE[dir];
    const repoItems = itemsByType.get(type) || new Map();
    const repoSlugs = repoSlugsByType.get(type) || new Set();
    const stats = ensureTypeStats(statsByType, type, repoItems.size);
    let liveSlugs = new Set();

    try {
      liveSlugs = await fetchLiveSlugs(dir);
      stats.live = liveSlugs.size;
    } catch (error) {
      stats.failed += 1;
      failures.push(`list:${type}: ${error.message}`);
      continue;
    }

    for (const slug of liveSlugs) {
      if (repoSlugs.has(slug)) continue;
      stats.extraLive += 1;
      extraLive.push(`${type}/${slug}`);
    }

    const slugs = [...repoSlugs];
    for (let index = 0; index < slugs.length; index += CONCURRENCY) {
      const batch = slugs.slice(index, index + CONCURRENCY);
      const results = await Promise.all(batch.map(async (slug) => {
        try {
          const liveItem = await fetchLiveItem(dir, slug);
          return { slug, liveItem };
        } catch (error) {
          return { slug, error };
        }
      }));

      for (const result of results) {
        if (result.error) {
          stats.failed += 1;
          failures.push(`fetch:${type}/${result.slug}: ${result.error.message}`);
          continue;
        }

        if (!result.liveItem) {
          stats.missingLive += 1;
          missingLive.push(`${type}/${result.slug}`);
          continue;
        }

        const repoItem = repoItems.get(result.slug);
        const reasons = formatChangedReason(result.liveItem, repoItem);
        if (reasons.length > 0) {
          stats.changed += 1;
          changed.push({
            type,
            slug: result.slug,
            reasons,
          });
          continue;
        }

        stats.matched += 1;
      }
    }
  }

  const totals = {
    repo: 0,
    live: 0,
    matched: 0,
    missingLive: 0,
    extraLive: 0,
    changed: 0,
    failed: failures.length,
  };

  for (const stats of statsByType.values()) {
    totals.repo += stats.repo;
    totals.live += stats.live;
    totals.matched += stats.matched;
    totals.missingLive += stats.missingLive;
    totals.extraLive += stats.extraLive;
    totals.changed += stats.changed;
  }

  const report = {
    auditedAt: new Date().toISOString(),
    registryUrl: REGISTRY_URL,
    namespace: CONTENT_NAMESPACE,
    totals,
    byType: Object.fromEntries(statsByType),
    missingLive,
    extraLive,
    changed,
    failures,
  };

  const summary = buildMarkdownSummary(report);

  if (REPORT_PATH) {
    ensureParentDir(REPORT_PATH);
    writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf-8');
  }

  if (SUMMARY_PATH) {
    ensureParentDir(SUMMARY_PATH);
    writeFileSync(SUMMARY_PATH, summary, 'utf-8');
  }

  console.log(`Audited ${totals.repo} repo items against ${totals.live} live items in ${REGISTRY_URL}`);
  console.log(`Matched: ${totals.matched}, missing live: ${totals.missingLive}, extra live: ${totals.extraLive}, changed: ${totals.changed}, failed: ${totals.failed}`);

  if (missingLive.length > 0) {
    console.log('\nMissing live:');
    for (const item of missingLive) {
      console.log(`  - ${item}`);
    }
  }

  if (extraLive.length > 0) {
    console.log('\nExtra live:');
    for (const item of extraLive) {
      console.log(`  - ${item}`);
    }
  }

  if (changed.length > 0) {
    console.log('\nChanged:');
    for (const item of changed) {
      console.log(`  - ${item.type}/${item.slug} (${item.reasons.join(', ')})`);
    }
  }

  if (failures.length > 0) {
    console.log('\nFailures:');
    for (const failure of failures) {
      console.log(`  - ${failure}`);
    }
  }

  if (FAIL_ON_DRIFT && (totals.missingLive > 0 || totals.extraLive > 0 || totals.changed > 0 || totals.failed > 0)) {
    process.exit(1);
  }

  if (totals.failed > 0) {
    process.exit(1);
  }
}

await main();
