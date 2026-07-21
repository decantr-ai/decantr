#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { arch, cpus, platform, release, tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalizePackedTarball } from './canonical-package-tarball.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureRoot = join(repoRoot, 'fixtures', 'qualification', '3.9');
const compatibilityPath = join(fixtureRoot, 'compatibility-manifest.json');
const packetPath = join(fixtureRoot, 'qualification-packet.json');
const missingEvidencePath = join(fixtureRoot, 'missing-evidence.json');

const PACKAGE_WAVE = [
  '@decantr/content',
  '@decantr/registry',
  '@decantr/core',
  '@decantr/verifier',
  '@decantr/mcp-server',
  '@decantr/cli',
];

const EXPECTED_PACKAGE_VERSIONS = Object.fromEntries(PACKAGE_WAVE.map((name) => [name, '3.9.4']));
const EXPECTED_SCHEMA_IDS = [
  'https://decantr.ai/schemas/scan-report.v2.json',
  'https://decantr.ai/schemas/verification-report.common.v2.json',
  'https://decantr.ai/schemas/project-health-report.v2.json',
  'https://decantr.ai/schemas/decantr-ci-report.v2.json',
  'https://decantr.ai/schemas/workspace-health-report.v2.json',
  'https://decantr.ai/schemas/evidence-bundle.v2.json',
  'https://decantr.ai/schemas/runtime-probe-payload.v2.json',
  'https://decantr.ai/schemas/loop-readiness.v2.json',
  'https://decantr.ai/schemas/authority-resolution.v2.json',
  'https://decantr.ai/schemas/proof-field-report.v2.json',
];

const COMMAND_GATES = {
  'scan-latency': 2_000,
  'contract-only-attach-latency': 10_000,
  'task-preparation-latency': 2_000,
};

const TARGETS = [
  {
    id: 'tanstack-start-dashboard',
    kind: 'brownfield',
    repository: 'https://github.com/Kiranism/tanstack-start-dashboard.git',
    ref: '433a5a073c944d25dcd59922b4de7193bde3c03e',
    projectPath: '.',
    route: '/dashboard/overview',
  },
  {
    id: 'bulletproof-react-vite',
    kind: 'brownfield',
    repository: 'https://github.com/alan2207/bulletproof-react.git',
    ref: '9506629ed003a561c6627735480cce4994244bb4',
    projectPath: 'apps/react-vite',
    route: '/app/discussions',
  },
  {
    id: 'tanstack-start-greenfield',
    kind: 'greenfield-generator',
    package: '@tanstack/cli',
    version: '0.69.6',
    projectPath: '.',
    route: '/',
  },
];

const EXCLUDED_TREE_DIRECTORIES = new Set([
  '.cache',
  '.git',
  '.next',
  '.nuxt',
  '.output',
  '.parcel-cache',
  '.pnpm-store',
  '.svelte-kit',
  '.turbo',
  '.vercel',
  '.vite',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'playwright-report',
  'target',
  'vendor',
]);

const TASK_REQUEST = `Qualify a governed route change without changing behavior. ${'Preserve source authority and report any drift. '.repeat(600)}`;

