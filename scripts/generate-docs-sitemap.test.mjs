import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const generatorPath = fileURLToPath(new URL('./generate-docs-sitemap.mjs', import.meta.url));
const sitemapPath = fileURLToPath(new URL('../docs/sitemap.xml', import.meta.url));

test('active sitemap excludes historical evidence and program directories', () => {
  execFileSync(process.execPath, [generatorPath], {
    cwd: repoRoot,
    stdio: 'pipe',
  });

  const sitemap = readFileSync(sitemapPath, 'utf8');

  assert.doesNotMatch(sitemap, /https:\/\/decantr\.ai\/audit\//);
  assert.doesNotMatch(sitemap, /https:\/\/decantr\.ai\/benchmarks\//);
  assert.doesNotMatch(sitemap, /https:\/\/decantr\.ai\/legacy\//);
  assert.doesNotMatch(sitemap, /https:\/\/decantr\.ai\/programs\//);
  assert.match(sitemap, /https:\/\/decantr\.ai\/guides\/existing-apps\.md/);
  assert.match(sitemap, /https:\/\/decantr\.ai\/reference\/workflow-model\.md/);
  assert.match(sitemap, /https:\/\/decantr\.ai\/releases\/2026-07-21-decantr-3-9-4-tailwind-source-isolation\.md/);
});
