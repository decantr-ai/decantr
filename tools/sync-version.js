#!/usr/bin/env node
/**
 * Sync version from package.json into static files that can't import at runtime.
 * Runs automatically via npm "version" lifecycle script.
 *
 * Usage: node tools/sync-version.js
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
const version = pkg.version;

let updated = 0;

function updateJSON(filePath, updater) {
  if (!existsSync(filePath)) return;
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const changed = updater(data);
  if (changed) {
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`  ✓ ${filePath.replace(root + '/', '')}`);
    updated++;
  }
}

function updateText(filePath, pattern, replacement) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, 'utf-8');
  const newContent = content.replace(pattern, replacement);
  if (newContent !== content) {
    writeFileSync(filePath, newContent);
    console.log(`  ✓ ${filePath.replace(root + '/', '')}`);
    updated++;
  }
}

console.log(`Syncing version ${version}...\n`);

// --- Root static files ---

updateJSON(join(root, 'server.json'), data => {
  let changed = false;
  if (data.version !== version) { data.version = version; changed = true; }
  if (Array.isArray(data.packages)) {
    for (const p of data.packages) {
      if (p.version !== version) { p.version = version; changed = true; }
    }
  }
  return changed;
});

updateJSON(join(root, '.decantr', 'manifest.json'), data => {
  if (data.version !== version) { data.version = version; return true; }
  return false;
});

updateJSON(join(root, 'src', 'registry', 'index.json'), data => {
  if (data.version !== version) { data.version = version; return true; }
  return false;
});

// --- Workbench manifest ---

updateJSON(join(root, 'workbench', '.decantr', 'manifest.json'), data => {
  if (data.version !== version) { data.version = version; return true; }
  return false;
});

// --- Showcase projects ---

const showcaseDir = join(root, 'showcase');
if (existsSync(showcaseDir)) {
  for (const name of readdirSync(showcaseDir)) {
    const dir = join(showcaseDir, name);

    // package.json — update decantr dependency version
    updateJSON(join(dir, 'package.json'), data => {
      if (data.dependencies?.decantr && data.dependencies.decantr !== '^' + version) {
        data.dependencies.decantr = '^' + version;
        return true;
      }
      return false;
    });

    // .decantr/manifest.json
    updateJSON(join(dir, '.decantr', 'manifest.json'), data => {
      if (data.version !== version) { data.version = version; return true; }
      return false;
    });

    // CLAUDE.md — version in header line
    updateText(
      join(dir, 'CLAUDE.md'),
      /Built with \[decantr\]\(https:\/\/decantr\.ai\) v[\d.]+/,
      `Built with [decantr](https://decantr.ai) v${version}`
    );
  }
}

console.log(`\n  Done — ${updated} file${updated !== 1 ? 's' : ''} updated.\n`);