function parseArgs(argv) {
  const options = {
    runs: 30,
    workDir: join(tmpdir(), `decantr-3.9-machine-qualification-${Date.now()}`),
    keep: false,
    skipBuild: false,
    writePacket: false,
    reuseTargets: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--') continue;
    if (arg === '--runs') options.runs = Number(argv[++index]);
    else if (arg.startsWith('--runs=')) options.runs = Number(arg.slice('--runs='.length));
    else if (arg === '--work-dir') options.workDir = resolve(argv[++index] ?? '');
    else if (arg.startsWith('--work-dir='))
      options.workDir = resolve(arg.slice('--work-dir='.length));
    else if (arg === '--keep') options.keep = true;
    else if (arg === '--skip-build') options.skipBuild = true;
    else if (arg === '--write-packet') options.writePacket = true;
    else if (arg === '--reuse-targets') options.reuseTargets = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/run-3-9-machine-qualification.mjs [options]

  --runs <n>          Isolated runs per target and command (default: 30)
  --work-dir <path>   Qualification scratch directory
  --skip-build        Reuse current package dist output
  --reuse-targets     Reuse exact prepared target bases in work-dir
  --write-packet      Write content-addressed evidence into the 3.9 packet (requires 30 runs)
  --keep              Retain scratch files after success`);
      process.exit(0);
    } else throw new Error(`Unknown option: ${arg}`);
  }
  if (!Number.isInteger(options.runs) || options.runs < 1) {
    throw new Error('--runs must be a positive integer.');
  }
  if (options.writePacket && options.runs !== 30) {
    throw new Error('--write-packet requires exactly 30 isolated runs per target and command.');
  }
  return options;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function sha256File(path) {
  return sha256(readFileSync(path));
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map((entry) => stableJson(entry)).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .filter((key) => value[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function hashJson(value) {
  return sha256(stableJson(value));
}

export function createBehaviorEvidenceBinding(exactPackageTarballs, behavior) {
  const schemaVersion = 'decantr-behavior-evidence-binding.v1';
  return {
    schemaVersion,
    packageSetSha256: hashJson(exactPackageTarballs),
    behaviorSha256: hashJson(behavior),
    boundEvidenceSha256: hashJson({ schemaVersion, exactPackageTarballs, behavior }),
  };
}

function canonicalBytes(value) {
  return Buffer.byteLength(stableJson(value), 'utf8');
}

function parseJson(text, label) {
  const trimmed = text.trim();
  const candidates = [trimmed];
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) candidates.push(text.slice(start, end + 1));
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next bounded candidate.
    }
  }
  throw new Error(`${label} did not return valid JSON.\n${text.slice(0, 2_000)}`);
}

function run(command, args, options = {}) {
  const startedAt = process.hrtime.bigint();
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: { ...process.env, ...(options.env ?? {}) },
    encoding: 'utf8',
    shell: false,
    timeout: options.timeoutMs ?? 180_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  const durationMs = Number((process.hrtime.bigint() - startedAt) / 1_000_000n);
  const output = {
    command: [command, ...args],
    exitCode: result.status,
    signal: result.signal ?? null,
    durationMs,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error ? String(result.error.message ?? result.error) : null,
  };
  if (!options.allowFailure && output.exitCode !== 0) {
    throw new Error(
      `${output.command.join(' ')} exited ${output.exitCode ?? output.signal ?? 'without status'}.\n${output.stdout}\n${output.stderr}`,
    );
  }
  return output;
}

function runJson(command, args, options = {}) {
  const result = run(command, args, options);
  return { ...result, json: parseJson(result.stdout, options.label ?? args.join(' ')) };
}

function nearestRank(values, percentile) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.ceil(percentile * sorted.length) - 1];
}

function copyTree(source, destination) {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, {
    recursive: true,
    dereference: false,
    preserveTimestamps: true,
    filter(path) {
      const name = basename(path);
      if (path !== source && EXCLUDED_TREE_DIRECTORIES.has(name)) return false;
      return true;
    },
  });
}

function normalizeRelative(path) {
  return path.replace(/\\/gu, '/').replace(/^\.\//u, '') || '.';
}

function selectedAppRoot(stateRoot, target) {
  return target.projectPath === '.' ? stateRoot : join(stateRoot, target.projectPath);
}

function projectArgs(target) {
  return target.projectPath === '.' ? [] : ['--project', target.projectPath];
}

function treeSnapshot(root) {
  const files = [];
  function visit(directory, prefix = '') {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      if (entry.isDirectory() && EXCLUDED_TREE_DIRECTORIES.has(entry.name)) continue;
      const absolute = join(directory, entry.name);
      const path = normalizeRelative(join(prefix, entry.name));
      if (entry.isDirectory()) visit(absolute, path);
      else if (entry.isSymbolicLink())
        files.push({ path, sha256: sha256(`symlink:${readlinkSync(absolute)}`) });
      else if (entry.isFile()) files.push({ path, sha256: sha256File(absolute) });
      else throw new Error(`Unsupported filesystem entry in qualification target: ${absolute}`);
    }
  }
  visit(root);
  return { files, sha256: hashJson(files) };
}

function changedTreePaths(before, after) {
  const beforeMap = new Map(before.files.map((entry) => [entry.path, entry.sha256]));
  const afterMap = new Map(after.files.map((entry) => [entry.path, entry.sha256]));
  return [...new Set([...beforeMap.keys(), ...afterMap.keys()])]
    .sort()
    .filter((path) => beforeMap.get(path) !== afterMap.get(path))
    .map((path) => ({
      path,
      beforeSha256: beforeMap.get(path) ?? null,
      afterSha256: afterMap.get(path) ?? null,
    }));
}

function assertNarrowIgnoreChange(path, beforeRoot, afterRoot) {
  const beforePath = join(beforeRoot, path);
  const afterPath = join(afterRoot, path);
  const before = existsSync(beforePath) ? readFileSync(beforePath, 'utf8') : '';
  const after = existsSync(afterPath) ? readFileSync(afterPath, 'utf8') : '';
  if (!after.startsWith(before))
    throw new Error(`${path} was rewritten instead of narrowly appended.`);
  const added = after
    .slice(before.length)
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
  const allowed =
    path === '.gitignore'
      ? new Set(['# Decantr cache', '.decantr/cache/'])
      : new Set([
          '# Decantr generated governance artifacts',
          '.decantr/',
          'DECANTR.md',
          'decantr.essence.json',
        ]);
  const unexpected = added.filter((line) => !allowed.has(line));
  if (unexpected.length > 0) {
    throw new Error(`${path} gained non-governance entries: ${unexpected.join(', ')}`);
  }
}

function assertBoundedTailwindSourceIsolation(change, beforeRoot, afterRoot, approval) {
  if (
    approval?.kind !== 'tailwind-v4-source-isolation' ||
    approval?.verified !== true ||
    approval?.beforeHash !== `sha256:${change.beforeSha256}` ||
    approval?.afterHash !== `sha256:${change.afterSha256}`
  ) {
    throw new Error(`${change.path} does not match its bounded Tailwind isolation receipt.`);
  }
  const before = readFileSync(join(beforeRoot, change.path), 'utf8');
  const after = readFileSync(join(afterRoot, change.path), 'utf8');
  const startMarker = '/* decantr:tailwind-source-isolation:start */';
  const endMarker = '/* decantr:tailwind-source-isolation:end */';
  const start = after.indexOf(startMarker);
  const end = after.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < start || after.indexOf(startMarker, start + startMarker.length) >= 0) {
    throw new Error(`${change.path} does not contain exactly one complete isolation block.`);
  }
  const block = after.slice(start, end + endMarker.length);
  for (const source of [
    '.decantr',
    'DECANTR.md',
    'decantr.essence.json',
    '.cursor/rules/decantr.mdc',
    '.claude/rules/decantr.md',
  ]) {
    if (!block.includes(`@source not `) || !block.includes(source)) {
      throw new Error(`${change.path} isolation block does not exclude ${source}.`);
    }
  }
  const removalStart = after.slice(Math.max(0, start - 2), start) === '\n\n' ? start - 2 : start;
  const reconstructed = `${after.slice(0, removalStart)}${after.slice(end + endMarker.length)}`;
  if (reconstructed !== before) {
    throw new Error(`${change.path} changed outside its bounded Tailwind isolation block.`);
  }
}

function classifyChangedPath(change, beforeRoot, afterRoot, approvedHostSourceMutations = new Map()) {
  const path = change.path;
  if (path === '.gitignore') {
    assertNarrowIgnoreChange(path, beforeRoot, afterRoot);
    return { ...change, classification: 'narrow-ignore-entry', owner: 'decantr' };
  }
  if (path === '.prettierignore') {
    assertNarrowIgnoreChange(path, beforeRoot, afterRoot);
    return { ...change, classification: 'narrow-formatter-ignore-entry', owner: 'decantr' };
  }
  if (path === 'DECANTR.md') {
    return { ...change, classification: 'assistant-governance-document', owner: 'decantr' };
  }
  if (path === 'decantr.essence.json') {
    return { ...change, classification: 'project-contract', owner: 'decantr' };
  }
  if (path === '.cursor/rules/decantr.mdc' || path === '.decantr/context/assistant-bridge.md') {
    return { ...change, classification: 'assistant-bridge-artifact', owner: 'decantr' };
  }
  if (path.startsWith('.decantr/')) {
    return { ...change, classification: 'generated-governance-artifact', owner: 'decantr' };
  }
  if (approvedHostSourceMutations.has(path)) {
    assertBoundedTailwindSourceIsolation(
      change,
      beforeRoot,
      afterRoot,
      approvedHostSourceMutations.get(path),
    );
    return {
      ...change,
      classification: 'bounded-tailwind-source-isolation',
      owner: 'decantr',
    };
  }
  return null;
}

function normalizeForAgreement(value, workspaceRoot, appRoot) {
  const replacements = [
    ...new Set([workspaceRoot, appRoot, realpathSync(workspaceRoot), realpathSync(appRoot)]),
  ]
    .sort((left, right) => right.length - left.length)
    .map((path) => [
      path.replace(/\\/gu, '/'),
      path === appRoot || path === realpathSync(appRoot) ? '<app>' : '<workspace>',
    ]);
  function visit(input) {
    if (Array.isArray(input)) return input.map(visit);
    if (input && typeof input === 'object') {
      return Object.fromEntries(
        Object.entries(input)
          .filter(([key]) => !['generatedAt', 'lastSync', 'savedAt', 'at'].includes(key))
          .map(([key, entry]) => [key, visit(entry)]),
      );
    }
    if (typeof input !== 'string') return input;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(input)) return '<timestamp>';
    let normalized = input.replace(/\\/gu, '/');
    for (const [from, to] of replacements) normalized = normalized.split(from).join(to);
    return normalized;
  }
  return visit(value);
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function parsePackOutput(stdout, cwd) {
  const value = JSON.parse(stdout.trim());
  const entry = Array.isArray(value) ? value[0] : value;
  if (!entry?.filename) throw new Error('pnpm pack did not report a tarball filename.');
  return resolve(cwd, entry.filename);
}

function prepareCandidate(options) {
  const candidateRoot = join(options.workDir, 'candidate');
  const rawTarballDir = join(candidateRoot, 'raw-tarballs');
  const tarballDir = join(candidateRoot, 'tarballs');
  const consumerDir = join(candidateRoot, 'consumer');
  rmSync(rawTarballDir, { recursive: true, force: true });
  rmSync(tarballDir, { recursive: true, force: true });
  rmSync(join(candidateRoot, 'canonical-sources'), { recursive: true, force: true });
  mkdirSync(rawTarballDir, { recursive: true });
  mkdirSync(tarballDir, { recursive: true });
  rmSync(consumerDir, { recursive: true, force: true });
  mkdirSync(consumerDir, { recursive: true });

  if (!options.skipBuild) {
    const filters = PACKAGE_WAVE.flatMap((name) => ['--filter', name]);
    run('pnpm', [...filters, 'build'], { cwd: repoRoot, timeoutMs: 600_000 });
  }

  const tarballs = {};
  for (const name of PACKAGE_WAVE) {
    const output = run(
      'pnpm',
      ['--filter', name, 'pack', '--pack-destination', rawTarballDir, '--json'],
      { cwd: repoRoot },
    );
    const rawTarball = parsePackOutput(output.stdout, repoRoot);
    tarballs[name] = canonicalizePackedTarball(rawTarball, name, candidateRoot, tarballDir);
  }
  writeJson(join(consumerDir, 'package.json'), {
    name: 'decantr-3-9-machine-qualification-consumer',
    private: true,
    type: 'module',
    dependencies: Object.fromEntries(PACKAGE_WAVE.map((name) => [name, `file:${tarballs[name]}`])),
  });
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], {
    cwd: consumerDir,
    timeoutMs: 600_000,
  });

  const exactPackageVersions = Object.fromEntries(
    PACKAGE_WAVE.map((name) => {
      const manifest = JSON.parse(
        readFileSync(join(consumerDir, 'node_modules', ...name.split('/'), 'package.json'), 'utf8'),
      );
      return [name, manifest.version];
    }),
  );
  if (stableJson(exactPackageVersions) !== stableJson(EXPECTED_PACKAGE_VERSIONS)) {
    throw new Error(`Packed candidate version mismatch: ${JSON.stringify(exactPackageVersions)}`);
  }
  const cliDist = join(consumerDir, 'node_modules', '@decantr', 'cli', 'dist');
  const studioChunks = readdirSync(cliDist).filter((name) => /^studio-[A-Z0-9]+\.js$/u.test(name));
  if (studioChunks.length !== 1) {
    throw new Error(
      `Packed CLI must contain exactly one Studio chunk; found ${studioChunks.join(', ') || 'none'}.`,
    );
  }

  return {
    consumerDir,
    cliPath: join(consumerDir, 'node_modules', '@decantr', 'cli', 'dist', 'bin.js'),
    mcpPath: join(consumerDir, 'node_modules', '@decantr', 'mcp-server', 'dist', 'index.js'),
    studioModulePath: join(cliDist, studioChunks[0]),
    exactPackageVersions,
    tarballs: Object.fromEntries(
      Object.entries(tarballs).map(([name, path]) => [
        name,
        { file: basename(path), sha256: sha256File(path) },
      ]),
    ),
  };
}

function prepareTargets(options) {
  const targetRoot = join(options.workDir, 'targets');
  mkdirSync(targetRoot, { recursive: true });
  for (const target of TARGETS) {
    const destination = join(targetRoot, target.id);
    if (options.reuseTargets && existsSync(destination)) {
      targetSourceRef(target, destination);
      continue;
    }
    rmSync(destination, { recursive: true, force: true });
    if (target.kind === 'brownfield') {
      mkdirSync(destination, { recursive: true });
      run('git', ['init', destination], { cwd: options.workDir });
      run('git', ['-C', destination, 'remote', 'add', 'origin', target.repository], {
        cwd: options.workDir,
      });
      run('git', ['-C', destination, 'fetch', '--depth', '1', 'origin', target.ref], {
        cwd: options.workDir,
        timeoutMs: 600_000,
      });
      run('git', ['-C', destination, 'checkout', '--detach', 'FETCH_HEAD'], {
        cwd: options.workDir,
      });
    } else {
      const name = basename(destination);
      run(
        'npx',
        [
          '--yes',
          `${target.package}@${target.version}`,
          'create',
          name,
          '--framework',
          'React',
          '--package-manager',
          'npm',
          '--toolchain',
          'biome',
          '--no-examples',
          '--no-git',
          '--no-intent',
          '--yes',
          '--target-dir',
          destination,
        ],
        { cwd: targetRoot, timeoutMs: 900_000 },
      );
      rmSync(join(destination, 'node_modules'), { recursive: true, force: true });
      rmSync(join(destination, '.git'), { recursive: true, force: true });
    }
    if (!existsSync(selectedAppRoot(destination, target))) {
      throw new Error(
        `${target.id} selected app does not exist: ${selectedAppRoot(destination, target)}`,
      );
    }
    targetSourceRef(target, destination);
  }
  return targetRoot;
}

export function validateBrownfieldTargetIdentity(target, pristineRoot) {
  const gitRootResult = run('git', ['-C', pristineRoot, 'rev-parse', '--show-toplevel'], {
    allowFailure: true,
  });
  if (gitRootResult.exitCode !== 0) {
    throw new Error(`${target.id} reusable target is not a Git checkout.`);
  }
  const expectedRoot = realpathSync(pristineRoot);
  const actualRoot = realpathSync(gitRootResult.stdout.trim());
  if (actualRoot !== expectedRoot) {
    throw new Error(
      `${target.id} reusable target resolves to a different Git checkout root: ${actualRoot}.`,
    );
  }

  const remoteResult = run('git', ['-C', pristineRoot, 'remote', 'get-url', '--all', 'origin'], {
    allowFailure: true,
  });
  const remoteUrls = remoteResult.stdout.split(/\r?\n/u).filter(Boolean);
  if (
    remoteResult.exitCode !== 0 ||
    remoteUrls.length !== 1 ||
    remoteUrls[0] !== target.repository
  ) {
    throw new Error(
      `${target.id} reusable target origin mismatch: expected ${target.repository}, received ${remoteUrls.join(', ') || 'none'}.`,
    );
  }

  const actualCommit = run('git', [
    '-C',
    pristineRoot,
    'rev-parse',
    '--verify',
    'HEAD',
  ]).stdout.trim();
  if (actualCommit !== target.ref) {
    throw new Error(
      `${target.id} reusable target HEAD mismatch: expected ${target.ref}, received ${actualCommit}.`,
    );
  }
  const status = run('git', [
    '-C',
    pristineRoot,
    'status',
    '--porcelain=v1',
    '--untracked-files=all',
    '--ignore-submodules=none',
  ]).stdout;
  if (status.length > 0) {
    throw new Error(`${target.id} reusable target is not clean:\n${status}`);
  }
  return { repository: remoteUrls[0], commit: actualCommit };
}

export function targetSourceRef(target, pristineRoot) {
  const appRoot = selectedAppRoot(pristineRoot, target);
  if (!existsSync(appRoot)) {
    throw new Error(`${target.id} selected app does not exist: ${appRoot}`);
  }
  if (target.kind === 'brownfield') {
    const identity = validateBrownfieldTargetIdentity(target, pristineRoot);
    return `${identity.repository}#${identity.commit}:${target.projectPath}`;
  }
  const snapshot = treeSnapshot(appRoot);
  return `npm:${target.package}@${target.version}:tree-sha256:${snapshot.sha256}`;
}

