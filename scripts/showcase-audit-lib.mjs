import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { getActiveShowcaseEntries, loadShowcaseManifest, showcaseRoot } from './showcase-manifest.mjs';

const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.html']);
const SKIP_DIRS = new Set(['dist', 'node_modules', '.git', '.turbo']);
const INLINE_STYLE_REGEX = /style\s*=\s*(?:\{\{|["'])/g;
const HARD_CODED_COLOR_REGEX = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g;
const UTILITY_LEAKAGE_REGEX = /\b(?:bg|text|border|shadow|rounded|px|py|mx|my|gap|grid-cols|col-span|row-span|sm|md|lg|xl|hover):[-\w/.[\]]+/g;
const DECANTR_TREATMENT_REGEX = /\bd-(?:interactive|surface|data|control|section|annotation|label)\b/g;

function listFiles(rootDir) {
  const files = [];
  if (!existsSync(rootDir)) return files;

  for (const entry of readdirSync(rootDir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const fullPath = join(rootDir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...listFiles(fullPath));
      continue;
    }
    if (!CODE_EXTENSIONS.has(extname(entry))) continue;
    files.push(fullPath);
  }

  return files;
}

function countMatches(content, pattern) {
  return content.match(pattern)?.length ?? 0;
}

export function auditShowcaseEntry(entry) {
  const rootDir = join(showcaseRoot, entry.slug);
  const files = listFiles(rootDir);

  let inlineStyleCount = 0;
  let hardcodedColorCount = 0;
  let utilityLeakageCount = 0;
  let decantrTreatmentCount = 0;

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    inlineStyleCount += countMatches(content, INLINE_STYLE_REGEX);
    hardcodedColorCount += countMatches(content, HARD_CODED_COLOR_REGEX);
    utilityLeakageCount += countMatches(content, UTILITY_LEAKAGE_REGEX);
    decantrTreatmentCount += countMatches(content, DECANTR_TREATMENT_REGEX);
  }

  return {
    slug: entry.slug,
    status: entry.status,
    classification: entry.classification ?? 'pending',
    origin: entry.origin ?? 'unknown',
    target: entry.target ?? null,
    goldenCandidate: entry.goldenCandidate ?? false,
    notes: entry.notes ?? null,
    fileCount: files.length,
    inlineStyleCount,
    hardcodedColorCount,
    utilityLeakageCount,
    decantrTreatmentCount,
    hasDist: existsSync(join(rootDir, 'dist')),
    hasPackManifest: existsSync(join(rootDir, '.decantr', 'context', 'pack-manifest.json')),
  };
}

export function buildShowcaseAuditSummary(results) {
  const classificationCounts = {};
  for (const result of results) {
    classificationCounts[result.classification] = (classificationCounts[result.classification] ?? 0) + 1;
  }

  return {
    appCount: results.length,
    totalInlineStyleCount: results.reduce((sum, entry) => sum + entry.inlineStyleCount, 0),
    totalHardcodedColorCount: results.reduce((sum, entry) => sum + entry.hardcodedColorCount, 0),
    totalUtilityLeakageCount: results.reduce((sum, entry) => sum + entry.utilityLeakageCount, 0),
    totalDecantrTreatmentCount: results.reduce((sum, entry) => sum + entry.decantrTreatmentCount, 0),
    withPackManifest: results.filter(entry => entry.hasPackManifest).length,
    withDist: results.filter(entry => entry.hasDist).length,
    classificationCounts,
  };
}

export function auditShowcases(options = {}) {
  const includeRemoved = options.includeRemoved === true;
  const manifest = loadShowcaseManifest();
  const showcaseEntries = includeRemoved ? manifest.apps : getActiveShowcaseEntries();
  const results = showcaseEntries.map(auditShowcaseEntry);

  return {
    generatedAt: new Date().toISOString(),
    includeRemoved,
    summary: buildShowcaseAuditSummary(results),
    results,
  };
}

export function computeShowcasePenalty(entry) {
  return entry.inlineStyleCount
    + (entry.hardcodedColorCount * 2)
    + (entry.utilityLeakageCount * 25)
    - Math.round(entry.decantrTreatmentCount * 0.25);
}

export function getShowcaseDriftSignal(entry) {
  const penalty = computeShowcasePenalty(entry);

  if (entry.utilityLeakageCount > 0 || entry.hardcodedColorCount > 60 || penalty > 340) {
    return 'elevated';
  }

  if (entry.inlineStyleCount <= 280 && entry.hardcodedColorCount <= 40 && penalty <= 300) {
    return 'lower';
  }

  return 'moderate';
}

export function buildShowcaseVerificationResult(entry, options = {}) {
  const buildPassed = options.buildPassed === true;
  const buildStatus = options.buildPassed === null || options.buildPassed === undefined
    ? 'pending'
    : buildPassed
      ? 'build-green'
      : 'build-red';
  const durationMs = Number.isFinite(options.durationMs) ? options.durationMs : 0;
  const penalty = computeShowcasePenalty(entry);
  const driftSignal = getShowcaseDriftSignal(entry);

  return {
    slug: entry.slug,
    target: entry.target ?? null,
    classification: entry.classification,
    verificationStatus: buildStatus,
    build: {
      passed: options.buildPassed ?? null,
      durationMs,
    },
    drift: {
      signal: driftSignal,
      penalty,
      inlineStyleCount: entry.inlineStyleCount,
      hardcodedColorCount: entry.hardcodedColorCount,
      utilityLeakageCount: entry.utilityLeakageCount,
      decantrTreatmentCount: entry.decantrTreatmentCount,
      hasPackManifest: entry.hasPackManifest,
      hasDist: entry.hasDist,
    },
  };
}

export function suggestShowcaseClassification(entry) {
  if (entry.status === 'removed') return 'D';
  if (!entry.hasDist) return 'D';
  if (entry.hasPackManifest && entry.inlineStyleCount <= 80 && entry.hardcodedColorCount <= 12 && entry.utilityLeakageCount === 0) {
    return 'A';
  }

  const penalty = computeShowcasePenalty(entry);
  if (penalty <= 380 && entry.decantrTreatmentCount >= 120) return 'B';
  return 'C';
}

export function rankGoldenCandidates(results, limit = 8) {
  return [...results]
    .filter(entry => entry.status === 'active')
    .map(entry => ({
      ...entry,
      penalty: computeShowcasePenalty(entry),
      suggestedClassification: suggestShowcaseClassification(entry),
      recommendedGoldenCandidate: suggestShowcaseClassification(entry) === 'B',
    }))
    .filter(entry => entry.recommendedGoldenCandidate)
    .sort((a, b) => a.penalty - b.penalty || b.decantrTreatmentCount - a.decantrTreatmentCount)
    .slice(0, limit);
}
