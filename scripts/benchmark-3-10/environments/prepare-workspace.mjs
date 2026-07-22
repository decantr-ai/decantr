#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJsonFile, sha256, sha256Canonical, writeCanonicalFile } from '../runner/canonical.mjs';
import { assertTaskEnvironmentSpec, taskEnvironmentSubstanceSha256 } from './contracts.mjs';
import { assertRuntimeMatrix } from './runtime-matrix.mjs';
import {
  calculatePreparedAttestationDigest,
  calculatePreparedEnvironmentIdentity,
  discoverDependencyRoots,
  hashDependencyRoots,
  verifyLockfiles,
  verifySourceEvidence,
} from './prepared-environment.mjs';

export async function prepareWorkspace(options) {
  const environmentSpecBytes = await readFile(options.environmentSpecPath);
  const spec = assertTaskEnvironmentSpec(JSON.parse(environmentSpecBytes), null, { reviewStatus: 'approved' });
  const matrix = assertRuntimeMatrix(await readJsonFile(options.runtimeMatrixPath), { requireLocked: true });
  const profile = matrix.profiles.find((item) => item.id === spec.profile.id);
  if (!profile) throw new Error(`${spec.taskId}: runtime profile is absent from the locked matrix`);
  verifyBenchmarkContainer(profile, options.environment, options.allowHostRuntime === true);
  const revisionRole = options.revisionRole ?? 'base';
  const revision = options.revision ?? spec.base;
  if (!['base', 'expected'].includes(revisionRole)) {
    throw new Error(`${spec.taskId}: prepared revision role must be base or expected`);
  }
  if (revisionRole === 'base' && (revision.commit !== spec.base.commit || revision.tree !== spec.base.tree)) {
    throw new Error(`${spec.taskId}: base preparation must use the reviewed environment base`);
  }
  if (revisionRole === 'expected' && !/^[a-f0-9]{64}$/u.test(options.candidateSha256 ?? '')) {
    throw new Error(`${spec.taskId}: expected preparation requires the frozen candidate SHA-256`);
  }
  verifyWorkspaceRevision(options.workspace, spec.taskId, revision);
  await verifySourceEvidence(options.workspace, spec.sourceEvidence);
  verifyLockfiles(options.workspace, spec.lockfiles);
  verifyRuntimeVersions(spec.profile, options.environment);
  const steps = [];
  for (const command of spec.preparation) {
    if (command.network === 'dependency-registry' && options.networkPolicy !== 'dependency-registry') {
      throw new Error(`${spec.taskId}: dependency installation requires a registry-only preparation network`);
    }
    const cwd = containedWorkspacePath(options.workspace, command.cwd);
    const environment = sanitizedEnvironment(options.environment, command.environment);
    const startedAt = Date.now();
    const result = spawnSync(command.executable, command.args, {
      cwd,
      env: environment,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      shell: false,
      timeout: command.timeoutMs,
    });
    const exitCode = result.status ?? 1;
    steps.push({
      id: command.id,
      network: command.network,
      commandSha256: sha256Canonical(command),
      exitCode,
      durationMs: Date.now() - startedAt,
      stdoutSha256: sha256(result.stdout ?? ''),
      stderrSha256: sha256(result.stderr ?? ''),
    });
    if (result.error) throw result.error;
    if (exitCode !== 0) {
      throw new Error(`${spec.taskId}: preparation command ${command.id} exited ${exitCode}`);
    }
  }
  verifyWorkspaceRevision(options.workspace, spec.taskId, revision);
  verifyLockfiles(options.workspace, spec.lockfiles);
  const dependencyRoots = await discoverDependencyRoots(options.workspace);
  if (dependencyRoots.length === 0) throw new Error(`${spec.taskId}: preparation produced no dependency roots`);
  const dependencyTree = await hashDependencyRoots(options.workspace, dependencyRoots);
  const attestation = {
    schemaVersion: 'decantr-benchmark-prepared-environment.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    taskId: spec.taskId,
    environmentSpecSha256: sha256(environmentSpecBytes),
    environmentSubstanceSha256: taskEnvironmentSubstanceSha256(spec),
    runtimeMatrixSha256: matrix.matrixSha256,
    runtimeProfileId: profile.id,
    benchmarkImageDigest: profile.benchmarkImage.digest,
    base: structuredClone(spec.base),
    revisionRole,
    revision: structuredClone(revision),
    candidateSha256: options.candidateSha256 ?? null,
    lockfiles: structuredClone(spec.lockfiles),
    steps,
    dependencyRoots,
    dependencyTreeSha256: dependencyTree.sha256,
    dependencyEntryCount: dependencyTree.entryCount,
    trackedClean: true,
    preparedAt: options.preparedAt,
  };
  attestation.environmentSha256 = calculatePreparedEnvironmentIdentity(attestation);
  attestation.attestationSha256 = calculatePreparedAttestationDigest(attestation);
  await writeCanonicalFile(options.outputPath, attestation);
  return attestation;
}

