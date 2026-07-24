#!/usr/bin/env node
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { constants } from 'node:fs';
import {
  access,
  lstat,
  mkdir,
  readFile,
  readlink,
  readdir,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertTaskEnvironmentSpec, taskEnvironmentSubstanceSha256 } from '../environments/contracts.mjs';
import { assertRuntimeMatrix } from '../environments/runtime-matrix.mjs';
import { executeEvaluator } from '../evaluator/run-evaluator.mjs';
import {
  canonicalJson,
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from '../runner/canonical.mjs';
import { assertEvaluatorContract } from '../runner/contracts.mjs';
import { assertFixedCommand, isForbiddenEvaluatorEnvironmentKey } from '../runner/process.mjs';

const PROGRAM = 'decantr-3.10-ui-change-control-proof';
const REQUEST_VERSION = 'decantr-benchmark-container-qualification-request.v1';
const ATTESTATION_VERSION = 'decantr-benchmark-container-execution-attestation.v1';
const ROLE_RESULT_VERSION = 'decantr-benchmark-container-role-result.v1';
const SHA256 = /^[a-f0-9]{64}$/u;
const IMAGE_DIGEST = /^sha256:[a-f0-9]{64}$/u;
const TASK_ID = /^[a-z0-9][a-z0-9._-]{2,95}$/u;
const GIT_SHA = /^[a-f0-9]{40}$/u;
const SAFE_HOST = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/u;
const FIXED_DEPENDENCY_HOSTS = Object.freeze([
  'codeload.github.com',
  'github.com',
  'objects.githubusercontent.com',
  'raw.githubusercontent.com',
  'registry.npmjs.org',
  'registry.yarnpkg.com',
  'release-assets.githubusercontent.com',
]);
const CONTROLLER_CLOSURE = Object.freeze([
  'environments/contracts.mjs',
  'environments/npm-ci-public-lock-fallback.mjs',
  'environments/runtime-matrix.mjs',
  'evaluator/run-evaluator.mjs',
  'evaluators/container-orchestrator.mjs',
  'runner/canonical.mjs',
  'runner/candidate-runtime.mjs',
  'runner/contracts.mjs',
  'runner/process.mjs',
]);
const repositoryRoot = resolve(fileURLToPath(new URL('../../..', import.meta.url)));

export async function orchestrateEvaluatorQualification(inputOptions) {
  const options = normalizeOptions(inputOptions);
  const request = await loadAndVerifyRequest(
    options.request,
    options.inputRoot,
    options.workspaceRoot,
    options.requestFileSha256,
  );
  const runner = options.commandRunner ?? createCommandRunner();
  const executionId = options.executionId ?? randomUUID();
  const names = resourceNames(request.taskId, executionId);
  const startedAt = options.clock().toISOString();
  const evidenceRoot = resolve(options.artifactRoot, 'evidence');
  await mkdir(evidenceRoot, { recursive: true, mode: 0o700 });
  await retainQualificationInputEvidence(request, options);

  const cleanup = { containers: new Set(), networks: new Set() };
  try {
    await ensureImage(runner, request.profile.benchmarkImage, request.imageArchivePath);
    const imageInspect = await inspectImage(runner, request.profile.benchmarkImage.digest, request.profile);
    const imageEvidence = await persistEvidence(evidenceRoot, 'benchmark-image.inspect.json', imageInspect.raw);
    const controller = await captureControllerClosure({
      runner,
      imageDigest: request.profile.benchmarkImage.digest,
      evidenceRoot,
      containerName: names.controller,
      cleanup,
    });

    const allowlist = await deriveDependencyAllowlist(request.environmentSpec, request.roles.base.workspace);
    const proxy = await startDependencyProxy({
      runner,
      request,
      names,
      allowlist,
      evidenceRoot,
      cleanup,
    });

    const roles = {};
    for (const role of ['base', 'expected']) {
      roles[role] = await prepareRole({
        runner,
        request,
        role,
        names,
        proxy,
        evidenceRoot,
        cleanup,
      });
    }

    await stopAndRemoveContainer(runner, proxy.containerId, cleanup);
    proxy.containerId = null;
    await removeNetwork(runner, proxy.networkName, cleanup);

    for (const role of ['base', 'expected']) {
      roles[role].evaluation = await evaluateRole({
        runner,
        request,
        role,
        names,
        executionId,
        evidenceRoot,
        cleanup,
      });
    }

    const endedAt = options.clock().toISOString();
    const runnerCommit = await verifyRunnerCommit(request.runnerRepository);
    if (
      options.environment.GITHUB_ACTIONS === 'true' &&
      options.environment.GITHUB_SHA !== runnerCommit
    ) {
      throw new Error('runner repository commit differs from the GitHub Actions checkout identity');
    }
    const attestation = buildExecutionAttestation({
      request,
      executionId,
      startedAt,
      endedAt,
      imageEvidence,
      controller,
      proxy,
      roles,
      runnerCommit,
      executionIdentity: executionIdentity(options.environment),
    });
    attestation.attestationSha256 = calculateExecutionAttestationDigest(attestation);
    assertExecutionAttestation(attestation);
    await writeCanonicalFile(options.outputPath, attestation);
    return attestation;
  } finally {
    await bestEffortCleanup(runner, cleanup);
  }
}

export function calculateExecutionAttestationDigest(attestation) {
  const { attestationSha256: _ignored, ...body } = attestation;
  return sha256Canonical(body);
}

export function calculateQualificationRequestDigest(request) {
  const { requestSha256: _ignored, ...body } = request;
  return sha256Canonical(body);
}

export function assertExecutionAttestation(attestation) {
  assertExactKeys(
    attestation,
    [
      'schemaVersion',
      'program',
      'executionId',
      'taskId',
      'partition',
      'status',
      'executionIdentity',
      'runnerRepositoryCommit',
      'startedAt',
      'endedAt',
      'bindings',
      'preparation',
      'evaluation',
      'attestationSha256',
    ],
    'execution attestation',
  );
  if (
    attestation.schemaVersion !== ATTESTATION_VERSION ||
    attestation.program !== PROGRAM ||
    !TASK_ID.test(attestation.taskId ?? '') ||
    !['development', 'qualification'].includes(attestation.partition) ||
    attestation.status !== 'completed' ||
    !GIT_SHA.test(attestation.runnerRepositoryCommit ?? '') ||
    !Number.isFinite(Date.parse(attestation.startedAt ?? '')) ||
    !Number.isFinite(Date.parse(attestation.endedAt ?? '')) ||
    Date.parse(attestation.endedAt) < Date.parse(attestation.startedAt)
  ) {
    throw new Error('execution attestation identity is invalid');
  }
  assertExecutionIdentity(attestation.executionIdentity);
  assertExecutionBindings(attestation.bindings);
  assertPreparationEvidence(attestation.preparation);
  assertEvaluationEvidence(attestation.evaluation);
  assertDigestTree(attestation.bindings, 'attestation bindings');
  if (
    attestation.preparation.networkPolicy !== 'isolated-forward-proxy' ||
    attestation.preparation.directTaskEgress !== false ||
    attestation.evaluation.networkMode !== 'none' ||
    attestation.evaluation.hostInspected !== true ||
    attestation.evaluation.roles.base.siblingWorkspaceVisible !== false ||
    attestation.evaluation.roles.expected.siblingWorkspaceVisible !== false ||
    attestation.evaluation.roles.base.networkCanary !== 'blocked' ||
    attestation.evaluation.roles.expected.networkCanary !== 'blocked'
  ) {
    throw new Error('execution attestation does not prove the required isolation policy');
  }
  for (const role of ['base', 'expected']) {
    const record = attestation.evaluation.roles[role];
    if (
      record.networkMode !== 'none' ||
      record.hostInspectedWhileRunning !== true ||
      record.readOnlyRoot !== true ||
      record.workspaceReadOnly !== true ||
      record.imageDigest !== attestation.bindings.benchmarkImage.digest ||
      !SHA256.test(record.inspectEvidence.fileSha256 ?? '') ||
      !SHA256.test(record.inspectEvidence.canonicalSha256 ?? '') ||
      !SHA256.test(record.result.fileSha256 ?? '') ||
      !SHA256.test(record.result.canonicalSha256 ?? '') ||
      record.workspaceBeforeSha256 !== record.workspaceAfterSha256
    ) {
      throw new Error(`${role} evaluation isolation evidence is invalid`);
    }
  }
  if (attestation.attestationSha256 !== calculateExecutionAttestationDigest(attestation)) {
    throw new Error('execution attestation self digest is invalid');
  }
  return attestation;
}

export async function calculateContainerControllerClosure(
  root = resolve(repositoryRoot, 'scripts', 'benchmark-3-10'),
) {
  const entries = await Promise.all(
    CONTROLLER_CLOSURE.map(async (path) => {
      const bytes = await readFile(resolve(root, path));
      return { path, sha256: sha256(bytes), bytes: bytes.byteLength };
    }),
  );
  entries.sort((left, right) => left.path.localeCompare(right.path));
  return { closureSha256: sha256Canonical(entries), entries };
}

export async function deriveDependencyAllowlist(environmentSpec, workspace) {
  const derived = new Set();
  const lockfiles = [];
  for (const binding of environmentSpec.lockfiles) {
    const path = containedPath(workspace, binding.path, 'lockfile');
    const bytes = await readFile(path);
    if (sha256(bytes) !== binding.sha256) throw new Error(`lockfile bytes drifted: ${binding.path}`);
    lockfiles.push({ path: binding.path, sha256: binding.sha256 });
    const text = bytes.toString('utf8');
    for (const match of text.matchAll(/https:\/\/[^\s'"<>()[\]{}]+/gu)) {
      let url;
      try {
        url = new URL(match[0].replace(/[),.;]+$/u, ''));
      } catch {
        continue;
      }
      const host = url.hostname.toLowerCase();
      if (url.protocol !== 'https:' || (url.port !== '' && url.port !== '443') || !SAFE_HOST.test(host)) {
        throw new Error(`unsafe dependency source in reviewed lockfile: ${match[0]}`);
      }
      derived.add(host);
    }
  }
  const fixed = [...FIXED_DEPENDENCY_HOSTS];
  const hosts = [...new Set([...fixed, ...derived])].sort();
  if (hosts.length === 0) throw new Error('dependency proxy allowlist is empty');
  return { fixed, derived: [...derived].sort(), hosts, lockfiles };
}

export function createCommandRunner() {
  return {
    async run(command, args, options = {}) {
      assertFixedCommand(command, args);
      const result = spawnSync(command, args, {
        cwd: options.cwd,
        env: options.env,
        encoding: 'utf8',
        maxBuffer: options.maxBuffer ?? 64 * 1024 * 1024,
        shell: false,
        timeout: options.timeoutMs,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      return {
        exitCode: Number.isInteger(result.status) ? result.status : null,
        signal: result.signal ?? null,
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? (result.error ? String(result.error.message) : ''),
        errorCode: result.error?.code ?? null,
      };
    },
  };
}

async function loadAndVerifyRequest(rawRequest, inputRoot, workspaceRoot, requestFileSha256) {
  const request = structuredClone(rawRequest);
  assertRequest(request);
  const canonicalRequestBytes = Buffer.from(prettyCanonicalJson(request));
  if (
    request.requestSha256 !== calculateQualificationRequestDigest(request) ||
    requestFileSha256 !== sha256(canonicalRequestBytes)
  ) {
    throw new Error('qualification request self digest is invalid');
  }
  resolveRequestPaths(request, inputRoot, workspaceRoot);
  const manifestBytes = await readFile(request.bindings.inputManifest.path);
  const manifest = JSON.parse(manifestBytes);
  assertInputManifest(manifest, request);
  await verifyInputManifestFiles(inputRoot, manifest);
  const candidateBytes = await readFile(request.bindings.candidate.path);
  const candidate = JSON.parse(candidateBytes);
  const bundleBytes = await readFile(request.bindings.prequalificationBundle.path);
  const bundle = JSON.parse(bundleBytes);
  assertPrequalificationSeal(bundle, candidate);
  const contractBytes = await readFile(request.bindings.evaluator.contractPath);
  const contract = assertEvaluatorContract(JSON.parse(contractBytes), {
    taskId: request.taskId,
    evaluator: { contractId: request.bindings.evaluator.contractId },
  });
  const environmentBytes = await readFile(request.bindings.environment.specPath);
  const environmentSpec = assertTaskEnvironmentSpec(JSON.parse(environmentBytes), candidate, { reviewStatus: 'approved' });
  const matrixBytes = await readFile(request.bindings.runtimeMatrix.path);
  const runtimeMatrix = assertRuntimeMatrix(JSON.parse(matrixBytes), { requireLocked: true });
  const profile = runtimeMatrix.profiles.find((item) => item.id === request.bindings.runtimeMatrix.profileId);
  if (!profile) throw new Error('requested runtime profile is absent from the locked matrix');

  const candidateSha256 = sha256Canonical(candidate);
  const bundleSha256 = calculateBundleDigest(bundle);
  const environmentSubstanceSha256 = taskEnvironmentSubstanceSha256(environmentSpec);
  const checks = [
    [candidate.taskId === request.taskId && candidate.partition === request.partition, 'candidate identity'],
    [request.bindings.evaluator.projectPath === candidate.repository.projectPath, 'evaluator project path'],
    [sha256(manifestBytes) === request.bindings.inputManifest.fileSha256, 'input manifest file digest'],
    [manifest.manifestSha256 === request.bindings.inputManifest.manifestSha256, 'input manifest digest'],
    [candidateSha256 === request.bindings.candidate.canonicalSha256, 'candidate canonical digest'],
    [sha256(candidateBytes) === request.bindings.candidate.fileSha256, 'candidate file digest'],
    [bundle.taskId === request.taskId && bundle.partition === request.partition, 'prequalification identity'],
    [bundleSha256 === bundle.bundleSha256, 'prequalification self digest'],
    [sha256(bundleBytes) === request.bindings.prequalificationBundle.fileSha256, 'prequalification file digest'],
    [bundle.bundleSha256 === request.bindings.prequalificationBundle.bundleSha256, 'prequalification digest'],
    [bundle.candidateSha256 === candidateSha256, 'prequalification candidate binding'],
    [sha256(contractBytes) === request.bindings.evaluator.contractFileSha256, 'evaluator contract file digest'],
    [sha256(contractBytes) === bundle.evaluatorContractSha256, 'prequalification evaluator contract binding'],
    [contract.oracle.sourceSha256 === bundle.oracleSourceSha256, 'prequalification oracle source binding'],
    [sha256(environmentBytes) === request.bindings.environment.specFileSha256, 'environment file digest'],
    [sha256(environmentBytes) === bundle.environmentSpecSha256, 'prequalification environment binding'],
    [environmentSubstanceSha256 === bundle.environmentSubstanceSha256, 'environment substance binding'],
    [sha256(matrixBytes) === request.bindings.runtimeMatrix.fileSha256, 'runtime matrix file digest'],
    [sha256(matrixBytes) === bundle.runtimeMatrixFileSha256, 'prequalification runtime matrix file binding'],
    [runtimeMatrix.matrixSha256 === request.bindings.runtimeMatrix.matrixSha256, 'runtime matrix digest'],
    [runtimeMatrix.matrixSha256 === bundle.runtimeMatrixSha256, 'prequalification runtime matrix binding'],
    [profile.id === bundle.runtimeProfileId, 'prequalification runtime profile binding'],
    [profile.benchmarkImage.digest === bundle.benchmarkImageDigest, 'prequalification image binding'],
  ];
  for (const [valid, label] of checks) if (!valid) throw new Error(`${label} is invalid or stale`);

  const sourceClosure = await verifyFileClosure(
    request.bindings.evaluator.sourceRoot,
    request.bindings.evaluator.sourceClosure,
    'evaluator source closure',
  );
  if (!sourceClosure.entries.some((entry) => entry.sha256 === contract.oracle.sourceSha256)) {
    throw new Error('evaluator source closure does not contain the bound oracle source');
  }
  for (const role of ['base', 'expected']) {
    const roleRequest = request.roles[role];
    const revision = candidate[role];
    if (roleRequest.revision.commit !== revision.commit || roleRequest.revision.tree !== revision.tree) {
      throw new Error(`${role} workspace revision differs from the candidate`);
    }
    if (sha256(await readFile(roleRequest.snapshotPackPath)) !== roleRequest.snapshotPackFileSha256) {
      throw new Error(`${role} source snapshot pack differs from the sealed request`);
    }
    await assertRoleMountIsolation(request.roles, role);
    await verifyGitRevision(roleRequest.workspace, revision, role);
    await verifySourceEvidence(environmentSpec, roleRequest.workspace);
  }
  await verifyRunnerCommit(request.runnerRepository);
  return {
    ...request,
    candidate,
    candidateFileSha256: sha256(candidateBytes),
    candidateSha256,
    bundle,
    bundleFileSha256: sha256(bundleBytes),
    contract,
    contractFileSha256: sha256(contractBytes),
    environmentSpec,
    environmentSpecFileSha256: sha256(environmentBytes),
    environmentSubstanceSha256,
    runtimeMatrix,
    runtimeMatrixFileSha256: sha256(matrixBytes),
    profile,
    sourceClosure,
    qualificationInput: {
      requestFileSha256,
      requestSha256: request.requestSha256,
      manifestFileSha256: sha256(manifestBytes),
      manifestSha256: manifest.manifestSha256,
    },
    qualificationInputManifestBytes: manifestBytes,
  };
}

function assertInputManifest(manifest, request) {
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
  const { manifestSha256: _ignored, ...body } = manifest;
  if (
    manifest.schemaVersion !== 'decantr-benchmark-qualification-input-manifest.v1' ||
    manifest.program !== PROGRAM ||
    manifest.taskId !== request.taskId ||
    manifest.partition !== request.partition ||
    !Number.isFinite(Date.parse(manifest.createdAt ?? '')) ||
    !SHA256.test(manifest.environmentSubstanceSha256 ?? '') ||
    !Array.isArray(manifest.files) ||
    manifest.files.length === 0 ||
    manifest.manifestSha256 !== sha256Canonical(body)
  ) {
    throw new Error('qualification input manifest is invalid');
  }
}

async function verifyInputManifestFiles(inputRoot, manifest) {
  const expected = new Map();
  for (const entry of manifest.files) {
    assertExactKeys(entry, ['path', 'sha256', 'bytes'], 'qualification input manifest file');
    assertSafeRelative(entry.path, 'qualification input manifest file path');
    if (
      ['manifest.json', 'request.json'].includes(entry.path) ||
      expected.has(entry.path) ||
      !SHA256.test(entry.sha256 ?? '') ||
      !Number.isSafeInteger(entry.bytes) ||
      entry.bytes < 0
    ) {
      throw new Error(`qualification input manifest file binding is invalid: ${entry.path}`);
    }
    const bytes = await readFile(containedPath(inputRoot, entry.path, 'qualification input manifest file'));
    if (bytes.byteLength !== entry.bytes || sha256(bytes) !== entry.sha256) {
      throw new Error(`qualification input file differs from its manifest: ${entry.path}`);
    }
    expected.set(entry.path, entry);
  }

  const actual = [];
  await walkFiles(inputRoot, inputRoot, actual, { rejectSymlinks: true });
  const actualPaths = actual.map((entry) => entry.path).sort();
  const expectedPaths = [...expected.keys(), 'manifest.json', 'request.json'].sort();
  if (canonicalJson(actualPaths) !== canonicalJson(expectedPaths)) {
    throw new Error('qualification input artifact contains missing or unsealed files');
  }
}

async function retainQualificationInputEvidence(request, options) {
  const root = resolve(options.artifactRoot, 'qualification-input');
  await mkdir(root, { recursive: true, mode: 0o700 });
  const requestBytes = Buffer.from(prettyCanonicalJson(options.request));
  if (sha256(requestBytes) !== request.qualificationInput.requestFileSha256) {
    throw new Error('retained qualification request differs from the verified input');
  }
  if (
    sha256(request.qualificationInputManifestBytes) !== request.qualificationInput.manifestFileSha256
  ) {
    throw new Error('retained qualification manifest differs from the verified input');
  }
  await Promise.all([
    writeFile(join(root, 'request.json'), requestBytes, { mode: 0o600 }),
    writeFile(join(root, 'manifest.json'), request.qualificationInputManifestBytes, { mode: 0o600 }),
  ]);
}

function assertPrequalificationSeal(bundle, candidate) {
  assertExactKeys(
    bundle,
    [
      'schemaVersion',
      'program',
      'taskId',
      'partition',
      'candidateSetSha256',
      'candidateSha256',
      'corpusSha256',
      'evaluatorSpecSha256',
      'oracleSourceSha256',
      'evaluatorContractSha256',
      'qualificationControllerSha256',
      'environmentSpecSha256',
      'environmentSubstanceSha256',
      'runtimeMatrixFileSha256',
      'runtimeMatrixSha256',
      'runtimeProfileId',
      'benchmarkImageDigest',
      'revisions',
      'sealedAt',
      'bundleSha256',
    ],
    'prequalification seal',
  );
  assertExactKeys(bundle.revisions, ['base', 'expected'], 'prequalification revisions');
  for (const role of ['base', 'expected']) {
    assertExactKeys(bundle.revisions[role], ['commit', 'tree'], `${role} prequalification revision`);
    if (
      bundle.revisions[role].commit !== candidate[role].commit ||
      bundle.revisions[role].tree !== candidate[role].tree
    ) {
      throw new Error(`${role} prequalification revision differs from the candidate`);
    }
  }
  if (
    bundle.schemaVersion !== 'decantr-benchmark-prequalification-task.v2' ||
    bundle.program !== PROGRAM ||
    !Number.isFinite(Date.parse(bundle.sealedAt ?? ''))
  ) {
    throw new Error('prequalification seal identity is invalid');
  }
}

async function prepareRole(context) {
  const { request, role, evidenceRoot } = context;
  const roleRequest = request.roles[role];
  const workspaceBeforeSha256 = await hashFilesystem(roleRequest.workspace);
  const steps = [];
  for (const command of request.environmentSpec.preparation) {
    steps.push(await runPreparationCommand({ ...context, command }));
  }
  await verifyGitRevision(roleRequest.workspace, roleRequest.revision, role);
  await verifyLockfiles(request.environmentSpec, roleRequest.workspace);
  const workspacePreparedSha256 = await hashFilesystem(roleRequest.workspace);
  const record = {
    workspaceBeforeSha256,
    workspacePreparedSha256,
    networkPolicy: 'isolated-forward-proxy',
    directTaskEgress: false,
    steps,
  };
  await writeCanonicalFile(join(evidenceRoot, `${role}.preparation.json`), record);
  return record;
}

async function runPreparationCommand(context) {
  const { runner, request, role, names, proxy, evidenceRoot, cleanup, command } = context;
  const roleRequest = request.roles[role];
  const containerName = `${names[role]}-prepare-${slug(command.id)}`;
  const network = command.network === 'dependency-registry' ? proxy.networkName : 'none';
  const args = hardeningArgs(containerName, network, request.profile.benchmarkImage.digest, true);
  args.push('--mount', bindMount(roleRequest.workspace, '/work/source', false));
  args.push('--workdir', containerWorkspacePath(command.cwd));
  args.push(
    '--tmpfs',
    '/home/benchmark-empty:rw,nosuid,nodev,noexec,size=256m,mode=0700,uid=10001,gid=10001',
    '--tmpfs',
    '/tmp:rw,nosuid,nodev,noexec,size=256m,mode=1777',
  );
  if (command.network === 'dependency-registry') {
    for (const [key, value] of Object.entries(proxyEnvironment())) args.push('--env', `${key}=${value}`);
  }
  for (const [key, value] of Object.entries(command.environment ?? {})) {
    if (isForbiddenEvaluatorEnvironmentKey(key)) throw new Error(`forbidden preparation environment override: ${key}`);
    args.push('--env', `${key}=${value}`);
  }
  args.push('--entrypoint', command.executable, request.profile.benchmarkImage.digest, ...command.args);
  const containerId = (await runOrThrow(runner, 'docker', ['create', ...args], `create ${role} preparation container`)).stdout.trim();
  cleanup.containers.add(containerId);
  const inspect = await inspectContainer(runner, containerId);
  verifyPreparationInspect(inspect.value, {
    imageDigest: request.profile.benchmarkImage.digest,
    network,
    workspace: roleRequest.workspace,
    siblingWorkspace: request.roles[otherRole(role)].workspace,
  });
  const inspectEvidence = await persistEvidence(
    evidenceRoot,
    `${role}.prepare.${slug(command.id)}.inspect.json`,
    inspect.raw,
  );
  const startedAt = new Date().toISOString();
  await runOrThrow(runner, 'docker', ['start', containerId], `start ${role} preparation container`);
  const wait = await runOrThrow(runner, 'docker', ['wait', containerId], `wait for ${role} preparation container`);
  const logs = await runner.run('docker', ['logs', containerId]);
  const logsEvidence = await persistEvidence(
    evidenceRoot,
    `${role}.prepare.${slug(command.id)}.log.txt`,
    Buffer.from(`${logs.stdout}${logs.stderr}`, 'utf8'),
    false,
  );
  const exitCode = Number.parseInt(wait.stdout.trim(), 10);
  if (exitCode !== 0) throw new Error(`${role} preparation command ${command.id} exited ${exitCode}`);
  await stopAndRemoveContainer(runner, containerId, cleanup);
  return {
    id: command.id,
    commandSha256: sha256Canonical(command),
    network: command.network === 'dependency-registry' ? 'isolated-forward-proxy' : 'none',
    imageDigest: request.profile.benchmarkImage.digest,
    inspectEvidence,
    logsEvidence,
    startedAt,
    endedAt: new Date().toISOString(),
    exitCode,
  };
}

async function evaluateRole(context) {
  const { runner, request, role, names, executionId, evidenceRoot, cleanup } = context;
  const roleRequest = request.roles[role];
  const siblingWorkspace = request.roles[otherRole(role)].workspace;
  const workspaceBeforeSha256 = await hashFilesystem(roleRequest.workspace);
  const roleEvidenceRoot = resolve(evidenceRoot, role);
  const outputRoot = resolve(roleEvidenceRoot, 'output');
  const controlRoot = resolve(roleEvidenceRoot, 'control');
  await Promise.all([
    mkdir(outputRoot, { recursive: true, mode: 0o700 }),
    mkdir(controlRoot, { recursive: true, mode: 0o700 }),
  ]);
  const gatePath = join(controlRoot, 'release');
  const resultPath = join(outputRoot, 'result.json');
  const canaryPath = join(outputRoot, 'network-canary.json');
  await rm(gatePath, { force: true });

  const containerName = `${names[role]}-evaluate`;
  const args = hardeningArgs(containerName, 'none', request.profile.benchmarkImage.digest, true);
  args.push('--mount', bindMount(roleRequest.workspace, '/work/source', true));
  args.push('--mount', bindMount(request.bindings.evaluator.sourceRoot, '/evaluator', true));
  args.push('--mount', bindMount(request.bindings.evaluator.contractPath, '/evidence/contract.json', true));
  args.push('--mount', bindMount(outputRoot, '/evidence/output', false));
  args.push('--mount', bindMount(controlRoot, '/evidence/control', false));
  args.push(
    '--tmpfs',
    '/home/benchmark-empty:rw,nosuid,nodev,noexec,size=64m,mode=0700,uid=10001,gid=10001',
    '--tmpfs',
    '/tmp:rw,nosuid,nodev,noexec,size=256m,mode=1777',
    request.profile.benchmarkImage.digest,
    '/usr/local/bin/node',
    '/opt/decantr-benchmark/evaluators/container-orchestrator.mjs',
    'role-execute',
    '--role',
    role,
    '--gate',
    '/evidence/control/release',
    '--contract',
    '/evidence/contract.json',
    '--workspace',
    '/work/source',
    '--evaluator-root',
    '/evaluator',
    '--project-path',
    request.bindings.evaluator.projectPath,
    '--run-id',
    `qualification-${executionId}-${role}`,
    '--task-id',
    request.taskId,
    '--contract-id',
    request.bindings.evaluator.contractId,
    '--expected-contract-sha256',
    request.contractFileSha256,
    '--out',
    '/evidence/output/result.json',
    '--canary-out',
    '/evidence/output/network-canary.json',
  );
  const containerId = (await runOrThrow(runner, 'docker', ['create', ...args], `create ${role} evaluation container`)).stdout.trim();
  cleanup.containers.add(containerId);
  await runOrThrow(runner, 'docker', ['start', containerId], `start ${role} evaluation container`);
  const inspect = await verifyRunningEvaluationContainer(runner, containerId, {
    imageDigest: request.profile.benchmarkImage.digest,
    workspace: roleRequest.workspace,
    siblingWorkspace,
    evaluatorRoot: request.bindings.evaluator.sourceRoot,
    contractPath: request.bindings.evaluator.contractPath,
    outputRoot,
    controlRoot,
  });
  const inspectEvidence = await persistEvidence(evidenceRoot, `${role}.evaluate.inspect.json`, inspect.raw);
  await writeFile(gatePath, 'host-inspection-passed\n', { encoding: 'utf8', mode: 0o600 });
  const wait = await runOrThrow(runner, 'docker', ['wait', containerId], `wait for ${role} evaluation container`);
  const logs = await runner.run('docker', ['logs', containerId]);
  const logsEvidence = await persistEvidence(
    evidenceRoot,
    `${role}.evaluate.log.txt`,
    Buffer.from(`${logs.stdout}${logs.stderr}`, 'utf8'),
    false,
  );
  const exitCode = Number.parseInt(wait.stdout.trim(), 10);
  if (exitCode !== 0) throw new Error(`${role} evaluator container exited ${exitCode}`);
  const resultBytes = await readFile(resultPath);
  const result = JSON.parse(resultBytes);
  const canaryBytes = await readFile(canaryPath);
  const canary = JSON.parse(canaryBytes);
  if (canary.status !== 'blocked' || canary.dnsBlocked !== true || canary.tcpBlocked !== true) {
    throw new Error(`${role} no-network canary did not prove blocked egress`);
  }
  const workspaceAfterSha256 = await hashFilesystem(roleRequest.workspace);
  if (workspaceAfterSha256 !== workspaceBeforeSha256) {
    throw new Error(`${role} workspace changed while mounted read-only`);
  }
  await stopAndRemoveContainer(runner, containerId, cleanup);
  return {
    imageDigest: request.profile.benchmarkImage.digest,
    networkMode: 'none',
    hostInspectedWhileRunning: true,
    readOnlyRoot: true,
    workspaceReadOnly: true,
    siblingWorkspaceVisible: false,
    networkCanary: 'blocked',
    workspaceBeforeSha256,
    workspaceAfterSha256,
    inspectEvidence,
    logsEvidence,
    canaryEvidence: {
      logicalPath: relative(optionsArtifactRoot(evidenceRoot), canaryPath).replaceAll('\\', '/'),
      fileSha256: sha256(canaryBytes),
      canonicalSha256: sha256Canonical(canary),
    },
    result: {
      logicalPath: relative(optionsArtifactRoot(evidenceRoot), resultPath).replaceAll('\\', '/'),
      fileSha256: sha256(resultBytes),
      canonicalSha256: sha256Canonical(result),
      status: result.status,
    },
  };
}

async function startDependencyProxy(context) {
  const { runner, request, names, allowlist, evidenceRoot, cleanup } = context;
  await ensureImage(runner, request.dependencyProxy.image, request.dependencyProxy.imageArchivePath);
  const networkName = names.network;
  await runOrThrow(runner, 'docker', ['network', 'create', '--internal', networkName], 'create internal dependency network');
  cleanup.networks.add(networkName);
  const proxyRoot = resolve(evidenceRoot, 'proxy');
  await mkdir(proxyRoot, { recursive: true, mode: 0o700 });
  const configPath = join(proxyRoot, 'squid.conf');
  const config = squidConfiguration(allowlist.hosts);
  await writeFile(configPath, config, { encoding: 'utf8', mode: 0o600 });
  const networkInspect = await inspectNetwork(runner, networkName);
  if (networkInspect.value.Name !== networkName || networkInspect.value.Internal !== true) {
    throw new Error('dependency network is not an internal Docker network');
  }
  const networkInspectEvidence = await persistEvidence(evidenceRoot, 'proxy-network.inspect.json', networkInspect.raw);
  const args = [
    '--name',
    names.proxy,
    '--network',
    networkName,
    '--network-alias',
    'dependency-proxy',
    '--read-only',
    '--cap-drop',
    'ALL',
    '--security-opt',
    'no-new-privileges',
    '--mount',
    bindMount(configPath, '/etc/squid/squid.conf', true),
    '--tmpfs',
    '/var/log/squid:rw,nosuid,nodev,noexec,size=64m',
    '--tmpfs',
    '/var/run:rw,nosuid,nodev,noexec,size=16m',
    '--tmpfs',
    '/var/spool/squid:rw,nosuid,nodev,noexec,size=64m',
    '--entrypoint',
    'squid',
    request.dependencyProxy.image.digest,
    '-N',
    '-f',
    '/etc/squid/squid.conf',
  ];
  const containerId = (await runOrThrow(runner, 'docker', ['create', ...args], 'create dependency proxy')).stdout.trim();
  cleanup.containers.add(containerId);
  await runOrThrow(runner, 'docker', ['network', 'connect', 'bridge', containerId], 'attach proxy egress network');
  await runOrThrow(runner, 'docker', ['start', containerId], 'start dependency proxy');
  const inspect = await inspectContainer(runner, containerId);
  verifyProxyInspect(inspect.value, {
    imageDigest: request.dependencyProxy.image.digest,
    internalNetwork: networkName,
    configPath,
  });
  const inspectEvidence = await persistEvidence(evidenceRoot, 'proxy.inspect.json', inspect.raw);
  return {
    containerId,
    networkName,
    image: structuredClone(request.dependencyProxy.image),
    configSha256: sha256(config),
    allowlist,
    inspectEvidence,
    networkInspectEvidence,
  };
}

async function captureControllerClosure(context) {
  const { runner, imageDigest, evidenceRoot, containerName, cleanup } = context;
  const created = await runOrThrow(
    runner,
    'docker',
    ['create', '--name', containerName, '--network', 'none', '--read-only', imageDigest],
    'create controller evidence container',
  );
  const containerId = created.stdout.trim();
  cleanup.containers.add(containerId);
  const root = resolve(evidenceRoot, 'controller-closure');
  await mkdir(root, { recursive: true, mode: 0o700 });
  const entries = [];
  for (const path of CONTROLLER_CLOSURE) {
    const outputPath = resolve(root, path);
    await mkdir(resolve(outputPath, '..'), { recursive: true, mode: 0o700 });
    await runOrThrow(
      runner,
      'docker',
      ['cp', `${containerId}:/opt/decantr-benchmark/${path}`, outputPath],
      `copy controller closure ${path}`,
    );
    const bytes = await readFile(outputPath);
    entries.push({ path, sha256: sha256(bytes), bytes: bytes.byteLength });
  }
  await stopAndRemoveContainer(runner, containerId, cleanup);
  entries.sort((left, right) => left.path.localeCompare(right.path));
  return { closureSha256: sha256Canonical(entries), entries };
}

export function verifyEvaluationInspect(value, expected) {
  verifyCommonInspect(value, expected.imageDigest, 'none');
  if (value.State?.Running !== true) throw new Error('evaluation container was not running during host inspection');
  if (value.HostConfig?.ReadonlyRootfs !== true) throw new Error('evaluation container root filesystem is writable');
  const mounts = normalizeInspectMounts(value.Mounts);
  requireMount(mounts, expected.workspace, '/work/source', false);
  requireMount(mounts, expected.evaluatorRoot, '/evaluator', false);
  requireMount(mounts, expected.contractPath, '/evidence/contract.json', false);
  requireMount(mounts, expected.outputRoot, '/evidence/output', true);
  requireMount(mounts, expected.controlRoot, '/evidence/control', true);
  rejectSiblingMount(mounts, expected.siblingWorkspace);
  const writableDestinations = new Set(['/evidence/output', '/evidence/control']);
  for (const mount of mounts) {
    if (mount.rw && !writableDestinations.has(mount.destination)) {
      throw new Error(`unexpected writable evaluation mount: ${mount.destination}`);
    }
  }
  return true;
}

export async function verifyRunningEvaluationContainer(commandRunner, containerId, expected) {
  const inspect = await inspectContainer(commandRunner, containerId);
  verifyEvaluationInspect(inspect.value, expected);
  return inspect;
}

function verifyPreparationInspect(value, expected) {
  verifyCommonInspect(value, expected.imageDigest, expected.network);
  if (value.HostConfig?.ReadonlyRootfs !== true) throw new Error('preparation container root filesystem is writable');
  const mounts = normalizeInspectMounts(value.Mounts);
  requireMount(mounts, expected.workspace, '/work/source', true);
  rejectSiblingMount(mounts, expected.siblingWorkspace);
}

function verifyProxyInspect(value, expected) {
  if (
    value.Image !== expected.imageDigest ||
    value.Config?.Image !== expected.imageDigest ||
    value.State?.Running !== true ||
    value.HostConfig?.ReadonlyRootfs !== true
  ) {
    throw new Error('dependency proxy image or running state is invalid');
  }
  const networks = Object.keys(value.NetworkSettings?.Networks ?? {}).sort();
  if (networks.length !== 2 || !networks.includes('bridge') || !networks.includes(expected.internalNetwork)) {
    throw new Error('dependency proxy must be the sole bridge between internal preparation and egress');
  }
  const mounts = normalizeInspectMounts(value.Mounts);
  requireMount(mounts, expected.configPath, '/etc/squid/squid.conf', false);
}

function verifyCommonInspect(value, imageDigest, networkMode) {
  if (value.Image !== imageDigest || value.Config?.Image !== imageDigest) {
    throw new Error(`container image differs from locked digest ${imageDigest}`);
  }
  if (value.HostConfig?.NetworkMode !== networkMode) {
    throw new Error(`container network mode must be ${networkMode}`);
  }
  if (!value.HostConfig?.CapDrop?.map((item) => item.toUpperCase()).includes('ALL')) {
    throw new Error('container must drop all Linux capabilities');
  }
  if (!value.HostConfig?.SecurityOpt?.includes('no-new-privileges')) {
    throw new Error('container must enable no-new-privileges');
  }
}

async function inspectImage(runner, digest, profile) {
  const result = await runOrThrow(runner, 'docker', ['image', 'inspect', digest], 'inspect benchmark image');
  const parsed = JSON.parse(result.stdout);
  const value = parsed[0];
  if (
    value?.Id !== digest ||
    value?.Os !== 'linux' ||
    value?.Architecture !== 'amd64' ||
    profile.os !== 'linux' ||
    profile.arch !== 'x64'
  ) {
    throw new Error('benchmark image inspect evidence differs from the locked Linux x64 profile');
  }
  return { raw: Buffer.from(result.stdout), value };
}

async function inspectContainer(runner, containerId) {
  const result = await runOrThrow(runner, 'docker', ['inspect', containerId], 'inspect container');
  const parsed = JSON.parse(result.stdout);
  if (!Array.isArray(parsed) || parsed.length !== 1) throw new Error('docker inspect returned unexpected evidence');
  return { raw: Buffer.from(result.stdout), value: parsed[0] };
}

async function inspectNetwork(runner, networkName) {
  const result = await runOrThrow(runner, 'docker', ['network', 'inspect', networkName], 'inspect dependency network');
  const parsed = JSON.parse(result.stdout);
  if (!Array.isArray(parsed) || parsed.length !== 1) throw new Error('docker network inspect returned unexpected evidence');
  return { raw: Buffer.from(result.stdout), value: parsed[0] };
}

async function ensureImage(runner, image, archivePath) {
  if (!IMAGE_DIGEST.test(image.digest) || typeof image.reference !== 'string' || image.reference.length < 3) {
    throw new Error('container image requires an exact reference and sha256 digest');
  }
  let inspected = await runner.run('docker', ['image', 'inspect', image.digest]);
  if (inspected.exitCode === 0) return;
  if (archivePath) {
    await runOrThrow(runner, 'docker', ['load', '--input', archivePath], `load ${image.reference}`);
  } else if (image.reference.includes('/')) {
    const pullReference = resolveImagePullReference(image);
    await runOrThrow(runner, 'docker', ['pull', pullReference], `pull ${image.reference}`);
  } else {
    throw new Error(`${image.reference}: exact image is unavailable and no OCI archive was supplied`);
  }
  inspected = await runner.run('docker', ['image', 'inspect', image.digest]);
  if (inspected.exitCode !== 0) throw new Error(`${image.reference}: loaded image does not expose ${image.digest}`);
}

export function resolveImagePullReference(image) {
  if (!IMAGE_DIGEST.test(image?.digest ?? '') || typeof image?.reference !== 'string') {
    throw new Error('container image requires an exact reference and sha256 digest');
  }
  if (!image.reference.includes('@')) return `${image.reference}@${image.digest}`;
  const parts = image.reference.split('@');
  if (parts.length !== 2 || parts[0].length < 3 || !IMAGE_DIGEST.test(parts[1])) {
    throw new Error('immutable container image reference is invalid');
  }
  return image.reference;
}

function hardeningArgs(name, network, imageDigest, readOnly) {
  const args = [
    '--name',
    name,
    '--network',
    network,
    '--cap-drop',
    'ALL',
    '--security-opt',
    'no-new-privileges',
    '--pids-limit',
    '512',
    '--user',
    '10001:10001',
    '--env',
    `DECANTR_BENCHMARK_IMAGE_DIGEST=${imageDigest}`,
    '--env',
    `DECANTR_BENCHMARK_NETWORK_MODE=${network}`,
  ];
  if (readOnly) args.push('--read-only');
  return args;
}

function buildExecutionAttestation(context) {
  const { request, roles, proxy } = context;
  return {
    schemaVersion: ATTESTATION_VERSION,
    program: PROGRAM,
    executionId: context.executionId,
    taskId: request.taskId,
    partition: request.partition,
    status: 'completed',
    executionIdentity: context.executionIdentity,
    runnerRepositoryCommit: context.runnerCommit,
    startedAt: context.startedAt,
    endedAt: context.endedAt,
    bindings: {
      qualificationInput: request.qualificationInput,
      candidate: {
        canonicalSha256: request.candidateSha256,
        fileSha256: request.candidateFileSha256,
      },
      prequalificationBundle: {
        bundleSha256: request.bundle.bundleSha256,
        fileSha256: request.bundleFileSha256,
      },
      evaluator: {
        contractFileSha256: request.contractFileSha256,
        oracleSourceSha256: request.contract.oracle.sourceSha256,
        sourceClosureSha256: request.sourceClosure.closureSha256,
        sourceClosure: request.sourceClosure.entries,
      },
      controller: context.controller,
      sourceSnapshots: {
        base: sourceSnapshotBinding(request.roles.base),
        expected: sourceSnapshotBinding(request.roles.expected),
      },
      environment: {
        specFileSha256: request.environmentSpecFileSha256,
        substanceSha256: request.environmentSubstanceSha256,
      },
      runtimeMatrix: {
        fileSha256: request.runtimeMatrixFileSha256,
        matrixSha256: request.runtimeMatrix.matrixSha256,
      },
      runtimeProfile: {
        id: request.profile.id,
        profileSha256: request.profile.profileSha256,
      },
      benchmarkImage: {
        reference: request.profile.benchmarkImage.reference,
        digest: request.profile.benchmarkImage.digest,
        inspectEvidence: context.imageEvidence,
      },
    },
    preparation: {
      networkPolicy: 'isolated-forward-proxy',
      directTaskEgress: false,
      proxy: {
        image: proxy.image,
        configSha256: proxy.configSha256,
        fixedHosts: proxy.allowlist.fixed,
        lockfileHosts: proxy.allowlist.derived,
        allowedHosts: proxy.allowlist.hosts,
        lockfiles: proxy.allowlist.lockfiles,
        inspectEvidence: proxy.inspectEvidence,
        networkInspectEvidence: proxy.networkInspectEvidence,
      },
      roles: {
        base: preparationRecord(roles.base),
        expected: preparationRecord(roles.expected),
      },
    },
    evaluation: {
      networkMode: 'none',
      hostInspected: true,
      roles: {
        base: roles.base.evaluation,
        expected: roles.expected.evaluation,
      },
    },
  };
}

async function runRoleExecute(argv) {
  const options = parseRoleArgs(argv);
  await waitForGate(options.gatePath);
  const canary = await runNoNetworkCanary();
  if (canary.status !== 'blocked') throw new Error('network canary detected evaluation egress');
  await writeCanonicalFile(options.canaryPath, canary);
  const result = await executeEvaluator({
    contractPath: options.contractPath,
    expectedContractSha256: options.expectedContractSha256,
    workspace: options.workspace,
    evaluatorRoot: options.evaluatorRoot,
    evaluatorRuntimeRoot: '/opt/decantr-benchmark/evaluator-runtime',
    evaluatorBrowsersPath: '/opt/decantr-benchmark/evaluator-runtime/browsers',
    home: `/tmp/decantr-${options.role}-home`,
    projectPath: options.projectPath,
    taskPath: process.env.PATH,
    runId: options.runId,
    taskId: options.taskId,
    contractId: options.contractId,
  });
  await writeCanonicalFile(options.outputPath, result);
  process.stdout.write(`${prettyCanonicalJson({ schemaVersion: ROLE_RESULT_VERSION, role: options.role, status: result.status })}`);
}

async function runNoNetworkCanary() {
  const { lookup } = await import('node:dns/promises');
  const { connect } = await import('node:net');
  let dnsBlocked = false;
  try {
    await lookup('registry.npmjs.org');
  } catch {
    dnsBlocked = true;
  }
  const tcpBlocked = await new Promise((resolvePromise) => {
    const socket = connect({ host: '1.1.1.1', port: 443 });
    const finish = (blocked) => {
      socket.destroy();
      resolvePromise(blocked);
    };
    socket.setTimeout(750, () => finish(true));
    socket.once('connect', () => finish(false));
    socket.once('error', () => finish(true));
  });
  return {
    schemaVersion: 'decantr-benchmark-network-canary.v1',
    dnsBlocked,
    tcpBlocked,
    status: dnsBlocked && tcpBlocked ? 'blocked' : 'reachable',
  };
}

async function waitForGate(path) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      await access(path, constants.R_OK);
      return;
    } catch {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 50));
    }
  }
  throw new Error('host inspection gate was not released');
}

