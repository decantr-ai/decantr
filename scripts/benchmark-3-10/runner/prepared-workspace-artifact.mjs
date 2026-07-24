#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createReadStream } from 'node:fs';
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
} from 'node:fs/promises';
import { join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extract, list } from 'tar';

import {
  assertPreparedEnvironment,
  verifyLockfiles,
  verifyPreparedDependencyTree,
} from '../environments/prepared-environment.mjs';
import {
  assertExecutionAttestation,
  hashQualificationWorkspace,
} from '../evaluators/container-orchestrator.mjs';
import {
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from './canonical.mjs';
import { verifyQualificationProvenance } from '../evaluators/qualification-provenance.mjs';

const MANIFEST_VERSION =
  'decantr-benchmark-prepared-workspace-artifact.v1';
const VERIFICATION_VERSION =
  'decantr-benchmark-prepared-workspace-verification.v1';
const SHA256 = /^[a-f0-9]{64}$/u;
const PUBLIC_PROVENANCE = 'execution-attestation.provenance.jsonl';
const PRIVATE_PROVENANCE =
  'execution-attestation.provenance.sigstore.json';

export async function verifyPreparedWorkspaceArtifact(inputOptions) {
  const options = {
    artifactRoot: resolve(inputOptions.artifactRoot),
    workspaceOutput: resolve(inputOptions.workspaceOutput),
    verificationOutput: inputOptions.verificationOutput
      ? resolve(inputOptions.verificationOutput)
      : null,
    cosignPath: inputOptions.cosignPath
      ? resolve(inputOptions.cosignPath)
      : undefined,
    provenanceVerifier:
      inputOptions.provenanceVerifier ?? verifyQualificationProvenance,
  };
  await assertEmptyDirectory(options.workspaceOutput);
  const workspaceReal = await realpath(options.workspaceOutput);
  const manifestPath = join(options.artifactRoot, 'manifest.json');
  const executionPath = join(
    options.artifactRoot,
    'execution-attestation.json',
  );
  const preparedPath = join(
    options.artifactRoot,
    'prepared-environment.json',
  );
  const workspaceTarPath = join(options.artifactRoot, 'workspace.tar');
  const [
    manifestBytes,
    executionBytes,
    preparedBytes,
    workspaceTarFileSha256,
  ] =
    await Promise.all([
      readFile(manifestPath),
      readFile(executionPath),
      readFile(preparedPath),
      hashFile(workspaceTarPath),
    ]);
  const manifest = assertManifest(parseCanonical(manifestBytes, 'manifest'));
  const execution = assertExecutionAttestation(
    parseCanonical(executionBytes, 'execution attestation'),
  );
  const prepared = assertPreparedEnvironment(
    parseCanonical(preparedBytes, 'prepared environment'),
  );
  const expectedProvenance =
    execution.partition === 'development'
      ? PUBLIC_PROVENANCE
      : PRIVATE_PROVENANCE;
  if (manifest.provenanceFile !== expectedProvenance) {
    throw new Error('prepared workspace provenance filename is invalid');
  }
  const expectedFiles = [
    'execution-attestation.json',
    'execution-attestation.provenance-verification.json',
    'manifest.json',
    'prepared-environment.json',
    expectedProvenance,
    'workspace.tar',
  ].sort();
  const actualFiles = (await readdir(options.artifactRoot)).sort();
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error('prepared workspace artifact file set is invalid');
  }
  await Promise.all(
    expectedFiles.map(async (name) => {
      const metadata = await lstat(join(options.artifactRoot, name));
      if (!metadata.isFile() || metadata.isSymbolicLink()) {
        throw new Error(
          `prepared workspace artifact entry is not a regular file: ${name}`,
        );
      }
    }),
  );
  if (
    sha256(executionBytes) !==
      manifest.executionAttestationFileSha256 ||
    sha256(preparedBytes) !== manifest.preparedEnvironmentFileSha256 ||
    workspaceTarFileSha256 !== manifest.workspaceTarFileSha256 ||
    manifest.workspacePreparedSha256 !==
      execution.preparation.roles.base.workspacePreparedSha256 ||
    manifest.environmentSha256 !== prepared.environmentSha256 ||
    execution.preparation.preparedEnvironment.fileSha256 !==
      sha256(preparedBytes) ||
    execution.preparation.preparedEnvironment.canonicalSha256 !==
      sha256Canonical(prepared) ||
    execution.preparation.preparedEnvironment.environmentSha256 !==
      prepared.environmentSha256 ||
    execution.preparation.preparedEnvironment.attestationSha256 !==
      prepared.attestationSha256 ||
    prepared.taskId !== execution.taskId ||
    prepared.revisionRole !== 'base' ||
    prepared.candidateSha256 !== null ||
    prepared.base.commit !==
      execution.bindings.sourceSnapshots.base.revision.commit ||
    prepared.base.tree !==
      execution.bindings.sourceSnapshots.base.revision.tree ||
    prepared.environmentSpecSha256 !==
      execution.bindings.environment.specFileSha256 ||
    prepared.environmentSubstanceSha256 !==
      execution.bindings.environment.substanceSha256 ||
    prepared.runtimeMatrixSha256 !==
      execution.bindings.runtimeMatrix.matrixSha256 ||
    prepared.runtimeProfileId !==
      execution.bindings.runtimeProfile.id ||
    prepared.benchmarkImageDigest !==
      execution.bindings.benchmarkImage.digest
  ) {
    throw new Error(
      'prepared workspace artifact differs from the signed execution',
    );
  }

  const provenancePath = join(options.artifactRoot, expectedProvenance);
  const provenance = await options.provenanceVerifier({
    attestationPath: executionPath,
    bundlePath: provenancePath,
    partition: execution.partition,
    sourceDigest: execution.runnerRepositoryCommit,
    sourceRef: execution.executionIdentity.ref,
    cosignPath: options.cosignPath,
  });
  if (provenance.attestationFileSha256 !== sha256(executionBytes)) {
    throw new Error(
      'prepared workspace provenance does not bind the execution attestation',
    );
  }

  await assertSafeTar(workspaceTarPath);
  await extract({
    cwd: workspaceReal,
    file: workspaceTarPath,
    preserveOwner: false,
    preservePaths: false,
    strict: true,
    unlink: true,
  });
  if ((await hashFile(workspaceTarPath)) !== workspaceTarFileSha256) {
    throw new Error('prepared workspace tar changed during verification');
  }
  const workspaceSha256 = await hashQualificationWorkspace(workspaceReal);
  const commit = git(workspaceReal, ['rev-parse', 'HEAD']);
  const tree = git(workspaceReal, ['rev-parse', 'HEAD^{tree}']);
  const status = git(workspaceReal, [
    'status',
    '--porcelain=v1',
    '--untracked-files=all',
  ]);
  const workspaceAfterGitSha256 =
    await hashQualificationWorkspace(workspaceReal);
  const workspaceMismatches = [];
  if (workspaceSha256 !== manifest.workspacePreparedSha256) {
    workspaceMismatches.push('filesystem');
  }
  if (commit !== prepared.revision.commit) {
    workspaceMismatches.push('commit');
  }
  if (tree !== prepared.revision.tree) {
    workspaceMismatches.push('tree');
  }
  if (status !== '') {
    workspaceMismatches.push(`status (${status.replaceAll('\n', ', ')})`);
  }
  if (workspaceAfterGitSha256 !== workspaceSha256) {
    workspaceMismatches.push('post-Git filesystem');
  }
  if (workspaceMismatches.length > 0) {
    throw new Error(
      `extracted prepared workspace differs from its signed identity: ${workspaceMismatches.join(', ')}`,
    );
  }
  verifyLockfiles(workspaceReal, prepared.lockfiles);
  await verifyPreparedDependencyTree(workspaceReal, prepared);

  const verification = {
    schemaVersion: VERIFICATION_VERSION,
    taskId: execution.taskId,
    partition: execution.partition,
    executionAttestationFileSha256: sha256(executionBytes),
    executionAttestationSha256: execution.attestationSha256,
    preparedEnvironmentFileSha256: sha256(preparedBytes),
    preparedEnvironmentAttestationSha256:
      prepared.attestationSha256,
    environmentSha256: prepared.environmentSha256,
    workspaceTarFileSha256,
    workspacePreparedSha256: workspaceSha256,
    provenanceVerificationSha256: provenance.verificationSha256,
    sourceCommit: execution.runnerRepositoryCommit,
  };
  verification.verificationSha256 = sha256Canonical(verification);
  if (options.verificationOutput) {
    await writeCanonicalFile(options.verificationOutput, verification);
  }
  return verification;
}

