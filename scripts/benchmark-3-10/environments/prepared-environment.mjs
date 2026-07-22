import { readFileSync } from 'node:fs';
import { lstat, readFile, readdir, readlink, realpath } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { canonicalJson, sha256, sha256Canonical } from '../runner/canonical.mjs';

const sha256Pattern = /^[a-f0-9]{64}$/u;
const imageDigestPattern = /^sha256:[a-f0-9]{64}$/u;

export function calculatePreparedEnvironmentIdentity(attestation) {
  return sha256Canonical({
    taskId: attestation.taskId,
    environmentSpecSha256: attestation.environmentSpecSha256,
    environmentSubstanceSha256: attestation.environmentSubstanceSha256,
    runtimeMatrixSha256: attestation.runtimeMatrixSha256,
    runtimeProfileId: attestation.runtimeProfileId,
    benchmarkImageDigest: attestation.benchmarkImageDigest,
    base: attestation.base,
    revisionRole: attestation.revisionRole,
    revision: attestation.revision,
    candidateSha256: attestation.candidateSha256,
    lockfiles: attestation.lockfiles,
    dependencyRoots: attestation.dependencyRoots,
    dependencyTreeSha256: attestation.dependencyTreeSha256,
    dependencyEntryCount: attestation.dependencyEntryCount,
  });
}

export function calculatePreparedAttestationDigest(attestation) {
  const { attestationSha256: _ignored, ...body } = attestation;
  return sha256Canonical(body);
}

