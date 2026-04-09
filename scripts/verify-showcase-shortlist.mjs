import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  getShortlistedShowcaseEntries,
  repoRoot,
  shortlistVerificationReportPath,
} from './showcase-manifest.mjs';
import { auditShowcaseEntry, buildShowcaseVerificationResult } from './showcase-audit-lib.mjs';

const SHOWCASE_SHORTLIST_REPORT_SCHEMA_URL = 'https://decantr.ai/schemas/showcase-shortlist-report.v1.json';
const reportJsonEqArg = process.argv.find(arg => arg.startsWith('--report-json='));
const reportJsonIndex = process.argv.indexOf('--report-json');
const requestedReportJsonPath = reportJsonEqArg
  ? reportJsonEqArg.slice('--report-json='.length)
  : reportJsonIndex !== -1
    ? process.argv[reportJsonIndex + 1] ?? null
    : null;
const reportJsonPath = requestedReportJsonPath ?? shortlistVerificationReportPath;
const dryRun = process.argv.includes('--dry-run');

const shortlisted = getShortlistedShowcaseEntries();

if (shortlisted.length === 0) {
  console.error('No shortlisted showcase apps were found in the manifest.');
  process.exit(1);
}

const results = [];
let failedBuilds = 0;

for (const entry of shortlisted) {
  const filter = `./apps/showcase/${entry.slug}`;

  if (dryRun) {
    console.log(`[dry-run] pnpm --filter "${filter}" build`);
    results.push(buildShowcaseVerificationResult(auditShowcaseEntry(entry), {
      buildPassed: null,
      durationMs: 0,
    }));
    continue;
  }

  console.log(`Verifying shortlisted showcase: ${entry.slug}`);
  const startedAt = Date.now();
  const build = spawnSync('pnpm', ['--filter', filter, 'build'], {
    cwd: repoRoot,
    encoding: 'utf-8',
  });
  const durationMs = Date.now() - startedAt;
  const audit = auditShowcaseEntry(entry);
  const buildPassed = build.status === 0;

  if (!buildPassed) {
    failedBuilds += 1;
    console.error(`Build failed for ${entry.slug}`);
    if (build.stdout) process.error.write(build.stdout);
    if (build.stderr) process.error.write(build.stderr);
  }

  results.push(buildShowcaseVerificationResult(audit, {
    buildPassed,
    durationMs,
  }));
}

const summary = {
  appCount: results.length,
  passedBuilds: results.filter(entry => entry.build.passed === true).length,
  failedBuilds,
  averageDurationMs: results.length > 0
    ? Math.round(results.reduce((sum, entry) => sum + entry.build.durationMs, 0) / results.length)
    : 0,
  lowerDriftCount: results.filter(entry => entry.drift.signal === 'lower').length,
  moderateDriftCount: results.filter(entry => entry.drift.signal === 'moderate').length,
  elevatedDriftCount: results.filter(entry => entry.drift.signal === 'elevated').length,
  withPackManifestCount: results.filter(entry => entry.drift.hasPackManifest).length,
};

console.log(`Verified ${summary.appCount} shortlisted showcase app(s).`);
console.log(`Builds passed: ${summary.passedBuilds}`);
console.log(`Builds failed: ${summary.failedBuilds}`);
console.log(`Average duration: ${summary.averageDurationMs}ms`);
console.log(`Drift signals: lower ${summary.lowerDriftCount}, moderate ${summary.moderateDriftCount}, elevated ${summary.elevatedDriftCount}`);
console.log(`Pack manifests present: ${summary.withPackManifestCount}/${summary.appCount}`);

if (reportJsonPath) {
  mkdirSync(dirname(reportJsonPath), { recursive: true });
  writeFileSync(reportJsonPath, JSON.stringify({
    $schema: SHOWCASE_SHORTLIST_REPORT_SCHEMA_URL,
    generatedAt: new Date().toISOString(),
    dryRun,
    summary,
    results,
  }, null, 2));
  console.log(`Wrote verification report to ${reportJsonPath}`);
}

if (failedBuilds > 0) {
  process.exit(1);
}
