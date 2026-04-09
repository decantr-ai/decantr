import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getActiveShowcaseEntries, showcaseRoot, repoRoot } from './showcase-manifest.mjs';

const dryRun = process.argv.includes('--dry-run');
const targetRoot = join(repoRoot, 'apps', 'registry', 'public', 'showcase');

for (const entry of getActiveShowcaseEntries()) {
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