function cliCommand(candidate, args, cwd, options = {}) {
  return run(process.execPath, [candidate.cliPath, ...args], {
    cwd,
    timeoutMs: options.timeoutMs ?? 180_000,
    env: {
      DECANTR_OFFLINE: 'true',
      DECANTR_API_URL: 'http://127.0.0.1:9',
      ...options.env,
    },
    allowFailure: options.allowFailure,
  });
}

function cliJson(candidate, args, cwd, options = {}) {
  const result = cliCommand(candidate, args, cwd, options);
  if (result.exitCode !== 0 && !options.allowFailure) {
    throw new Error(`${args.join(' ')} failed before JSON parsing.`);
  }
  return { ...result, json: parseJson(result.stdout, args.join(' ')) };
}

function adoptionArgs(target, complete = false) {
  if (target.kind === 'greenfield-generator') {
    return [
      'init',
      '--workflow=greenfield',
      '--adoption=contract-only',
      '--assistant-bridge=apply',
      '--offline',
      '--yes',
    ];
  }
  return [
    'adopt',
    '--yes',
    '--offline',
    '--no-packs',
    ...(complete ? [] : ['--no-verify']),
    ...projectArgs(target),
  ];
}

function graphArgs(target) {
  return ['graph', ...projectArgs(target)];
}

