#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { lstat, open, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { taskEnvironmentSubstanceSha256 } from '../environments/contracts.mjs';
import { assertRuntimeMatrix } from '../environments/runtime-matrix.mjs';
import { checkoutDirectory } from '../lib.mjs';
import { prettyCanonicalJson, sha256, sha256Canonical, writeCanonicalFile } from '../runner/canonical.mjs';
import { runFixed, sanitizedEnvironment } from '../runner/process.mjs';
import { assertCandidateSet } from './qualify.mjs';
import { prepareEvaluatorQualificationTask } from './qualification-task.mjs';

const directory = dirname(fileURLToPath(import.meta.url));
const benchmarkRoot = resolve(directory, '..');
const repositoryRoot = resolve(benchmarkRoot, '..', '..');
const PROGRAM = 'decantr-3.10-ui-change-control-proof';
const REQUEST_VERSION = 'decantr-benchmark-container-qualification-request.v1';
const MANIFEST_VERSION = 'decantr-benchmark-qualification-input-manifest.v1';
const SHA256 = /^[a-f0-9]{64}$/u;
const IMAGE_DIGEST = /^sha256:[a-f0-9]{64}$/u;
const GIT_SHA = /^[a-f0-9]{40}$/u;

export async function buildQualificationInput(inputOptions) {
  const options = normalizeBuildOptions(inputOptions);
  await assertEmptyDirectory(options.outputRoot);
  const candidateSetBytes = await readFile(options.candidatesPath);
  const candidates = assertCandidateSet(JSON.parse(candidateSetBytes), options.partition);
  const candidate = candidates.find((item) => item.taskId === options.taskId);
  if (!candidate) throw new Error(`${options.taskId}: candidate is absent from the ${options.partition} set`);

  const contractRoot = join(options.outputRoot, 'contracts');
  const bundleRoot = join(options.outputRoot, 'prequalification');
  const sealed = await prepareEvaluatorQualificationTask({
    partition: options.partition,
    taskId: options.taskId,
    candidatesPath: options.candidatesPath,
    corpusPath: options.corpusPath,
    corpusRoot: options.corpusRoot,
    evaluatorRoot: options.evaluatorRoot,
    environmentRoot: options.environmentRoot,
    runtimeMatrixPath: options.runtimeMatrixPath,
    contractRoot,
    bundleRoot,
  });

  const environmentSpecPath = join(options.environmentRoot, 'specs', `${options.taskId}.json`);
  const evaluatorSpec = JSON.parse(
    await readFile(join(options.evaluatorRoot, 'specs', `${options.taskId}.json`), 'utf8'),
  );
  const sourceLogicalPath = evaluatorSpec.oracle.sourcePath;
  const [environmentBytes, matrixBytes, sourceBytes, contractBytes, bundleBytes] = await Promise.all([
    readFile(environmentSpecPath),
    readFile(options.runtimeMatrixPath),
    readFile(join(options.evaluatorRoot, sourceLogicalPath)),
    readFile(sealed.contractPath),
    readFile(sealed.bundlePath),
  ]);
  const environmentSpec = JSON.parse(environmentBytes);
  const runtimeMatrix = assertRuntimeMatrix(JSON.parse(matrixBytes), { requireLocked: true });
  const profile = runtimeMatrix.profiles.find((item) => item.id === environmentSpec.profile.id);
  if (!profile) throw new Error(`${options.taskId}: environment profile is absent from the locked matrix`);

  const candidatePath = join(options.outputRoot, 'candidate.json');
  const environmentPath = join(options.outputRoot, 'environment.json');
  const matrixPath = join(options.outputRoot, 'runtime-matrix.json');
  const stagedContractPath = sealed.contractPath;
  const stagedBundlePath = sealed.bundlePath;
  const stagedSourcePath = join(options.outputRoot, 'evaluator', sourceLogicalPath);
  await mkdir(dirname(stagedSourcePath), { recursive: true, mode: 0o700 });
  await Promise.all([
    writeCanonicalFile(candidatePath, candidate),
    writeFile(environmentPath, environmentBytes, { mode: 0o600 }),
    writeFile(matrixPath, matrixBytes, { mode: 0o600 }),
    writeFile(stagedSourcePath, sourceBytes, { mode: 0o600 }),
  ]);

  const checkout = join(options.corpusRoot, checkoutDirectory(candidate.repository.url));
  const snapshotRoot = join(options.outputRoot, 'snapshots');
  await mkdir(snapshotRoot, { recursive: true, mode: 0o700 });
  const snapshots = {};
  for (const role of ['base', 'expected']) {
    const path = join(snapshotRoot, `${role}.pack`);
    const revision = candidate[role];
    await writeSnapshotPack(checkout, revision, path);
    snapshots[role] = { path, fileSha256: sha256(await readFile(path)) };
  }

  const runnerCommit = options.runnerCommit ?? git(repositoryRoot, ['rev-parse', 'HEAD']);
  const controllerCommitVerifier = options.controllerCommitVerifier ?? assertControllerCommitted;
  await controllerCommitVerifier(repositoryRoot, runnerCommit);
  const manifestPath = join(options.outputRoot, 'manifest.json');
  const files = await collectInputFiles(options.outputRoot, [
    candidatePath,
    environmentPath,
    matrixPath,
    stagedContractPath,
    stagedBundlePath,
    stagedSourcePath,
    snapshots.base.path,
    snapshots.expected.path,
  ]);
  const manifest = {
    schemaVersion: MANIFEST_VERSION,
    program: PROGRAM,
    taskId: candidate.taskId,
    partition: candidate.partition,
    createdAt: new Date().toISOString(),
    environmentSubstanceSha256: taskEnvironmentSubstanceSha256(environmentSpec),
    files,
  };
  manifest.manifestSha256 = calculateQualificationInputManifestDigest(manifest);
  await writeCanonicalFile(manifestPath, manifest);
  const manifestBytes = await readFile(manifestPath);

  const request = {
    schemaVersion: REQUEST_VERSION,
    program: PROGRAM,
    taskId: candidate.taskId,
    partition: candidate.partition,
    bindings: {
      inputManifest: {
        path: 'manifest.json',
        fileSha256: sha256(manifestBytes),
        manifestSha256: manifest.manifestSha256,
      },
      candidate: {
        path: 'candidate.json',
        canonicalSha256: sha256Canonical(candidate),
        fileSha256: sha256(await readFile(candidatePath)),
      },
      prequalificationBundle: {
        path: join('prequalification', `${candidate.taskId}.json`),
        fileSha256: sha256(bundleBytes),
        bundleSha256: sealed.bundle.bundleSha256,
      },
      evaluator: {
        contractPath: join('contracts', `${candidate.taskId}.json`),
        contractFileSha256: sha256(contractBytes),
        contractId: evaluatorSpec.contractId,
        sourceRoot: 'evaluator',
        sourceClosure: [{ path: sourceLogicalPath, sha256: sha256(sourceBytes) }],
        projectPath: candidate.repository.projectPath,
      },
      environment: {
        specPath: 'environment.json',
        specFileSha256: sha256(environmentBytes),
      },
      runtimeMatrix: {
        path: 'runtime-matrix.json',
        fileSha256: sha256(matrixBytes),
        matrixSha256: runtimeMatrix.matrixSha256,
        profileId: profile.id,
      },
    },
    roles: Object.fromEntries(
      ['base', 'expected'].map((role) => [
        role,
        {
          snapshotPackPath: join('snapshots', `${role}.pack`),
          snapshotPackFileSha256: snapshots[role].fileSha256,
          revision: structuredClone(candidate[role]),
        },
      ]),
    ),
    dependencyProxy: {
      image: structuredClone(options.proxyImage),
      imageArchivePath: null,
    },
    runnerRepository: { commit: runnerCommit },
    imageArchivePath: null,
  };
  request.requestSha256 = calculateQualificationInputRequestDigest(request);
  const requestPath = join(options.outputRoot, 'request.json');
  await writeCanonicalFile(requestPath, request);
  return { request, requestPath, manifest, manifestPath };
}

