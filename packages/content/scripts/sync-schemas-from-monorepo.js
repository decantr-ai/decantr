// Maintainer-only utility. Refreshes the vendored copies in `schemas/` from a
// sibling `decantr-monorepo` checkout. External contributors do not need to run
// this — the vendored schemas are committed to this repo and `npm run validate`
// uses them as-is.

import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const monorepoRoot = process.env.DECANTR_MONOREPO_DIR
  ? resolve(process.env.DECANTR_MONOREPO_DIR)
  : resolve(repoRoot, '..', 'decantr-monorepo');
const registrySchemaDir = join(monorepoRoot, 'packages', 'registry', 'schema');
const essenceSchemaDir = join(monorepoRoot, 'packages', 'essence-spec', 'schema');
const targetDir = join(repoRoot, 'schemas');

if (!existsSync(registrySchemaDir)) {
  console.error(`Registry schema source not found: ${registrySchemaDir}`);
  console.error('Set DECANTR_MONOREPO_DIR to a Decantr monorepo checkout and try again.');
  process.exit(1);
}

if (!existsSync(essenceSchemaDir)) {
  console.error(`Essence schema source not found: ${essenceSchemaDir}`);
  console.error('Set DECANTR_MONOREPO_DIR to a Decantr monorepo checkout and try again.');
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });

for (const file of readdirSync(registrySchemaDir).filter(name => name.endsWith('.json'))) {
  copyFileSync(join(registrySchemaDir, file), join(targetDir, file));
}

copyFileSync(join(essenceSchemaDir, 'essence.v4.json'), join(targetDir, 'essence.v4.json'));

console.log(`Synced registry schemas from ${registrySchemaDir}`);
console.log(`Synced Essence V4 schema from ${essenceSchemaDir}`);
