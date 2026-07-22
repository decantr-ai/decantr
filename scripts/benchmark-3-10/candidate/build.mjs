#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashRuntimeTree } from '../runner/candidate-runtime.mjs';
import { prettyCanonicalJson, sha256, writeCanonicalFile } from '../runner/canonical.mjs';
import { runFixed } from '../runner/process.mjs';

const benchmarkRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(benchmarkRoot, '..', '..');
const candidatePackages = [
  '@decantr/essence-spec',
  '@decantr/core',
  '@decantr/telemetry',
  '@decantr/content',
  '@decantr/verifier',
  '@decantr/cli',
];

export async function buildCandidate(options) {
  const source = inspectSource(options.repositoryRoot);
  if (!source.clean && !options.allowDirty) {
    throw new Error('candidate builds require a clean Git worktree; use --allow-dirty only for no-cost development smoke tests');
  }
  await prepareEmptyDirectory(options.outputRoot, options.force);
  const tarballRoot = join(options.outputRoot, 'tarballs');
  const runtimeRoot = join(options.outputRoot, 'runtime');
  await mkdir(tarballRoot, { recursive: true });
  await mkdir(runtimeRoot, { recursive: true });

  run('pnpm', ['--filter', '@decantr/cli...', 'build'], options.repositoryRoot, 1_800_000);
  const tarballs = [];
  for (const packageName of candidatePackages) {
    const before = new Set(await listTarballs(tarballRoot));
    run(
      'pnpm',
      ['--filter', packageName, 'pack', '--pack-destination', tarballRoot],
      options.repositoryRoot,
      300_000,
    );
    const created = (await listTarballs(tarballRoot)).filter((file) => !before.has(file));
    if (created.length !== 1) throw new Error(`${packageName}: pack did not create exactly one tarball`);
    const path = join(tarballRoot, created[0]);
    tarballs.push({
      package: packageName,
      path: relative(options.outputRoot, path).split('\\').join('/'),
      sha256: sha256(await readFile(path)),
    });
  }

  const runtimePackage = {
    name: 'decantr-3-10-candidate-runtime',
    version: '0.0.0-private',
    private: true,
    dependencies: Object.fromEntries(
      tarballs.map((item) => [item.package, `file:../${item.path}`]),
    ),
  };
  await writeFile(join(runtimeRoot, 'package.json'), prettyCanonicalJson(runtimePackage));
  run(
    'npm',
    ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'],
    runtimeRoot,
    1_800_000,
  );
  run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], runtimeRoot, 1_800_000);

  const runtimeFiles = ['package-lock.json', 'node_modules/@decantr'];
  const lockPath = join(runtimeRoot, 'package-lock.json');
  const manifest = {
    schemaVersion: 'decantr-benchmark-candidate.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    version: options.versionLabel,
    builtAt: options.builtAt,
    source,
    tarballs: tarballs.sort((left, right) => left.package.localeCompare(right.package)),
    contextProvider: {
      type: 'decantr-cli-task-v1',
      package: '@decantr/cli',
      entrypoint: 'node_modules/@decantr/cli/dist/bin.js',
      outputSchemaVersion: 'ui-surface-task-context.v1',
      runtimeLock: {
        path: 'package-lock.json',
        sha256: sha256(await readFile(lockPath)),
      },
      runtimeFiles,
      runtimeTreeSha256: await hashRuntimeTree(runtimeRoot, runtimeFiles),
    },
  };
  const manifestPath = join(options.outputRoot, 'candidate.json');
  await writeCanonicalFile(manifestPath, manifest);
  return {
    manifestPath,
    manifestSha256: sha256(await readFile(manifestPath)),
    runtimeRoot,
    sourceClean: source.clean,
    tarballCount: tarballs.length,
  };
}

function inspectSource(root) {
  const commit = git(root, ['rev-parse', 'HEAD']);
  const tree = git(root, ['rev-parse', 'HEAD^{tree}']);
  const status = git(root, ['status', '--porcelain=v1', '--untracked-files=all']);
  const diff = execFileSync('git', ['-C', root, 'diff', '--binary', 'HEAD'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    repository: 'https://github.com/decantr-ai/decantr',
    commit,
    tree,
    clean: status === '',
    dirtyStatusSha256: sha256(status),
    trackedDiffSha256: sha256(diff),
  };
}

async function prepareEmptyDirectory(path, force) {
  try {
    const entries = await readdir(path);
    if (entries.length > 0 && !force) throw new Error(`candidate output is not empty: ${path}`);
    if (entries.length > 0) await rm(path, { recursive: true, force: true });
  } catch (error) {
    if (error && typeof error === 'object' && error.code !== 'ENOENT') throw error;
  }
  await mkdir(path, { recursive: true });
}

async function listTarballs(path) {
  return (await readdir(path)).filter((file) => file.endsWith('.tgz')).sort();
}

function run(command, args, cwd, timeoutMs) {
  const result = runFixed(command, args, {
    cwd,
    env: process.env,
    timeoutMs,
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.exitCode !== 0) {
    throw new Error(
      `${basename(command)} ${args.join(' ')} failed (${result.exitCode ?? result.signal ?? 'unknown'}): ${result.stderr.slice(-2000)}`,
    );
  }
}

function git(root, args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
}

function parseArgs(argv) {
  const options = {
    repositoryRoot,
    outputRoot: join(repositoryRoot, '.private', 'benchmark-3-10', 'candidate'),
    versionLabel: '3.10.0-development',
    builtAt: new Date().toISOString(),
    allowDirty: false,
    force: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--repository-root') options.repositoryRoot = resolve(argv[++index]);
    else if (argument === '--out') options.outputRoot = resolve(argv[++index]);
    else if (argument === '--version-label') options.versionLabel = argv[++index];
    else if (argument === '--built-at') options.builtAt = new Date(argv[++index]).toISOString();
    else if (argument === '--allow-dirty') options.allowDirty = true;
    else if (argument === '--force') options.force = true;
    else throw new Error(`Unknown option: ${argument}`);
  }
  if (!/^3\.10\.0(?:[-+][a-z0-9.-]+)?$/iu.test(options.versionLabel)) {
    throw new Error('--version-label must identify a 3.10.0 candidate');
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await buildCandidate(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
