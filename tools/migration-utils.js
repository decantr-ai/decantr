/**
 * Shared migration utilities used by both `migrate` and `age` commands.
 *
 * Exports:
 * - compareSemver(a, b) — compare two semver strings (-1, 0, 1)
 * - loadMigrations() — load all migration modules from tools/migrations/ in semver order
 */

import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, 'migrations');

/**
 * Compare two semver strings. Returns -1, 0, or 1.
 */
export function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] < pb[i]) return -1;
    if (pa[i] > pb[i]) return 1;
  }
  return 0;
}

/**
 * Load all migration modules from tools/migrations/ in semver order.
 * Each module exports at minimum { version: string, migrate: (essence) => essence }.
 * New modules may also export migrateConfig(config) and changes manifest.
 */
export async function loadMigrations() {
  let files;
  try {
    files = await readdir(MIGRATIONS_DIR);
  } catch {
    return [];
  }

  const jsFiles = files
    .filter(f => /^\d+\.\d+\.\d+\.js$/.test(f))
    .sort((a, b) => compareSemver(a.replace('.js', ''), b.replace('.js', '')));

  const migrations = [];
  for (const file of jsFiles) {
    const mod = await import(join(MIGRATIONS_DIR, file));
    if (mod.version && typeof mod.migrate === 'function') {
      migrations.push({
        version: mod.version,
        migrate: mod.migrate,
        migrateConfig: typeof mod.migrateConfig === 'function' ? mod.migrateConfig : null,
        changes: mod.changes || null,
        file,
      });
    }
  }

  return migrations;
}