export async function hydrateQualificationInput(inputOptions) {
  const inputRoot = resolveRequired(inputOptions.inputRoot, 'inputRoot');
  const requestPath = contained(inputRoot, inputOptions.request, 'request');
  if (dirname(requestPath) !== inputRoot || requestPath !== join(inputRoot, 'request.json')) {
    throw new Error('qualification request must be request.json at the sealed input root');
  }
  const requestBytes = await readFile(requestPath);
  const request = JSON.parse(requestBytes);
  if (request.schemaVersion !== REQUEST_VERSION || request.program !== PROGRAM) {
    throw new Error('qualification request identity is invalid');
  }
  if (
    request.requestSha256 !== calculateQualificationInputRequestDigest(request) ||
    !requestBytes.equals(Buffer.from(prettyCanonicalJson(request)))
  ) {
    throw new Error('qualification request digest or canonical bytes are invalid');
  }
  await verifyInputManifest(dirname(requestPath), request);
  const workspaceRoot = resolveRequired(inputOptions.workspaceRoot, 'workspaceRoot');
  assertDisjointRoots(dirname(requestPath), workspaceRoot);
  await assertEmptyDirectory(workspaceRoot);
  for (const role of ['base', 'expected']) {
    const binding = request.roles?.[role];
    if (!binding) throw new Error(`${role} request binding is missing`);
    const packPath = contained(inputRoot, binding.snapshotPackPath, `${role} snapshot pack`);
    const workspace = join(workspaceRoot, role);
    if (sha256(await readFile(packPath)) !== binding.snapshotPackFileSha256) {
      throw new Error(`${role} snapshot pack digest is invalid`);
    }
    await hydrateSnapshot(packPath, workspace, binding.revision);
  }
  return { taskId: request.taskId, requestPath };
}

