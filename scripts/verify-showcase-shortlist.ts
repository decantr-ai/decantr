import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { auditBuiltDist, type RuntimeAudit } from '../packages/verifier/src/runtime.ts';
import {
  getActiveShowcaseEntries,
  repoRoot,
  shortlistVerificationReportPath,
  showcaseCapsulesRoot,
  showcaseHostRoot,
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
  const essencePath = join(showcaseCapsulesRoot, entry.slug, 'decantr.essence.json');
  if (!existsSync(essencePath)) {
    return [`/showcase/${entry.slug}`, `/showcase/${entry.slug}/`];
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

    return [...routes]
      .filter(Boolean)
      .map((route) => route === '/' ? `/showcase/${entry.slug}` : `/showcase/${entry.slug}${normalizeRouteHint(route)}`)
      .slice(0, 8);
  } catch {
    return [`/showcase/${entry.slug}`, `/showcase/${entry.slug}/`];
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
    langOk: runtimeAudit.langOk,
    viewportOk: runtimeAudit.viewportOk,
    charsetOk: runtimeAudit.charsetOk,
    cspSignalOk: runtimeAudit.cspSignalOk,
    inlineScriptCount: runtimeAudit.inlineScriptCount,
    inlineEventHandlerCount: runtimeAudit.inlineEventHandlerCount,
    externalScriptsWithoutIntegrityCount: runtimeAudit.externalScriptsWithoutIntegrityCount,
    externalScriptsWithIntegrityMissingCrossoriginCount: runtimeAudit.externalScriptsWithIntegrityMissingCrossoriginCount,
    externalStylesheetsWithoutIntegrityCount: runtimeAudit.externalStylesheetsWithoutIntegrityCount,
    externalStylesheetsWithIntegrityMissingCrossoriginCount: runtimeAudit.externalStylesheetsWithIntegrityMissingCrossoriginCount,
    externalScriptsWithInsecureTransportCount: runtimeAudit.externalScriptsWithInsecureTransportCount,
    externalStylesheetsWithInsecureTransportCount: runtimeAudit.externalStylesheetsWithInsecureTransportCount,
    externalMediaSourcesWithInsecureTransportCount: runtimeAudit.externalMediaSourcesWithInsecureTransportCount,
    externalBlankLinksWithoutRelCount: runtimeAudit.externalBlankLinksWithoutRelCount,
    externalIframesWithoutSandboxCount: runtimeAudit.externalIframesWithoutSandboxCount,
    externalIframesWithInsecureTransportCount: runtimeAudit.externalIframesWithInsecureTransportCount,
    jsEvalSignalCount: runtimeAudit.jsEvalSignalCount,
    jsHtmlInjectionSignalCount: runtimeAudit.jsHtmlInjectionSignalCount,
    jsInsecureTransportSignalCount: runtimeAudit.jsInsecureTransportSignalCount,
    jsSecretSignalCount: runtimeAudit.jsSecretSignalCount,
    assetCount: runtimeAudit.assetCount,
    assetsPassed: runtimeAudit.assetsPassed,
    routeHintsChecked: runtimeAudit.routeHintsChecked,
    routeHintsMatched: runtimeAudit.routeHintsMatched,
    routeHintsCoverageOk: runtimeAudit.routeHintsCoverageOk,
    routeDocumentsChecked: runtimeAudit.routeDocumentsChecked,
    routeDocumentsPassed: runtimeAudit.routeDocumentsPassed,
    routeDocumentsHardenedCount: runtimeAudit.routeDocumentsHardenedCount,
    routeDocumentsCoverageOk: runtimeAudit.routeDocumentsCoverageOk,
    routeDocumentsHardeningOk: runtimeAudit.routeDocumentsHardeningOk,
    fullRouteCoverageOk: runtimeAudit.fullRouteCoverageOk,
    totalAssetBytes: runtimeAudit.totalAssetBytes,
    jsAssetBytes: runtimeAudit.jsAssetBytes,
    cssAssetBytes: runtimeAudit.cssAssetBytes,
    largestAssetPath: runtimeAudit.largestAssetPath,
    largestAssetBytes: runtimeAudit.largestAssetBytes,
    failures: runtimeAudit.failures,
  };
}

