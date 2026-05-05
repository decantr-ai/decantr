import { cpSync, mkdirSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  getPublicShowcaseEntries,
  loadShortlistVerificationReport,
  repoRoot,
  showcaseHostRoot,
} from './showcase-manifest.mjs';

const dryRun = process.argv.includes('--dry-run');
const targetRoot = join(repoRoot, 'apps', 'registry', 'public', 'showcase');
const distDir = join(showcaseHostRoot, 'dist');
const activeEntries = getPublicShowcaseEntries();
const verificationReport = loadShortlistVerificationReport();
const verificationBySlug = new Map(verificationReport.results.map(entry => [entry.slug, entry]));

if (!existsSync(distDir)) {
  console.error(`Showcase host dist is missing at ${distDir}. Run scripts/build-showcases.mjs first.`);
  process.exit(1);
}

if (!dryRun && existsSync(targetRoot)) {
  rmSync(targetRoot, { recursive: true });
}
if (!dryRun) {
  mkdirSync(targetRoot, { recursive: true });
  cpSync(distDir, targetRoot, { recursive: true });
  console.log('Copied showcase-host/dist -> apps/registry/public/showcase/');
} else {
  console.log('[dry-run] copy showcase-host/dist -> apps/registry/public/showcase/');
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
    url: `/showcase/${entry.slug}`,
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
