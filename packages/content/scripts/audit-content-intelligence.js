#!/usr/bin/env node

/**
 * Audit live official registry content for intelligence metadata coverage.
 *
 * Usage:
 *   node scripts/audit-content-intelligence.js
 *   node scripts/audit-content-intelligence.js --report-json=./content-intelligence-report.json
 *   node scripts/audit-content-intelligence.js --summary-markdown=./content-intelligence-summary.md
 *   node scripts/audit-content-intelligence.js --fail-on-missing
 *   node scripts/audit-content-intelligence.js --fail-on-filter-mismatch
 *   node scripts/audit-content-intelligence.js --fail-on-source-filter-mismatch
 *   node scripts/audit-content-intelligence.js --fail-on-summary-mismatch
 *
 * Environment variables:
 *   REGISTRY_URL        - API base URL (default: https://api.decantr.ai/v1)
 *   CONTENT_NAMESPACE   - Namespace to audit (default: @official)
 *   FAIL_ON_MISSING     - Set to "true" to fail when official blueprints have no intelligence metadata
 *   FAIL_ON_FILTER_MISMATCH - Set to "true" to fail when the hosted recommended filter disagrees with metadata counts
 *   FAIL_ON_SOURCE_FILTER_MISMATCH - Set to "true" to fail when hosted source filters disagree with metadata counts
 *   FAIL_ON_SUMMARY_MISMATCH - Set to "true" to fail when the hosted summary endpoint disagrees with the live crawl
 */

import { mkdirSync, readdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import {
  CONTENT_DIRECTORIES,
  DIRECTORY_TO_CONTENT_TYPE,
  isIgnoredLocalContentFile,
} from './content-contract.js';

const args = process.argv.slice(2);
const REGISTRY_URL = process.env.REGISTRY_URL || 'https://api.decantr.ai/v1';
const CONTENT_NAMESPACE = process.env.CONTENT_NAMESPACE || '@official';
const REPORT_PATH =
  args.find((arg) => arg.startsWith('--report-json='))?.slice('--report-json='.length) || null;
const SUMMARY_PATH =
  args.find((arg) => arg.startsWith('--summary-markdown='))?.slice('--summary-markdown='.length) || null;
const FAIL_ON_MISSING =
  args.includes('--fail-on-missing') || process.env.FAIL_ON_MISSING === 'true';
const FAIL_ON_FILTER_MISMATCH =
  args.includes('--fail-on-filter-mismatch') || process.env.FAIL_ON_FILTER_MISMATCH === 'true';
const FAIL_ON_SOURCE_FILTER_MISMATCH =
  args.includes('--fail-on-source-filter-mismatch') || process.env.FAIL_ON_SOURCE_FILTER_MISMATCH === 'true';
const FAIL_ON_SUMMARY_MISMATCH =
  args.includes('--fail-on-summary-mismatch') || process.env.FAIL_ON_SUMMARY_MISMATCH === 'true';

const SUMMARY_FIELD_MAP = [
  ['total_public_items', 'live'],
  ['with_intelligence', 'withIntelligence'],
  ['recommended', 'recommended'],
  ['authored', 'authored'],
  ['benchmark', 'benchmark'],
  ['hybrid', 'hybrid'],
  ['missing_source', 'missingSource'],
  ['smoke_green', 'smokeGreen'],
  ['build_green', 'buildGreen'],
  ['high_confidence', 'highConfidence'],
  ['verified_confidence', 'verifiedConfidence'],
];

function ensureParentDir(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function countRepoItems() {
  const repoCounts = {};

  for (const dir of CONTENT_DIRECTORIES) {
    try {
      repoCounts[DIRECTORY_TO_CONTENT_TYPE[dir]] = readdirSync(dir).filter((file) => (
        file.endsWith('.json') && !isIgnoredLocalContentFile(file)
      )).length;
    } catch {
      repoCounts[DIRECTORY_TO_CONTENT_TYPE[dir]] = 0;
    }
  }

  return repoCounts;
}

async function fetchLiveItems(directory, options = {}) {
  const { recommendedOnly = false, intelligenceSource = null } = options;
  const items = [];
  let offset = 0;

  while (true) {
    const searchParams = new URLSearchParams({
      namespace: CONTENT_NAMESPACE,
      limit: '100',
      offset: String(offset),
    });

    if (recommendedOnly) {
      searchParams.set('recommended', 'true');
    }
    if (intelligenceSource) {
      searchParams.set('intelligence_source', intelligenceSource);
    }

    const url = `${REGISTRY_URL}/${directory}?${searchParams}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to list ${directory}: ${response.status} ${await response.text()}`);
    }

    const body = await response.json();
    const batch = Array.isArray(body.items) ? body.items : [];
    items.push(...batch);

    if (batch.length < 100) {
      break;
    }

    offset += batch.length;
  }

  return items;
}

