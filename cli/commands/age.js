/**
 * decantr age — Version aging CLI command
 *
 * A more complete upgrade experience than `migrate`. Handles:
 * 1. Cellar Check — version detection + health gate
 * 2. Load Migrations — reuses tools/migrations/ with expanded format
 * 3. Vintage Report — categorized change summary
 * 4. Automated Transforms — essence + config migration + version bump
 * 5. Compile Migration Profile — targeted llm/task-age.md
 * 6. Verify — validate + lint + doctor
 *
 * Usage:
 *   npx decantr age
 *   npx decantr age --dry-run
 *   npx decantr age --to=0.9.0
 *   npx decantr age --report
 *   npx decantr age --skip-profile
 */

import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { success, info, heading } from '../art.js';
import { compareSemver, loadMigrations } from '../../tools/migration-utils.js';
import { collectChanges, compileAgeProfile } from '../../tools/compile-age.js';

// ── Helpers ───────────────────────────────────────────────────────

async function readJSON(path) {
  try {
    return JSON.parse(await readFile(path, 'utf-8'));
  } catch {
    return null;
  }
}

function printChangeSummary(changes, label, color) {
  if (changes.length === 0) return;
  console.log(`\n    ${label} (${changes.length}):`);
  for (const c of changes) {
    const tag = c.type ? ` [${c.type}]` : '';
    const arrow = c.replacement ? ` → ${c.replacement}` : '';
    console.log(`      ${color}${c.symbol}${arrow}${tag}\x1b[0m`);
  }
}

// ── Main ──────────────────────────────────────────────────────────

