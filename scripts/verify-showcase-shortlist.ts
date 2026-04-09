import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { auditBuiltDist, type RuntimeAudit } from '../packages/verifier/src/runtime.ts';
import {
  getShortlistedShowcaseEntries,
  repoRoot,
  shortlistVerificationReportPath,
  showcaseRoot,
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

function extractShowcaseRouteHints(entry: { slug: string }): string[] {
  const essencePath = join(showcaseRoot, entry.slug, 'decantr.essence.json');
  if (!existsSync(essencePath)) {
    return ['/'];
  }

  try {
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8'));
    const routes = new Set<string>(['/']);

    for (const section of essence.blueprint?.sections ?? []) {
      for (const page of section.pages ?? []) {
        if (typeof page.route === 'string' && page.route.length > 0) {
          routes.add(normalizeRouteHint(page.route));
        }
      }
    }

    for (const page of essence.blueprint?.pages ?? []) {
      if (typeof page.route === 'string' && page.route.length > 0) {
        routes.add(normalizeRouteHint(page.route));
      }
    }

    if (essence.blueprint?.routes && typeof essence.blueprint.routes === 'object') {
      for (const route of Object.keys(essence.blueprint.routes)) {
        routes.add(normalizeRouteHint(route));
      }
    }

    return [...routes].filter(Boolean).slice(0, 8);
  } catch {
    return ['/'];
  }
}

function normalizeRouteHint(route: string | null | undefined): string {
  if (!route || route === '/') return '/';
  const dynamicIndex = route.indexOf('/:');
  if (dynamicIndex !== -1) {
    return route.slice(0, dynamicIndex + 1);
  }
  return route;
}

function buildSmokeResult(runtimeAudit: RuntimeAudit, durationMs: number) {
  return {
    passed: runtimeAudit.passed,
    durationMs,
    rootDocumentOk: runtimeAudit.rootDocumentOk,
    titleOk: runtimeAudit.titleOk,
    assetCount: runtimeAudit.assetCount,
    assetsPassed: runtimeAudit.assetsPassed,
    routeHintsChecked: runtimeAudit.routeHintsChecked,
    routeHintsMatched: runtimeAudit.routeHintsMatched,
    routeDocumentsChecked: runtimeAudit.routeDocumentsChecked,
    routeDocumentsPassed: runtimeAudit.routeDocumentsPassed,
    failures: runtimeAudit.failures,
  };
}

async function main() {
  const shortlisted = getShortlistedShowcaseEntries();

  if (shortlisted.length === 0) {
    console.error('No shortlisted showcase apps were found in the manifest.');
    process.exit(1);
  }

  const results = [];
  let failedBuilds = 0;
  let failedSmokes = 0;

  for (const entry of shortlisted) {
    const filter = `./apps/showcase/${entry.slug}`;
    const appRoot = join(showcaseRoot, entry.slug);

    if (dryRun) {
      console.log(`[dry-run] pnpm --filter "${filter}" build`);
      console.log(`[dry-run] runtime audit ${entry.slug} dist output`);
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
    let smoke = null;

    if (!buildPassed) {
      failedBuilds += 1;
      console.error(`Build failed for ${entry.slug}`);
      if (build.stdout) process.stderr.write(build.stdout);
      if (build.stderr) process.stderr.write(build.stderr);
    } else {
      const smokeStartedAt = Date.now();
      const runtimeAudit = await auditBuiltDist(appRoot, {
        routeHints: extractShowcaseRouteHints(entry),
      });
      smoke = buildSmokeResult(runtimeAudit, Date.now() - smokeStartedAt);
      if (!smoke.passed) {
        failedSmokes += 1;
        console.error(`Smoke check failed for ${entry.slug}: ${smoke.failures.join(', ')}`);
      }
    }

    results.push(buildShowcaseVerificationResult(audit, {
      buildPassed,
      durationMs,
      smoke,
    }));
  }

  const summary = {
    appCount: results.length,
    passedBuilds: results.filter(entry => entry.build.passed === true).length,
    failedBuilds,
    averageDurationMs: results.length > 0
      ? Math.round(results.reduce((sum, entry) => sum + entry.build.durationMs, 0) / results.length)
      : 0,
    passedSmokes: results.filter(entry => entry.smoke.passed === true).length,
    failedSmokes,
    averageSmokeDurationMs: results.filter(entry => entry.smoke.passed !== null).length > 0
      ? Math.round(
        results
          .filter(entry => entry.smoke.passed !== null)
          .reduce((sum, entry) => sum + entry.smoke.durationMs, 0)
        / results.filter(entry => entry.smoke.passed !== null).length
      )
      : 0,
    appsWithTitleOkCount: results.filter(entry => entry.smoke.titleOk).length,
    appsWithRouteCoverageCount: results.filter(entry => {
      const minimumRoutes = Math.min(2, entry.smoke.routeDocumentsChecked);
      return entry.smoke.routeDocumentsChecked === 0 || entry.smoke.routeDocumentsPassed >= minimumRoutes;
    }).length,
    lowerDriftCount: results.filter(entry => entry.drift.signal === 'lower').length,
    moderateDriftCount: results.filter(entry => entry.drift.signal === 'moderate').length,
    elevatedDriftCount: results.filter(entry => entry.drift.signal === 'elevated').length,
    withPackManifestCount: results.filter(entry => entry.drift.hasPackManifest).length,
  };

  console.log(`Verified ${summary.appCount} shortlisted showcase app(s).`);
  console.log(`Builds passed: ${summary.passedBuilds}`);
  console.log(`Builds failed: ${summary.failedBuilds}`);
  console.log(`Average build duration: ${summary.averageDurationMs}ms`);
  console.log(`Smoke passed: ${summary.passedSmokes}`);
  console.log(`Smoke failed: ${summary.failedSmokes}`);
  console.log(`Average smoke duration: ${summary.averageSmokeDurationMs}ms`);
  console.log(`Title checks passed: ${summary.appsWithTitleOkCount}/${summary.appCount}`);
  console.log(`Route coverage checks passed: ${summary.appsWithRouteCoverageCount}/${summary.appCount}`);
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

  if (failedBuilds > 0 || failedSmokes > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