function taskArgs(target) {
  return ['task', target.route, TASK_REQUEST, '--json', ...projectArgs(target)];
}

function prepareAdoptedTargets(options, candidate, targetRoot) {
  const adoptedRoot = join(options.workDir, 'adopted');
  const boundaries = [];
  mkdirSync(adoptedRoot, { recursive: true });
  for (const target of TARGETS) {
    const pristine = join(targetRoot, target.id);
    const adopted = join(adoptedRoot, target.id);
    copyTree(pristine, adopted);
    cliCommand(
      candidate,
      adoptionArgs(target, true),
      target.kind === 'greenfield-generator' ? selectedAppRoot(adopted, target) : adopted,
      {
        timeoutMs: 300_000,
      },
    );
    cliCommand(candidate, graphArgs(target), adopted, { timeoutMs: 180_000 });
    if (target.kind === 'greenfield-generator') {
      cliCommand(
        candidate,
        ['health', '--save-baseline', '--json'],
        selectedAppRoot(adopted, target),
        {
          timeoutMs: 180_000,
        },
      );
    }

    const beforeApp = selectedAppRoot(pristine, target);
    const afterApp = selectedAppRoot(adopted, target);
    const before = treeSnapshot(beforeApp);
    const after = treeSnapshot(afterApp);
    const rawChanges = changedTreePaths(before, after);
    const project = JSON.parse(readFileSync(join(afterApp, '.decantr', 'project.json'), 'utf8'));
    const receipt = project?.initialized?.adoption;
    const approvedHostSourceMutations = new Map(
      (receipt?.approvedHostSourceMutations ?? []).map((entry) => [entry.path, entry]),
    );
    const receiptScope = receipt?.scope?.root && receipt.scope.root !== '.' ? receipt.scope.root : '';
    const approvedAppSourceMutations = new Map(
      [...approvedHostSourceMutations.entries()].map(([path, entry]) => [
        receiptScope && path.startsWith(`${receiptScope}/`)
          ? path.slice(receiptScope.length + 1)
          : path,
        entry,
      ]),
    );
    const changedPaths = [];
    const unclassifiedPaths = [];
    for (const change of rawChanges) {
      const classified = classifyChangedPath(
        change,
        beforeApp,
        afterApp,
        approvedAppSourceMutations,
      );
      if (classified) changedPaths.push(classified);
      else unclassifiedPaths.push(change.path);
    }

    const authoredApplicationSourceChanges = [
      ...(receipt?.changes?.hostSource?.created ?? []),
      ...(receipt?.changes?.hostSource?.updated ?? []),
      ...(receipt?.changes?.hostSource?.deleted ?? []),
    ];
    const verifiedUntouched =
      receipt?.integrity?.status === 'verified-untouched' &&
      authoredApplicationSourceChanges.length === 0;
    const verifiedBounded =
      receipt?.integrity?.status === 'verified-bounded' &&
      authoredApplicationSourceChanges.length > 0 &&
      authoredApplicationSourceChanges.length === approvedHostSourceMutations.size &&
      authoredApplicationSourceChanges.every((path) => approvedHostSourceMutations.has(path));
    if (
      (!verifiedUntouched && !verifiedBounded) ||
      receipt?.integrity?.complete !== true ||
      receipt?.workflowCompleted !== true
    ) {
      throw new Error(
        `${target.id} did not retain a complete untouched or bounded adoption receipt.`,
      );
    }
    if (unclassifiedPaths.length > 0) {
      throw new Error(
        `${target.id} adoption exceeded its boundary: unclassified=${unclassifiedPaths.join(',')} source=${authoredApplicationSourceChanges.join(',')}`,
      );
    }
    boundaries.push({
      targetId: target.id,
      exhaustive: true,
      beforeTreeSha256: before.sha256,
      afterTreeSha256: after.sha256,
      changedPaths,
      unclassifiedPaths: [],
      authoredApplicationSourceChanges,
      approvedHostSourceMutations: [...approvedHostSourceMutations.values()],
      studioWrites: [],
    });
  }
  return { adoptedRoot, boundaries };
}

