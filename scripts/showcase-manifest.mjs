import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const repoRoot = join(import.meta.dirname, '..');
export const showcaseRoot = join(repoRoot, 'apps', 'showcase');
export const showcaseManifestPath = join(showcaseRoot, 'manifest.json');

export function loadShowcaseManifest() {
  const raw = readFileSync(showcaseManifestPath, 'utf-8');
  const manifest = JSON.parse(raw);
  const apps = Array.isArray(manifest.apps) ? manifest.apps : [];

  return {
    ...manifest,
    apps,
  };
}

export function parseRequestedShowcaseSlugs() {
  const raw = process.env.SHOWCASE_SLUGS?.trim();
  if (!raw) return null;
  return new Set(
    raw
      .split(',')
      .map(value => value.trim())
      .filter(Boolean),
  );
}

export function getActiveShowcaseEntries() {
  const manifest = loadShowcaseManifest();
  const requested = parseRequestedShowcaseSlugs();

  return manifest.apps.filter(entry => {
    if (entry.status !== 'active') return false;
    if (!requested) return true;
    return requested.has(entry.slug);
  });
}