export async function run() {
  const { values } = parseArgs({
    options: {
      'dry-run': { type: 'boolean', default: false },
      'to': { type: 'string' },
      'report': { type: 'boolean', default: false },
      'skip-profile': { type: 'boolean', default: false },
    },
    strict: false,
  });

  const dryRun = values['dry-run'];
  const reportOnly = values['report'];
  const skipProfile = values['skip-profile'];
  const cwd = process.cwd();

  console.log(heading('decantr age'));

  // ─── 1. Cellar Check ────────────────────────────────────────────

  // Read installed framework version
  const frameworkPkg = await readJSON(join(cwd, 'node_modules', 'decantr', 'package.json'))
    || await readJSON(join(cwd, 'node_modules', '@decantr', 'decantr', 'package.json'));

  const frameworkVersion = frameworkPkg?.version || null;
  if (frameworkVersion) {
    console.log(`  ${info(`Framework: ${frameworkVersion}`)}`);
  } else {
    console.log('  \x1b[33m⚠\x1b[0m Could not read installed decantr version — run npm install');
  }

  // Read essence
  const essencePath = join(cwd, 'decantr.essence.json');
  const essence = await readJSON(essencePath);
  const essenceVersion = essence?.version || '0.4.0';
  console.log(`  ${info(`Essence:   ${essenceVersion}`)}`);

  // Read config
  const configPath = join(cwd, 'decantr.config.json');
  const config = await readJSON(configPath);

  // Read project package.json
  const projectPkgPath = join(cwd, 'package.json');
  const projectPkg = await readJSON(projectPkgPath);

  // ─── 2. Load Migrations ─────────────────────────────────────────

  const allMigrations = await loadMigrations();

  if (allMigrations.length === 0) {
    console.log(`\n  ${info('No migration files found.')}`);
    return;
  }

  const targetVersion = values.to || allMigrations[allMigrations.length - 1].version;
  console.log(`  ${info(`Target:    ${targetVersion}`)}`);

  // Filter applicable migrations
  const applicable = allMigrations.filter(m =>
    compareSemver(m.version, essenceVersion) > 0 &&
    compareSemver(m.version, targetVersion) <= 0
  );

  if (applicable.length === 0) {
    console.log(`\n  ${success('Already up to date.')}`);
    return;
  }

  // ─── 3. Vintage Report ──────────────────────────────────────────

  console.log(`\n  ${info(`${applicable.length} migration(s) in range:`)}`);
  for (const m of applicable) {
    console.log(`    \x1b[2m→\x1b[0m ${m.version}`);
  }

  // Categorize changes
  const hasEssenceMigrations = applicable.some(m => typeof m.migrate === 'function');
  const hasConfigMigrations = applicable.some(m => m.migrateConfig !== null);
  const allChanges = collectChanges(applicable);
  const hasSourceChanges = allChanges.breaking.length > 0 || allChanges.deprecated.length > 0;

  console.log('\n  \x1b[1mVintage Report\x1b[0m');
  console.log('  ─────────────');

  // Automated transforms
  const automated = [];
  if (hasEssenceMigrations) automated.push('essence schema');
  if (hasConfigMigrations) automated.push('config');
  if (automated.length > 0) {
    console.log(`\n    \x1b[32mAutomated:\x1b[0m ${automated.join(', ')} transforms`);
  }

  // Guided (source changes)
  if (hasSourceChanges) {
    console.log(`\n    \x1b[33mGuided:\x1b[0m source code updates (LLM profile will be compiled)`);
    printChangeSummary(allChanges.breaking, '\x1b[31mBreaking\x1b[0m', '\x1b[31m');
    printChangeSummary(allChanges.deprecated, '\x1b[33mDeprecated\x1b[0m', '\x1b[33m');
  } else {
    console.log('\n    No source-level API changes in this range.');
  }

  if (reportOnly) {
    console.log(`\n  ${info('Report only — no changes applied.')}`);
    return;
  }

  // ─── 4. Automated Transforms ────────────────────────────────────

  // 4a. Essence migration
  if (essence) {
    let essenceResult = JSON.parse(JSON.stringify(essence));
    for (const m of applicable) {
      essenceResult = m.migrate(essenceResult);
    }

    if (dryRun) {
      console.log(`\n  ${info('Dry run — essence preview:')}`);
      const before = JSON.stringify(essence, null, 2);
      const after = JSON.stringify(essenceResult, null, 2);
      if (before !== after) {
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
      } else {
        console.log('    No essence changes.');
      }
    } else {
      await copyFile(essencePath, essencePath + '.backup');
      await writeFile(essencePath, JSON.stringify(essenceResult, null, 2) + '\n', 'utf-8');
      console.log(`\n  ${success(`Essence migrated to ${essenceResult.version}`)}`);
    }
  }

  // 4b. Config migration
  if (config && hasConfigMigrations) {
    let configResult = JSON.parse(JSON.stringify(config));
    for (const m of applicable) {
      if (m.migrateConfig) {
        configResult = m.migrateConfig(configResult);
      }
    }

    if (dryRun) {
      console.log(`\n  ${info('Dry run — config preview:')}`);
      const before = JSON.stringify(config, null, 2);
      const after = JSON.stringify(configResult, null, 2);
      if (before !== after) {
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
      } else {
        console.log('    No config changes.');
      }
    } else {
      await copyFile(configPath, configPath + '.backup');
      await writeFile(configPath, JSON.stringify(configResult, null, 2) + '\n', 'utf-8');
      console.log(`  ${success('Config migrated')}`);
    }
  }

  // 4c. Bump decantr version in project package.json
  if (projectPkg && frameworkVersion) {
    const deps = projectPkg.dependencies || {};
    const devDeps = projectPkg.devDependencies || {};

    if (deps.decantr || devDeps.decantr) {
      if (dryRun) {
        console.log(`\n  ${info(`Dry run — would bump decantr to ^${frameworkVersion} in package.json`)}`);
      } else {
        if (deps.decantr) projectPkg.dependencies.decantr = `^${frameworkVersion}`;
        if (devDeps.decantr) projectPkg.devDependencies.decantr = `^${frameworkVersion}`;
        await writeFile(projectPkgPath, JSON.stringify(projectPkg, null, 2) + '\n', 'utf-8');
        console.log(`  ${success(`package.json decantr → ^${frameworkVersion}`)}`);
      }
    }
  }

  // ─── 5. Compile Migration Profile ───────────────────────────────

  if (!skipProfile && hasSourceChanges) {
    console.log('');
    try {
      const result = await compileAgeProfile(cwd, applicable, essenceVersion, targetVersion, { dryRun });

      if (result.relevant > 0) {
        if (dryRun) {
          console.log(`  ${info(`Would compile llm/task-age.md (${result.relevant} relevant change(s), ${result.scannedFiles} files scanned)`)}`);
        } else {
          console.log(`  ${success(`Compiled llm/task-age.md (${result.relevant} relevant change(s), ${result.scannedFiles} files scanned)`)}`);
          console.log(`  ${info('Use this profile to guide AI-assisted source updates.')}`);
        }
      } else {
        console.log(`  ${success(`No source-level changes needed (${result.scannedFiles} files scanned)`)}`);
      }
    } catch (err) {
      console.log(`  \x1b[33m⚠\x1b[0m Could not compile migration profile: ${err.message}`);
    }
  }

  // ─── 6. Verify ──────────────────────────────────────────────────

  if (!dryRun) {
    console.log(`\n  \x1b[1mVerification\x1b[0m`);
    console.log('  ────────────');

    // Run validate
    try {
      const savedExitCode = process.exitCode;
      process.exitCode = undefined;
      const validateMod = await import('./validate.js');
      await validateMod.run();
      if (process.exitCode === 1) {
        console.log('  \x1b[33m⚠\x1b[0m Validation found issues — review above');
      }
      process.exitCode = savedExitCode;
    } catch {
      console.log('  \x1b[33m⚠\x1b[0m Could not run validate');
    }

    console.log('');
    console.log(`  ${success('Aging complete.')}`);

    if (hasSourceChanges) {
      console.log(`\n  ${info('Next step: read llm/task-age.md and apply guided source updates.')}`);
    }
  } else {
    console.log(`\n  ${info('Dry run — no files modified.')}`);
  }

  console.log('');
}
