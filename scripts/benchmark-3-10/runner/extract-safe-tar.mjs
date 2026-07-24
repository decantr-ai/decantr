#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import {
  lstat,
  mkdir,
  readdir,
} from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extract } from 'tar';

import { assertSafeTar } from './prepared-workspace-artifact.mjs';

export async function extractSafeTar(options) {
  const tarPath = resolve(options.tarPath);
  const outputRoot = resolve(options.outputRoot);
  await mkdir(outputRoot, { recursive: true, mode: 0o700 });
  const metadata = await lstat(outputRoot);
  if (
    !metadata.isDirectory() ||
    metadata.isSymbolicLink() ||
    (await readdir(outputRoot)).length !== 0
  ) {
    throw new Error('safe tar output must be an empty real directory');
  }
  const before = await hashFile(tarPath);
  await assertSafeTar(tarPath);
  await extract({
    cwd: outputRoot,
    file: tarPath,
    preserveOwner: false,
    preservePaths: false,
    strict: true,
    unlink: true,
  });
  if ((await hashFile(tarPath)) !== before) {
    throw new Error('tar changed during safe extraction');
  }
  return { tarFileSha256: before };
}

async function hashFile(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) {
    hash.update(chunk);
  }
  return hash.digest('hex');
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--tar') {
      options.tarPath = argv[++index];
    } else if (argument === '--out') {
      options.outputRoot = argv[++index];
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }
  if (!options.tarPath || !options.outputRoot) {
    throw new Error('--tar and --out are required');
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await extractSafeTar(
      parseArgs(process.argv.slice(2)),
    );
    process.stdout.write(`${JSON.stringify({ ok: true, ...result })}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