async function main() {
  const activeShowcases = getActiveShowcaseEntries();

  if (activeShowcases.length === 0) {
    console.error('No active showcase capsules were found in the manifest.');
    process.exit(1);
  }

  const results = [];
  let failedBuilds = 0;
  let failedSmokes = 0;
  let buildPassed: boolean | null = null;
  let buildDurationMs = 0;

  const filter = './apps/showcase-host';

  if (dryRun) {
    console.log(`[dry-run] pnpm --filter "${filter}" build`);
  } else {
    console.log('Building showcase host once for capsule verification.');
    const startedAt = Date.now();
    const build = spawnSync('pnpm', ['--filter', filter, 'build'], {
      cwd: repoRoot,
      encoding: 'utf-8',
    });
    buildDurationMs = Date.now() - startedAt;
    buildPassed = build.status === 0;

    if (!buildPassed) {
      failedBuilds = activeShowcases.length;
      console.error('Showcase host build failed.');
      if (build.stdout) process.stderr.write(build.stdout);
      if (build.stderr) process.stderr.write(build.stderr);
    }
  }

  for (const entry of activeShowcases) {
    const audit = auditShowcaseEntry(entry);
    let smoke = null;

    if (dryRun) {
      console.log(`[dry-run] runtime audit ${entry.slug} through showcase host`);
    } else if (!buildPassed) {
      console.error(`Skipping smoke for ${entry.slug} because showcase host build failed.`);
    } else {
      const smokeStartedAt = Date.now();
      const runtimeAudit = await auditBuiltDist(showcaseHostRoot, {
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
      durationMs: buildDurationMs,
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
    appsWithLangOkCount: results.filter(entry => entry.smoke.langOk).length,
    appsWithViewportOkCount: results.filter(entry => entry.smoke.viewportOk).length,
    appsWithCharsetOkCount: results.filter(entry => entry.smoke.charsetOk).length,
    appsWithoutInlineScriptsCount: results.filter(entry => entry.smoke.inlineScriptCount === 0).length,
    appsWithoutInlineEventHandlersCount: results.filter(entry => entry.smoke.inlineEventHandlerCount === 0).length,
    appsWithCspSignalCount: results.filter(entry => entry.smoke.cspSignalOk).length,
    appsWithExternalScriptIntegrityCount: results.filter(entry => entry.smoke.externalScriptsWithoutIntegrityCount === 0).length,
    appsWithExternalScriptCrossoriginCount: results.filter(entry => entry.smoke.externalScriptsWithIntegrityMissingCrossoriginCount === 0).length,
    appsWithoutInsecureRemoteAssetTransportCount: results.filter(
      entry => entry.smoke.externalScriptsWithInsecureTransportCount === 0
        && entry.smoke.externalStylesheetsWithInsecureTransportCount === 0
        && entry.smoke.externalMediaSourcesWithInsecureTransportCount === 0,
    ).length,
    appsWithSafeExternalBlankLinksCount: results.filter(entry => entry.smoke.externalBlankLinksWithoutRelCount === 0).length,
    appsWithSandboxedExternalIframesCount: results.filter(entry => entry.smoke.externalIframesWithoutSandboxCount === 0).length,
    appsWithoutInsecureExternalIframesCount: results.filter(entry => entry.smoke.externalIframesWithInsecureTransportCount === 0).length,
    appsWithExternalStylesheetIntegrityCount: results.filter(entry => entry.smoke.externalStylesheetsWithoutIntegrityCount === 0).length,
    appsWithExternalStylesheetCrossoriginCount: results.filter(entry => entry.smoke.externalStylesheetsWithIntegrityMissingCrossoriginCount === 0).length,
    appsWithRouteCoverageCount: results.filter(entry => {
      const minimumRoutes = Math.min(2, entry.smoke.routeDocumentsChecked);
      return entry.smoke.routeDocumentsChecked === 0 || entry.smoke.routeDocumentsPassed >= minimumRoutes;
    }).length,
    appsWithRouteDocumentHardeningCount: results.filter(entry => entry.smoke.routeDocumentsHardeningOk).length,
    appsWithFullRouteCoverageCount: results.filter(entry => entry.smoke.fullRouteCoverageOk).length,
    averageTotalAssetBytes: results.filter(entry => entry.smoke.passed !== null).length > 0
      ? Math.round(
        results
          .filter(entry => entry.smoke.passed !== null)
          .reduce((sum, entry) => sum + entry.smoke.totalAssetBytes, 0)
        / results.filter(entry => entry.smoke.passed !== null).length
      )
      : 0,
    averageJsAssetBytes: results.filter(entry => entry.smoke.passed !== null).length > 0
      ? Math.round(
        results
          .filter(entry => entry.smoke.passed !== null)
          .reduce((sum, entry) => sum + entry.smoke.jsAssetBytes, 0)
        / results.filter(entry => entry.smoke.passed !== null).length
      )
      : 0,
    averageCssAssetBytes: results.filter(entry => entry.smoke.passed !== null).length > 0
      ? Math.round(
        results
          .filter(entry => entry.smoke.passed !== null)
          .reduce((sum, entry) => sum + entry.smoke.cssAssetBytes, 0)
        / results.filter(entry => entry.smoke.passed !== null).length
      )
      : 0,
    lowerDriftCount: results.filter(entry => entry.drift.signal === 'lower').length,
    moderateDriftCount: results.filter(entry => entry.drift.signal === 'moderate').length,
    elevatedDriftCount: results.filter(entry => entry.drift.signal === 'elevated').length,
    withPackManifestCount: results.filter(entry => entry.drift.hasPackManifest).length,
  };

  console.log(`Verified ${summary.appCount} active showcase capsule(s).`);
  console.log(`Builds passed: ${summary.passedBuilds}`);
  console.log(`Builds failed: ${summary.failedBuilds}`);
  console.log(`Average build duration: ${summary.averageDurationMs}ms`);
  console.log(`Smoke passed: ${summary.passedSmokes}`);
  console.log(`Smoke failed: ${summary.failedSmokes}`);
  console.log(`Average smoke duration: ${summary.averageSmokeDurationMs}ms`);
  console.log(`Title checks passed: ${summary.appsWithTitleOkCount}/${summary.appCount}`);
  console.log(`Lang checks passed: ${summary.appsWithLangOkCount}/${summary.appCount}`);
  console.log(`Viewport checks passed: ${summary.appsWithViewportOkCount}/${summary.appCount}`);
  console.log(`Charset checks passed: ${summary.appsWithCharsetOkCount}/${summary.appCount}`);
  console.log(`No inline scripts: ${summary.appsWithoutInlineScriptsCount}/${summary.appCount}`);
  console.log(`CSP signals present: ${summary.appsWithCspSignalCount}/${summary.appCount}`);
  console.log(`External script integrity ok: ${summary.appsWithExternalScriptIntegrityCount}/${summary.appCount}`);
  console.log(`External script crossorigin ok: ${summary.appsWithExternalScriptCrossoriginCount}/${summary.appCount}`);
  console.log(`No insecure remote asset transport: ${summary.appsWithoutInsecureRemoteAssetTransportCount}/${summary.appCount}`);
  console.log(`External stylesheet integrity ok: ${summary.appsWithExternalStylesheetIntegrityCount}/${summary.appCount}`);
  console.log(`External stylesheet crossorigin ok: ${summary.appsWithExternalStylesheetCrossoriginCount}/${summary.appCount}`);
  console.log(`Route coverage checks passed: ${summary.appsWithRouteCoverageCount}/${summary.appCount}`);
  console.log(`Route document hardening preserved: ${summary.appsWithRouteDocumentHardeningCount}/${summary.appCount}`);
  console.log(`Full route coverage: ${summary.appsWithFullRouteCoverageCount}/${summary.appCount}`);
  console.log(`Average built assets: total ${summary.averageTotalAssetBytes} B, js ${summary.averageJsAssetBytes} B, css ${summary.averageCssAssetBytes} B`);
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
