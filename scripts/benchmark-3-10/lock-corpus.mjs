#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import {
  benchmarkDir,
  checkoutDirectory,
  readJson,
  sha256,
  stableJson,
} from './lib.mjs';

const options = {
  corpusPath: resolve(benchmarkDir, 'corpus.json'),
  corpusRoot: '/tmp/decantr-3-10-corpus-20260722',
  outputPath: resolve(benchmarkDir, 'corpus.lock.json'),
};

const args = process.argv.slice(2);
for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  if (argument === '--') continue;
  if (argument === '--corpus') options.corpusPath = resolve(args[++index]);
  else if (argument === '--corpus-root') options.corpusRoot = resolve(args[++index]);
  else if (argument === '--out') options.outputPath = resolve(args[++index]);
  else throw new Error(`Unknown option: ${argument}`);
}

const corpus = readJson(options.corpusPath);
const repositories = corpus.repositories.map((repository) => {
  const checkout = join(options.corpusRoot, checkoutDirectory(repository.repo));
  if (!existsSync(checkout)) throw new Error(`${repository.id}: checkout does not exist`);
  const head = git(checkout, ['rev-parse', 'HEAD']);
  const tree = git(checkout, ['rev-parse', 'HEAD^{tree}']);
  const status = git(checkout, ['status', '--porcelain=v1']);
  const origin = git(checkout, ['remote', 'get-url', 'origin']);
  const submodules = git(checkout, ['submodule', 'status', '--recursive'], true);
  if (head !== repository.commit) {
    throw new Error(`${repository.id}: expected ${repository.commit}, found ${head}`);
  }
  if (status !== '') throw new Error(`${repository.id}: checkout is dirty`);

  const evidenceFiles = collectEvidenceFiles(checkout, repository.projectPath);
  return {
    id: repository.id,
    repo: repository.repo,
    commit: head,
    tree,
    origin,
    projectPath: repository.projectPath,
    partition: repository.partition,
    license: repository.license,
    submodulesSha256: sha256(submodules),
    evidenceFiles,
  };
});

const lock = {
  schemaVersion: 'decantr-benchmark-corpus-lock.v1',
  generatedAt: new Date().toISOString(),
  corpusSha256: sha256(readFileSync(options.corpusPath)),
  repositories,
};

writeFileSync(options.outputPath, stableJson(lock), 'utf8');
console.log(
  JSON.stringify(
    {
      outputPath: options.outputPath,
      repositories: repositories.length,
      lockSha256: sha256(stableJson(lock)),
    },
    null,
    2,
  ),
);

function git(checkout, gitArgs, allowFailure = false) {
  const result = spawnSync('git', ['-C', checkout, ...gitArgs], {
    encoding: 'utf8',
    shell: false,
    timeout: 30_000,
  });
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`git ${gitArgs.join(' ')} failed in ${checkout}: ${result.stderr}`);
  }
  return result.status === 0 ? result.stdout.trim() : '';
}

function collectEvidenceFiles(checkout, projectPath) {
  const projectRoot = projectPath === '.' ? checkout : join(checkout, projectPath);
  const candidates = new Set([
    'package.json',
    'pnpm-lock.yaml',
    'package-lock.json',
    'yarn.lock',
    'bun.lock',
    'bun.lockb',
    'LICENSE',
    'LICENSE.md',
    'LICENSE.txt',
    'LICENSE-MIT',
    'LICENSE-APACHE',
    'COPYING',
  ]);
  const roots = [...new Set([checkout, projectRoot])];
  const files = [];
  for (const root of roots) {
    if (!existsSync(root) || !statSync(root).isDirectory()) continue;
    for (const name of readdirSync(root)) {
      if (!candidates.has(name)) continue;
      const absolute = join(root, name);
      if (!statSync(absolute).isFile()) continue;
      files.push({
        path: relative(checkout, absolute).replace(/\\/gu, '/') || name,
        sizeBytes: statSync(absolute).size,
        sha256: sha256(readFileSync(absolute)),
      });
    }
  }
  return files.sort((left, right) => left.path.localeCompare(right.path));
}
