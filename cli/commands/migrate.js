/**
 * decantr migrate — Automated migration for decantr.essence.json
 *
 * Detects the current essence version, applies migrations in semver order,
 * and writes the updated essence back. Supports --dry-run for preview
 * and --target=<version> for migrating to a specific version.
 *
 * Usage:
 *   npx decantr migrate
 *   npx decantr migrate --dry-run
 *   npx decantr migrate --target=0.5.0
 */

import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { success, info, heading } from '../art.js';
import { compareSemver, loadMigrations } from '../../tools/migration-utils.js';

export async function run() {
  const { values } = parseArgs({
    options: {
      'dry-run': { type: 'boolean', default: false },
      'target': { type: 'string' },
    },
    strict: false,
  });

  const dryRun = values['dry-run'];
  const cwd = process.cwd();
  const essencePath = join(cwd, 'decantr.essence.json');

  console.log(heading('decantr migrate'));

  // 1. Read essence
  let raw;
  try {
    raw = await readFile(essencePath, 'utf-8');
  } catch {
    console.error('  \x1b[31m\u2717\x1b[0m decantr.essence.json not found in current directory.');
    console.error('    Run the CLARIFY stage to create your project essence.');
    process.exitCode = 1;
    return;
  }

  let essence;
  try {
    essence = JSON.parse(raw);
  } catch {
    console.error('  \x1b[31m\u2717\x1b[0m decantr.essence.json contains invalid JSON.');
    process.exitCode = 1;
    return;
  }

  // 2. Detect current version (default to 0.4.0 if missing)
  const currentVersion = essence.version || '0.4.0';
  console.log(`  ${info(`Current version: ${currentVersion}`)}`);

  // 3. Load migrations
  const allMigrations = await loadMigrations();

  if (allMigrations.length === 0) {
    console.log(`  ${info('No migration files found.')}`);
    return;
  }

  // Determine target version (default: latest migration)
  const targetVersion = values.target || allMigrations[allMigrations.length - 1].version;
  console.log(`  ${info(`Target version:  ${targetVersion}`)}`);

  // 4. Filter applicable migrations: > current and <= target
  const applicable = allMigrations.filter(m =>
    compareSemver(m.version, currentVersion) > 0 &&
    compareSemver(m.version, targetVersion) <= 0
  );

  if (applicable.length === 0) {
    console.log(`\n  ${success('Already up to date.')}`);
    return;
  }

  console.log(`\n  ${info(`${applicable.length} migration(s) to apply:`)}`);
  for (const m of applicable) {
    console.log(`    \x1b[2m\u2192\x1b[0m ${m.version} (${m.file})`);
  }

  // 5. Apply migrations in order
  let result = JSON.parse(JSON.stringify(essence)); // deep clone
  for (const m of applicable) {
    result = m.migrate(result);
  }

  // 6. Dry run: show diff and exit
  if (dryRun) {
    console.log(`\n  ${info('Dry run \u2014 no files modified.')}`);
    console.log('\n  Changes preview:\n');

    const before = JSON.stringify(essence, null, 2);
    const after = JSON.stringify(result, null, 2);

    if (before === after) {
      console.log('    No changes detected.');
    } else {
      // Show a simple key-level diff
      const beforeLines = before.split('\n');
      const afterLines = after.split('\n');
      const maxLines = Math.max(beforeLines.length, afterLines.length);

      for (let i = 0; i < maxLines; i++) {
        const bl = beforeLines[i] ?? '';
        const al = afterLines[i] ?? '';
        if (bl !== al) {
          if (bl) console.log(`    \x1b[31m- ${bl.trim()}\x1b[0m`);
          if (al) console.log(`    \x1b[32m+ ${al.trim()}\x1b[0m`);
        }
      }
    }

    return;
  }

  // 7. Back up and write
  const backupPath = essencePath + '.backup';
  await copyFile(essencePath, backupPath);
  console.log(`\n  ${info(`Backup saved to decantr.essence.json.backup`)}`);

  const output = JSON.stringify(result, null, 2) + '\n';
  await writeFile(essencePath, output, 'utf-8');

  console.log(`  ${success(`Migrated to ${result.version}.`)}`);
  console.log(`\n  ${applicable.length} migration(s) applied successfully.`);
  console.log(`\n  ${info('Tip: `decantr age` provides a more complete upgrade experience including config migration and AI-assisted source updates.')}\n`);
}
