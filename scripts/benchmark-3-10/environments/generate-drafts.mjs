#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import { basename, dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  readJsonFile,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from '../runner/canonical.mjs';

const benchmarkRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(benchmarkRoot, '..', '..');
const lockfileManagers = new Map([
  ['package-lock.json', 'npm'],
  ['npm-shrinkwrap.json', 'npm'],
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
]);

const privateConfigSchemaVersion =
  'decantr-benchmark-qualification-private-generator-config.v1';

export async function generateTaskEnvironmentDrafts(options) {
  const [developmentBundle, qualificationBundle, taskOverrides] = await Promise.all([
    readJsonFile(options.developmentCandidatesPath),
    readJsonFile(options.qualificationCandidatesPath),
    readEnvironmentConfig(options.privateConfigPath),
  ]);
  const development = assertCandidateBundle(developmentBundle, 'development', 24);
  const qualification = assertCandidateBundle(qualificationBundle, 'qualification', 16);
  const candidateIds = new Set(
    [...development, ...qualification].map((candidate) => candidate.taskId),
  );
  if ([...taskOverrides.keys()].some((taskId) => !candidateIds.has(taskId))) {
    throw new Error('private environment config contains an unknown task override');
  }
  const repositories = await discoverRepositories(options.corpusRoot);
  const records = [];
  for (const candidate of [...development, ...qualification]) {
    const repository = repositories.get(normalizeRemote(candidate.repository.url));
    if (!repository) throw new Error(`${candidate.taskId}: corpus checkout is missing`);
    records.push(buildDraft(candidate, repository, taskOverrides.get(candidate.taskId)));
  }
  records.sort((left, right) => left.taskId.localeCompare(right.taskId));

  const developmentDrafts = records.filter((record) => record.partition === 'development');
  const qualificationDrafts = records.filter((record) => record.partition === 'qualification');
  const publicBundle = makeBundle('development', developmentDrafts, false);
  const privateBundle = makeBundle('qualification', qualificationDrafts, true);
  await writeCanonicalFile(options.developmentOutputPath, publicBundle);
  await writeCanonicalFile(options.qualificationOutputPath, privateBundle);
  return {
    development: developmentDrafts.length,
    qualification: qualificationDrafts.length,
    total: records.length,
    developmentSha256: sha256Canonical(publicBundle),
    qualificationSha256: sha256Canonical(privateBundle),
  };
}

function assertCandidateBundle(bundle, partition, count) {
  if (!Array.isArray(bundle?.records) || bundle.records.length !== count || bundle.count !== count) {
    throw new Error(`${partition}: expected ${count} candidate records`);
  }
  const seen = new Set();
  for (const record of bundle.records) {
    if (record?.partition !== partition || typeof record.taskId !== 'string' || seen.has(record.taskId)) {
      throw new Error(`${partition}: invalid or duplicate candidate record`);
    }
    seen.add(record.taskId);
  }
  return bundle.records;
}

async function discoverRepositories(corpusRoot) {
  const result = new Map();
  for (const entry of await readdir(corpusRoot)) {
    const path = join(corpusRoot, entry);
    if (!(await stat(path)).isDirectory()) continue;
    let remote;
    try {
      remote = git(path, ['remote', 'get-url', 'origin']).trim();
    } catch {
      continue;
    }
    const normalized = normalizeRemote(remote);
    if (result.has(normalized)) throw new Error(`duplicate corpus remote: ${normalized}`);
    result.set(normalized, path);
  }
  return result;
}