async function fetchHostedSummary() {
  const searchParams = new URLSearchParams({ namespace: CONTENT_NAMESPACE });
  const response = await fetch(`${REGISTRY_URL}/intelligence/summary?${searchParams}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch intelligence summary: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function average(values) {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 100) / 100;
}

function toTypeStats(type, repoCount, liveItems, recommendedItems, sourceFilteredItems) {
  const intelligenceItems = liveItems.filter((item) => item.intelligence);
  const qualityScores = intelligenceItems
    .map((item) => item.intelligence?.quality_score)
    .filter((value) => typeof value === 'number');
  const confidenceScores = intelligenceItems
    .map((item) => item.intelligence?.confidence_score)
    .filter((value) => typeof value === 'number');
  const recommended = intelligenceItems.filter((item) => item.intelligence?.recommended).length;
  const authored = intelligenceItems.filter((item) => item.intelligence?.source === 'authored').length;
  const benchmark = intelligenceItems.filter((item) => item.intelligence?.source === 'benchmark').length;
  const hybrid = intelligenceItems.filter((item) => item.intelligence?.source === 'hybrid').length;
  const missingSource = intelligenceItems.filter((item) => !item.intelligence?.source).length;
  const authoredViaFilter = sourceFilteredItems.authored.length;
  const benchmarkViaFilter = sourceFilteredItems.benchmark.length;
  const hybridViaFilter = sourceFilteredItems.hybrid.length;

  return {
    repo: repoCount,
    live: liveItems.length,
    withIntelligence: intelligenceItems.length,
    authored,
    benchmark,
    hybrid,
    missingSource,
    authoredViaFilter,
    benchmarkViaFilter,
    hybridViaFilter,
    recommended,
    recommendedViaFilter: recommendedItems.length,
    recommendedFilterMismatch: recommendedItems.length - recommended,
    smokeGreen: intelligenceItems.filter((item) => item.intelligence?.verification_status === 'smoke-green').length,
    buildGreen: intelligenceItems.filter((item) => item.intelligence?.verification_status === 'build-green').length,
    highConfidence: intelligenceItems.filter((item) => {
      const tier = item.intelligence?.confidence_tier;
      return tier === 'high' || tier === 'verified';
    }).length,
    verifiedConfidence: intelligenceItems.filter((item) => item.intelligence?.confidence_tier === 'verified').length,
    averageQuality: average(qualityScores),
    averageConfidence: average(confidenceScores),
  };
}

function buildMarkdownSummary(report) {
  const lines = [
    '# Content Intelligence Audit',
    '',
    `- Audited at: ${report.auditedAt}`,
    `- Registry: ${report.registryUrl}`,
    `- Namespace: ${report.namespace}`,
    '',
    '| Type | Repo | Live | With Intelligence | Authored | Benchmark | Hybrid | Recommended | Recommended API | Smoke Green | Build Green | High Confidence | Verified Confidence | Avg Quality | Avg Confidence |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  for (const [type, stats] of Object.entries(report.byType)) {
    lines.push(
      `| ${type} | ${stats.repo} | ${stats.live} | ${stats.withIntelligence} | ${stats.authored} | ${stats.benchmark} | ${stats.hybrid} | ${stats.recommended} | ${stats.recommendedViaFilter} | ${stats.smokeGreen} | ${stats.buildGreen} | ${stats.highConfidence} | ${stats.verifiedConfidence} | ${stats.averageQuality ?? '—'} | ${stats.averageConfidence ?? '—'} |`,
    );
  }

  lines.push('');
  lines.push(
    `- Totals: repo ${report.totals.repo}, live ${report.totals.live}, intelligence ${report.totals.withIntelligence}, authored ${report.totals.authored}, benchmark ${report.totals.benchmark}, hybrid ${report.totals.hybrid}, recommended ${report.totals.recommended}, recommended API ${report.totals.recommendedViaFilter}, smoke green ${report.totals.smokeGreen}, build green ${report.totals.buildGreen}, high confidence ${report.totals.highConfidence}, verified confidence ${report.totals.verifiedConfidence}`,
  );

  if (report.hostedSummary) {
    lines.push('');
    lines.push('## Hosted Summary Endpoint');
    lines.push(`- Generated at: ${report.hostedSummary.generated_at}`);
    lines.push(
      `- Totals: live ${report.hostedSummary.totals.total_public_items}, intelligence ${report.hostedSummary.totals.with_intelligence}, authored ${report.hostedSummary.totals.authored}, benchmark ${report.hostedSummary.totals.benchmark}, hybrid ${report.hostedSummary.totals.hybrid}, recommended ${report.hostedSummary.totals.recommended}, smoke green ${report.hostedSummary.totals.smoke_green}, build green ${report.hostedSummary.totals.build_green}, high confidence ${report.hostedSummary.totals.high_confidence}, verified confidence ${report.hostedSummary.totals.verified_confidence}`,
    );
  }

  if (report.recommendedFilterMismatches.length > 0) {
    lines.push('');
    lines.push('## Recommended Filter Mismatches');
    for (const mismatch of report.recommendedFilterMismatches) {
      lines.push(`- ${mismatch.type} — metadata ${mismatch.recommended}, API filter ${mismatch.recommendedViaFilter}`);
    }
  }

  if (report.missingSourceByType.length > 0) {
    lines.push('');
    lines.push('## Intelligence Missing Source');
    for (const item of report.missingSourceByType) {
      lines.push(`- ${item.type} — ${item.missingSource} live items expose intelligence metadata without a provenance source`);
    }
  }

  if (report.sourceFilterMismatches.length > 0) {
    lines.push('');
    lines.push('## Source Filter Mismatches');
    for (const mismatch of report.sourceFilterMismatches) {
      const parts = [];
      if (mismatch.authored !== mismatch.authoredViaFilter) {
        parts.push(`authored metadata ${mismatch.authored}, API filter ${mismatch.authoredViaFilter}`);
      }
      if (mismatch.benchmark !== mismatch.benchmarkViaFilter) {
        parts.push(`benchmark metadata ${mismatch.benchmark}, API filter ${mismatch.benchmarkViaFilter}`);
      }
      if (mismatch.hybrid !== mismatch.hybridViaFilter) {
        parts.push(`hybrid metadata ${mismatch.hybrid}, API filter ${mismatch.hybridViaFilter}`);
      }
      lines.push(`- ${mismatch.type} — ${parts.join('; ')}`);
    }
  }

  if (report.summaryMismatches.length > 0) {
    lines.push('');
    lines.push('## Hosted Summary Mismatches');
    for (const mismatch of report.summaryMismatches) {
      if (mismatch.scope === 'totals') {
        lines.push(`- totals.${mismatch.field} — crawl ${mismatch.crawl}, hosted summary ${mismatch.summary}`);
      } else {
        lines.push(`- ${mismatch.scope}.${mismatch.field} — crawl ${mismatch.crawl}, hosted summary ${mismatch.summary}`);
      }
    }
  }

  if (report.failures.length > 0) {
    lines.push('');
    lines.push('## Failures');
    for (const failure of report.failures) {
      lines.push(`- ${failure}`);
    }
  }

  if (report.blueprintsMissingIntelligence.length > 0) {
    lines.push('');
    lines.push('## Blueprints Missing Intelligence');
    for (const slug of report.blueprintsMissingIntelligence) {
      lines.push(`- ${slug}`);
    }
  }

  if (report.topRecommendations.length > 0) {
    lines.push('');
    lines.push('## Top Recommended Blueprints');
    for (const item of report.topRecommendations) {
      lines.push(
        `- ${item.slug} — source ${item.source ?? 'unknown'}, quality ${item.qualityScore ?? '—'}, confidence ${item.confidenceScore ?? '—'}, verification ${item.verificationStatus ?? 'unknown'}`,
      );
    }
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const repoCounts = countRepoItems();
  const byType = {};
  const failures = [];
  const allLiveItems = [];
  let hostedSummary = null;

  try {
    hostedSummary = await fetchHostedSummary();
  } catch (error) {
    failures.push(`summary: ${error.message}`);
  }

  for (const dir of CONTENT_DIRECTORIES) {
    const type = DIRECTORY_TO_CONTENT_TYPE[dir];
    try {
      const liveItems = await fetchLiveItems(dir);
      const recommendedItems = await fetchLiveItems(dir, { recommendedOnly: true });
      const sourceFilteredItems = {
        authored: await fetchLiveItems(dir, { intelligenceSource: 'authored' }),
        benchmark: await fetchLiveItems(dir, { intelligenceSource: 'benchmark' }),
        hybrid: await fetchLiveItems(dir, { intelligenceSource: 'hybrid' }),
      };
      byType[type] = toTypeStats(
        type,
        repoCounts[type] || 0,
        liveItems,
        recommendedItems,
        sourceFilteredItems,
      );
      allLiveItems.push(...liveItems.map((item) => ({ ...item, type })));
    } catch (error) {
      failures.push(`${type}: ${error.message}`);
      byType[type] = toTypeStats(type, repoCounts[type] || 0, [], [], {
        authored: [],
        benchmark: [],
        hybrid: [],
      });
    }
  }

  const blueprintItems = allLiveItems.filter((item) => item.type === 'blueprint');
  const blueprintsMissingIntelligence = blueprintItems
    .filter((item) => !item.intelligence)
    .map((item) => item.slug)
    .sort((left, right) => left.localeCompare(right));

  const topRecommendations = blueprintItems
    .filter((item) => item.intelligence?.recommended)
    .map((item) => ({
      slug: item.slug,
      source: item.intelligence?.source ?? null,
      qualityScore: item.intelligence?.quality_score ?? null,
      confidenceScore: item.intelligence?.confidence_score ?? null,
      verificationStatus: item.intelligence?.verification_status ?? null,
    }))
    .sort((left, right) => {
      const qualityDelta = (right.qualityScore ?? -1) - (left.qualityScore ?? -1);
      if (qualityDelta !== 0) return qualityDelta;
      return left.slug.localeCompare(right.slug);
    })
    .slice(0, 10);

  const recommendedFilterMismatches = Object.entries(byType)
    .filter(([, stats]) => stats.recommended !== stats.recommendedViaFilter)
    .map(([type, stats]) => ({
      type,
      recommended: stats.recommended,
      recommendedViaFilter: stats.recommendedViaFilter,
    }));
  const missingSourceByType = Object.entries(byType)
    .filter(([, stats]) => stats.missingSource > 0)
    .map(([type, stats]) => ({
      type,
      missingSource: stats.missingSource,
    }));
  const sourceFilterMismatches = Object.entries(byType)
    .filter(([, stats]) =>
      stats.authored !== stats.authoredViaFilter ||
      stats.benchmark !== stats.benchmarkViaFilter ||
      stats.hybrid !== stats.hybridViaFilter,
    )
    .map(([type, stats]) => ({
      type,
      authored: stats.authored,
      authoredViaFilter: stats.authoredViaFilter,
      benchmark: stats.benchmark,
      benchmarkViaFilter: stats.benchmarkViaFilter,
      hybrid: stats.hybrid,
      hybridViaFilter: stats.hybridViaFilter,
    }));

  const totals = Object.values(byType).reduce(
    (acc, stats) => ({
      repo: acc.repo + stats.repo,
      live: acc.live + stats.live,
      withIntelligence: acc.withIntelligence + stats.withIntelligence,
      authored: acc.authored + stats.authored,
      benchmark: acc.benchmark + stats.benchmark,
      hybrid: acc.hybrid + stats.hybrid,
      missingSource: acc.missingSource + stats.missingSource,
      recommended: acc.recommended + stats.recommended,
      recommendedViaFilter: acc.recommendedViaFilter + stats.recommendedViaFilter,
      smokeGreen: acc.smokeGreen + stats.smokeGreen,
      buildGreen: acc.buildGreen + stats.buildGreen,
      highConfidence: acc.highConfidence + stats.highConfidence,
      verifiedConfidence: acc.verifiedConfidence + stats.verifiedConfidence,
    }),
    {
      repo: 0,
      live: 0,
      withIntelligence: 0,
      authored: 0,
      benchmark: 0,
      hybrid: 0,
      missingSource: 0,
      recommended: 0,
      recommendedViaFilter: 0,
      smokeGreen: 0,
      buildGreen: 0,
      highConfidence: 0,
      verifiedConfidence: 0,
    },
  );

  const summaryMismatches = [];

  if (hostedSummary) {
    for (const [summaryField, reportField] of SUMMARY_FIELD_MAP) {
      if (hostedSummary.totals?.[summaryField] !== totals[reportField]) {
        summaryMismatches.push({
          scope: 'totals',
          field: summaryField,
          crawl: totals[reportField],
          summary: hostedSummary.totals?.[summaryField] ?? null,
        });
      }
    }

    for (const [type, stats] of Object.entries(byType)) {
      const hostedBucket = hostedSummary.by_type?.[type];
      if (!hostedBucket) {
        summaryMismatches.push({
          scope: type,
          field: 'missing_bucket',
          crawl: true,
          summary: false,
        });
        continue;
      }

      for (const [summaryField, reportField] of SUMMARY_FIELD_MAP) {
        if (hostedBucket[summaryField] !== stats[reportField]) {
          summaryMismatches.push({
            scope: type,
            field: summaryField,
            crawl: stats[reportField],
            summary: hostedBucket[summaryField] ?? null,
          });
        }
      }
    }
  }

  const report = {
    auditedAt: new Date().toISOString(),
    registryUrl: REGISTRY_URL,
    namespace: CONTENT_NAMESPACE,
    hostedSummary,
    byType,
    totals,
    blueprintsMissingIntelligence,
    topRecommendations,
    recommendedFilterMismatches,
    missingSourceByType,
    sourceFilterMismatches,
    summaryMismatches,
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

  if (FAIL_ON_MISSING && blueprintsMissingIntelligence.length > 0) {
    process.exitCode = 1;
  }

  if (FAIL_ON_FILTER_MISMATCH && recommendedFilterMismatches.length > 0) {
    process.exitCode = 1;
  }

  if (FAIL_ON_SOURCE_FILTER_MISMATCH && sourceFilterMismatches.length > 0) {
    process.exitCode = 1;
  }

  if (FAIL_ON_SUMMARY_MISMATCH && summaryMismatches.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