function assertManifest(manifest) {
  assertExactKeys(
    manifest,
    [
      'schemaVersion',
      'executionAttestationFileSha256',
      'preparedEnvironmentFileSha256',
      'workspaceTarFileSha256',
      'workspacePreparedSha256',
      'environmentSha256',
      'provenanceFile',
    ],
    'prepared workspace manifest',
  );
  if (
    manifest.schemaVersion !== MANIFEST_VERSION ||
    ![
      'executionAttestationFileSha256',
      'preparedEnvironmentFileSha256',
      'workspaceTarFileSha256',
      'workspacePreparedSha256',
      'environmentSha256',
    ].every((key) => SHA256.test(manifest[key] ?? '')) ||
    ![PUBLIC_PROVENANCE, PRIVATE_PROVENANCE].includes(
      manifest.provenanceFile,
    )
  ) {
    throw new Error('prepared workspace manifest is invalid');
  }
  return manifest;
}

export async function assertSafeTar(path) {
  const entries = [];
  await list({
    file: path,
    strict: true,
    onentry(entry) {
      entries.push({
        path: normalizeArchivePath(entry.path, 'entry path'),
        type: entry.type,
        linkpath: entry.linkpath ?? null,
      });
    },
  });
  if (entries.length === 0) {
    throw new Error('prepared workspace tar is empty');
  }
  const allowedTypes = new Set([
    'Directory',
    'File',
    'Link',
    'SymbolicLink',
  ]);
  const paths = new Set();
  for (const entry of entries) {
    if (!allowedTypes.has(entry.type)) {
      throw new Error(
        `prepared workspace tar entry type is unsafe: ${entry.type}`,
      );
    }
    if (paths.has(entry.path)) {
      throw new Error(
        `prepared workspace tar contains a duplicate path: ${entry.path}`,
      );
    }
    paths.add(entry.path);
    if (entry.type === 'SymbolicLink') {
      const target = normalizeArchiveLink(entry.path, entry.linkpath);
      if (target === '..' || target.startsWith('../')) {
        throw new Error(
          `prepared workspace tar symlink escapes the workspace: ${entry.path}`,
        );
      }
    } else if (entry.type === 'Link') {
      normalizeArchivePath(entry.linkpath, 'hard link target');
    }
  }
  const symlinks = new Set(
    entries
      .filter((entry) => entry.type === 'SymbolicLink')
      .map((entry) => entry.path),
  );
  for (const entry of entries) {
    const segments = entry.path.split('/');
    for (let index = 1; index < segments.length; index += 1) {
      if (symlinks.has(segments.slice(0, index).join('/'))) {
        throw new Error(
          `prepared workspace tar entry traverses a symlink: ${entry.path}`,
        );
      }
    }
  }
}

