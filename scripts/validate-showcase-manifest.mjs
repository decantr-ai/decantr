import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  loadShowcaseManifest,
  loadShortlistVerificationReport,
  showcaseRoot,
} from './showcase-manifest.mjs';

const ALLOWED_STATUS = new Set(['active', 'removed']);
const ALLOWED_CLASSIFICATIONS = new Set(['pending', 'A', 'B', 'C', 'D']);
const ALLOWED_GOLDEN_CANDIDATE_VALUES = new Set(['shortlist']);
const ALLOWED_VERIFICATION_STATUS = new Set(['pending', 'build-green', 'build-red']);
const ALLOWED_DRIFT_SIGNALS = new Set(['lower', 'moderate', 'elevated']);
const SHOWCASE_SHORTLIST_REPORT_SCHEMA_URL = 'https://decantr.ai/schemas/showcase-shortlist-report.v1.json';

function fail(errors) {
  console.error('Showcase manifest validation failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const manifest = loadShowcaseManifest();
const shortlistReport = loadShortlistVerificationReport();
const errors = [];
const seenSlugs = new Set();

for (const entry of manifest.apps) {
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

  if (!ALLOWED_CLASSIFICATIONS.has(entry.classification)) {
    errors.push(`Showcase "${entry.slug}" has invalid classification "${entry.classification}".`);
  }

  if (typeof entry.origin !== 'string' || entry.origin.length === 0) {
    errors.push(`Showcase "${entry.slug}" must declare an origin.`);
  }

  const showcaseDir = join(showcaseRoot, entry.slug);
  if (entry.status === 'active' && !existsSync(showcaseDir)) {
    errors.push(`Active showcase "${entry.slug}" is missing its directory at ${showcaseDir}.`);
  }

  if (entry.status === 'removed' && existsSync(showcaseDir)) {
    errors.push(`Removed showcase "${entry.slug}" still exists on disk at ${showcaseDir}.`);
  }

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

const shortlistedSlugs = new Set(
  manifest.apps
    .filter(entry => entry.status === 'active' && Boolean(entry.goldenCandidate))
    .map(entry => entry.slug),
);
const reportResults = Array.isArray(shortlistReport.results) ? shortlistReport.results : [];
const seenReportSlugs = new Set();

if (reportResults.length > 0) {
  if (shortlistReport.$schema !== SHOWCASE_SHORTLIST_REPORT_SCHEMA_URL) {
    errors.push(`Showcase shortlist report must declare $schema "${SHOWCASE_SHORTLIST_REPORT_SCHEMA_URL}".`);
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

    if (!shortlistedSlugs.has(entry.slug)) {
      errors.push(`Showcase shortlist report entry "${entry.slug}" is not an active golden shortlist entry in the manifest.`);
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

  for (const slug of shortlistedSlugs) {
    if (!seenReportSlugs.has(slug)) {
      errors.push(`Showcase shortlist report is missing active shortlisted entry "${slug}".`);
    }
  }
}

if (errors.length > 0) {
  fail(errors);
}

const classificationCounts = manifest.apps.reduce((acc, entry) => {
  acc[entry.classification] = (acc[entry.classification] ?? 0) + 1;
  return acc;
}, {});

console.log(`Validated ${manifest.apps.length} showcase manifest entries.`);
console.log(`Classification counts: ${JSON.stringify(classificationCounts)}`);
