import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getShowcaseThumbnailPublicSrc,
  getShowcaseThumbnailSourcePath,
  loadShowcaseManifest,
  loadShortlistVerificationReport,
  showcaseCapsulesRoot,
} from './showcase-manifest.mjs';

const ALLOWED_STATUS = new Set(['active', 'removed']);
const ALLOWED_CLASSIFICATIONS = new Set(['pending', 'A', 'B', 'C', 'D']);
const ALLOWED_GOLDEN_CANDIDATE_VALUES = new Set(['shortlist']);
const ALLOWED_VERIFICATION_STATUS = new Set(['pending', 'build-green', 'build-red', 'smoke-green', 'smoke-red']);
const ALLOWED_DRIFT_SIGNALS = new Set(['lower', 'moderate', 'elevated']);
const SHOWCASE_SHORTLIST_REPORT_SCHEMA_URL = 'https://decantr.ai/schemas/showcase-shortlist-report.v1.json';

export function fail(errors) {
  console.error('Showcase manifest validation failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

export function validateShowcaseManifest({
  manifest,
  shortlistReport,
  capsuleRoot = showcaseCapsulesRoot,
  thumbnailSourcePathForSlug = getShowcaseThumbnailSourcePath,
  contentRoot = process.env.DECANTR_CONTENT_DIR,
} = {}) {
  const errors = [];
  const seenSlugs = new Set();
  const activeSlugs = new Set();
  const apps = Array.isArray(manifest?.apps) ? manifest.apps : [];
  const reportResults = Array.isArray(shortlistReport?.results) ? shortlistReport.results : [];

  function validateThumbnail(entry) {
    if (entry.status !== 'active') return;

    const expectedSrc = getShowcaseThumbnailPublicSrc(entry.slug);
    const sourcePath = thumbnailSourcePathForSlug(entry.slug);

    if (!entry.thumbnail || typeof entry.thumbnail !== 'object') {
      errors.push(`Active showcase "${entry.slug}" must declare a thumbnail at ${expectedSrc}.`);
      return;
    }
    if (entry.thumbnail.src !== expectedSrc) {
      errors.push(`Showcase "${entry.slug}" thumbnail.src must be "${expectedSrc}".`);
    }
    if (typeof entry.thumbnail.alt !== 'string' || entry.thumbnail.alt.length === 0) {
      errors.push(`Showcase "${entry.slug}" thumbnail.alt must be a non-empty string.`);
    }
    if (entry.thumbnail.width !== undefined && (!Number.isFinite(entry.thumbnail.width) || entry.thumbnail.width <= 0)) {
      errors.push(`Showcase "${entry.slug}" thumbnail.width must be a positive number when provided.`);
    }
    if (entry.thumbnail.height !== undefined && (!Number.isFinite(entry.thumbnail.height) || entry.thumbnail.height <= 0)) {
      errors.push(`Showcase "${entry.slug}" thumbnail.height must be a positive number when provided.`);
    }
    if (!existsSync(sourcePath)) {
      errors.push(`Showcase "${entry.slug}" thumbnail file is missing at ${sourcePath}.`);
    }
  }

  for (const entry of apps) {
    if (typeof entry.slug !== 'string' || entry.slug.length === 0) {
      errors.push('Every showcase entry must have a non-empty slug.');
      continue;
    }

    if (seenSlugs.has(entry.slug)) {
      errors.push(`Duplicate showcase slug detected: ${entry.slug}`);
    }
    seenSlugs.add(entry.slug);

    if (!ALLOWED_STATUS.has(entry.status)) {
      errors.push(`Showcase "${entry.slug}" has invalid status "${entry.status}".`);
    }
    if (entry.status === 'active') {
      activeSlugs.add(entry.slug);
    }

    if (!ALLOWED_CLASSIFICATIONS.has(entry.classification)) {
      errors.push(`Showcase "${entry.slug}" has invalid classification "${entry.classification}".`);
    }

    if (typeof entry.origin !== 'string' || entry.origin.length === 0) {
      errors.push(`Showcase "${entry.slug}" must declare an origin.`);
    }

    const showcaseDir = join(capsuleRoot, entry.slug);
    if (entry.status === 'active' && !existsSync(showcaseDir)) {
      errors.push(`Active showcase "${entry.slug}" is missing its capsule at ${showcaseDir}.`);
    }

    if (entry.status === 'removed' && existsSync(showcaseDir)) {
      errors.push(`Removed showcase "${entry.slug}" still has a capsule on disk at ${showcaseDir}.`);
    }

    validateThumbnail(entry);

    if (entry.goldenCandidate !== undefined) {
      if (!ALLOWED_GOLDEN_CANDIDATE_VALUES.has(entry.goldenCandidate)) {
        errors.push(`Showcase "${entry.slug}" has invalid goldenCandidate value "${entry.goldenCandidate}".`);
      }
      if (entry.status !== 'active') {
        errors.push(`Showcase "${entry.slug}" cannot be a golden candidate unless it is active.`);
      }
      if (!['A', 'B'].includes(entry.classification)) {
        errors.push(`Showcase "${entry.slug}" golden candidates must be classified as A or B.`);
      }
      if (typeof entry.target !== 'string' || entry.target.length === 0) {
        errors.push(`Showcase "${entry.slug}" golden candidates must declare a target.`);
      }
      if (typeof entry.notes !== 'string' || entry.notes.length === 0) {
        errors.push(`Showcase "${entry.slug}" golden candidates must include notes.`);
      }
    }
  }

  const blueprintRoot = contentRoot ? join(contentRoot, 'blueprints') : null;
  if (blueprintRoot && existsSync(blueprintRoot)) {
    const officialBlueprintSlugs = readdirSync(blueprintRoot)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace(/\.json$/, ''))
      .sort();

    for (const slug of officialBlueprintSlugs) {
      if (!activeSlugs.has(slug)) {
        errors.push(`Official blueprint "${slug}" is missing an active showcase manifest entry.`);
      }
    }
  }

  const reportableSlugs = new Set(
    apps
      .filter(entry => entry.status === 'active')
      .map(entry => entry.slug),
  );
  const seenReportSlugs = new Set();

  if (reportResults.length > 0) {
    if (shortlistReport.$schema !== SHOWCASE_SHORTLIST_REPORT_SCHEMA_URL) {
      errors.push(`Showcase shortlist report must declare $schema "${SHOWCASE_SHORTLIST_REPORT_SCHEMA_URL}".`);
    }

    if (typeof shortlistReport.summary !== 'object' || shortlistReport.summary === null) {
      errors.push('Showcase shortlist report must include a summary object.');
    } else {
      for (const key of [
        'appCount',
        'passedBuilds',
        'failedBuilds',
        'averageDurationMs',
        'passedSmokes',
        'failedSmokes',
        'averageSmokeDurationMs',
        'appsWithTitleOkCount',
        'appsWithLangOkCount',
        'appsWithViewportOkCount',
        'appsWithCharsetOkCount',
        'appsWithoutInlineScriptsCount',
        'appsWithoutInlineEventHandlersCount',
        'appsWithCspSignalCount',
        'appsWithExternalScriptIntegrityCount',
        'appsWithExternalScriptCrossoriginCount',
        'appsWithExternalStylesheetIntegrityCount',
        'appsWithExternalStylesheetCrossoriginCount',
        'appsWithRouteCoverageCount',
        'appsWithRouteDocumentHardeningCount',
        'appsWithFullRouteCoverageCount',
        'averageTotalAssetBytes',
        'averageJsAssetBytes',
        'averageCssAssetBytes',
        'lowerDriftCount',
        'moderateDriftCount',
        'elevatedDriftCount',
        'withPackManifestCount',
      ]) {
        if (!Number.isFinite(shortlistReport.summary[key]) || shortlistReport.summary[key] < 0) {
          errors.push(`Showcase shortlist report summary.${key} must be a non-negative number.`);
        }
      }
    }

    for (const entry of reportResults) {
      if (typeof entry.slug !== 'string' || entry.slug.length === 0) {
        errors.push('Every showcase shortlist report entry must have a non-empty slug.');
        continue;
      }

      if (seenReportSlugs.has(entry.slug)) {
        errors.push(`Duplicate showcase shortlist report slug detected: ${entry.slug}`);
      }
      seenReportSlugs.add(entry.slug);

      if (!reportableSlugs.has(entry.slug)) {
        errors.push(`Showcase verification report entry "${entry.slug}" is not an active entry in the manifest.`);
      }

      if (!ALLOWED_CLASSIFICATIONS.has(entry.classification)) {
        errors.push(`Showcase shortlist report entry "${entry.slug}" has invalid classification "${entry.classification}".`);
      }

      if (!ALLOWED_VERIFICATION_STATUS.has(entry.verificationStatus)) {
        errors.push(`Showcase shortlist report entry "${entry.slug}" has invalid verification status "${entry.verificationStatus}".`);
      }

      if (typeof entry.build !== 'object' || entry.build === null) {
        errors.push(`Showcase shortlist report entry "${entry.slug}" must include a build object.`);
      } else {
        if (entry.build.passed !== null && typeof entry.build.passed !== 'boolean') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" build.passed must be boolean or null.`);
        }
        if (!Number.isFinite(entry.build.durationMs) || entry.build.durationMs < 0) {
          errors.push(`Showcase shortlist report entry "${entry.slug}" build.durationMs must be a non-negative number.`);
        }
      }

      if (typeof entry.smoke !== 'object' || entry.smoke === null) {
        errors.push(`Showcase shortlist report entry "${entry.slug}" must include a smoke object.`);
      } else {
        if (entry.smoke.passed !== null && typeof entry.smoke.passed !== 'boolean') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.passed must be boolean or null.`);
        }
        if (!Number.isFinite(entry.smoke.durationMs) || entry.smoke.durationMs < 0) {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.durationMs must be a non-negative number.`);
        }
        if (typeof entry.smoke.rootDocumentOk !== 'boolean') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.rootDocumentOk must be boolean.`);
        }
        if (typeof entry.smoke.titleOk !== 'boolean') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.titleOk must be boolean.`);
        }
        if (typeof entry.smoke.langOk !== 'boolean') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.langOk must be boolean.`);
        }
        if (typeof entry.smoke.viewportOk !== 'boolean') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.viewportOk must be boolean.`);
        }
        if (typeof entry.smoke.charsetOk !== 'boolean') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.charsetOk must be boolean.`);
        }
        if (typeof entry.smoke.cspSignalOk !== 'boolean') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.cspSignalOk must be boolean.`);
        }
        if (typeof entry.smoke.routeHintsCoverageOk !== 'boolean') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.routeHintsCoverageOk must be boolean.`);
        }
        if (typeof entry.smoke.routeDocumentsCoverageOk !== 'boolean') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.routeDocumentsCoverageOk must be boolean.`);
        }
        if (typeof entry.smoke.fullRouteCoverageOk !== 'boolean') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.fullRouteCoverageOk must be boolean.`);
        }
        for (const key of ['inlineScriptCount', 'inlineEventHandlerCount', 'externalScriptsWithoutIntegrityCount', 'externalScriptsWithIntegrityMissingCrossoriginCount', 'externalStylesheetsWithoutIntegrityCount', 'externalStylesheetsWithIntegrityMissingCrossoriginCount', 'externalScriptsWithInsecureTransportCount', 'externalStylesheetsWithInsecureTransportCount', 'externalMediaSourcesWithInsecureTransportCount', 'jsEvalSignalCount', 'jsHtmlInjectionSignalCount', 'jsInsecureTransportSignalCount', 'jsSecretSignalCount', 'assetCount', 'assetsPassed', 'routeHintsMatched', 'routeDocumentsChecked', 'routeDocumentsPassed', 'routeDocumentsHardenedCount', 'totalAssetBytes', 'jsAssetBytes', 'cssAssetBytes', 'largestAssetBytes']) {
          if (!Number.isFinite(entry.smoke[key]) || entry.smoke[key] < 0) {
            errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.${key} must be a non-negative number.`);
          }
        }
        if (typeof entry.smoke.routeDocumentsHardeningOk !== 'boolean') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.routeDocumentsHardeningOk must be boolean.`);
        }
        if (entry.smoke.largestAssetPath !== null && typeof entry.smoke.largestAssetPath !== 'string') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.largestAssetPath must be string or null.`);
        }
        if (!Array.isArray(entry.smoke.routeHintsChecked) || !entry.smoke.routeHintsChecked.every(value => typeof value === 'string')) {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.routeHintsChecked must be a string array.`);
        }
        if (!Array.isArray(entry.smoke.failures) || !entry.smoke.failures.every(value => typeof value === 'string')) {
          errors.push(`Showcase shortlist report entry "${entry.slug}" smoke.failures must be a string array.`);
        }
      }

      if (typeof entry.drift !== 'object' || entry.drift === null) {
        errors.push(`Showcase shortlist report entry "${entry.slug}" must include a drift object.`);
      } else {
        if (!ALLOWED_DRIFT_SIGNALS.has(entry.drift.signal)) {
          errors.push(`Showcase shortlist report entry "${entry.slug}" has invalid drift signal "${entry.drift.signal}".`);
        }

        for (const key of ['penalty', 'inlineStyleCount', 'hardcodedColorCount', 'utilityLeakageCount', 'decantrTreatmentCount']) {
          if (!Number.isFinite(entry.drift[key]) || entry.drift[key] < 0) {
            errors.push(`Showcase shortlist report entry "${entry.slug}" drift.${key} must be a non-negative number.`);
          }
        }

        if (typeof entry.drift.hasPackManifest !== 'boolean') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" drift.hasPackManifest must be boolean.`);
        }
        if (typeof entry.drift.hasDist !== 'boolean') {
          errors.push(`Showcase shortlist report entry "${entry.slug}" drift.hasDist must be boolean.`);
        }
      }
    }

    for (const slug of reportableSlugs) {
      if (!seenReportSlugs.has(slug)) {
        errors.push(`Showcase verification report is missing active entry "${slug}".`);
      }
    }
  }

  const classificationCounts = apps.reduce((acc, entry) => {
    acc[entry.classification] = (acc[entry.classification] ?? 0) + 1;
    return acc;
  }, {});

  return {
    errors,
    classificationCounts,
    entryCount: apps.length,
  };
}

export function runShowcaseManifestValidation() {
  const result = validateShowcaseManifest({
    manifest: loadShowcaseManifest(),
    shortlistReport: loadShortlistVerificationReport(),
  });

  if (result.errors.length > 0) {
    fail(result.errors);
  }

  console.log(`Validated ${result.entryCount} showcase manifest entries.`);
  console.log(`Classification counts: ${JSON.stringify(result.classificationCounts)}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runShowcaseManifestValidation();
}
