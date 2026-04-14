import { cpSync, mkdirSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  getActiveShowcaseEntries,
  loadShortlistVerificationReport,
  showcaseRoot,
  repoRoot,
} from './showcase-manifest.mjs';

const dryRun = process.argv.includes('--dry-run');
const targetRoot = join(repoRoot, 'apps', 'registry', 'public', 'showcase');
const activeEntries = getActiveShowcaseEntries();
const verificationReport = loadShortlistVerificationReport();
const verificationBySlug = new Map(verificationReport.results.map(entry => [entry.slug, entry]));

for (const entry of activeEntries) {
  const distDir = join(showcaseRoot, entry.slug, 'dist');
  if (!existsSync(distDir)) continue;

  const targetDir = join(targetRoot, entry.slug);

  // Clean target directory
  if (!dryRun && existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true });
  }
  if (!dryRun) {
    mkdirSync(targetDir, { recursive: true });
  }

  // Copy dist contents
  if (!dryRun) {
    cpSync(distDir, targetDir, { recursive: true });
    console.log(`Copied ${entry.slug}/dist -> apps/registry/public/showcase/${entry.slug}/`);
  } else {
    console.log(`[dry-run] copy ${entry.slug}/dist -> apps/registry/public/showcase/${entry.slug}/`);
  }
}

const publicManifest = {
  generatedAt: new Date().toISOString(),
  apps: activeEntries.map(entry => ({
    slug: entry.slug,
    status: entry.status,
    classification: entry.classification,
    target: entry.target ?? null,
    goldenCandidate: entry.goldenCandidate ?? false,
    notes: entry.notes ?? null,
    verification: verificationBySlug.get(entry.slug) ?? null,
    url: `/showcase/${entry.slug}/index.html`,
  })),
};

const shortlistManifest = {
  generatedAt: publicManifest.generatedAt,
  apps: publicManifest.apps.filter(entry => entry.goldenCandidate),
};

if (!dryRun) {
  mkdirSync(targetRoot, { recursive: true });
  writeFileSync(join(targetRoot, 'manifest.json'), JSON.stringify(publicManifest, null, 2));
  writeFileSync(join(targetRoot, 'shortlist.json'), JSON.stringify(shortlistManifest, null, 2));
  writeFileSync(join(targetRoot, 'shortlist-verification.json'), JSON.stringify(verificationReport, null, 2));
  console.log(`Wrote showcase metadata manifest -> apps/registry/public/showcase/manifest.json`);
  console.log(`Wrote showcase shortlist manifest -> apps/registry/public/showcase/shortlist.json`);
  console.log(`Wrote showcase verification report -> apps/registry/public/showcase/shortlist-verification.json`);
} else {
  console.log(`[dry-run] write showcase metadata manifest -> apps/registry/public/showcase/manifest.json`);
  console.log(`[dry-run] write showcase shortlist manifest -> apps/registry/public/showcase/shortlist.json`);
  console.log(`[dry-run] write showcase verification report -> apps/registry/public/showcase/shortlist-verification.json`);
}
