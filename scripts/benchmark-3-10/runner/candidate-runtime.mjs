import { lstat, readFile, readdir, readlink } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { sha256, sha256Canonical } from './canonical.mjs';

const SHA256 = /^[a-f0-9]{64}$/u;

export async function verifyCandidateRuntime(provider, runtimeRoot) {
  assertProvider(provider);
  const entrypoint = resolveRuntimePath(runtimeRoot, provider.entrypoint, 'candidate entrypoint');
  const lockfile = resolveRuntimePath(runtimeRoot, provider.runtimeLock.path, 'candidate runtime lockfile');
  const lockSha256 = sha256(await readFile(lockfile));
  if (lockSha256 !== provider.runtimeLock.sha256) {
    throw new Error(
      `candidate runtime lockfile digest mismatch: expected ${provider.runtimeLock.sha256}, received ${lockSha256}`,
    );
  }
  const runtimeTreeSha256 = await hashRuntimeTree(runtimeRoot, provider.runtimeFiles);
  if (runtimeTreeSha256 !== provider.runtimeTreeSha256) {
    throw new Error(
      `candidate runtime tree digest mismatch: expected ${provider.runtimeTreeSha256}, received ${runtimeTreeSha256}`,
    );
  }
  await readFile(entrypoint);
  return { entrypoint, lockfile, runtimeTreeSha256 };
}

export function assertProvider(provider) {
  if (!provider || typeof provider !== 'object' || Array.isArray(provider)) {
    throw new Error('candidate contextProvider is invalid');
  }
  const keys = Object.keys(provider).sort();
  const expected = [
    'entrypoint',
    'outputSchemaVersion',
    'package',
    'runtimeFiles',
    'runtimeLock',
    'runtimeTreeSha256',
    'type',
  ].sort();
  if (JSON.stringify(keys) !== JSON.stringify(expected)) {
    throw new Error('candidate contextProvider fields are invalid');
  }
  if (
    provider.type !== 'decantr-cli-task-v1' ||
    provider.package !== '@decantr/cli' ||
    provider.outputSchemaVersion !== 'ui-surface-task-context.v1' ||
    typeof provider.entrypoint !== 'string' ||
    !provider.entrypoint.startsWith('node_modules/@decantr/cli/') ||
    !SHA256.test(provider.runtimeTreeSha256)
  ) {
    throw new Error('candidate contextProvider identity is invalid');
  }
  if (
    !provider.runtimeLock ||
    typeof provider.runtimeLock !== 'object' ||
    Object.keys(provider.runtimeLock).sort().join(',') !== 'path,sha256' ||
    provider.runtimeLock.path !== 'package-lock.json' ||
    !SHA256.test(provider.runtimeLock.sha256)
  ) {
    throw new Error('candidate contextProvider runtime lock is invalid');
  }
  if (
    !Array.isArray(provider.runtimeFiles) ||
    provider.runtimeFiles.length === 0 ||
    new Set(provider.runtimeFiles).size !== provider.runtimeFiles.length ||
    !provider.runtimeFiles.includes('package-lock.json') ||
    !provider.runtimeFiles.includes('node_modules/@decantr')
  ) {
    throw new Error('candidate contextProvider runtime file set is invalid');
  }
  for (const path of [provider.entrypoint, ...provider.runtimeFiles]) {
    if (typeof path !== 'string' || path.trim() === '' || path.startsWith('/') || path.includes('\\')) {
      throw new Error('candidate contextProvider contains an invalid runtime path');
    }
    resolveRuntimePath('/candidate-runtime-root', path, 'candidate runtime path');
  }
  return provider;
}

export async function hashRuntimeTree(runtimeRoot, requestedPaths) {
  const records = [];
  for (const requestedPath of [...requestedPaths].sort()) {
    const absolute = resolveRuntimePath(runtimeRoot, requestedPath, 'candidate runtime file');
    await collect(runtimeRoot, absolute, records);
  }
  records.sort((left, right) => left.path.localeCompare(right.path));
  return sha256Canonical(records);
}

async function collect(root, path, records) {
  const stat = await lstat(path);
  const normalized = relative(root, path).split(sep).join('/');
  if (stat.isSymbolicLink()) {
    records.push({ path: normalized, type: 'symlink', target: await readlink(path) });
    return;
  }
  if (stat.isDirectory()) {
    records.push({ path: `${normalized}/`, type: 'directory' });
    const entries = await readdir(path);
    for (const entry of entries.sort()) await collect(root, resolve(path, entry), records);
    return;
  }
  if (!stat.isFile()) throw new Error(`candidate runtime contains unsupported file type: ${normalized}`);
  const bytes = await readFile(path);
  records.push({ path: normalized, type: 'file', bytes: bytes.length, sha256: sha256(bytes) });
}

function resolveRuntimePath(root, path, label) {
  const absoluteRoot = resolve(root);
  const absolute = resolve(absoluteRoot, path);
  if (absolute !== absoluteRoot && !absolute.startsWith(`${absoluteRoot}${sep}`)) {
    throw new Error(`${label} escapes the candidate runtime root`);
  }
  return absolute;
}
