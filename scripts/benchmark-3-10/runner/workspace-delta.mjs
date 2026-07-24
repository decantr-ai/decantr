import { chmod, lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import {
  canonicalJson,
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from './canonical.mjs';
import { runFixed } from './process.mjs';

export async function captureWorkspaceDelta(options) {
  const workspace = await realpath(resolve(options.workspace));
  const outputRoot = resolve(options.outputRoot);
  const base = inspectBase(workspace, options.environment);
  if (options.expectedBaseCommit && base.commit !== options.expectedBaseCommit) {
    throw new Error('workspace delta base commit mismatch');
  }
  if (options.expectedBaseTree && base.tree !== options.expectedBaseTree) {
    throw new Error('workspace delta base tree mismatch');
  }
  const patch = git(workspace, ['diff', '--binary', '--no-ext-diff', 'HEAD', '--'], options.environment).stdout;
  const trackedPaths = nulPaths(
    git(workspace, ['diff', '--name-only', '-z', 'HEAD', '--'], options.environment).stdout,
  );
  const untrackedPaths = nulPaths(
    git(
      workspace,
      ['ls-files', '--others', '--exclude-standard', '-z', '--'],
      options.environment,
    ).stdout,
  );
  const changedPaths = [...new Set([...trackedPaths, ...untrackedPaths])].sort(compareStrings);
  const patchPath = join(outputRoot, 'workspace.patch');
  await mkdir(dirname(patchPath), { recursive: true });
  await writeFile(patchPath, patch, { encoding: 'utf8', mode: 0o600 });
  const untracked = [];
  for (const path of untrackedPaths) {
    const absolute = contained(workspace, path);
    const metadata = await lstat(absolute);
    if (!metadata.isFile() || metadata.isSymbolicLink()) {
      throw new Error(`untracked workspace path is not a regular file: ${path}`);
    }
    const bytes = await readFile(absolute);
    const digest = sha256(bytes);
    const blobPath = join(outputRoot, 'untracked', 'sha256', `${digest}.blob`);
    await mkdir(dirname(blobPath), { recursive: true });
    try {
      await writeFile(blobPath, bytes, { mode: 0o600, flag: 'wx' });
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      const existing = await readFile(blobPath);
      if (!existing.equals(bytes)) throw new Error(`content-address collision for ${path}`);
    }
    untracked.push({
      path,
      sha256: digest,
      bytes: bytes.byteLength,
      mode: metadata.mode & 0o111 ? '100755' : '100644',
    });
  }
  const manifest = {
    schemaVersion: 'decantr-benchmark-workspace-delta.v1',
    base,
    patch: {
      path: 'workspace.patch',
      sha256: sha256(Buffer.from(patch, 'utf8')),
      bytes: Buffer.byteLength(patch, 'utf8'),
    },
    changedPaths,
    untracked,
    untrackedSetSha256: sha256Canonical(untracked),
    deltaSha256: null,
  };
  manifest.deltaSha256 = calculateWorkspaceDeltaDigest(manifest);
  const manifestPath = join(outputRoot, 'workspace-delta.json');
  await writeCanonicalFile(manifestPath, manifest);
  return { manifest, manifestPath, patchPath };
}

export async function applyWorkspaceDelta(options) {
  const workspace = await realpath(resolve(options.workspace));
  const artifactRoot = await realpath(resolve(options.artifactRoot));
  const manifestBytes = await readFile(resolve(options.manifestPath));
  const manifest = assertWorkspaceDelta(JSON.parse(manifestBytes));
  const base = inspectBase(workspace, options.environment);
  if (canonicalJson(base) !== canonicalJson(manifest.base)) {
    throw new Error('workspace delta cannot be applied to a different base');
  }
  const status = git(
    workspace,
    ['status', '--porcelain=v1', '--untracked-files=all'],
    options.environment,
  ).stdout;
  if (status !== '') throw new Error('workspace must be clean before applying an agent delta');
  const patchPath = contained(artifactRoot, manifest.patch.path);
  const patchBytes = await readFile(patchPath);
  assertFileBinding(manifest.patch, patchBytes, 'workspace patch');
  if (patchBytes.byteLength > 0) {
    const applied = runFixed(
      'git',
      ['-C', workspace, 'apply', '--binary', '--index', '--whitespace=nowarn', patchPath],
      {
        cwd: workspace,
        env: options.environment,
        timeoutMs: 120_000,
        maxBuffer: 16 * 1024 * 1024,
      },
    );
    if (applied.exitCode !== 0) {
      throw new Error(`workspace patch failed to apply: ${applied.stderr.slice(0, 500)}`);
    }
  }
  for (const item of manifest.untracked) {
    const destination = contained(workspace, item.path);
    const blob = contained(artifactRoot, join('untracked', 'sha256', `${item.sha256}.blob`));
    const bytes = await readFile(blob);
    if (sha256(bytes) !== item.sha256 || bytes.byteLength !== item.bytes) {
      throw new Error(`untracked blob binding mismatch: ${item.path}`);
    }
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, bytes, { mode: item.mode === '100755' ? 0o700 : 0o600, flag: 'wx' });
    await chmod(destination, item.mode === '100755' ? 0o755 : 0o644);
  }
  const verificationRoot = join(resolve(options.verificationRoot), 'recaptured');
  const recaptured = await captureWorkspaceDelta({
    workspace,
    outputRoot: verificationRoot,
    expectedBaseCommit: manifest.base.commit,
    expectedBaseTree: manifest.base.tree,
    environment: options.environment,
  });
  if (
    recaptured.manifest.deltaSha256 !== manifest.deltaSha256 ||
    canonicalJson(recaptured.manifest) !== canonicalJson(manifest)
  ) {
    throw new Error(
      `reconstructed workspace differs from the signed agent delta: expected ${manifest.deltaSha256}, received ${recaptured.manifest.deltaSha256}; patch ${manifest.patch.sha256}/${recaptured.manifest.patch.sha256}; paths ${canonicalJson(manifest.changedPaths)}/${canonicalJson(recaptured.manifest.changedPaths)}; untracked ${canonicalJson(manifest.untracked)}/${canonicalJson(recaptured.manifest.untracked)}`,
    );
  }
  return { manifest, manifestFileSha256: sha256(manifestBytes) };
}

export function assertWorkspaceDelta(manifest) {
  if (
    manifest?.schemaVersion !== 'decantr-benchmark-workspace-delta.v1' ||
    !/^[a-f0-9]{40}$/u.test(manifest.base?.commit ?? '') ||
    !/^[a-f0-9]{40}$/u.test(manifest.base?.tree ?? '') ||
    typeof manifest.patch?.path !== 'string' ||
    !/^[a-f0-9]{64}$/u.test(manifest.patch?.sha256 ?? '') ||
    !Number.isInteger(manifest.patch?.bytes) ||
    manifest.patch.bytes < 0 ||
    !Array.isArray(manifest.changedPaths) ||
    !Array.isArray(manifest.untracked) ||
    manifest.untrackedSetSha256 !== sha256Canonical(manifest.untracked) ||
    manifest.deltaSha256 !== calculateWorkspaceDeltaDigest(manifest)
  ) {
    throw new Error('workspace delta manifest is invalid');
  }
  const seen = new Set();
  for (const path of manifest.changedPaths) assertPortablePath(path, 'changed path');
  for (const item of manifest.untracked) {
    assertPortablePath(item?.path, 'untracked path');
    if (
      seen.has(item.path) ||
      !/^[a-f0-9]{64}$/u.test(item.sha256 ?? '') ||
      !Number.isInteger(item.bytes) ||
      item.bytes < 0 ||
      !['100644', '100755'].includes(item.mode)
    ) {
      throw new Error('workspace delta untracked binding is invalid');
    }
    seen.add(item.path);
  }
  if (
    canonicalJson([...manifest.changedPaths].sort(compareStrings)) !==
      canonicalJson(manifest.changedPaths) ||
    canonicalJson([...manifest.untracked].sort((left, right) => compareStrings(left.path, right.path))) !==
      canonicalJson(manifest.untracked)
  ) {
    throw new Error('workspace delta paths are not canonically sorted');
  }
  return manifest;
}

export function calculateWorkspaceDeltaDigest(manifest) {
  const { deltaSha256: _deltaSha256, ...body } = manifest;
  return sha256Canonical(body);
}

export function workspaceDeltaFileBytes(manifest) {
  assertWorkspaceDelta(manifest);
  return Buffer.from(prettyCanonicalJson(manifest), 'utf8');
}

function inspectBase(workspace, environment) {
  return {
    commit: git(workspace, ['rev-parse', 'HEAD'], environment).stdout.trim(),
    tree: git(workspace, ['rev-parse', 'HEAD^{tree}'], environment).stdout.trim(),
  };
}

function git(workspace, args, environment) {
  const result = runFixed('git', ['-C', workspace, ...args], {
    cwd: workspace,
    env: environment,
    timeoutMs: 60_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.exitCode !== 0) throw new Error(`git ${args[0]} failed: ${result.stderr.slice(0, 500)}`);
  return result;
}

function nulPaths(value) {
  return value
    .split('\0')
    .filter(Boolean)
    .map((path) => {
      assertPortablePath(path, 'Git path');
      return path;
    })
    .sort(compareStrings);
}

function assertPortablePath(path, label) {
  if (
    typeof path !== 'string' ||
    path.length === 0 ||
    path.includes('\\') ||
    path.includes('\0') ||
    isAbsolute(path) ||
    path === '..' ||
    path.startsWith('../') ||
    path.includes('/../') ||
    path.startsWith('.git/') ||
    path === '.git'
  ) {
    throw new Error(`${label} is not a contained portable path`);
  }
}

function contained(root, candidate) {
  const absolute = resolve(root, candidate);
  const relation = relative(root, absolute);
  if (
    relation === '..' ||
    relation.startsWith(`..${sep}`) ||
    isAbsolute(relation) ||
    relation === ''
  ) {
    throw new Error('artifact path escapes its allowed root');
  }
  return absolute;
}

function assertFileBinding(binding, bytes, label) {
  if (sha256(bytes) !== binding.sha256 || bytes.byteLength !== binding.bytes) {
    throw new Error(`${label} binding mismatch`);
  }
}

function compareStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}
