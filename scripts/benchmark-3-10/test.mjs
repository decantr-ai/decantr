#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const repositoryRoot = resolve(root, '..', '..');
const files = await collectTests(root);
if (files.length === 0) {
  console.error('No Decantr 3.10 benchmark tests were found.');
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...files], {
  cwd: repositoryRoot,
  env: process.env,
  shell: false,
  stdio: 'inherit',
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);

async function collectTests(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await collectTests(path)));
    else if (entry.isFile() && entry.name.endsWith('.test.mjs')) {
      output.push(relative(repositoryRoot, path).replaceAll('\\', '/'));
    }
  }
  return output.sort();
}