function normalizeArchivePath(value, label) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.includes('\\') ||
    value.includes('\0') ||
    value.includes('\r') ||
    value.includes('\n') ||
    posix.isAbsolute(value) ||
    value.split('/').includes('..')
  ) {
    throw new Error(`prepared workspace tar ${label} is unsafe`);
  }
  const normalized = posix.normalize(value.replace(/^(?:\.\/)+/u, ''));
  if (
    normalized === '..' ||
    normalized.startsWith('../') ||
    posix.isAbsolute(normalized)
  ) {
    throw new Error(`prepared workspace tar ${label} is unsafe`);
  }
  return normalized;
}

function normalizeArchiveLink(entryPath, linkpath) {
  if (
    typeof linkpath !== 'string' ||
    linkpath.length === 0 ||
    linkpath.includes('\\') ||
    linkpath.includes('\0') ||
    linkpath.includes('\r') ||
    linkpath.includes('\n') ||
    posix.isAbsolute(linkpath)
  ) {
    throw new Error('prepared workspace tar symbolic link target is unsafe');
  }
  return posix.normalize(posix.join(posix.dirname(entryPath), linkpath));
}

function parseCanonical(bytes, label) {
  let value;
  try {
    value = JSON.parse(bytes);
  } catch {
    throw new Error(`${label} is not valid JSON`);
  }
  if (!bytes.equals(Buffer.from(prettyCanonicalJson(value)))) {
    throw new Error(`${label} is not canonical`);
  }
  return value;
}

async function assertEmptyDirectory(path) {
  await mkdir(path, { recursive: true, mode: 0o700 });
  const metadata = await lstat(path);
  if (!metadata.isDirectory() || metadata.isSymbolicLink()) {
    throw new Error('prepared workspace output must be a real directory');
  }
  if ((await readdir(path)).length !== 0) {
    throw new Error('prepared workspace output must be empty');
  }
}

function git(cwd, args) {
  return command('git', ['-C', cwd, ...args]).trim();
}

function command(executable, args, options = {}) {
  return execFileSync(executable, args, {
    encoding: 'utf8',
    env:
      executable === 'git'
        ? { ...process.env, GIT_OPTIONAL_LOCKS: '0' }
        : process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });
}

async function hashFile(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) {
    hash.update(chunk);
  }
  return hash.digest('hex');
}

function assertExactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  if (
    JSON.stringify(Object.keys(value).sort()) !==
    JSON.stringify([...keys].sort())
  ) {
    throw new Error(`${label} keys are invalid`);
  }
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--artifact-root') {
      options.artifactRoot = argv[++index];
    } else if (argument === '--workspace-out') {
      options.workspaceOutput = argv[++index];
    } else if (argument === '--verification-out') {
      options.verificationOutput = argv[++index];
    } else if (argument === '--cosign') {
      options.cosignPath = argv[++index];
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }
  if (
    !options.artifactRoot ||
    !options.workspaceOutput ||
    !options.verificationOutput
  ) {
    throw new Error(
      '--artifact-root, --workspace-out, and --verification-out are required',
    );
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await verifyPreparedWorkspaceArtifact(
      parseArgs(process.argv.slice(2)),
    );
    process.stdout.write(
      `${prettyCanonicalJson({
        ok: true,
        taskId: result.taskId,
        verificationSha256: result.verificationSha256,
      })}`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