export function assertPreparedEnvironment(attestation, context = {}) {
  if (
    attestation?.schemaVersion !== 'decantr-benchmark-prepared-environment.v1' ||
    attestation?.program !== 'decantr-3.10-ui-change-control-proof' ||
    typeof attestation.taskId !== 'string' ||
    !sha256Pattern.test(attestation.environmentSpecSha256 ?? '') ||
    !sha256Pattern.test(attestation.environmentSubstanceSha256 ?? '') ||
    !sha256Pattern.test(attestation.runtimeMatrixSha256 ?? '') ||
    typeof attestation.runtimeProfileId !== 'string' ||
    attestation.runtimeProfileId.length === 0 ||
    !imageDigestPattern.test(attestation.benchmarkImageDigest ?? '') ||
    !/^[a-f0-9]{40}$/u.test(attestation.base?.commit ?? '') ||
    !/^[a-f0-9]{40}$/u.test(attestation.base?.tree ?? '') ||
    !['base', 'expected'].includes(attestation.revisionRole) ||
    !/^[a-f0-9]{40}$/u.test(attestation.revision?.commit ?? '') ||
    !/^[a-f0-9]{40}$/u.test(attestation.revision?.tree ?? '') ||
    !(attestation.candidateSha256 === null || sha256Pattern.test(attestation.candidateSha256 ?? '')) ||
    (attestation.revisionRole === 'expected' && !sha256Pattern.test(attestation.candidateSha256 ?? '')) ||
    !Array.isArray(attestation.lockfiles) ||
    attestation.lockfiles.length === 0 ||
    !Array.isArray(attestation.steps) ||
    attestation.steps.length === 0 ||
    !Array.isArray(attestation.dependencyRoots) ||
    attestation.dependencyRoots.length === 0 ||
    !sha256Pattern.test(attestation.dependencyTreeSha256 ?? '') ||
    !Number.isInteger(attestation.dependencyEntryCount) ||
    attestation.dependencyEntryCount < 1 ||
    attestation.trackedClean !== true ||
    !Number.isFinite(Date.parse(attestation.preparedAt ?? '')) ||
    attestation.environmentSha256 !== calculatePreparedEnvironmentIdentity(attestation) ||
    attestation.attestationSha256 !== calculatePreparedAttestationDigest(attestation)
  ) {
    throw new Error(`${attestation?.taskId ?? 'unknown task'}: prepared environment attestation is invalid`);
  }
  const lockfilePaths = new Set();
  for (const lockfile of attestation.lockfiles) {
    if (
      typeof lockfile?.path !== 'string' ||
      lockfile.path.length === 0 ||
      lockfilePaths.has(lockfile.path) ||
      !sha256Pattern.test(lockfile.sha256 ?? '')
    ) {
      throw new Error(`${attestation.taskId}: prepared environment lockfile binding is invalid`);
    }
    lockfilePaths.add(lockfile.path);
  }
  const stepIds = new Set();
  for (const step of attestation.steps) {
    if (
      typeof step?.id !== 'string' ||
      step.id.length === 0 ||
      stepIds.has(step.id) ||
      !['none', 'dependency-registry'].includes(step.network) ||
      !sha256Pattern.test(step.commandSha256 ?? '') ||
      step.exitCode !== 0 ||
      !Number.isInteger(step.durationMs) ||
      step.durationMs < 0 ||
      !sha256Pattern.test(step.stdoutSha256 ?? '') ||
      !sha256Pattern.test(step.stderrSha256 ?? '')
    ) {
      throw new Error(`${attestation.taskId}: prepared environment step binding is invalid`);
    }
    stepIds.add(step.id);
  }
  if (
    new Set(attestation.dependencyRoots).size !== attestation.dependencyRoots.length ||
    attestation.dependencyRoots.some((path) => typeof path !== 'string' || path.length === 0)
  ) {
    throw new Error(`${attestation.taskId}: prepared dependency roots are invalid`);
  }
  if (context.task) {
    const task = context.task;
    const expectedRevision = context.revision ?? task.base;
    const expectedRevisionRole = context.revisionRole ?? 'base';
    if (
      attestation.taskId !== task.taskId ||
      attestation.base?.commit !== task.base?.commit ||
      attestation.base?.tree !== task.base?.tree ||
      attestation.revisionRole !== expectedRevisionRole ||
      attestation.revision?.commit !== expectedRevision?.commit ||
      attestation.revision?.tree !== expectedRevision?.tree ||
      (context.candidateSha256 !== undefined &&
        attestation.candidateSha256 !== context.candidateSha256) ||
      attestation.environmentSpecSha256 !== task.environment?.specSha256 ||
      attestation.environmentSubstanceSha256 !== task.environment?.substanceSha256 ||
      attestation.runtimeProfileId !== task.environment?.runtimeProfileId
    ) {
      throw new Error(`${attestation.taskId}: prepared environment differs from the task manifest`);
    }
  }
  if (context.runtimeMatrix) {
    const profile = context.runtimeMatrix.profiles.find((item) => item.id === attestation.runtimeProfileId);
    if (
      attestation.runtimeMatrixSha256 !== context.runtimeMatrix.matrixSha256 ||
      attestation.benchmarkImageDigest !== profile?.benchmarkImage?.digest
    ) {
      throw new Error(`${attestation.taskId}: prepared environment differs from the locked runtime matrix`);
    }
  }
  if (context.environmentSpec) {
    const spec = context.environmentSpec;
    const expectedSteps = spec.preparation.map((command) => ({
      id: command.id,
      network: command.network,
      commandSha256: sha256Canonical(command),
    }));
    const actualSteps = attestation.steps.map(({ id, network, commandSha256 }) => ({
      id,
      network,
      commandSha256,
    }));
    if (
      canonicalJson(attestation.base) !== canonicalJson(spec.base) ||
      (attestation.revisionRole === 'base' &&
        canonicalJson(attestation.revision) !== canonicalJson(spec.base)) ||
      canonicalJson(attestation.lockfiles) !== canonicalJson(spec.lockfiles) ||
      canonicalJson(actualSteps) !== canonicalJson(expectedSteps)
    ) {
      throw new Error(`${attestation.taskId}: prepared environment differs from the reviewed environment spec`);
    }
  }
  return attestation;
}

export async function verifyPreparedDependencyTree(workspace, attestation) {
  const discoveredRoots = await discoverDependencyRoots(workspace);
  if (canonicalJson(discoveredRoots) !== canonicalJson(attestation.dependencyRoots)) {
    throw new Error(`${attestation.taskId}: prepared dependency root set drifted`);
  }
  const actual = await hashDependencyRoots(workspace, attestation.dependencyRoots);
  if (
    actual.sha256 !== attestation.dependencyTreeSha256 ||
    actual.entryCount !== attestation.dependencyEntryCount
  ) {
    throw new Error(`${attestation.taskId}: prepared dependency tree drifted`);
  }
  return actual;
}

export async function verifySourceEvidence(workspace, sourceEvidence) {
  const workspaceRoot = await realpath(resolve(workspace));
  for (const evidence of sourceEvidence) {
    const evidencePath = contained(workspaceRoot, evidence.path);
    let metadata;
    try {
      metadata = await lstat(evidencePath);
    } catch (error) {
      throw new Error(`source evidence is missing: ${evidence.path}`, { cause: error });
    }
    if (!metadata.isFile()) {
      throw new Error(`source evidence must be a regular file: ${evidence.path}`);
    }
    let resolvedPath;
    try {
      resolvedPath = await realpath(evidencePath);
    } catch (error) {
      throw new Error(`source evidence cannot be resolved: ${evidence.path}`, { cause: error });
    }
    assertContainedAbsolute(workspaceRoot, resolvedPath, `source evidence escapes workspace: ${evidence.path}`);
    const actual = sha256(await readFile(evidencePath));
    if (actual !== evidence.sha256) {
      throw new Error(`source evidence digest drift: ${evidence.path}`);
    }
  }
}