function buildDraft(candidate, repository, taskOverride = {}) {
  const actualTree = git(repository, ['rev-parse', `${candidate.base.commit}^{tree}`]).trim();
  if (actualTree !== candidate.base.tree) {
    throw new Error(`${candidate.taskId}: base tree mismatch`);
  }
  const paths = git(repository, ['ls-tree', '-r', '--name-only', candidate.base.commit])
    .split('\n')
    .filter(Boolean);
  const metadata = readMetadata(candidate, repository, paths);
  const manager = selectPackageManager(candidate, metadata, taskOverride);
  const lockfilePath = selectLockfile(candidate, paths, manager.name);
  const lockfile = gitBuffer(repository, ['show', `${candidate.base.commit}:${lockfilePath}`]);
  const profile = selectProfile(candidate, manager, metadata, taskOverride);
  const sourceEvidence = buildEvidence(metadata, lockfilePath, lockfile, manager);
  return {
    schemaVersion: 'decantr-benchmark-task-environment.v1',
    taskId: candidate.taskId,
    partition: candidate.partition,
    base: structuredClone(candidate.base),
    projectPath: candidate.repository.projectPath,
    profile,
    lockfiles: [{ path: lockfilePath, sha256: sha256(lockfile) }],
    sourceEvidence,
    preparation: preparationCommands(candidate, manager, lockfilePath, taskOverride),
    cleanAfterPreparation: true,
    review: {
      status: 'draft',
      reviewedBy: null,
      reviewedAt: null,
      notes: 'Generated from frozen repository evidence; independent runtime and command review is required.',
    },
  };
}

