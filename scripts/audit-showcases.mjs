import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { getActiveShowcaseEntries, loadShowcaseManifest, showcaseRoot } from './showcase-manifest.mjs';

const reportJsonEqArg = process.argv.find(arg => arg.startsWith('--report-json='));
const reportJsonIndex = process.argv.indexOf('--report-json');
const reportJsonPath = reportJsonEqArg
  ? reportJsonEqArg.slice('--report-json='.length)
  : reportJsonIndex !== -1
    ? process.argv[reportJsonIndex + 1] ?? null
    : null;
const includeRemoved = process.argv.includes('--include-removed');

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

function auditShowcase(entry) {
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

function buildSummary(results) {
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

const manifest = loadShowcaseManifest();
const showcaseEntries = includeRemoved ? manifest.apps : getActiveShowcaseEntries();
const results = showcaseEntries.map(auditShowcase);
const summary = buildSummary(results);

const report = {
  generatedAt: new Date().toISOString(),
  includeRemoved,
  summary,
  results,
};

console.log(`Audited ${summary.appCount} showcase app(s).`);
console.log(`Inline styles: ${summary.totalInlineStyleCount}`);
console.log(`Hardcoded colors: ${summary.totalHardcodedColorCount}`);
console.log(`Utility leakage signals: ${summary.totalUtilityLeakageCount}`);
console.log(`Decantr treatment signals: ${summary.totalDecantrTreatmentCount}`);
console.log(`Pack manifests present: ${summary.withPackManifest}/${summary.appCount}`);
console.log(`Dist outputs present: ${summary.withDist}/${summary.appCount}`);
console.log(`Classifications: ${JSON.stringify(summary.classificationCounts)}`);

if (reportJsonPath) {
  writeFileSync(reportJsonPath, JSON.stringify(report, null, 2));
  console.log(`Wrote report to ${reportJsonPath}`);
}