export async function discoverDependencyRoots(workspace) {
  const root = await realpath(resolve(workspace));
  const output = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name === '.git') continue;
      const absolute = join(directory, entry.name);
      if (entry.name === 'node_modules') {
        output.push(relative(root, absolute).replaceAll('\\', '/'));
        continue;
      }
      if (entry.isDirectory() && !entry.isSymbolicLink()) await walk(absolute);
    }
  }
  await walk(root);
  return output.sort();
}

export async function hashDependencyRoots(workspace, roots) {
  const workspaceRoot = await realpath(resolve(workspace));
  const entries = [];
  for (const root of [...roots].sort()) {
    const absoluteRoot = contained(workspaceRoot, root);
    await hashPath(workspaceRoot, absoluteRoot, entries, new Set(), true);
  }
  return { sha256: sha256Canonical(entries), entryCount: entries.length };
}

async function hashPath(workspaceRoot, path, entries, resolving, dependencyRoot = false) {
  const metadata = await lstat(path);
  const relativePath = relative(workspaceRoot, path).replaceAll('\\', '/');
  if (metadata.isSymbolicLink()) {
    const target = await readlink(path);
    let resolvedPath;
    try {
      resolvedPath = await realpath(path);
    } catch (error) {
      throw new Error(`dependency symlink cannot be resolved: ${relativePath}`, { cause: error });
    }
    assertContainedAbsolute(workspaceRoot, resolvedPath, `dependency symlink escapes workspace: ${relativePath}`);
    const resolvedMetadata = await lstat(resolvedPath);
    if (dependencyRoot && !resolvedMetadata.isDirectory()) {
      throw new Error(`dependency root must resolve to a directory: ${relativePath}`);
    }
    if (resolving.has(resolvedPath)) {
      throw new Error(`dependency symlink cycle detected: ${relativePath}`);
    }
    resolving.add(resolvedPath);
    const resolvedEntries = [];
    try {
      await hashPath(workspaceRoot, resolvedPath, resolvedEntries, resolving);
    } finally {
      resolving.delete(resolvedPath);
    }
    const targetAfterHash = await readlink(path);
    const resolvedPathAfterHash = await realpath(path);
    if (targetAfterHash !== target || resolvedPathAfterHash !== resolvedPath) {
      throw new Error(`dependency symlink changed while hashing: ${relativePath}`);
    }
    entries.push({
      path: relativePath,
      type: 'symlink',
      mode: metadata.mode & 0o777,
      target,
      realPath: relative(workspaceRoot, resolvedPath).replaceAll('\\', '/') || '.',
      resolvedSha256: sha256Canonical(resolvedEntries),
      resolvedEntryCount: resolvedEntries.length,
    });
    return;
  }
  if (dependencyRoot && !metadata.isDirectory()) {
    throw new Error(`dependency root must be a directory: ${relativePath}`);
  }
  if (metadata.isFile()) {
    entries.push({ path: relativePath, type: 'file', mode: metadata.mode & 0o777, sha256: sha256(await readFile(path)) });
    return;
  }
  if (!metadata.isDirectory()) throw new Error(`unsupported dependency entry type: ${relativePath}`);
  entries.push({ path: relativePath, type: 'directory', mode: metadata.mode & 0o777 });
  for (const entry of (await readdir(path)).sort()) {
    await hashPath(workspaceRoot, join(path, entry), entries, resolving);
  }
}

export function verifyLockfiles(workspace, lockfiles) {
  const root = resolve(workspace);
  for (const lockfile of lockfiles) {
    const path = contained(root, lockfile.path);
    const actual = sha256(readFileSync(path));
    if (actual !== lockfile.sha256) throw new Error(`lockfile digest drift: ${lockfile.path}`);
  }
}

function contained(root, value) {
  if (typeof value !== 'string' || value.length === 0 || isAbsolute(value)) {
    throw new Error('prepared environment path must be workspace-relative');
  }
  const path = resolve(root, value);
  const relation = relative(root, path);
  if (relation === '..' || relation.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) || isAbsolute(relation)) {
    throw new Error('prepared environment path escapes workspace');
  }
  return path;
}

function assertContainedAbsolute(root, path, message) {
  const relation = relative(root, path);
  if (
    relation === '..' ||
    relation.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) ||
    isAbsolute(relation)
  ) {
    throw new Error(message);
  }
}