function assertRequest(request) {
  assertExactKeys(
    request,
      [
        'requestSha256',
        'schemaVersion',
      'program',
      'taskId',
      'partition',
      'bindings',
      'roles',
      'dependencyProxy',
      'runnerRepository',
      'imageArchivePath',
    ],
    'container qualification request',
  );
  if (
    request.schemaVersion !== REQUEST_VERSION ||
    request.program !== PROGRAM ||
    !TASK_ID.test(request.taskId ?? '') ||
    !['development', 'qualification'].includes(request.partition)
  ) {
    throw new Error('container qualification request identity is invalid');
  }
  assertExactKeys(
    request.bindings,
    ['inputManifest', 'candidate', 'prequalificationBundle', 'evaluator', 'environment', 'runtimeMatrix'],
    'request bindings',
  );
  assertExactKeys(request.bindings.inputManifest, ['path', 'fileSha256', 'manifestSha256'], 'input manifest binding');
  assertExactKeys(request.bindings.candidate, ['path', 'canonicalSha256', 'fileSha256'], 'candidate binding');
  assertExactKeys(request.bindings.prequalificationBundle, ['path', 'fileSha256', 'bundleSha256'], 'prequalification binding');
  assertExactKeys(
    request.bindings.evaluator,
    ['contractPath', 'contractFileSha256', 'contractId', 'sourceRoot', 'sourceClosure', 'projectPath'],
    'evaluator binding',
  );
  assertExactKeys(request.bindings.environment, ['specPath', 'specFileSha256'], 'environment binding');
  assertExactKeys(request.bindings.runtimeMatrix, ['path', 'fileSha256', 'matrixSha256', 'profileId'], 'runtime matrix binding');
  assertExactKeys(request.roles, ['base', 'expected'], 'qualification roles');
  assertExactKeys(request.dependencyProxy, ['image', 'imageArchivePath'], 'dependency proxy');
  assertImage(request.dependencyProxy.image, 'dependency proxy image');
  if (request.dependencyProxy.image.reference !== 'docker.io/ubuntu/squid') {
    throw new Error('dependency proxy must use the reviewed docker.io/ubuntu/squid image by digest');
  }
  assertExactKeys(request.runnerRepository, ['commit'], 'runner repository');
  if (!GIT_SHA.test(request.runnerRepository.commit ?? '')) throw new Error('runner repository commit is invalid');
  for (const digest of [
    request.bindings.candidate.canonicalSha256,
    request.bindings.candidate.fileSha256,
    request.bindings.prequalificationBundle.fileSha256,
    request.bindings.prequalificationBundle.bundleSha256,
    request.bindings.evaluator.contractFileSha256,
    request.bindings.environment.specFileSha256,
    request.bindings.runtimeMatrix.fileSha256,
    request.bindings.runtimeMatrix.matrixSha256,
  ]) {
    if (!SHA256.test(digest ?? '')) throw new Error('request contains an invalid SHA-256 binding');
  }
  if (!Array.isArray(request.bindings.evaluator.sourceClosure) || request.bindings.evaluator.sourceClosure.length === 0) {
    throw new Error('evaluator source closure is missing');
  }
  for (const entry of request.bindings.evaluator.sourceClosure) {
    assertExactKeys(entry, ['path', 'sha256'], 'evaluator closure entry');
    assertSafeRelative(entry.path, 'evaluator closure path');
    if (!SHA256.test(entry.sha256 ?? '')) throw new Error('evaluator closure digest is invalid');
  }
  for (const role of ['base', 'expected']) {
    const item = request.roles[role];
    assertExactKeys(
      item,
      ['snapshotPackPath', 'snapshotPackFileSha256', 'revision'],
      `${role} role`,
    );
    assertExactKeys(item.revision, ['commit', 'tree'], `${role} revision`);
    if (!GIT_SHA.test(item.revision.commit ?? '') || !GIT_SHA.test(item.revision.tree ?? '')) {
      throw new Error(`${role} revision is invalid`);
    }
    if (!SHA256.test(item.snapshotPackFileSha256 ?? '')) {
      throw new Error(`${role} snapshot pack digest is invalid`);
    }
  }
}