function readMetadata(candidate, repository, paths) {
  const manifestPaths = paths.includes('package.json') ? ['package.json'] : [];
  const projectManifest = posix.join(candidate.repository.projectPath, 'package.json').replace(/^\.\//u, '');
  if (projectManifest !== 'package.json' && paths.includes(projectManifest)) manifestPaths.push(projectManifest);
  if (manifestPaths.length === 0) {
    throw new Error(`${candidate.taskId}: no package manifest exists at the project base`);
  }
  const manifests = manifestPaths.map((path) => {
    const bytes = gitBuffer(repository, ['show', `${candidate.base.commit}:${path}`]);
    return { path, bytes, value: JSON.parse(bytes.toString('utf8')) };
  });
  const hintPaths = ['.node-version', '.nvmrc', '.tool-versions'];
  const hints = hintPaths
    .filter((path) => paths.includes(path))
    .map((path) => {
      const bytes = gitBuffer(repository, ['show', `${candidate.base.commit}:${path}`]);
      return { path, bytes, value: bytes.toString('utf8').trim() };
    });
  return { manifests, hints };
}

function selectPackageManager(candidate, metadata, taskOverride = {}) {
  for (const manifest of [...metadata.manifests].reverse()) {
    const parsed = parsePackageManager(manifest.value.packageManager);
    if (parsed) return { ...parsed, evidencePath: manifest.path };
  }
  const environment = String(candidate.environment?.environment ?? '');
  const named = inferManagerName(candidate);
  const exact = exactNamedVersion(environment, named);
  const fallback = taskOverride.runtimeFallback?.[named];
  const version = exact ?? fallback;
  if (!version) throw new Error(`${candidate.taskId}: exact ${named} version requires a reviewed fallback`);
  return { name: named, version, evidencePath: null };
}

function inferManagerName(candidate) {
  const install = String(candidate.environment?.install ?? '').toLowerCase();
  if (/\bbun\b/u.test(install)) return 'bun';
  if (/\bpnpm\b/u.test(install)) return 'pnpm';
  if (/\byarn\b/u.test(install)) return 'yarn';
  if (/\bnpm\b/u.test(install)) return 'npm';
  throw new Error(`${candidate.taskId}: package manager is not inferable`);
}

function parsePackageManager(value) {
  const match = /^(npm|pnpm|yarn|bun)@([0-9]+\.[0-9]+(?:\.[0-9]+)?)/u.exec(String(value ?? ''));
  return match ? { name: match[1], version: normalizeVersion(match[2]) } : null;
}

function selectProfile(candidate, manager, metadata, taskOverride = {}) {
  const fallback = taskOverride.runtimeFallback ?? {};
  if (manager.name === 'bun') {
    const bunVersion = manager.version ?? fallback.bun;
    if (!bunVersion) throw new Error(`${candidate.taskId}: exact Bun version is missing`);
    return makeProfile(null, bunVersion, manager);
  }
  const nodeVersion = inferNodeVersion(candidate, metadata) ?? fallback.node;
  if (!nodeVersion) throw new Error(`${candidate.taskId}: exact Node version requires a reviewed fallback`);
  return makeProfile(nodeVersion, null, manager);
}

function inferNodeVersion(candidate, metadata) {
  for (const manifest of [...metadata.manifests].reverse()) {
    const version = normalizeExactVersion(manifest.value?.volta?.node);
    if (version) return version;
  }
  for (const hint of metadata.hints) {
    const raw = hint.path === '.tool-versions'
      ? /^nodejs\s+([^\s]+)$/mu.exec(hint.value)?.[1]
      : hint.value;
    const version = normalizeExactVersion(raw);
    if (version) return version;
  }
  const environment = String(candidate.environment?.environment ?? '');
  const match = /\bNode\s+(?![><=^~])v?([0-9]+\.[0-9]+(?:\.[0-9]+)?)(?!\.x)/iu.exec(environment);
  return normalizeExactVersion(match?.[1]);
}

function makeProfile(nodeVersion, bunVersion, manager) {
  const runtime = nodeVersion ? `node-${nodeVersion}` : `bun-${bunVersion}`;
  const id = `${runtime}-${manager.name}-${manager.version}`;
  return {
    id,
    os: 'linux',
    arch: 'x64',
    nodeVersion,
    bunVersion,
    packageManager: { name: manager.name, version: manager.version },
  };
}

function selectLockfile(candidate, paths, manager) {
  const matches = paths.filter((path) => lockfileManagers.get(basename(path)) === manager);
  if (matches.length === 0) throw new Error(`${candidate.taskId}: no ${manager} lockfile exists at the base commit`);
  const projectPath = candidate.repository.projectPath === '.' ? '' : candidate.repository.projectPath.replace(/\/$/u, '');
  const exactProject = matches.find((path) => dirname(path) === (projectPath || '.'));
  if (exactProject) return exactProject;
  const root = matches.find((path) => !path.includes('/'));
  if (root) return root;
  if (matches.length === 1) return matches[0];
  throw new Error(`${candidate.taskId}: relevant ${manager} lockfile is ambiguous`);
}

function buildEvidence(metadata, lockfilePath, lockfile, manager) {
  const evidence = metadata.manifests.map((manifest) => ({
    kind: 'package-manifest',
    path: manifest.path,
    sha256: sha256(manifest.bytes),
    statement: `Manifest evidence considered for ${manager.name} and runtime selection.`,
  }));
  for (const hint of metadata.hints) {
    evidence.push({
      kind: 'runtime-hint',
      path: hint.path,
      sha256: sha256(hint.bytes),
      statement: `Runtime hint observed at the frozen base: ${hint.value}`,
    });
  }
  evidence.push({
    kind: 'lockfile',
    path: lockfilePath,
    sha256: sha256(lockfile),
    statement: `Selected ${manager.name} lockfile for deterministic dependency preparation.`,
  });
  // Source evidence is verified inside the frozen checkout. Candidate metadata
  // may inform a draft fallback, but it is not workspace evidence.
  return evidence.sort((left, right) => left.path.localeCompare(right.path));
}

function preparationCommands(candidate, manager, lockfilePath, taskOverride = {}) {
  const cwd = dirname(lockfilePath) === '.' ? '.' : dirname(lockfilePath);
  const defaultArgs = manager.name === 'npm'
    ? ['ci']
    : ['install', '--frozen-lockfile'];
  const install = {
    id: 'install-dependencies',
    executable: manager.name,
    args: structuredClone(taskOverride.install?.args ?? defaultArgs),
    cwd,
    timeoutMs: 7_200_000,
    network: 'dependency-registry',
    required: true,
    ...(taskOverride.install?.environment
      ? { environment: structuredClone(taskOverride.install.environment) }
      : {}),
  };
  return [
    ...structuredClone(taskOverride.preparation?.beforeInstall ?? []),
    install,
    ...structuredClone(taskOverride.preparation?.afterInstall ?? []),
  ];
}

function makeBundle(partition, records, privateBundle) {
  return {
    schemaVersion: 'decantr-benchmark-task-environment-draft-bundle.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    partition,
    confidentiality: privateBundle
      ? 'PRIVATE: sealed qualification runtime and repository details.'
      : 'public development environment drafts; not confirmatory evidence',
    count: records.length,
    records,
    bundleSha256: sha256Canonical(records),
  };
}

function exactNamedVersion(value, name) {
  const match = new RegExp(`\\b${name}\\s+([0-9]+\\.[0-9]+(?:\\.[0-9]+)?)\\b`, 'iu').exec(value);
  return normalizeExactVersion(match?.[1]);
}

function normalizeExactVersion(value) {
  const match = /^v?([0-9]+)(?:\.([0-9]+))?(?:\.([0-9]+))?$/u.exec(String(value ?? '').trim());
  if (!match || !match[2]) return null;
  return `${Number(match[1])}.${Number(match[2])}.${Number(match[3] ?? 0)}`;
}

function normalizeVersion(value) {
  return normalizeExactVersion(value) ?? String(value);
}

function normalizeRemote(value) {
  return String(value).trim().replace(/\.git$/iu, '').replace(/^git@github\.com:/iu, 'https://github.com/').toLowerCase();
}

function git(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function gitBuffer(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'buffer',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function readEnvironmentConfig(path) {
  if (!path) throw new Error('private generator config is required');
  return validateEnvironmentConfig(await readJsonFile(path));
}

function validateEnvironmentConfig(config) {
  if (
    !isObject(config) ||
    config.schemaVersion !== privateConfigSchemaVersion ||
    !isObject(config.environments) ||
    !hasExactKeys(config.environments, ['taskOverrides']) ||
    !Array.isArray(config.environments.taskOverrides)
  ) {
    throw new Error('private generator config has an invalid environments section');
  }

  const taskOverrides = new Map();
  for (const override of config.environments.taskOverrides) {
    if (!isValidTaskOverride(override) || taskOverrides.has(override.taskId)) {
      throw new Error('private generator config contains an invalid environment task override');
    }
    taskOverrides.set(override.taskId, structuredClone(override));
  }
  return taskOverrides;
}

function isValidTaskOverride(value) {
  if (
    !isObject(value) ||
    !hasOnlyKeys(value, ['install', 'preparation', 'runtimeFallback', 'taskId']) ||
    !isTaskId(value.taskId) ||
    !['install', 'preparation', 'runtimeFallback'].some((key) => key in value)
  ) {
    return false;
  }
  if ('runtimeFallback' in value && !isRuntimeFallback(value.runtimeFallback)) return false;
  if ('install' in value && !isInstallOverride(value.install)) return false;
  if ('preparation' in value && !isPreparationOverride(value.preparation)) return false;

  const commands = [
    ...(value.preparation?.beforeInstall ?? []),
    ...(value.preparation?.afterInstall ?? []),
  ];
  const commandIds = commands.map((item) => item.id);
  return !commandIds.includes('install-dependencies') && new Set(commandIds).size === commandIds.length;
}

function isRuntimeFallback(value) {
  const keys = ['bun', 'node', 'npm', 'pnpm', 'yarn'];
  return (
    isObject(value) &&
    hasOnlyKeys(value, keys) &&
    Object.keys(value).length > 0 &&
    Object.values(value).every(isExactVersion)
  );
}

function isInstallOverride(value) {
  return (
    isObject(value) &&
    hasOnlyKeys(value, ['args', 'environment']) &&
    Object.keys(value).length > 0 &&
    (!('args' in value) ||
      (Array.isArray(value.args) &&
        value.args.length > 0 &&
        value.args.every((item) => typeof item === 'string'))) &&
    (!('environment' in value) || isEnvironment(value.environment))
  );
}

function isPreparationOverride(value) {
  return (
    isObject(value) &&
    hasOnlyKeys(value, ['afterInstall', 'beforeInstall']) &&
    Object.keys(value).length > 0 &&
    ['afterInstall', 'beforeInstall'].every(
      (key) => !(key in value) || (Array.isArray(value[key]) && value[key].every(isCommand)),
    )
  );
}

function isCommand(value) {
  return (
    isObject(value) &&
    hasOnlyKeys(value, [
      'args',
      'cwd',
      'environment',
      'executable',
      'id',
      'network',
      'required',
      'timeoutMs',
    ]) &&
    ['args', 'cwd', 'executable', 'id', 'network', 'required', 'timeoutMs'].every(
      (key) => key in value,
    ) &&
    typeof value.id === 'string' &&
    /^[a-z0-9][a-z0-9-]+$/u.test(value.id) &&
    typeof value.executable === 'string' &&
    value.executable.length > 0 &&
    Array.isArray(value.args) &&
    value.args.every((item) => typeof item === 'string') &&
    isRelativePath(value.cwd) &&
    Number.isInteger(value.timeoutMs) &&
    value.timeoutMs >= 100 &&
    value.timeoutMs <= 7_200_000 &&
    value.network === 'none' &&
    value.required === true &&
    (!('environment' in value) || isEnvironment(value.environment))
  );
}

function isEnvironment(value) {
  return (
    isObject(value) &&
    Object.keys(value).length > 0 &&
    Object.entries(value).every(
      ([key, item]) => /^[A-Z_][A-Z0-9_]*$/u.test(key) && typeof item === 'string',
    )
  );
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasExactKeys(value, expected) {
  return Object.keys(value).sort().join('\0') === [...expected].sort().join('\0');
}

function hasOnlyKeys(value, allowed) {
  const allowedKeys = new Set(allowed);
  return Object.keys(value).every((key) => allowedKeys.has(key));
}

function isTaskId(value) {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9._-]{2,95}$/u.test(value);
}

function isExactVersion(value) {
  return typeof value === 'string' && /^[0-9]+\.[0-9]+\.[0-9]+$/u.test(value);
}

function isRelativePath(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !value.startsWith('/') &&
    !value.includes('\\') &&
    !value.split('/').includes('..')
  );
}

export {
  buildEvidence,
  normalizeExactVersion,
  normalizeRemote,
  parsePackageManager,
  preparationCommands,
  selectPackageManager,
  selectProfile,
  selectLockfile,
  validateEnvironmentConfig,
};

function parseArgs(argv) {
  const options = {
    corpusRoot: null,
    developmentCandidatesPath: join(benchmarkRoot, 'tasks', 'development-candidates.json'),
    qualificationCandidatesPath: join(repositoryRoot, '.private', 'benchmark-3-10', 'task-freeze', 'qualification-private.json'),
    developmentOutputPath: join(benchmarkRoot, 'environments', 'development-drafts.json'),
    qualificationOutputPath: join(repositoryRoot, '.private', 'benchmark-3-10', 'environments', 'qualification-drafts.json'),
    privateConfigPath: join(
      repositoryRoot,
      '.private',
      'benchmark-3-10',
      'qualification-generator-config.json',
    ),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--corpus-root') options.corpusRoot = resolve(argv[++index]);
    else if (argument === '--private-config') options.privateConfigPath = resolve(argv[++index]);
    else if (argument === '--development-candidates') options.developmentCandidatesPath = resolve(argv[++index]);
    else if (argument === '--qualification-candidates') options.qualificationCandidatesPath = resolve(argv[++index]);
    else if (argument === '--development-out') options.developmentOutputPath = resolve(argv[++index]);
    else if (argument === '--qualification-out') options.qualificationOutputPath = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argument}`);
  }
  if (!options.corpusRoot) throw new Error('--corpus-root is required');
  if (!options.privateConfigPath) throw new Error('--private-config is required');
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await generateTaskEnvironmentDrafts(parseArgs(process.argv.slice(2)));
    console.log(
      JSON.stringify(
        {
          ok: true,
          development: result.development,
          qualification: result.qualification,
          total: result.total,
        },
        null,
        2,
      ),
    );
  } catch {
    console.error('Environment draft generation failed; inspect the private inputs locally.');
    process.exitCode = 1;
  }
}