function measureLatency(options, candidate, targetRoot, adoptedRoot) {
  const samples = [];
  const stateRoot = join(options.workDir, 'states');
  mkdirSync(stateRoot, { recursive: true });
  for (const target of TARGETS) {
    const exactSourceRef = targetSourceRef(target, join(targetRoot, target.id));
    for (const commandId of Object.keys(COMMAND_GATES)) {
      for (let index = 1; index <= options.runs; index += 1) {
        const suffix = String(index).padStart(2, '0');
        const temporaryProjectStateId = `${target.id}-${commandId}-${suffix}`;
        const state = join(stateRoot, temporaryProjectStateId);
        const source =
          commandId === 'task-preparation-latency'
            ? join(adoptedRoot, target.id)
            : join(targetRoot, target.id);
        copyTree(source, state);

        let args;
        let cwd = state;
        if (commandId === 'scan-latency') args = ['scan', '--json', ...projectArgs(target)];
        else if (commandId === 'contract-only-attach-latency') {
          args = adoptionArgs(target, false);
          if (target.kind === 'greenfield-generator') cwd = selectedAppRoot(state, target);
        } else {
          cliCommand(candidate, graphArgs(target), state, { timeoutMs: 180_000 });
          args = taskArgs(target);
        }

        const result = cliCommand(candidate, args, cwd, { timeoutMs: 180_000, allowFailure: true });
        if (result.exitCode !== 0) {
          throw new Error(
            `${temporaryProjectStateId} exited ${result.exitCode}.\n${result.stdout}\n${result.stderr}`,
          );
        }
        samples.push({
          sampleId: `sample-${temporaryProjectStateId}`,
          targetId: target.id,
          commandId,
          temporaryProjectStateId,
          durationMs: result.durationMs,
          exitCode: 0,
          command: [process.execPath, candidate.cliPath, ...args],
          exactSourceRef,
        });
        rmSync(state, { recursive: true, force: true });
      }
    }
  }

  for (const target of TARGETS) {
    for (const [commandId, maximumMs] of Object.entries(COMMAND_GATES)) {
      const group = samples.filter(
        (sample) => sample.targetId === target.id && sample.commandId === commandId,
      );
      if (group.length !== options.runs)
        throw new Error(`${target.id}/${commandId} sample count drifted.`);
      const p95 = nearestRank(
        group.map((sample) => sample.durationMs),
        0.95,
      );
      if (p95 > maximumMs)
        throw new Error(`${target.id}/${commandId} p95 ${p95}ms exceeds ${maximumMs}ms.`);
    }
  }
  return samples;
}

function writeProbeScripts(candidate) {
  const mcpProbePath = join(candidate.consumerDir, 'mcp-qualification-probe.mjs');
  writeFileSync(
    mcpProbePath,
    `import { spawn } from 'node:child_process';

const [projectRoot, route, task] = process.argv.slice(2);
const child = spawn(process.execPath, [${JSON.stringify(candidate.mcpPath)}], {
  cwd: projectRoot,
  env: { ...process.env, DECANTR_OFFLINE: 'true', DECANTR_API_URL: 'http://127.0.0.1:9' },
  stdio: ['pipe', 'pipe', 'pipe'],
});
child.stdout.setEncoding('utf8');
child.stderr.setEncoding('utf8');

let nextId = 1;
let stdoutBuffer = '';
let stderrBuffer = '';
let exited = false;
const pending = new Map();
const exitPromise = new Promise((resolve) => {
  child.once('exit', (code, signal) => {
    exited = true;
    const detail = stderrBuffer.trim();
    const error = new Error('MCP server exited before completing the probe (' + (signal ?? code) + ')' + (detail ? ': ' + detail : ''));
    for (const request of pending.values()) request.reject(error);
    pending.clear();
    resolve();
  });
});

child.stderr.on('data', (chunk) => {
  stderrBuffer += chunk;
});
child.stdout.on('data', (chunk) => {
  stdoutBuffer += chunk;
  while (true) {
    const newline = stdoutBuffer.indexOf('\\n');
    if (newline < 0) break;
    const line = stdoutBuffer.slice(0, newline).replace(/\\r$/u, '');
    stdoutBuffer = stdoutBuffer.slice(newline + 1);
    if (!line.trim()) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch (error) {
      for (const request of pending.values()) request.reject(new Error('Invalid MCP JSON response: ' + error.message));
      pending.clear();
      continue;
    }
    if (!Object.hasOwn(message, 'id')) continue;
    const request = pending.get(message.id);
    if (!request) continue;
    pending.delete(message.id);
    if (message.error) request.reject(new Error('MCP ' + request.method + ' failed: ' + JSON.stringify(message.error)));
    else request.resolve(message.result);
  }
});

function send(message) {
  child.stdin.write(JSON.stringify(message) + '\\n');
}

function request(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { method, resolve, reject });
    send({ jsonrpc: '2.0', id, method, params });
  });
}

try {
  await request('initialize', {
    protocolVersion: '2025-11-25',
    capabilities: {},
    clientInfo: { name: 'decantr-3-9-qualification', version: '1.0.0' },
  });
  send({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} });
  const listed = await request('tools/list');
  const stateResult = await request('tools/call', { name: 'decantr_project', arguments: { action: 'state', project_path: projectRoot } });
  const taskResult = await request('tools/call', { name: 'decantr_context', arguments: { action: 'task', project_path: projectRoot, route, task, detail: 'compact' } });
  const parse = (result) => JSON.parse(result.content.find((entry) => entry.type === 'text')?.text ?? '{}');
  console.log(JSON.stringify({ tools: listed.tools, state: parse(stateResult), task: parse(taskResult) }));
} finally {
  child.stdin.end();
  await Promise.race([exitPromise, new Promise((resolve) => setTimeout(resolve, 1_000))]);
  if (!exited) child.kill();
}
`,
    'utf8',
  );

  const studioProbePath = join(candidate.consumerDir, 'studio-qualification-probe.mjs');
  writeFileSync(
    studioProbePath,
    `import { pathToFileURL } from 'node:url';
const [mode, projectRoot, reportPath] = process.argv.slice(2);
const { startStudioServer } = await import(pathToFileURL(${JSON.stringify(candidate.studioModulePath)}).href);
const options = { port: 0 };
if (mode === 'workspace') options.workspace = true;
if (mode === 'saved-v2' || mode === 'saved-v3') options.report = reportPath;
const handle = await startStudioServer(projectRoot, options);
try {
  const endpoint = mode === 'current-project' ? '/api/adoption-truth' : mode === 'workspace' ? '/api/workspace' : '/api/studio-state';
  const response = await fetch(handle.url + endpoint);
  const payload = await response.json();
  if (!response.ok) throw new Error(mode + ' returned ' + response.status + ': ' + JSON.stringify(payload));
  console.log(JSON.stringify({ mode, payload }));
} finally {
  await new Promise((resolve, reject) => handle.server.close((error) => error ? reject(error) : resolve()));
}
`,
    'utf8',
  );

  const contentProbePath = join(candidate.consumerDir, 'content-qualification-probe.mjs');
  writeFileSync(
    contentProbePath,
    `import { searchContent } from '@decantr/content';
if (process.argv[2] === 'network-denied') {
  globalThis.fetch = async () => { throw new Error('network denied by qualification probe'); };
}
console.log(JSON.stringify(searchContent({ q: 'navigation', limit: 50 })));
`,
    'utf8',
  );
  return { mcpProbePath, studioProbePath, contentProbePath };
}

