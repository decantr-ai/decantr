import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EssenceFile } from '@decantr/essence-spec';
import { isV3, migrateV2ToV3, validateEssence } from '@decantr/essence-spec';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

export interface MigrateResult {
  success: boolean;
  backupPath?: string;
  error?: string;
  alreadyV3?: boolean;
}

/**
 * Migrate a v2 essence file to v3 format in-place.
 * Creates a .v2.backup.json backup before overwriting.
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

  let essence: EssenceFile;
  try {
    essence = JSON.parse(raw);
  } catch (e) {
    return { success: false, error: `Invalid JSON: ${(e as Error).message}` };
  }

  // Already v3
  if (isV3(essence)) {
    return { success: true, alreadyV3: true };
  }

  // Validate v2 before migration
  const preValidation = validateEssence(essence);
  if (!preValidation.valid) {
    return {
      success: false,
      error: `v2 essence is invalid, fix before migrating: ${preValidation.errors.join(', ')}`,
    };
  }

  // Create backup
  const backupPath = essencePath.replace(/\.json$/, '.v2.backup.json');
  try {
    copyFileSync(essencePath, backupPath);
  } catch (e) {
    return { success: false, error: `Could not create backup: ${(e as Error).message}` };
  }

  // Migrate
  let v3: ReturnType<typeof migrateV2ToV3>;
  try {
    v3 = migrateV2ToV3(essence);
  } catch (e) {
    return { success: false, error: `Migration failed: ${(e as Error).message}` };
  }

  // Validate v3 output
  const postValidation = validateEssence(v3);
  if (!postValidation.valid) {
    return {
      success: false,
      backupPath,
      error: `Migrated v3 essence is invalid: ${postValidation.errors.join(', ')}`,
    };
  }

  // Write migrated file
  try {
    writeFileSync(essencePath, JSON.stringify(v3, null, 2) + '\n');
  } catch (e) {
    return {
      success: false,
      backupPath,
      error: `Could not write migrated file: ${(e as Error).message}`,
    };
  }

  return { success: true, backupPath };
}

/**
 * CLI handler for `decantr migrate`.
 */
export async function cmdMigrate(projectRoot: string = process.cwd()): Promise<void> {
  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    console.error(`${RED}No decantr.essence.json found. Run \`decantr init\` first.${RESET}`);
    process.exitCode = 1;
    return;
  }

  console.log('Migrating essence to v3...\n');

  const result = migrateEssenceFile(essencePath);

  if (result.alreadyV3) {
    console.log(`${GREEN}Already v3 — no migration needed.${RESET}`);
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
  console.log('');
  console.log(`${YELLOW}Review the migrated file and run \`decantr validate\` to verify.${RESET}`);
}