function resolveRequestPaths(request, inputRoot, workspaceRoot) {
  const root = resolve(inputRoot);
  request.bindings.inputManifest.path = requestPath(root, request.bindings.inputManifest.path);
  request.bindings.candidate.path = requestPath(root, request.bindings.candidate.path);
  request.bindings.prequalificationBundle.path = requestPath(root, request.bindings.prequalificationBundle.path);
  request.bindings.evaluator.contractPath = requestPath(root, request.bindings.evaluator.contractPath);
  request.bindings.evaluator.sourceRoot = requestPath(root, request.bindings.evaluator.sourceRoot);
  request.bindings.environment.specPath = requestPath(root, request.bindings.environment.specPath);
  request.bindings.runtimeMatrix.path = requestPath(root, request.bindings.runtimeMatrix.path);
  request.roles.base.workspace = resolve(workspaceRoot, 'base');
  request.roles.expected.workspace = resolve(workspaceRoot, 'expected');
  request.roles.base.snapshotPackPath = requestPath(root, request.roles.base.snapshotPackPath);
  request.roles.expected.snapshotPackPath = requestPath(root, request.roles.expected.snapshotPackPath);
  request.imageArchivePath = request.imageArchivePath ? requestPath(root, request.imageArchivePath) : null;
  request.dependencyProxy.imageArchivePath = request.dependencyProxy.imageArchivePath
    ? requestPath(root, request.dependencyProxy.imageArchivePath)
    : null;
}