function taskBudget(cliTask, mcpTask) {
  const cliBudget = cliTask.taskCapsuleBudget ?? cliTask.task_capsule_budget;
  const mcpBudget = mcpTask.task_capsule_budget ?? mcpTask.taskCapsuleBudget;
  const budgetValues = [cliBudget, mcpBudget].map((budget) => ({
    canonicalBytes: budget?.canonicalBytes ?? budget?.canonical_bytes,
    tokenEstimateV1:
      budget?.tokenEstimateV1 ?? budget?.token_estimate_v1 ?? budget?.estimatedTokens,
  }));
  if (
    budgetValues.some(
      (budget) =>
        !Number.isInteger(budget.canonicalBytes) ||
        !Number.isInteger(budget.tokenEstimateV1) ||
        budget.tokenEstimateV1 !== Math.ceil(budget.canonicalBytes / 3) ||
        budget.canonicalBytes > 12_000 ||
        budget.tokenEstimateV1 > 4_000,
    )
  ) {
    throw new Error('Task responses do not expose canonical capsule budget metadata.');
  }
  const canonicalBytesValue = Math.max(...budgetValues.map((budget) => budget.canonicalBytes));
  const result = {
    canonicalBytes: canonicalBytesValue,
    tokenEstimateV1: Math.ceil(canonicalBytesValue / 3),
    cliPayloadBytes: canonicalBytes(cliTask),
    mcpPayloadBytes: canonicalBytes(mcpTask),
  };
  if (
    result.canonicalBytes > 12_000 ||
    result.tokenEstimateV1 !== Math.ceil(result.canonicalBytes / 3) ||
    result.tokenEstimateV1 > 4_000 ||
    result.cliPayloadBytes > 12_000 ||
    result.mcpPayloadBytes > 12_000
  ) {
    throw new Error(`Task capsule/payload budget failed: ${JSON.stringify(result)}`);
  }
  return result;
}

function taskDigest(task) {
  const reported = task.taskCapsuleDigest ?? task.task_capsule_digest;
  if (typeof reported === 'string') {
    const normalized = reported.replace(/^sha256:/u, '');
    if (/^[a-f0-9]{64}$/u.test(normalized)) return normalized;
  }
  return hashJson(task);
}

function writeReport(path, report) {
  writeJson(path, report);
  return path;
}

