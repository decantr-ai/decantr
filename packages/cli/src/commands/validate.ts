import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { validateEssence, evaluateGuard, isSimple } from '@decantr/essence-spec';
import type { EssenceFile } from '@decantr/essence-spec';
import { success, error, warn, heading } from '../output.js';

export async function run(): Promise<void> {
  const { positionals } = parseArgs({ allowPositionals: true, strict: false });
  // positionals[0] is "validate", positionals[1] is optional path
  const essencePath = positionals[1] || join(process.cwd(), 'decantr.essence.json');

  let raw: string;
  try {
    raw = await readFile(essencePath, 'utf-8');
  } catch {
    console.error(error(`Could not read ${essencePath}`));
    console.error('  Run "decantr init" to create a project, or pass a path to an essence file.');
    process.exitCode = 1;
    return;
  }

  let essence: unknown;
  try {
    essence = JSON.parse(raw);
  } catch (e) {
    console.error(error(`Invalid JSON in ${essencePath}: ${(e as Error).message}`));
    process.exitCode = 1;
    return;
  }

  // Schema validation
  const result = validateEssence(essence);
  console.log(heading('Schema Validation'));
  if (result.valid) {
    console.log(success('Essence file is valid'));
  } else {
    for (const err of result.errors) {
      console.log(error(err));
    }
    process.exitCode = 1;
  }

  // Guard evaluation (only if schema is valid)
  if (result.valid) {
    const essenceObj = essence as EssenceFile;
    console.log(heading('Guard Rules'));
    const violations = evaluateGuard(essenceObj, {});
    if (violations.length === 0) {
      console.log(success('All guard rules pass'));
    } else {
      for (const v of violations) {
        if (v.severity === 'error') {
          console.log(error(`${v.rule}: ${v.message}`));
        } else {
          console.log(warn(`${v.rule}: ${v.message}`));
        }
      }
    }
  }
}