async function verifyFileClosure(root, expectedEntries, label) {
  const actualEntries = [];
  await walkFiles(root, root, actualEntries, { rejectSymlinks: true });
  actualEntries.sort((left, right) => left.path.localeCompare(right.path));
  const expected = [...expectedEntries].sort((left, right) => left.path.localeCompare(right.path));
  if (canonicalJson(actualEntries.map(({ path, sha256: digest }) => ({ path, sha256: digest }))) !== canonicalJson(expected)) {
    throw new Error(`${label} differs from the complete staged directory`);
  }
  return { closureSha256: sha256Canonical(actualEntries), entries: actualEntries };
}

async function walkFiles(root, directory, output, options = {}) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    const logicalPath = relative(root, path).replaceAll('\\', '/');
    const stat = await lstat(path);
    if (stat.isSymbolicLink()) {
      if (options.rejectSymlinks) throw new Error(`symlink is forbidden in sealed input: ${logicalPath}`);
      const target = await readlink(path);
      const resolvedTarget = await realpath(path);
      const relation = relative(resolve(root), resolvedTarget);
      if (relation.startsWith('..') || isAbsolute(relation)) {
        throw new Error(`workspace symlink escapes the sealed role: ${logicalPath}`);
      }
      output.push({ path: logicalPath, kind: 'symlink', target, sha256: sha256(target), bytes: stat.size });
    } else if (stat.isDirectory()) {
      await walkFiles(root, path, output, options);
    } else if (stat.isFile()) {
      const bytes = await readFile(path);
      output.push({ path: logicalPath, kind: 'file', sha256: sha256(bytes), bytes: bytes.byteLength, mode: stat.mode & 0o777 });
    }
  }
}