function probeTarget(options, candidate, probes, target, adoptedRoot, boundary) {
  const stateRoot = join(adoptedRoot, target.id);
  const appRoot = selectedAppRoot(stateRoot, target);
  const reportsDir = join(options.workDir, 'reports', target.id);
  mkdirSync(reportsDir, { recursive: true });

  cliCommand(candidate, graphArgs(target), stateRoot);
  const doctor = cliJson(candidate, ['doctor', '--json', ...projectArgs(target)], stateRoot);
  const cliTask = cliJson(candidate, taskArgs(target), stateRoot);
  const ciV2 = cliJson(
    candidate,
    ['ci', '--fail-on', 'none', '--json', ...projectArgs(target)],
    stateRoot,
  );
  const ciV3a = cliJson(
    candidate,
    ['ci', '--report-version', 'v3', '--fail-on', 'none', '--json', ...projectArgs(target)],
    stateRoot,
  );
  const ciV3b = cliJson(
    candidate,
    ['ci', '--report-version', 'v3', '--fail-on', 'none', '--json', ...projectArgs(target)],
    stateRoot,
  );
  const mcp = runJson(
    process.execPath,
    [probes.mcpProbePath, appRoot, target.route, TASK_REQUEST],
    { cwd: candidate.consumerDir, timeoutMs: 180_000, label: `${target.id} MCP probe` },
  ).json;

  const normalize = (value) => normalizeForAgreement(value, stateRoot, appRoot);
  const adoptionHashes = {
    cliSha256: hashJson(normalize(doctor.json.adoptionTruth)),
    mcpSha256: hashJson(normalize(mcp.state.adoption_truth)),
    ciV3Sha256: hashJson(normalize(ciV3a.json.adoptionTruth)),
  };

  const v2Path = writeReport(join(reportsDir, 'ci-v2.json'), ciV2.json);
  const v3Path = writeReport(join(reportsDir, 'ci-v3.json'), ciV3a.json);
  const beforeStudio = treeSnapshot(appRoot);
  const studioCurrent = runJson(
    process.execPath,
    [probes.studioProbePath, 'current-project', appRoot, ''],
    { cwd: candidate.consumerDir, label: `${target.id} current Studio` },
  ).json;
  const studioWorkspace = runJson(
    process.execPath,
    [probes.studioProbePath, 'workspace', stateRoot, ''],
    { cwd: candidate.consumerDir, label: `${target.id} workspace Studio` },
  ).json;
  const studioV2 = runJson(
    process.execPath,
    [probes.studioProbePath, 'saved-v2', appRoot, v2Path],
    { cwd: candidate.consumerDir, label: `${target.id} v2 Studio` },
  ).json;
  const studioV3 = runJson(
    process.execPath,
    [probes.studioProbePath, 'saved-v3', appRoot, v3Path],
    { cwd: candidate.consumerDir, label: `${target.id} v3 Studio` },
  ).json;
  const afterStudio = treeSnapshot(appRoot);
  const studioWrites = changedTreePaths(beforeStudio, afterStudio).map((entry) => entry.path);
  if (studioWrites.length > 0)
    throw new Error(`${target.id} Studio wrote: ${studioWrites.join(', ')}`);
  boundary.studioWrites = [];
  adoptionHashes.studioSha256 = hashJson(normalize(studioCurrent.payload));
  if (new Set(Object.values(adoptionHashes)).size !== 1) {
    throw new Error(`${target.id} adoption truth differs across CLI, MCP, CI v3, and Studio.`);
  }

  const contentBundled = runJson(process.execPath, [probes.contentProbePath, 'bundled'], {
    cwd: candidate.consumerDir,
    label: `${target.id} bundled content`,
  }).json;
  const contentDenied = runJson(process.execPath, [probes.contentProbePath, 'network-denied'], {
    cwd: candidate.consumerDir,
    label: `${target.id} network-denied content`,
  }).json;
  const bundledDigest = hashJson(contentBundled);
  const networkDeniedDigest = hashJson(contentDenied);
  if (bundledDigest !== networkDeniedDigest)
    throw new Error(`${target.id} content offline parity failed.`);

  const v2NewFindingCount =
    target.kind === 'brownfield' ? ciV2.json.baselineGate?.newFindings?.length : null;
  const v3NewFindingCount =
    target.kind === 'brownfield' ? ciV3a.json.governanceDelta?.summary?.newCount : null;
  if (target.kind === 'brownfield' && (v2NewFindingCount !== 0 || v3NewFindingCount !== 0)) {
    throw new Error(
      `${target.id} immediate CI found v2=${v2NewFindingCount}, v3=${v3NewFindingCount}.`,
    );
  }

  const contractDigests = [
    taskDigest(cliTask.json),
    taskDigest(cliJson(candidate, taskArgs(target), stateRoot).json),
  ];
  const deltaDigests = [
    hashJson(normalize(ciV3a.json.governanceDelta)),
    hashJson(normalize(ciV3b.json.governanceDelta)),
  ];
  if (new Set(contractDigests).size !== 1 || new Set(deltaDigests).size !== 1) {
    throw new Error(`${target.id} task/governance determinism failed.`);
  }

  return {
    result: {
      targetId: target.id,
      adoptionAgreement: adoptionHashes,
      immediateCi: {
        applicable: target.kind === 'brownfield',
        v2NewFindingCount,
        v3NewFindingCount,
      },
      taskCapsuleBudget: taskBudget(cliTask.json, mcp.task),
      determinism: { runCount: 2, contractDigests, deltaDigests },
      contentResolution: { bundledDigest, networkDeniedDigest },
      studioModes: {
        currentProject: Boolean(studioCurrent.payload?.schemaVersion === 1),
        workspace: Boolean(studioWorkspace.payload?.projects),
        savedV2: Boolean(studioV2.payload),
        savedV3: Boolean(studioV3.payload),
      },
      reproducibility: {
        exactSourceRef: targetSourceRef(target, join(options.workDir, 'targets', target.id)),
        commandIds: Object.keys(COMMAND_GATES),
        temporaryStateCount: options.runs * Object.keys(COMMAND_GATES).length,
      },
    },
    mcpTools: mcp.tools,
    defaultSchema: ciV2.json.$schema,
    explicitSchema: ciV3a.json.$schema,
    taskVersion: cliTask.json.taskCapsuleVersion,
  };
}

function normalizeMcpTools(tools) {
  return tools.map((tool) => ({
    name: tool.name,
    actions: tool.inputSchema?.properties?.action?.enum ?? [],
  }));
}

function verifyV2Schemas(candidate) {
  const verifierRoot = join(candidate.consumerDir, 'node_modules', '@decantr', 'verifier');
  for (const id of EXPECTED_SCHEMA_IDS) {
    const filename = basename(new URL(id).pathname);
    const path = join(verifierRoot, 'schema', filename);
    if (!existsSync(path)) throw new Error(`Packed verifier is missing ${filename}.`);
    if (JSON.parse(readFileSync(path, 'utf8')).$id !== id)
      throw new Error(`${filename} schema ID drifted.`);
  }
  const golden = run(
    'pnpm',
    [
      'exec',
      'vitest',
      'run',
      'packages/verifier/test/schema.test.ts',
      'packages/cli/test/ci-v3.test.ts',
    ],
    { cwd: repoRoot, timeoutMs: 300_000 },
  );
  return golden.exitCode === 0;
}

function verifyWorkspaceCi(candidate, adoptedRoot) {
  const target = TARGETS.find((entry) => entry.id === 'bulletproof-react-vite');
  const root = join(adoptedRoot, target.id);
  const project = cliJson(
    candidate,
    ['ci', '--report-version', 'v3', '--fail-on', 'none', '--json', ...projectArgs(target)],
    root,
  ).json;
  const workspace = cliJson(
    candidate,
    ['ci', '--workspace', '--report-version', 'v3', '--fail-on', 'none', '--json'],
    root,
  ).json;
  return { projectMode: project.mode === 'project', workspaceMode: workspace.mode === 'workspace' };
}

function artifactEnvironment(candidate, targetRoot) {
  const compatibilityHash = sha256File(compatibilityPath);
  const packageSetSha256 = hashJson(candidate.tarballs);
  const harnessSha256 = sha256File(fileURLToPath(import.meta.url));
  return {
    os: `${platform()} ${release()}`,
    cpu: `${arch()} ${cpus()[0]?.model ?? 'unknown'}`,
    nodeVersion: process.version,
    packageManagerVersion: run('pnpm', ['--version']).stdout.trim(),
    exactSourceRef: `compatibility-manifest.json@sha256:${compatibilityHash};targets:${hashJson(
      TARGETS.map((target) => targetSourceRef(target, join(targetRoot, target.id))),
    )};harness-sha256:${harnessSha256};package-set-sha256:${packageSetSha256}`,
    exactPackageVersions: candidate.exactPackageVersions,
    exactPackageTarballs: candidate.tarballs,
  };
}

function artifactReference(path, payload) {
  return {
    path: normalizeRelative(relative(repoRoot, path)),
    sha256: sha256File(path),
    mediaType: 'application/json',
    generatedAt: payload.generatedAt,
    command: payload.command,
    exitCode: payload.exitCode,
    environment: payload.environment,
    behaviorBinding: payload.behaviorBinding,
  };
}

