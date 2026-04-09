import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { getShortlistedShowcaseEntries, repoRoot } from './showcase-manifest.mjs';
import { auditShowcaseEntry, computeShowcasePenalty } from './showcase-audit-lib.mjs';

const reportJsonEqArg = process.argv.find(arg => arg.startsWith('--report-json='));
const reportJsonIndex = process.argv.indexOf('--report-json');
const reportJsonPath = reportJsonEqArg
  ? reportJsonEqArg.slice('--report-json='.length)
  : reportJsonIndex !== -1
    ? process.argv[reportJsonIndex + 1] ?? null
    : null;
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
    results.push({
      slug: entry.slug,
      target: entry.target ?? null,
      classification: entry.classification,
      buildPassed: null,
      durationMs: 0,
      penalty: computeShowcasePenalty(auditShowcaseEntry(entry)),
    });
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

  results.push({
    slug: entry.slug,
    target: entry.target ?? null,
    classification: entry.classification,
    buildPassed,
    durationMs,
    inlineStyleCount: audit.inlineStyleCount,
    hardcodedColorCount: audit.hardcodedColorCount,
    utilityLeakageCount: audit.utilityLeakageCount,
    decantrTreatmentCount: audit.decantrTreatmentCount,
    penalty: computeShowcasePenalty(audit),
  });
}

const summary = {
  appCount: results.length,
  passedBuilds: results.filter(entry => entry.buildPassed === true).length,
  failedBuilds,
  averageDurationMs: results.length > 0
    ? Math.round(results.reduce((sum, entry) => sum + entry.durationMs, 0) / results.length)
    : 0,
};

console.log(`Verified ${summary.appCount} shortlisted showcase app(s).`);
console.log(`Builds passed: ${summary.passedBuilds}`);
console.log(`Builds failed: ${summary.failedBuilds}`);
console.log(`Average duration: ${summary.averageDurationMs}ms`);

if (reportJsonPath) {
  writeFileSync(reportJsonPath, JSON.stringify({
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
