#!/usr/bin/env node

/**
 * Sync all content from this repo to the Decantr registry API.
 * Uses concurrent requests (batches of 20) for speed.
 *
 * Usage:
 *   node scripts/sync-to-registry.js
 *   node scripts/sync-to-registry.js --dry-run
 *   node scripts/sync-to-registry.js --prune-missing --dry-run
 *   node scripts/sync-to-registry.js --report-json=./sync-report.json
 *
 * Environment variables:
 *   REGISTRY_URL     - API base URL (default: https://api.decantr.ai/v1)
 *   DECANTR_CONTENT_SYNC_TOKEN - Scoped service token for the sync endpoint (preferred)
 *   DECANTR_CONTENT_PRUNE_TOKEN - Scoped service token for the prune endpoint (preferred)
 *   DECANTR_ADMIN_KEY - Legacy admin key fallback
 *   CONTENT_CERTIFICATION_TIER - Tier to sync: enterprise, demo, experimental, all (default: enterprise)
 *   PRUNE_MISSING    - Set to "true" to include stale @official pruning (default: false)
 *   CONFIRM_PRUNE    - Must be "true" for non-dry-run pruning
 *   DRY_RUN          - Set to "true" to report actions without mutating the registry
 *   SYNC_REPORT_PATH - Write a JSON report to this path
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import {
  CONTENT_DIRECTORIES,
  DIRECTORY_TO_CONTENT_TYPE,
  isIgnoredLocalContentFile,
} from './content-contract.js';
import {
  CERTIFICATION_TIERS,
  getContentCertification,
  lintDangerousScaffoldingPolicy,
} from './content-certification.js';
import { emitContentTelemetry } from './telemetry.js';

const args = process.argv.slice(2);
const startedAt = Date.now();
const REGISTRY_URL = process.env.REGISTRY_URL || 'https://api.decantr.ai/v1';
const SYNC_TOKEN = process.env.DECANTR_CONTENT_SYNC_TOKEN || process.env.DECANTR_ADMIN_KEY;
const PRUNE_TOKEN = process.env.DECANTR_CONTENT_PRUNE_TOKEN || process.env.DECANTR_ADMIN_KEY;
const SYNC_TOKEN_HEADER = process.env.DECANTR_CONTENT_SYNC_TOKEN ? 'X-Content-Sync-Token' : 'X-Admin-Key';
const PRUNE_TOKEN_HEADER = process.env.DECANTR_CONTENT_PRUNE_TOKEN ? 'X-Content-Prune-Token' : 'X-Admin-Key';
const CONCURRENCY = 20;
const SHOULD_PRUNE = args.includes('--prune-missing') || process.env.PRUNE_MISSING === 'true';
const CONFIRM_PRUNE = args.includes('--confirm-prune') || process.env.CONFIRM_PRUNE === 'true';
const IS_DRY_RUN = args.includes('--dry-run') || process.env.DRY_RUN === 'true';
const CONTENT_CERTIFICATION_TIER = process.env.CONTENT_CERTIFICATION_TIER || 'enterprise';
const REPORT_PATH = process.env.SYNC_REPORT_PATH
  || args.find(arg => arg.startsWith('--report-json='))?.slice('--report-json='.length)
  || null;

if (!['all', ...CERTIFICATION_TIERS].includes(CONTENT_CERTIFICATION_TIER)) {
  console.error(`Error: CONTENT_CERTIFICATION_TIER must be one of: all, ${CERTIFICATION_TIERS.join(', ')}`);
  process.exit(1);
}

if (!IS_DRY_RUN && !SYNC_TOKEN) {
  console.error('Error: DECANTR_CONTENT_SYNC_TOKEN or DECANTR_ADMIN_KEY environment variable is required');
  process.exit(1);
}

if (!IS_DRY_RUN && SHOULD_PRUNE && !CONFIRM_PRUNE) {
  console.error('Error: pruning official content requires --confirm-prune or CONFIRM_PRUNE=true. Run --dry-run first and review the report.');
  process.exit(1);
}

if (!IS_DRY_RUN && SHOULD_PRUNE && !PRUNE_TOKEN) {
  console.error('Error: DECANTR_CONTENT_PRUNE_TOKEN or DECANTR_ADMIN_KEY environment variable is required when pruning');
  process.exit(1);
}

// Collect all items first
const items = [];
const repoSlugsByType = new Map();
const statsByType = new Map();
let skippedByCertification = 0;
const policyFailures = [];

function ensureTypeStats(type) {
  if (!statsByType.has(type)) {
    statsByType.set(type, {
      repo: 0,
      synced: 0,
      pruned: 0,
    });
  }
  return statsByType.get(type);
}

for (const dir of CONTENT_DIRECTORIES) {
  const type = DIRECTORY_TO_CONTENT_TYPE[dir];
  let files;
  const slugs = new Set();
  try {
    files = readdirSync(dir).filter(f => f.endsWith('.json') && !isIgnoredLocalContentFile(f));
  } catch {
    repoSlugsByType.set(type, slugs);
    continue;
  }
  for (const file of files) {
    const path = `${dir}/${file}`;
    try {
      const item = JSON.parse(readFileSync(path, 'utf-8'));
      const slug = item.id || item.slug;
      if (!slug) {
        console.error(`  SKIP ${path}: missing id or slug`);
        continue;
      }
      const certification = getContentCertification(item);
      const policyFindings = lintDangerousScaffoldingPolicy(item);
      if (policyFindings.length > 0 && certification.tier === 'enterprise') {
        policyFailures.push(`${path}: unsafe enterprise policy (${policyFindings.join(', ')})`);
        continue;
      }
      if (CONTENT_CERTIFICATION_TIER !== 'all' && certification.tier !== CONTENT_CERTIFICATION_TIER) {
        skippedByCertification++;
        continue;
      }
      slugs.add(slug);
      items.push({ path, type, item });
      ensureTypeStats(type).repo += 1;
    } catch {
      console.error(`  SKIP ${path}: invalid JSON`);
    }
  }
  repoSlugsByType.set(type, slugs);
}

if (policyFailures.length > 0) {
  console.error('Error: unsafe enterprise-certified content cannot be synced:');
  for (const failure of policyFailures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(`${IS_DRY_RUN ? 'Dry-run sync' : 'Syncing'} ${items.length} ${CONTENT_CERTIFICATION_TIER}-tier item(s) to ${REGISTRY_URL} (concurrency: ${CONCURRENCY}; skipped ${skippedByCertification})`);

let succeeded = 0;
let failed = 0;
const failures = [];
const plannedPrunes = [];

async function syncItem({ path, type, item }) {
  if (IS_DRY_RUN) {
    succeeded++;
    ensureTypeStats(type).synced += 1;
    process.stdout.write('.');
    return;
  }

  try {
    const res = await fetch(`${REGISTRY_URL}/admin/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [SYNC_TOKEN_HEADER]: SYNC_TOKEN,
      },
      body: JSON.stringify({ type, item }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`  FAIL ${path}: ${res.status} ${body}`);
      failed++;
      failures.push(path);
    } else {
      succeeded++;
      ensureTypeStats(type).synced += 1;
      process.stdout.write('.');
    }
  } catch (e) {
    console.error(`  FAIL ${path}: ${e.message}`);
    failed++;
    failures.push(path);
  }
}

async function fetchOfficialSlugs(dir) {
  const slugs = new Set();
  let offset = 0;

  while (true) {
    const res = await fetch(`${REGISTRY_URL}/${dir}?namespace=%40official&limit=100&offset=${offset}`);
    if (!res.ok) {
      throw new Error(`Failed to list ${dir}: ${res.status} ${await res.text()}`);
    }

    const body = await res.json();
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

async function pruneMissingContent() {
  let pruned = 0;

  for (const dir of CONTENT_DIRECTORIES) {
    const type = DIRECTORY_TO_CONTENT_TYPE[dir];
    const repoSlugs = repoSlugsByType.get(type) || new Set();
    let liveSlugs;
    try {
      liveSlugs = await fetchOfficialSlugs(dir);
    } catch (error) {
      const message = `prune:${type}: ${error.message}`;
      console.error(`  FAIL ${message}`);
      failed++;
      failures.push(message);
      continue;
    }

    for (const slug of liveSlugs) {
      if (repoSlugs.has(slug)) continue;
      plannedPrunes.push(`${type}/${slug}`);

      if (IS_DRY_RUN) {
        pruned++;
        ensureTypeStats(type).pruned += 1;
        process.stdout.write('x');
        continue;
      }

      const res = await fetch(
        `${REGISTRY_URL}/admin/content/${type}/%40official/${encodeURIComponent(slug)}`,
        {
          method: 'DELETE',
          headers: { [PRUNE_TOKEN_HEADER]: PRUNE_TOKEN },
        }
      );

      if (!res.ok) {
        const body = await res.text();
        console.error(`  FAIL prune ${type}/${slug}: ${res.status} ${body}`);
        failed++;
        failures.push(`prune:${type}/${slug}`);
        continue;
      }

      pruned++;
      ensureTypeStats(type).pruned += 1;
      process.stdout.write('x');
    }
  }

  return pruned;
}

// Process in batches of CONCURRENCY
for (let i = 0; i < items.length; i += CONCURRENCY) {
  const batch = items.slice(i, i + CONCURRENCY);
  await Promise.all(batch.map(syncItem));
}

let pruned = 0;
if (SHOULD_PRUNE) {
  console.log(`\n${IS_DRY_RUN ? 'Planning prune for' : 'Pruning'} stale @official content...`);
  pruned = await pruneMissingContent();
}

const report = {
  dryRun: IS_DRY_RUN,
  pruneMissing: SHOULD_PRUNE,
  pruneConfirmed: CONFIRM_PRUNE,
  registryUrl: REGISTRY_URL,
  certificationTier: CONTENT_CERTIFICATION_TIER,
  totals: {
    repoItems: items.length,
    skippedByCertification,
    synced: succeeded,
    pruned,
    failed,
  },
  byType: Object.fromEntries(statsByType),
  plannedPrunes,
  failures,
};

if (REPORT_PATH) {
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf-8');
  console.log(`Report written to ${REPORT_PATH}`);
}

console.log(`\n\nSync complete: ${succeeded} ${IS_DRY_RUN ? 'planned' : 'synced'}, ${pruned} ${IS_DRY_RUN ? 'planned prune(s)' : 'pruned'}, ${failed} failed (of ${items.length} repo items)`);

await emitPublishTelemetry(report, Date.now() - startedAt);

if (failures.length > 0) {
  console.log('\nFailed items:');
  for (const f of failures) {
    console.log(`  - ${f}`);
  }
  process.exit(1);
}

async function emitPublishTelemetry(syncReport, durationMs) {
  const entries = Object.entries(syncReport.byType);
  const fallbackEntries = entries.length > 0
    ? entries
    : [['pattern', { repo: 0, synced: 0, pruned: 0 }]];

  await Promise.all(fallbackEntries.map(([contentType, stats]) => emitContentTelemetry({
    name: 'content.publish.completed',
    properties: {
      contentType,
      success: syncReport.totals.failed === 0,
      durationMs,
      dryRun: syncReport.dryRun,
      errorCode: syncReport.totals.failed > 0 ? 'content_sync_failed' : undefined,
      itemCount: stats.synced ?? 0,
      namespace: '@official',
      plannedPruneCount: syncReport.plannedPrunes.length,
      prunedCount: stats.pruned ?? 0,
      registrySource: 'official',
      repoItemCount: stats.repo ?? 0,
      skippedByCertification: syncReport.totals.skippedByCertification,
      visibility: 'public',
    },
  })));
}