async function hashFilesystem(root) {
  const entries = [];
  await walkFiles(root, root, entries, { rejectSymlinks: false });
  entries.sort((left, right) => left.path.localeCompare(right.path));
  return sha256Canonical(entries);
}

async function verifySourceEvidence(spec, workspace) {
  for (const evidence of spec.sourceEvidence) {
    assertSafeRelative(evidence.path, 'source evidence path');
    const bytes = await readFile(containedPath(workspace, evidence.path, 'source evidence'));
    if (sha256(bytes) !== evidence.sha256) throw new Error(`source evidence drifted: ${evidence.path}`);
  }
}

async function verifyLockfiles(spec, workspace) {
  for (const lockfile of spec.lockfiles) {
    const bytes = await readFile(containedPath(workspace, lockfile.path, 'lockfile'));
    if (sha256(bytes) !== lockfile.sha256) throw new Error(`lockfile drifted: ${lockfile.path}`);
  }
}

async function verifyGitRevision(workspace, revision, role) {
  const commit = await gitOutput(workspace, ['rev-parse', 'HEAD']);
  const tree = await gitOutput(workspace, ['rev-parse', 'HEAD^{tree}']);
  if (commit !== revision.commit || tree !== revision.tree) throw new Error(`${role} workspace Git revision drifted`);
  const status = await gitOutput(workspace, ['status', '--porcelain=v1', '--untracked-files=all']);
  if (status !== '') throw new Error(`${role} workspace contains unreviewed tracked or untracked state`);
}