export function calculateQualificationInputManifestDigest(manifest) {
  const { manifestSha256: _ignored, ...body } = manifest;
  return sha256Canonical(body);
}

export function calculateQualificationInputRequestDigest(request) {
  const { requestSha256: _ignored, ...body } = request;
  return sha256Canonical(body);
}

async function writeSnapshotPack(checkout, revision, outputPath) {
  if (
    git(checkout, ['rev-parse', `${revision.commit}^{commit}`]) !== revision.commit ||
    git(checkout, ['rev-parse', `${revision.commit}^{tree}`]) !== revision.tree
  ) {
    throw new Error(`snapshot revision is absent or has the wrong tree: ${revision.commit}`);
  }
  const objects = new Set([revision.commit, revision.tree]);
  const listing = git(checkout, ['ls-tree', '-r', '-t', '--full-tree', revision.commit]);
  for (const line of listing.split('\n').filter(Boolean)) {
    const match = line.match(/^[0-7]{6}\s+(?:blob|tree)\s+([a-f0-9]{40})\t/u);
    if (!match) throw new Error(`unable to parse Git tree entry for ${revision.commit}`);
    objects.add(match[1]);
  }
  await mkdir(dirname(outputPath), { recursive: true, mode: 0o700 });
  const output = await open(outputPath, 'w', 0o600);
  try {
    const result = spawnSync('git', ['-C', checkout, 'pack-objects', '--stdout'], {
      input: `${[...objects].sort().join('\n')}\n`,
      encoding: 'utf8',
      shell: false,
      stdio: ['pipe', output.fd, 'pipe'],
    });
    if (result.status !== 0) throw new Error(`git pack-objects failed: ${result.stderr ?? ''}`);
  } finally {
    await output.close();
  }
}

async function hydrateSnapshot(packPath, workspace, revision) {
  await mkdir(workspace, { recursive: true, mode: 0o700 });
  if ((await readdir(workspace)).length !== 0) throw new Error(`snapshot workspace is not empty: ${workspace}`);
  runGit(workspace, ['init', '--quiet']);
  const pack = await open(packPath, 'r');
  try {
    const result = spawnSync('git', ['-C', workspace, 'index-pack', '--stdin'], {
      encoding: 'utf8',
      shell: false,
      stdio: [pack.fd, 'pipe', 'pipe'],
    });
    if (result.status !== 0) throw new Error(`git index-pack failed: ${result.stderr ?? ''}`);
  } finally {
    await pack.close();
  }
  runGit(workspace, ['config', 'core.hooksPath', '/dev/null']);
  runGit(workspace, ['update-ref', 'refs/heads/snapshot', revision.commit]);
  runGit(workspace, ['checkout', '--quiet', '--detach', revision.commit]);
  if (
    git(workspace, ['rev-parse', 'HEAD']) !== revision.commit ||
    git(workspace, ['rev-parse', 'HEAD^{tree}']) !== revision.tree ||
    git(workspace, ['status', '--porcelain=v1', '--untracked-files=all']) !== ''
  ) {
    throw new Error('hydrated source snapshot differs from the sealed revision');
  }
}