function writeContentAddressedArtifact(directory, payload) {
  const contents = `${JSON.stringify(payload, null, 2)}\n`;
  const digest = sha256(contents);
  const path = join(directory, `${payload.schemaVersion}.${digest}.json`);
  mkdirSync(directory, { recursive: true });
  writeFileSync(path, contents, 'utf8');
  return path;
}

function updatePacket(machine, adoption, machinePath, adoptionPath) {
  const packet = JSON.parse(readFileSync(packetPath, 'utf8'));
  packet.machineReplay = {
    status: 'complete',
    artifact: artifactReference(machinePath, machine),
    latencySamples: machine.latencySamples,
    targetResults: machine.targetResults,
    mcp: machine.mcp,
    v2Compatibility: machine.v2Compatibility,
    reportCompatibility: machine.reportCompatibility,
    workspaceCi: machine.workspaceCi,
  };
  packet.adoptionBoundaryReplay = {
    status: 'complete',
    artifact: artifactReference(adoptionPath, adoption),
    targets: adoption.targets,
  };
  writeJson(packetPath, packet);

  const missing = JSON.parse(readFileSync(missingEvidencePath, 'utf8'));
  const completed = new Set(['MACHINE_QUALIFICATION_REPLAY', 'ADOPTION_BOUNDARY_REPLAY']);
  missing.items = missing.items.filter((item) => !completed.has(item.id));
  writeJson(missingEvidencePath, missing);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  mkdirSync(options.workDir, { recursive: true });
  const command = [
    process.execPath,
    normalizeRelative(relative(repoRoot, fileURLToPath(import.meta.url))),
    ...process.argv.slice(2),
  ];
  console.log(`Qualification work directory: ${options.workDir}`);
  console.log(`Preparing packed 3.9 candidate...`);
  const candidate = prepareCandidate(options);
  console.log(`Preparing exact target snapshots...`);
  const targetRoot = prepareTargets(options);
  console.log(`Preparing canonical adopted targets and source-boundary evidence...`);
  const { adoptedRoot, boundaries } = prepareAdoptedTargets(options, candidate, targetRoot);
  console.log(
    `Running ${options.runs * TARGETS.length * Object.keys(COMMAND_GATES).length} isolated latency samples...`,
  );
  const latencySamples = measureLatency(options, candidate, targetRoot, adoptedRoot);
  const probes = writeProbeScripts(candidate);
  console.log('Probing CLI/MCP/CI/Studio agreement and compatibility...');
  const targetProbes = TARGETS.map((target) =>
    probeTarget(
      options,
      candidate,
      probes,
      target,
      adoptedRoot,
      boundaries.find((entry) => entry.targetId === target.id),
    ),
  );
  const mcp = { tools: normalizeMcpTools(targetProbes[0].mcpTools) };
  if (
    targetProbes.some(
      (probe) => stableJson(normalizeMcpTools(probe.mcpTools)) !== stableJson(mcp.tools),
    )
  ) {
    throw new Error('MCP inventory changed between target probes.');
  }
  const manifest = JSON.parse(readFileSync(compatibilityPath, 'utf8'));
  if (stableJson(mcp.tools) !== stableJson(manifest.mcp.tools))
    throw new Error('Packed MCP inventory drifted.');
  const goldenOutputTestsPassed = verifyV2Schemas(candidate);
  const workspaceCi = verifyWorkspaceCi(candidate, adoptedRoot);
  if (!workspaceCi.projectMode || !workspaceCi.workspaceMode)
    throw new Error('Project/workspace CI modes failed.');

  const generatedAt = new Date().toISOString();
  const environment = artifactEnvironment(candidate, targetRoot);
  const machine = {
    schemaVersion: 'decantr-machine-qualification-artifact.v1',
    generatedAt,
    command,
    exitCode: 0,
    environment,
    latencySamples,
    targetResults: targetProbes.map((probe) => probe.result),
    mcp,
    v2Compatibility: {
      schemaIds: EXPECTED_SCHEMA_IDS,
      goldenOutputTestsPassed,
      defaultReportSchema: targetProbes[0].defaultSchema,
    },
    reportCompatibility: {
      defaultV2: targetProbes.every(
        (probe) => probe.defaultSchema === 'https://decantr.ai/schemas/decantr-ci-report.v2.json',
      ),
      explicitV3: targetProbes.every(
        (probe) => probe.explicitSchema === 'https://decantr.ai/schemas/decantr-ci-report.v3.json',
      ),
      taskCapsuleV1: targetProbes.every(
        (probe) => probe.taskVersion === 1 || probe.taskVersion === 'task-capsule.v1',
      ),
    },
    workspaceCi,
  };
  const adoption = {
    schemaVersion: 'decantr-adoption-boundary-replay-artifact.v1',
    generatedAt,
    command,
    exitCode: 0,
    environment,
    targets: boundaries,
  };
  machine.behaviorBinding = createBehaviorEvidenceBinding(environment.exactPackageTarballs, {
    latencySamples: machine.latencySamples,
    targetResults: machine.targetResults,
    mcp: machine.mcp,
    v2Compatibility: machine.v2Compatibility,
    reportCompatibility: machine.reportCompatibility,
    workspaceCi: machine.workspaceCi,
  });
  adoption.behaviorBinding = createBehaviorEvidenceBinding(environment.exactPackageTarballs, {
    targets: adoption.targets,
  });
  if (!Object.values(machine.reportCompatibility).every(Boolean)) {
    throw new Error(`Report compatibility failed: ${JSON.stringify(machine.reportCompatibility)}`);
  }

  const evidenceDir = options.writePacket
    ? join(fixtureRoot, 'evidence')
    : join(options.workDir, 'evidence');
  const machinePath = writeContentAddressedArtifact(evidenceDir, machine);
  const adoptionPath = writeContentAddressedArtifact(evidenceDir, adoption);
  if (options.writePacket) updatePacket(machine, adoption, machinePath, adoptionPath);

  const summary = {
    status: 'pass',
    runsPerTargetCommand: options.runs,
    sampleCount: latencySamples.length,
    targetCount: machine.targetResults.length,
    packageVersions: candidate.exactPackageVersions,
    packageTarballs: candidate.tarballs,
    machineArtifact: normalizeRelative(relative(repoRoot, machinePath)),
    machineSha256: sha256File(machinePath),
    adoptionArtifact: normalizeRelative(relative(repoRoot, adoptionPath)),
    adoptionSha256: sha256File(adoptionPath),
    packetUpdated: options.writePacket,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!options.keep && !options.writePacket)
    rmSync(options.workDir, { recursive: true, force: true });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
    process.exitCode = 1;
  });
}