async function gitOutput(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.status !== 0) throw new Error(`git ${args[0]} failed: ${result.stderr ?? ''}`);
  return (result.stdout ?? '').trim();
}

export async function verifyRunnerCommit(binding, expectedRepositoryRoot = repositoryRoot) {
  const runnerPath = binding.path ?? expectedRepositoryRoot;
  if ((await realpath(runnerPath)) !== (await realpath(expectedRepositoryRoot))) {
    throw new Error('runner repository path is not the repository executing the orchestrator');
  }
  const actual = await gitOutput(runnerPath, ['rev-parse', 'HEAD']);
  if (actual !== binding.commit) throw new Error('runner repository commit differs from the request');
  const controllerDiff = await gitOutput(runnerPath, [
    'status',
    '--porcelain=v1',
    '--untracked-files=all',
    '--',
    'scripts/benchmark-3-10',
    '.github/workflows/benchmark-3-10-evaluator-qualification.yml',
    '.github/workflows/benchmark-3-10-qualification-input.yml',
    '.github/workflows/benchmark-3-10-runtime-profiles.yml',
  ]);
  if (controllerDiff !== '') throw new Error('qualification controller tree differs from the bound runner commit');
  return actual;
}

async function assertRoleMountIsolation(roles, role) {
  const workspace = await realpath(roles[role].workspace);
  const sibling = await realpath(roles[otherRole(role)].workspace);
  if (pathsOverlap(workspace, sibling)) throw new Error('base and expected workspaces must be disjoint');
}

function normalizeInspectMounts(mounts) {
  if (!Array.isArray(mounts)) throw new Error('container inspect mounts are missing');
  return mounts.map((mount) => ({
    source: resolve(mount.Source),
    destination: mount.Destination,
    rw: mount.RW === true,
  }));
}

function requireMount(mounts, source, destination, writable) {
  const expectedSource = resolve(source);
  const found = mounts.find((mount) => mount.source === expectedSource && mount.destination === destination);
  if (!found || found.rw !== writable) {
    throw new Error(`required ${writable ? 'writable' : 'read-only'} mount is absent: ${destination}`);
  }
}

function rejectSiblingMount(mounts, siblingWorkspace) {
  const sibling = resolve(siblingWorkspace);
  if (mounts.some((mount) => pathsOverlap(mount.source, sibling))) {
    throw new Error('evaluation container can see its sibling workspace');
  }
}

function bindMount(source, destination, readonly) {
  if (String(source).includes(',') || String(destination).includes(',') || /[\r\n]/u.test(`${source}${destination}`)) {
    throw new Error('Docker bind mount paths cannot contain commas or newlines');
  }
  const parts = ['type=bind', `src=${resolve(source)}`, `dst=${destination}`];
  if (readonly) parts.push('readonly');
  return parts.join(',');
}

function containerWorkspacePath(cwd) {
  assertSafeRelative(cwd, 'preparation cwd');
  return cwd === '.' ? '/work/source' : `/work/source/${cwd}`;
}

function assertSafeRelative(value, label) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    isAbsolute(value) ||
    value.split(/[\\/]/u).some((part) => part === '..' || part === '')
  ) {
    throw new Error(`${label} must be a contained relative path`);
  }
}

function containedPath(root, path, label) {
  assertSafeRelative(path, label);
  const output = resolve(root, path);
  const relation = relative(resolve(root), output);
  if (relation.startsWith('..') || isAbsolute(relation)) throw new Error(`${label} escapes its root`);
  return output;
}

function requestPath(root, value) {
  if (typeof value !== 'string' || value.length === 0) throw new Error('request path is missing');
  const output = isAbsolute(value) ? resolve(value) : resolve(root, value);
  const relation = relative(root, output);
  if (relation.startsWith('..') || isAbsolute(relation)) throw new Error(`request path escapes input root: ${value}`);
  return output;
}

