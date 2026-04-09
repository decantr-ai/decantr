import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadShowcaseManifest, showcaseRoot } from './showcase-manifest.mjs';

const ALLOWED_STATUS = new Set(['active', 'removed']);
const ALLOWED_CLASSIFICATIONS = new Set(['pending', 'A', 'B', 'C', 'D']);
const ALLOWED_GOLDEN_CANDIDATE_VALUES = new Set(['shortlist']);

function fail(errors) {
  console.error('Showcase manifest validation failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const manifest = loadShowcaseManifest();
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

if (errors.length > 0) {
  fail(errors);
}

const classificationCounts = manifest.apps.reduce((acc, entry) => {
  acc[entry.classification] = (acc[entry.classification] ?? 0) + 1;
  return acc;
}, {});

console.log(`Validated ${manifest.apps.length} showcase manifest entries.`);
console.log(`Classification counts: ${JSON.stringify(classificationCounts)}`);
