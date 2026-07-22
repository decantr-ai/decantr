#!/usr/bin/env node
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJsonFile } from '../runner/canonical.mjs';
import { assertRuntimeMatrix } from './runtime-matrix.mjs';

export async function listRuntimeProfiles(options) {
  const matrix = assertRuntimeMatrix(await readJsonFile(options.matrixPath));
  const available = matrix.profiles.map((profile) => profile.id).sort();
  if (options.profile && !available.includes(options.profile)) {
    throw new Error(`runtime profile is absent from the matrix: ${options.profile}`);
  }
  return options.profile ? [options.profile] : available;
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--matrix') options.matrixPath = resolve(argv[++index]);
    else if (argument === '--profile') options.profile = argv[++index];
    else throw new Error(`Unknown option: ${argument}`);
  }
  if (!options.matrixPath) throw new Error('--matrix is required');
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    console.log(JSON.stringify(await listRuntimeProfiles(parseArgs(process.argv.slice(2)))));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