function pathsOverlap(left, right) {
  const relation = relative(resolve(left), resolve(right));
  const reverse = relative(resolve(right), resolve(left));
  return relation === '' || (!relation.startsWith('..') && !isAbsolute(relation)) || (!reverse.startsWith('..') && !isAbsolute(reverse));
}

function proxyEnvironment() {
  return {
    HTTP_PROXY: 'http://dependency-proxy:3128',
    HTTPS_PROXY: 'http://dependency-proxy:3128',
    NO_PROXY: 'localhost,127.0.0.1,::1',
    http_proxy: 'http://dependency-proxy:3128',
    https_proxy: 'http://dependency-proxy:3128',
    no_proxy: 'localhost,127.0.0.1,::1',
  };
}

function squidConfiguration(hosts) {
  return [
    'http_port 3128',
    'acl CONNECT method CONNECT',
    'acl allowed_ports port 443',
    'acl forbidden_destination dst 0.0.0.0/8 10.0.0.0/8 100.64.0.0/10 127.0.0.0/8 169.254.0.0/16 172.16.0.0/12 192.0.0.0/24 192.168.0.0/16 198.18.0.0/15 224.0.0.0/4 240.0.0.0/4 ::1/128 fc00::/7 fe80::/10',
    `acl reviewed_dependencies dstdomain ${hosts.join(' ')}`,
    'http_access deny !allowed_ports',
    'http_access deny forbidden_destination',
    'http_access allow reviewed_dependencies',
    'http_access deny all',
    'cache deny all',
    'access_log stdio:/var/log/squid/access.log',
    'cache_log /var/log/squid/cache.log',
    'coredump_dir /var/spool/squid',
    '',
  ].join('\n');
}

function executionIdentity(environment) {
  const github = typeof environment.GITHUB_ACTIONS === 'string' && environment.GITHUB_ACTIONS === 'true';
  if (!github) {
    return {
      provider: 'local',
      repository: 'local',
      workflowRef: 'local',
      runId: 'local',
      runAttempt: '1',
      actor: 'local',
      ref: 'local',
    };
  }
  const values = {
    provider: 'github-actions',
    repository: environment.GITHUB_REPOSITORY,
    workflowRef: environment.GITHUB_WORKFLOW_REF,
    runId: environment.GITHUB_RUN_ID,
    runAttempt: environment.GITHUB_RUN_ATTEMPT,
    actor: environment.GITHUB_ACTOR,
    ref: environment.GITHUB_REF,
  };
  if (Object.values(values).some((value) => typeof value !== 'string' || value.length === 0)) {
    throw new Error('GitHub Actions execution identity is incomplete');
  }
  return values;
}

function calculateBundleDigest(bundle) {
  const { bundleSha256: _ignored, ...body } = bundle;
  return sha256Canonical(body);
}

function preparationRecord(record) {
  return {
    workspaceBeforeSha256: record.workspaceBeforeSha256,
    workspacePreparedSha256: record.workspacePreparedSha256,
    networkPolicy: record.networkPolicy,
    directTaskEgress: record.directTaskEgress,
    steps: record.steps,
  };
}

function sourceSnapshotBinding(role) {
  return {
    revision: structuredClone(role.revision),
    packFileSha256: role.snapshotPackFileSha256,
  };
}

function assertDigestTree(bindings, label) {
  const visit = (value, path) => {
    if (Array.isArray(value)) return value.forEach((item, index) => visit(item, `${path}[${index}]`));
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (/Sha256$/u.test(key) && !SHA256.test(child ?? '')) throw new Error(`${path}.${key} is invalid`);
      if (key === 'digest' && path.endsWith('benchmarkImage') && !IMAGE_DIGEST.test(child ?? '')) {
        throw new Error(`${path}.${key} is invalid`);
      }
      visit(child, `${path}.${key}`);
    }
  };
  visit(bindings, label);
}

function assertExecutionIdentity(identity) {
  assertExactKeys(
    identity,
    ['provider', 'repository', 'workflowRef', 'runId', 'runAttempt', 'actor', 'ref'],
    'execution identity',
  );
  if (
    !['github-actions', 'local'].includes(identity.provider) ||
    Object.entries(identity).some(
      ([key, value]) => key !== 'provider' && (typeof value !== 'string' || value.length === 0),
    )
  ) {
    throw new Error('execution identity is invalid');
  }
}

function assertExecutionBindings(bindings) {
  assertExactKeys(
    bindings,
    [
      'qualificationInput',
      'candidate',
      'prequalificationBundle',
      'evaluator',
      'controller',
      'sourceSnapshots',
      'environment',
      'runtimeMatrix',
      'runtimeProfile',
      'benchmarkImage',
    ],
    'execution bindings',
  );
  assertExactKeys(
    bindings.qualificationInput,
    ['requestFileSha256', 'requestSha256', 'manifestFileSha256', 'manifestSha256'],
    'qualification input execution binding',
  );
  assertExactKeys(bindings.candidate, ['canonicalSha256', 'fileSha256'], 'candidate execution binding');
  assertExactKeys(
    bindings.prequalificationBundle,
    ['bundleSha256', 'fileSha256'],
    'prequalification execution binding',
  );
  assertExactKeys(
    bindings.evaluator,
    ['contractFileSha256', 'oracleSourceSha256', 'sourceClosureSha256', 'sourceClosure'],
    'evaluator execution binding',
  );
  if (!Array.isArray(bindings.evaluator.sourceClosure) || bindings.evaluator.sourceClosure.length === 0) {
    throw new Error('evaluator execution source closure is missing');
  }
  for (const entry of bindings.evaluator.sourceClosure) {
    assertExactKeys(entry, ['path', 'kind', 'sha256', 'bytes', 'mode'], 'evaluator source closure entry');
    if (
      typeof entry.path !== 'string' ||
      entry.path.length === 0 ||
      entry.kind !== 'file' ||
      !SHA256.test(entry.sha256 ?? '') ||
      !Number.isInteger(entry.bytes) ||
      entry.bytes < 1 ||
      !Number.isInteger(entry.mode)
    ) {
      throw new Error('evaluator source closure entry is invalid');
    }
  }
  if (bindings.evaluator.sourceClosureSha256 !== sha256Canonical(bindings.evaluator.sourceClosure)) {
    throw new Error('evaluator source closure digest is invalid');
  }
  assertExactKeys(bindings.controller, ['closureSha256', 'entries'], 'controller execution binding');
  if (!Array.isArray(bindings.controller.entries)) throw new Error('controller closure entries are missing');
  const expectedPaths = [...CONTROLLER_CLOSURE].sort();
  const actualPaths = bindings.controller.entries.map((entry) => {
    assertExactKeys(entry, ['path', 'sha256', 'bytes'], 'controller closure entry');
    if (!SHA256.test(entry.sha256 ?? '') || !Number.isInteger(entry.bytes) || entry.bytes < 1) {
      throw new Error('controller closure entry is invalid');
    }
    return entry.path;
  });
  if (canonicalJson(actualPaths) !== canonicalJson(expectedPaths)) {
    throw new Error('controller closure does not contain the exact qualification controller files');
  }
  if (bindings.controller.closureSha256 !== sha256Canonical(bindings.controller.entries)) {
    throw new Error('controller closure digest is invalid');
  }
  assertExactKeys(bindings.sourceSnapshots, ['base', 'expected'], 'source snapshot bindings');
  for (const role of ['base', 'expected']) {
    const snapshot = bindings.sourceSnapshots[role];
    assertExactKeys(snapshot, ['revision', 'packFileSha256'], `${role} source snapshot binding`);
    assertExactKeys(snapshot.revision, ['commit', 'tree'], `${role} source snapshot revision`);
    if (
      !GIT_SHA.test(snapshot.revision.commit ?? '') ||
      !GIT_SHA.test(snapshot.revision.tree ?? '') ||
      !SHA256.test(snapshot.packFileSha256 ?? '')
    ) {
      throw new Error(`${role} source snapshot binding is invalid`);
    }
  }
  assertExactKeys(
    bindings.environment,
    ['specFileSha256', 'substanceSha256'],
    'environment execution binding',
  );
  assertExactKeys(bindings.runtimeMatrix, ['fileSha256', 'matrixSha256'], 'runtime matrix execution binding');
  assertExactKeys(bindings.runtimeProfile, ['id', 'profileSha256'], 'runtime profile execution binding');
  if (typeof bindings.runtimeProfile.id !== 'string' || bindings.runtimeProfile.id.length < 3) {
    throw new Error('runtime profile execution binding is invalid');
  }
  assertExactKeys(
    bindings.benchmarkImage,
    ['reference', 'digest', 'inspectEvidence'],
    'benchmark image execution binding',
  );
  assertJsonEvidence(bindings.benchmarkImage.inspectEvidence, 'benchmark image inspect evidence');
}

function assertPreparationEvidence(preparation) {
  assertExactKeys(
    preparation,
    ['networkPolicy', 'directTaskEgress', 'proxy', 'roles'],
    'preparation evidence',
  );
  assertExactKeys(
    preparation.proxy,
    [
      'image',
      'configSha256',
      'fixedHosts',
      'lockfileHosts',
      'allowedHosts',
      'lockfiles',
      'inspectEvidence',
      'networkInspectEvidence',
    ],
    'preparation proxy evidence',
  );
  assertImage(preparation.proxy.image, 'preparation proxy image');
  for (const key of ['fixedHosts', 'lockfileHosts', 'allowedHosts', 'lockfiles']) {
    if (!Array.isArray(preparation.proxy[key])) throw new Error(`preparation proxy ${key} is invalid`);
  }
  assertJsonEvidence(preparation.proxy.inspectEvidence, 'preparation proxy inspect evidence');
  assertJsonEvidence(preparation.proxy.networkInspectEvidence, 'preparation proxy network evidence');
  assertExactKeys(preparation.roles, ['base', 'expected'], 'preparation roles');
  for (const role of ['base', 'expected']) {
    const record = preparation.roles[role];
    assertExactKeys(
      record,
      ['workspaceBeforeSha256', 'workspacePreparedSha256', 'networkPolicy', 'directTaskEgress', 'steps'],
      `${role} preparation evidence`,
    );
    if (!Array.isArray(record.steps) || record.steps.length === 0) {
      throw new Error(`${role} preparation steps are missing`);
    }
    for (const step of record.steps) {
      assertExactKeys(
        step,
        [
          'id',
          'commandSha256',
          'network',
          'imageDigest',
          'inspectEvidence',
          'logsEvidence',
          'startedAt',
          'endedAt',
          'exitCode',
        ],
        `${role} preparation step`,
      );
      assertJsonEvidence(step.inspectEvidence, `${role} preparation inspect evidence`);
      assertFileEvidence(step.logsEvidence, `${role} preparation logs evidence`);
      if (
        !['none', 'isolated-forward-proxy'].includes(step.network) ||
        !IMAGE_DIGEST.test(step.imageDigest ?? '') ||
        step.exitCode !== 0 ||
        !Number.isFinite(Date.parse(step.startedAt ?? '')) ||
        !Number.isFinite(Date.parse(step.endedAt ?? ''))
      ) {
        throw new Error(`${role} preparation step execution evidence is invalid`);
      }
    }
  }
}