function verifyWorkspaceRevision(workspace, taskId, revision) {
  const environment = sanitizedEnvironment(process.env);
  const status = git(workspace, ['status', '--porcelain=v1', '--untracked-files=all'], environment).trim();
  if (status !== '') throw new Error(`${taskId}: workspace is not clean after preparation`);
  const commit = git(workspace, ['rev-parse', 'HEAD'], environment).trim();
  const tree = git(workspace, ['rev-parse', 'HEAD^{tree}'], environment).trim();
  if (commit !== revision.commit || tree !== revision.tree) {
    throw new Error(`${taskId}: workspace revision differs from the requested preparation revision`);
  }
}

function verifyRuntimeVersions(profile, environment) {
  const runtimeName = profile.nodeVersion ? 'node' : 'bun';
  const expectedRuntime = profile.nodeVersion ?? profile.bunVersion;
  const actualRuntime = runVersion(runtimeName, environment);
  const actualManager = runVersion(profile.packageManager.name, environment);
  if (normalizeVersion(actualRuntime) !== expectedRuntime) {
    throw new Error(`runtime version mismatch: expected ${expectedRuntime}, received ${actualRuntime}`);
  }
  if (normalizeVersion(actualManager) !== profile.packageManager.version) {
    throw new Error(
      `package manager version mismatch: expected ${profile.packageManager.version}, received ${actualManager}`,
    );
  }
}

function verifyBenchmarkContainer(profile, environment, allowHostRuntime) {
  if (allowHostRuntime) return;
  if (process.platform !== 'linux' || process.arch !== 'x64') {
    throw new Error('workspace preparation must run in the locked Linux x64 benchmark image');
  }
  if (environment.DECANTR_BENCHMARK_IMAGE_DIGEST !== profile.benchmarkImage.digest) {
    throw new Error('benchmark image digest marker differs from the locked runtime matrix');
  }
}

function runVersion(command, environment) {
  const result = spawnSync(command, ['--version'], {
    encoding: 'utf8',
    env: sanitizedEnvironment(environment),
    shell: false,
    timeout: 10_000,
  });
  if (result.status !== 0) throw new Error(`${command} version check failed`);
  return (result.stdout || result.stderr || '').trim();
}

function normalizeVersion(value) {
  return String(value).replace(/^v/u, '');
}

function sanitizedEnvironment(environment = process.env, additions = {}) {
  const allowed = ['HOME', 'PATH', 'LANG', 'LC_ALL', 'TZ', 'CI', 'NO_COLOR', 'TMPDIR'];
  return {
    ...Object.fromEntries(allowed.filter((key) => typeof environment[key] === 'string').map((key) => [key, environment[key]])),
    ...additions,
  };
}

function containedWorkspacePath(workspace, value) {
  const root = resolve(workspace);
  const path = resolve(root, value);
  if (path !== root && !path.startsWith(`${root}/`)) throw new Error('preparation cwd escapes workspace');
  return path;
}

function git(cwd, args, environment) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', env: environment, stdio: ['ignore', 'pipe', 'pipe'] });
}

function parseArgs(argv) {
  const options = {
    environment: process.env,
    networkPolicy: 'none',
    preparedAt: new Date().toISOString(),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--environment-spec') options.environmentSpecPath = resolve(argv[++index]);
    else if (argument === '--runtime-matrix') options.runtimeMatrixPath = resolve(argv[++index]);
    else if (argument === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argument === '--out') options.outputPath = resolve(argv[++index]);
    else if (argument === '--network-policy') options.networkPolicy = argv[++index];
    else if (argument === '--prepared-at') options.preparedAt = argv[++index];
    else if (argument === '--revision-role') options.revisionRole = argv[++index];
    else if (argument === '--revision-commit') {
      options.revision = { ...(options.revision ?? {}), commit: argv[++index] };
    } else if (argument === '--revision-tree') {
      options.revision = { ...(options.revision ?? {}), tree: argv[++index] };
    } else if (argument === '--candidate-sha256') options.candidateSha256 = argv[++index];
    else throw new Error(`Unknown option: ${argument}`);
  }
  for (const name of ['environmentSpecPath', 'runtimeMatrixPath', 'workspace', 'outputPath']) {
    if (!options[name]) throw new Error(`Missing required option: ${name}`);
  }
  if (!['none', 'dependency-registry'].includes(options.networkPolicy)) {
    throw new Error('--network-policy must be none or dependency-registry');
  }
  if (options.revisionRole && !['base', 'expected'].includes(options.revisionRole)) {
    throw new Error('--revision-role must be base or expected');
  }
  if (options.revision && !/^[a-f0-9]{40}$/u.test(options.revision.commit ?? '')) {
    throw new Error('--revision-commit must be a Git commit SHA');
  }
  if (options.revision && !/^[a-f0-9]{40}$/u.test(options.revision.tree ?? '')) {
    throw new Error('--revision-tree must be a Git tree SHA');
  }
  if (options.candidateSha256 && !/^[a-f0-9]{64}$/u.test(options.candidateSha256)) {
    throw new Error('--candidate-sha256 must be a SHA-256 digest');
  }
  if (!Number.isFinite(Date.parse(options.preparedAt))) throw new Error('--prepared-at must be a timestamp');
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const attestation = await prepareWorkspace(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({ ok: true, taskId: attestation.taskId, environmentSha256: attestation.environmentSha256 }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