async function collectInputFiles(root, paths) {
  const output = [];
  for (const path of paths) {
    const bytes = await readFile(path);
    output.push({
      path: relative(root, path).replaceAll('\\', '/'),
      sha256: sha256(bytes),
      bytes: bytes.byteLength,
    });
  }
  return output.sort((left, right) => left.path.localeCompare(right.path));
}

function assertControllerCommitted(root, runnerCommit) {
  if (git(root, ['rev-parse', 'HEAD']) !== runnerCommit) {
    throw new Error('qualification controller checkout differs from the requested runner commit');
  }
  const changed = git(root, [
    'status',
    '--porcelain=v1',
    '--untracked-files=all',
    '--',
    'scripts/benchmark-3-10',
    '.github/workflows/benchmark-3-10-evaluator-qualification.yml',
    '.github/workflows/benchmark-3-10-qualification-input.yml',
    '.github/workflows/benchmark-3-10-runtime-profiles.yml',
  ]);
  if (changed !== '') throw new Error('qualification controller sources must be committed before staging input');
}

async function verifyInputManifest(root, request) {
  const binding = request.bindings?.inputManifest;
  if (!binding) throw new Error('qualification request does not bind its input manifest');
  const manifestPath = contained(root, binding.path, 'qualification input manifest');
  const manifestBytes = await readFile(manifestPath);
  const manifest = JSON.parse(manifestBytes);
  assertExactKeys(
    manifest,
    [
      'schemaVersion',
      'program',
      'taskId',
      'partition',
      'createdAt',
      'environmentSubstanceSha256',
      'files',
      'manifestSha256',
    ],
    'qualification input manifest',
  );
  if (
    manifest.schemaVersion !== MANIFEST_VERSION ||
    manifest.program !== PROGRAM ||
    manifest.taskId !== request.taskId ||
    manifest.partition !== request.partition ||
    !Number.isFinite(Date.parse(manifest.createdAt ?? '')) ||
    !SHA256.test(manifest.environmentSubstanceSha256 ?? '') ||
    manifest.manifestSha256 !== calculateQualificationInputManifestDigest(manifest) ||
    manifest.manifestSha256 !== binding.manifestSha256 ||
    sha256(manifestBytes) !== binding.fileSha256 ||
    !Array.isArray(manifest.files) ||
    manifest.files.length === 0
  ) {
    throw new Error('qualification input manifest identity or self digest is invalid');
  }

  const expected = new Map();
  for (const entry of manifest.files) {
    assertExactKeys(entry, ['path', 'sha256', 'bytes'], 'qualification input manifest file');
    const path = contained(root, entry.path, 'qualification input manifest file');
    const logicalPath = relative(root, path).replaceAll('\\', '/');
    if (
      ['manifest.json', 'request.json'].includes(logicalPath) ||
      expected.has(logicalPath) ||
      !SHA256.test(entry.sha256 ?? '') ||
      !Number.isSafeInteger(entry.bytes) ||
      entry.bytes < 0
    ) {
      throw new Error(`qualification input manifest file binding is invalid: ${entry.path}`);
    }
    const bytes = await readFile(path);
    if (bytes.byteLength !== entry.bytes || sha256(bytes) !== entry.sha256) {
      throw new Error(`qualification input file differs from its manifest: ${entry.path}`);
    }
    expected.set(logicalPath, entry);
  }

  const actual = [];
  await walkInputFiles(root, root, actual);
  const actualPaths = actual.sort();
  const expectedPaths = [...expected.keys(), 'manifest.json', 'request.json'].sort();
  if (actualPaths.join('\n') !== expectedPaths.join('\n')) {
    throw new Error('qualification input artifact contains missing or unsealed files');
  }
}

async function walkInputFiles(root, current, output) {
  for (const name of (await readdir(current)).sort()) {
    const path = join(current, name);
    const metadata = await lstat(path);
    if (metadata.isSymbolicLink()) throw new Error(`qualification input contains a symlink: ${relative(root, path)}`);
    if (metadata.isDirectory()) {
      await walkInputFiles(root, path, output);
      continue;
    }
    if (!metadata.isFile()) throw new Error(`qualification input contains a non-file entry: ${relative(root, path)}`);
    output.push(relative(root, path).replaceAll('\\', '/'));
  }
}

function assertExactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.join('\n') !== wanted.join('\n')) {
    throw new Error(`${label} keys must be exactly ${wanted.join(', ')}`);
  }
}

function runGit(cwd, args) {
  const result = runFixed('git', ['-C', cwd, ...args], {
    cwd,
    env: sanitizedEnvironment(join(cwd, '.qualification-input-git-home')),
    timeoutMs: 120_000,
  });
  if (result.exitCode !== 0) throw new Error(`git ${args[0]} failed: ${result.stderr.trim()}`);
}

function git(cwd, args) {
  const result = runFixed('git', ['-C', cwd, ...args], {
    cwd,
    env: sanitizedEnvironment(join(cwd, '.qualification-input-git-home')),
    timeoutMs: 120_000,
  });
  if (result.exitCode !== 0) throw new Error(`git ${args[0]} failed: ${result.stderr.trim()}`);
  return result.stdout.trim();
}

async function assertEmptyDirectory(path) {
  await mkdir(path, { recursive: true, mode: 0o700 });
  if ((await readdir(path)).length !== 0) throw new Error(`qualification input output is not empty: ${path}`);
}

function contained(root, path, label) {
  if (typeof path !== 'string' || path.length === 0 || isAbsolute(path)) {
    throw new Error(`${label} path is invalid`);
  }
  const value = resolve(root, path);
  const relation = relative(resolve(root), value);
  if (relation.startsWith('..') || isAbsolute(relation)) throw new Error(`${label} path escapes input root`);
  return value;
}

function assertDisjointRoots(left, right) {
  const leftToRight = relative(resolve(left), resolve(right));
  const rightToLeft = relative(resolve(right), resolve(left));
  if (
    leftToRight === '' ||
    (!leftToRight.startsWith('..') && !isAbsolute(leftToRight)) ||
    (!rightToLeft.startsWith('..') && !isAbsolute(rightToLeft))
  ) {
    throw new Error('qualification workspace root must be outside the sealed input artifact');
  }
}

function resolveRequired(value, label) {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} is required`);
  return resolve(value);
}

function normalizeBuildOptions(input) {
  const options = { ...input };
  for (const name of [
    'candidatesPath',
    'corpusPath',
    'corpusRoot',
    'evaluatorRoot',
    'environmentRoot',
    'runtimeMatrixPath',
    'outputRoot',
  ]) {
    options[name] = resolveRequired(options[name], name);
  }
  if (!['development', 'qualification'].includes(options.partition)) {
    throw new Error('partition must be development or qualification');
  }
  if (typeof options.taskId !== 'string' || options.taskId.length < 3) throw new Error('taskId is required');
  if (
    typeof options.proxyImage?.reference !== 'string' ||
    options.proxyImage.reference.length < 3 ||
    !IMAGE_DIGEST.test(options.proxyImage.digest ?? '')
  ) {
    throw new Error('an exact dependency proxy image reference and digest are required');
  }
  if (options.runnerCommit !== undefined && !GIT_SHA.test(options.runnerCommit)) {
    throw new Error('runnerCommit override is invalid');
  }
  return options;
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) throw new Error(`invalid option: ${key ?? 'missing'}`);
    parsed[key.slice(2)] = value;
  }
  if (parsed.mode === 'hydrate') {
    return {
      mode: 'hydrate',
      inputRoot: parsed['input-root'],
      request: parsed.request,
      workspaceRoot: parsed['workspace-root'],
    };
  }
  if (parsed.mode !== 'build') throw new Error('--mode must be build or hydrate');
  return {
    mode: 'build',
    partition: parsed.partition,
    taskId: parsed['task-id'],
    candidatesPath: parsed.candidates,
    corpusPath: parsed.corpus,
    corpusRoot: parsed['corpus-root'],
    evaluatorRoot: parsed['evaluator-root'],
    environmentRoot: parsed['environment-root'],
    runtimeMatrixPath: parsed['runtime-matrix'],
    outputRoot: parsed['output-root'],
    proxyImage: {
      reference: parsed['proxy-image-reference'],
      digest: parsed['proxy-image-digest'],
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = options.mode === 'hydrate'
      ? await hydrateQualificationInput(options)
      : await buildQualificationInput(options);
    process.stdout.write(`${prettyCanonicalJson({ ok: true, taskId: result.taskId ?? result.request.taskId })}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