function assertEvaluationEvidence(evaluation) {
  assertExactKeys(evaluation, ['networkMode', 'hostInspected', 'roles'], 'evaluation evidence');
  assertExactKeys(evaluation.roles, ['base', 'expected'], 'evaluation roles');
  for (const role of ['base', 'expected']) {
    const record = evaluation.roles[role];
    assertExactKeys(
      record,
      [
        'imageDigest',
        'networkMode',
        'hostInspectedWhileRunning',
        'readOnlyRoot',
        'workspaceReadOnly',
        'siblingWorkspaceVisible',
        'networkCanary',
        'workspaceBeforeSha256',
        'workspaceAfterSha256',
        'inspectEvidence',
        'logsEvidence',
        'canaryEvidence',
        'result',
      ],
      `${role} evaluation evidence`,
    );
    assertJsonEvidence(record.inspectEvidence, `${role} evaluation inspect evidence`);
    assertFileEvidence(record.logsEvidence, `${role} evaluation logs evidence`);
    assertJsonEvidence(record.canaryEvidence, `${role} evaluation canary evidence`);
    assertExactKeys(
      record.result,
      ['logicalPath', 'fileSha256', 'canonicalSha256', 'status'],
      `${role} evaluation result evidence`,
    );
    assertJsonEvidence(
      {
        logicalPath: record.result.logicalPath,
        fileSha256: record.result.fileSha256,
        canonicalSha256: record.result.canonicalSha256,
      },
      `${role} evaluation result evidence`,
    );
    if (!['passed', 'failed', 'build_failure', 'evaluator_failure'].includes(record.result.status)) {
      throw new Error(`${role} evaluation result status is invalid`);
    }
  }
}

function assertJsonEvidence(evidence, label) {
  assertExactKeys(evidence, ['logicalPath', 'fileSha256', 'canonicalSha256'], label);
  assertFileEvidence(
    { logicalPath: evidence.logicalPath, fileSha256: evidence.fileSha256 },
    label,
  );
  if (!SHA256.test(evidence.canonicalSha256 ?? '')) throw new Error(`${label} canonical digest is invalid`);
}

function assertFileEvidence(evidence, label) {
  assertExactKeys(evidence, ['logicalPath', 'fileSha256'], label);
  if (
    typeof evidence.logicalPath !== 'string' ||
    evidence.logicalPath.length === 0 ||
    !SHA256.test(evidence.fileSha256 ?? '')
  ) {
    throw new Error(`${label} is invalid`);
  }
}

function assertImage(image, label) {
  assertExactKeys(image, ['reference', 'digest'], label);
  if (typeof image.reference !== 'string' || image.reference.length < 3 || !IMAGE_DIGEST.test(image.digest ?? '')) {
    throw new Error(`${label} is invalid`);
  }
}

function assertExactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (canonicalJson(actual) !== canonicalJson(expected)) throw new Error(`${label} keys are invalid`);
}

async function persistEvidence(root, name, bytes, parseJson = true) {
  const path = resolve(root, name);
  await mkdir(resolve(path, '..'), { recursive: true, mode: 0o700 });
  await writeFile(path, bytes, { mode: 0o600 });
  const raw = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  const record = {
    logicalPath: relative(optionsArtifactRoot(root), path).replaceAll('\\', '/'),
    fileSha256: sha256(raw),
  };
  if (parseJson) record.canonicalSha256 = sha256Canonical(JSON.parse(raw.toString('utf8')));
  return record;
}

function optionsArtifactRoot(evidenceRoot) {
  return resolve(evidenceRoot, '..');
}

async function runOrThrow(runner, command, args, label) {
  const result = await runner.run(command, args);
  if (result.exitCode !== 0) throw new Error(`${label} failed: ${result.stderr || result.stdout}`.trim());
  return result;
}

async function stopAndRemoveContainer(runner, containerId, cleanup) {
  if (!containerId) return;
  await runner.run('docker', ['rm', '--force', containerId]);
  cleanup.containers.delete(containerId);
}

async function removeNetwork(runner, network, cleanup) {
  if (!network) return;
  await runner.run('docker', ['network', 'rm', network]);
  cleanup.networks.delete(network);
}

async function bestEffortCleanup(runner, cleanup) {
  for (const container of [...cleanup.containers].reverse()) await runner.run('docker', ['rm', '--force', container]);
  for (const network of [...cleanup.networks].reverse()) await runner.run('docker', ['network', 'rm', network]);
}

function resourceNames(taskId, executionId) {
  const prefix = `decantr-${slug(taskId).slice(0, 32)}-${slug(executionId).slice(0, 12)}`;
  return {
    controller: `${prefix}-controller`,
    proxy: `${prefix}-proxy`,
    network: `${prefix}-deps`,
    base: `${prefix}-base`,
    expected: `${prefix}-expected`,
  };
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9_.-]+/gu, '-').replace(/^-+|-+$/gu, '');
}

function otherRole(role) {
  return role === 'base' ? 'expected' : 'base';
}

function normalizeOptions(input) {
  if (
    !input?.request ||
    !input?.inputRoot ||
    !input?.workspaceRoot ||
    !input?.artifactRoot ||
    !input?.outputPath
  ) {
    throw new Error('request, inputRoot, workspaceRoot, artifactRoot, and outputPath are required');
  }
  const options = {
    ...input,
    inputRoot: resolve(input.inputRoot),
    workspaceRoot: resolve(input.workspaceRoot),
    artifactRoot: resolve(input.artifactRoot),
    outputPath: resolve(input.outputPath),
    requestFileSha256:
      input.requestFileSha256 ?? sha256(Buffer.from(prettyCanonicalJson(input.request))),
    clock: input.clock ?? (() => new Date()),
    environment: input.environment ?? process.env,
  };
  if (
    pathsOverlap(options.inputRoot, options.workspaceRoot) ||
    pathsOverlap(options.inputRoot, options.artifactRoot) ||
    pathsOverlap(options.workspaceRoot, options.artifactRoot)
  ) {
    throw new Error('sealed input, hydrated workspaces, and output artifacts must be disjoint');
  }
  const outputRelation = relative(options.artifactRoot, options.outputPath);
  if (outputRelation.startsWith('..') || isAbsolute(outputRelation)) {
    throw new Error('execution attestation output must be inside the artifact root');
  }
  if (!SHA256.test(options.requestFileSha256)) {
    throw new Error('qualification request file digest is invalid');
  }
  return options;
}

function parseRoleArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) throw new Error(`invalid role option: ${key ?? 'missing'}`);
    parsed[key.slice(2)] = value;
  }
  const options = {
    role: parsed.role,
    gatePath: parsed.gate,
    contractPath: parsed.contract,
    workspace: parsed.workspace,
    evaluatorRoot: parsed['evaluator-root'],
    projectPath: parsed['project-path'],
    runId: parsed['run-id'],
    taskId: parsed['task-id'],
    contractId: parsed['contract-id'],
    expectedContractSha256: parsed['expected-contract-sha256'],
    outputPath: parsed.out,
    canaryPath: parsed['canary-out'],
  };
  if (
    !['base', 'expected'].includes(options.role) ||
    Object.values(options).some((value) => typeof value !== 'string' || value.length === 0) ||
    !SHA256.test(options.expectedContractSha256)
  ) {
    throw new Error('role execution options are invalid');
  }
  return options;
}

function parseCli(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) throw new Error(`invalid option: ${key ?? 'missing'}`);
    parsed[key.slice(2)] = value;
  }
  for (const name of ['request', 'input-root', 'workspace-root', 'artifact-root', 'out']) {
    if (!parsed[name]) throw new Error(`--${name} is required`);
  }
  return parsed;
}

async function main(argv) {
  if (argv[0] === 'role-execute') return runRoleExecute(argv.slice(1));
  const parsed = parseCli(argv);
  const inputRoot = resolve(parsed['input-root']);
  const sealedRequestPath = requestPath(inputRoot, parsed.request);
  if (sealedRequestPath !== join(inputRoot, 'request.json')) {
    throw new Error('qualification request must be request.json at the sealed input root');
  }
  const requestBytes = await readFile(sealedRequestPath);
  const request = JSON.parse(requestBytes);
  if (!requestBytes.equals(Buffer.from(prettyCanonicalJson(request)))) {
    throw new Error('qualification request bytes are not canonical');
  }
  const attestation = await orchestrateEvaluatorQualification({
    request,
    requestFileSha256: sha256(requestBytes),
    inputRoot,
    workspaceRoot: resolve(parsed['workspace-root']),
    artifactRoot: resolve(parsed['artifact-root']),
    outputPath: resolve(parsed.out),
  });
  process.stdout.write(`${prettyCanonicalJson({ ok: true, taskId: attestation.taskId, attestationSha256: attestation.attestationSha256 })}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
