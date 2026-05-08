import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EssenceV4 } from '@decantr/essence-spec';
import {
  isV4,
  migrateToV4,
  validateEssence,
  validateLegacyEssenceForMigration,
} from '@decantr/essence-spec';
import { RegistryClient } from '../registry.js';
import { refreshDerivedFiles } from '../scaffold.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

export interface MigrateResult {
  success: boolean;
  backupPath?: string;
  error?: string;
  alreadyV4?: boolean;
  essence?: EssenceV4;
}

/**
 * Migrate a legacy Essence file to v4 format in-place.
 * Creates a .pre-v4.backup.json backup before overwriting.
 */
export function migrateEssenceFile(essencePath: string): MigrateResult {
  if (!existsSync(essencePath)) {
    return { success: false, error: `File not found: ${essencePath}` };
  }

  let raw: string;
  try {
    raw = readFileSync(essencePath, 'utf-8');
  } catch (e) {
    return { success: false, error: `Could not read ${essencePath}: ${(e as Error).message}` };
  }

  let essence: unknown;
  try {
    essence = JSON.parse(raw);
  } catch (e) {
    return { success: false, error: `Invalid JSON: ${(e as Error).message}` };
  }

  if (isV4(essence)) {
    return { success: true, alreadyV4: true, essence };
  }

  const preValidation = validateLegacyEssenceForMigration(essence);
  if (!preValidation.valid) {
    return {
      success: false,
      error: `Legacy essence is invalid, fix before migrating: ${preValidation.errors.join(', ')}`,
    };
  }

  // Create backup
  const backupPath = essencePath.replace(/\.json$/, '.pre-v4.backup.json');
  try {
    copyFileSync(essencePath, backupPath);
  } catch (e) {
    return { success: false, error: `Could not create backup: ${(e as Error).message}` };
  }

  let v4: ReturnType<typeof migrateToV4>;
  try {
    v4 = migrateToV4(essence);
  } catch (e) {
    return { success: false, error: `Migration failed: ${(e as Error).message}` };
  }

  const postValidation = validateEssence(v4);
  if (!postValidation.valid) {
    return {
      success: false,
      backupPath,
      error: `Migrated v4 essence is invalid: ${postValidation.errors.join(', ')}`,
    };
  }

  // Write migrated file
  try {
    writeFileSync(essencePath, JSON.stringify(v4, null, 2) + '\n');
  } catch (e) {
    return {
      success: false,
      backupPath,
      error: `Could not write migrated file: ${(e as Error).message}`,
    };
  }

  return { success: true, backupPath, essence: v4 };
}

/**
 * CLI handler for `decantr migrate --to v4`.
 */
export async function cmdMigrate(
  projectRoot: string = process.cwd(),
  args: string[] = [],
): Promise<void> {
  const toIndex = args.indexOf('--to');
  const target = toIndex >= 0 ? args[toIndex + 1] : undefined;
  const hasInlineTarget = args.find((arg) => arg.startsWith('--to='));
  const inlineTarget = hasInlineTarget?.split('=')[1];
  const requestedTarget = inlineTarget ?? target;

  if (requestedTarget !== 'v4') {
    console.error(`${RED}Usage: decantr migrate --to v4${RESET}`);
    process.exitCode = 1;
    return;
  }

  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    console.error(`${RED}No decantr.essence.json found. Run \`decantr init\` first.${RESET}`);
    process.exitCode = 1;
    return;
  }

  console.log('Migrating essence to v4...\n');

  const result = migrateEssenceFile(essencePath);

  if (result.alreadyV4) {
    console.log(`${GREEN}Already Essence v4.0.0 — no migration needed.${RESET}`);
    return;
  }

  if (!result.success) {
    console.error(`${RED}Migration failed: ${result.error}${RESET}`);
    process.exitCode = 1;
    return;
  }

  console.log(`${GREEN}Migration successful.${RESET}`);
  if (result.backupPath) {
    console.log(`${DIM}Backup saved to: ${result.backupPath}${RESET}`);
  }
  if (result.essence) {
    const registryClient = new RegistryClient({
      cacheDir: join(projectRoot, '.decantr', 'cache'),
    });
    await refreshDerivedFiles(projectRoot, result.essence, registryClient);
    console.log(`${GREEN}Derived context and execution packs refreshed.${RESET}`);
  }
  console.log('');
  console.log(`${YELLOW}Review the migrated file and run \`decantr check\` to verify.${RESET}`);
}
