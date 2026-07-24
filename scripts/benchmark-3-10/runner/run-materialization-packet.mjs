#!/usr/bin/env node
import {
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  rm,
} from 'node:fs/promises';
import {
  dirname,
  join,
  resolve,
} from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assertPreparedEnvironment,
  verifyLockfiles,
  verifyPreparedDependencyTree,
} from '../environments/prepared-environment.mjs';
import { assertRuntimeMatrix } from '../environments/runtime-matrix.mjs';
import { hashQualificationWorkspace } from '../evaluators/container-orchestrator.mjs';
import { calculateSealedDirectoryClosure } from './evaluator-stage.mjs';
import {
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from './canonical.mjs';
import {
  assertCandidateManifest,
  assertRunPlan,
  assertTaskManifest,
} from './contracts.mjs';
import { resolveContained } from './process.mjs';
import {
  buildRunAuthorization,
  assertRunAuthorization,
} from './run-authorization.mjs';
import { prepareSplitRunInput } from './prepare-split-run-input.mjs';
import { readCandidateSource } from './candidate-source.mjs';
import {
  assertPreparedWorkspaceSource,
  readPreparedWorkspaceSourceIndex,
} from './prepared-workspace-source-index.mjs';

const SCHEMA_VERSION =
  'decantr-benchmark-run-materialization-packet.v1';
const PREPARED_VERIFICATION_VERSION =
  'decantr-benchmark-prepared-workspace-verification.v1';
const PROGRAM = 'decantr-3.10-ui-change-control-proof';
const SHA256 = /^[a-f0-9]{64}$/u;
const GIT_SHA = /^[a-f0-9]{40}$/u;
const PACKET_ENTRIES = [
  'authorization.json',
  'candidate',
  'candidate-source.json',
  'contract.json',
  'evaluator',
  'manifest.json',
  'manifest.provenance-verification.json',
  'manifest.sigstore.json',
  'prepared-environment.json',
  'prepared-verification.json',
  'prepared-workspace-source.json',
  'run-plan.json',
  'runtime-matrix.json',
  'task.json',
  'workspace',
].sort();

export async function resolveRunMaterializationSources(options) {
  const plan = await readCanonical(
    options.planPath,
    'run plan',
    assertRunPlan,
  );
  const run = plan.value.runs.find(
    (item) => item.runId === options.runId,
  );
  if (!run) {
    throw new Error(
      `${options.runId}: run is absent from the frozen plan`,
    );
  }
  const plannedTask = plan.value.tasks.find(
    (item) => item.taskId === run.taskId,
  );
  if (!plannedTask) {
    throw new Error(`${run.runId}: planned task binding is absent`);
  }
  const [preparedIndex, candidateSource] = await Promise.all([
    readPreparedWorkspaceSourceIndex(
      options.preparedSourceIndexPath,
      { expectedTasks: plan.value.tasks },
    ),
    readCandidateSource(options.candidateSourcePath),
  ]);
  const preparedSource = preparedIndex.tasks.find(
    (item) => item.taskId === run.taskId,
  );
  if (
    !preparedSource ||
    preparedSource.partition !== run.partition
  ) {
    throw new Error(
      `${run.taskId}: prepared workspace source is absent or stale`,
    );
  }
  return {
    plan: plan.value,
    planBytes: plan.bytes,
    run,
    plannedTask,
    preparedIndex,
    preparedSource,
    candidateSource,
  };
}

export async function buildRunMaterializationPacket(options) {
  await assertEmptyDirectory(options.outputRoot);
  await assertEmptyDirectory(options.validationOutputRoot);
  const context = await resolveRunMaterializationSources(options);
  const taskRoot =
    context.run.partition === 'development'
      ? options.developmentTaskRoot
      : options.qualificationTaskRoot;
  const evaluatorRoot =
    context.run.partition === 'development'
      ? options.developmentEvaluatorRoot
      : options.qualificationEvaluatorRoot;
  const taskPath = resolveContained(
    taskRoot,
    context.plannedTask.sourceRef,
    `${context.run.taskId}: materialized task`,
  );
  const task = await readCanonical(
    taskPath,
    'task manifest',
    (value) =>
      assertTaskManifest(value, context.run.partition),
  );
  if (
    task.value.taskId !== context.run.taskId ||
    sha256(task.bytes) !== context.run.taskManifestSha256 ||
    sha256(task.bytes) !== context.plannedTask.manifestSha256
  ) {
    throw new Error(
      `${context.run.runId}: materialized task differs from the plan`,
    );
  }

  const runtimeMatrix = await readCanonical(
    options.runtimeMatrixPath,
    'runtime matrix',
    (value) => assertRuntimeMatrix(value, { requireLocked: true }),
  );
  if (
    sha256(runtimeMatrix.bytes) !==
      context.plan.bindings.runtimeMatrix.sha256 ||
    runtimeMatrix.bytes.byteLength !==
      context.plan.bindings.runtimeMatrix.bytes
  ) {
    throw new Error('runtime matrix differs from the frozen plan');
  }
  const prepared = await readCanonical(
    options.preparedEnvironmentPath,
    'prepared environment',
    (value) =>
      assertPreparedEnvironment(value, {
        task: task.value,
        runtimeMatrix: runtimeMatrix.value,
      }),
  );
  const preparedVerification = await readCanonical(
    options.preparedVerificationPath,
    'prepared workspace verification',
    assertPreparedVerification,
  );
  assertPreparedSourceBindings({
    source: context.preparedSource,
    task: task.value,
    prepared: prepared.value,
    preparedBytes: prepared.bytes,
    verification: preparedVerification.value,
  });
  verifyLockfiles(options.workspace, prepared.value.lockfiles);
  await verifyPreparedDependencyTree(
    options.workspace,
    prepared.value,
  );
  const workspacePreparedSha256 =
    await hashQualificationWorkspace(options.workspace);
  if (
    workspacePreparedSha256 !==
      preparedVerification.value.workspacePreparedSha256
  ) {
    throw new Error(
      `${context.run.taskId}: prepared workspace bytes differ from verification`,
    );
  }

  const candidatePath = join(
    options.candidateRoot,
    'candidate.json',
  );
  const candidateManifest = await readCanonical(
    candidatePath,
    'candidate manifest',
  );
  const candidate = await assertCandidateManifest(
    candidateManifest.value,
    candidatePath,
    {
      runtimeRoot: join(options.candidateRoot, 'runtime'),
    },
  );
  await assertCandidateSourceBindings({
    root: options.candidateRoot,
    manifest: candidateManifest,
    candidate,
    source: context.candidateSource,
  });
  const protocol = await readCanonical(
    options.protocolPath,
    'protocol',
  );
  const models = await readCanonical(options.modelsPath, 'model lock');
  const model = models.value.models?.find(
    (item) => item.id === context.run.modelId,
  );
  if (
    protocol.value.program !== context.plan.program ||
    !model ||
    model.provider !== context.run.provider ||
    model.requestedModel !== context.run.requestedModel
  ) {
    throw new Error(
      `${context.run.runId}: protocol or model lock differs from the plan`,
    );
  }

  await Promise.all([
    copyRegular(options.planPath, join(options.outputRoot, 'run-plan.json')),
    copyRegular(taskPath, join(options.outputRoot, 'task.json')),
    copyRegular(
      options.preparedEnvironmentPath,
      join(options.outputRoot, 'prepared-environment.json'),
    ),
    copyRegular(
      options.preparedVerificationPath,
      join(options.outputRoot, 'prepared-verification.json'),
    ),
    copyRegular(
      options.runtimeMatrixPath,
      join(options.outputRoot, 'runtime-matrix.json'),
    ),
    copyRegular(
      options.candidateSourcePath,
      join(options.outputRoot, 'candidate-source.json'),
    ),
    copyTree(options.workspace, join(options.outputRoot, 'workspace')),
    copyCandidate(
      options.candidateRoot,
      join(options.outputRoot, 'candidate'),
    ),
  ]);
  await writeCanonicalFile(
    join(options.outputRoot, 'prepared-workspace-source.json'),
    context.preparedSource,
  );

  const evaluatorSpec = await readCanonical(
    resolveContained(
      evaluatorRoot,
      join('specs', `${task.value.taskId}.json`),
      `${task.value.taskId}: evaluator spec`,
    ),
    'evaluator spec',
  );
  const evaluatorSourcePath = resolveContained(
    evaluatorRoot,
    evaluatorSpec.value.oracle?.sourcePath,
    `${task.value.taskId}: evaluator source`,
  );
  const packetEvaluatorRoot = join(
    options.outputRoot,
    'evaluator',
  );
  await mkdir(packetEvaluatorRoot, {
    recursive: true,
    mode: 0o700,
  });
  const evaluatorDestination = resolveContained(
    packetEvaluatorRoot,
    evaluatorSpec.value.oracle?.sourcePath,
    `${task.value.taskId}: packet evaluator source`,
  );
  await mkdir(dirname(evaluatorDestination), {
    recursive: true,
    mode: 0o700,
  });
  await copyRegular(evaluatorSourcePath, evaluatorDestination);
  const contractPath = resolveContained(
    evaluatorRoot,
    join('contracts', `${task.value.taskId}.json`),
    `${task.value.taskId}: evaluator contract`,
  );
  await copyRegular(
    contractPath,
    join(options.outputRoot, 'contract.json'),
  );

  const authorizationPath = join(
    options.outputRoot,
    'authorization.json',
  );
  const authorization = await buildRunAuthorization({
    outputPath: authorizationPath,
    runId: context.run.runId,
    partition: context.run.partition,
    modelId: context.run.modelId,
    runPlanSha256: context.plan.planSha256,
    candidateManifestSha256: candidate.manifestSha256,
    candidateTarballSetSha256: candidate.tarballSetSha256,
    maxRunCostUsd: model.maxRunCostUsd,
    protocolMaximumUsd:
      protocol.value.budget.maximumModelSpendUsd,
    developmentTaskCount: context.plan.tasks.filter(
      (item) => item.partition === 'development',
    ).length,
    paid: false,
  });

  const split = await prepareSplitRunInput({
    planPath: join(options.outputRoot, 'run-plan.json'),
    runId: context.run.runId,
    taskManifestPath: join(options.outputRoot, 'task.json'),
    workspace: join(options.outputRoot, 'workspace'),
    preparedEnvironmentPath: join(
      options.outputRoot,
      'prepared-environment.json',
    ),
    evaluatorContractPath: join(
      options.outputRoot,
      'contract.json',
    ),
    evaluatorRoot: join(options.outputRoot, 'evaluator'),
    candidateManifestPath: join(
      options.outputRoot,
      'candidate',
      'candidate.json',
    ),
    candidateRuntimeRoot: join(
      options.outputRoot,
      'candidate',
      'runtime',
    ),
    runtimeMatrixPath: join(
      options.outputRoot,
      'runtime-matrix.json',
    ),
    authorizationPath,
    modelsPath: options.modelsPath,
    protocolPath: options.protocolPath,
    sourceCommit: options.sourceCommit,
    repositoryRoot: options.repositoryRoot,
    outputRoot: options.validationOutputRoot,
  });
  await rm(options.validationOutputRoot, {
    recursive: true,
    force: true,
  });

  const evaluatorClosure =
    await calculateSealedDirectoryClosure(
      join(options.outputRoot, 'evaluator'),
    );
  const preparedSourceBytes = await readFile(
    join(
      options.outputRoot,
      'prepared-workspace-source.json',
    ),
  );
  const contractBytes = await readFile(
    join(options.outputRoot, 'contract.json'),
  );
  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    program: PROGRAM,
    runId: context.run.runId,
    taskId: context.run.taskId,
    partition: context.run.partition,
    materializedAt: options.materializedAt,
    sourceCommit: options.sourceCommit,
    bindings: {
      authorizationFileSha256: authorization.sha256,
      candidateManifestFileSha256: candidate.manifestSha256,
      candidateProvenanceBundleFileSha256:
        context.candidateSource.source
          .candidateProvenanceBundleFileSha256,
      candidateRuntimeTreeSha256:
        candidate.runtime.runtimeTreeSha256,
      candidateSourceSha256:
        context.candidateSource.sourceSha256,
      candidateTarballSetSha256:
        candidate.tarballSetSha256,
      contractFileSha256: sha256(contractBytes),
      evaluatorClosureSha256:
        evaluatorClosure.closureSha256,
      preparedEnvironmentFileSha256:
        sha256(prepared.bytes),
      preparedSourceIndexSha256:
        context.preparedIndex.indexSha256,
      preparedSourceFileSha256:
        sha256(preparedSourceBytes),
      preparedVerificationFileSha256:
        sha256(preparedVerification.bytes),
      preparedVerificationSha256:
        preparedVerification.value.verificationSha256,
      runPlanFileSha256: sha256(context.planBytes),
      runPlanSha256: context.plan.planSha256,
      runtimeMatrixFileSha256:
        sha256(runtimeMatrix.bytes),
      runtimeMatrixSha256:
        runtimeMatrix.value.matrixSha256,
      splitPairSha256: split.pairSha256,
      taskManifestFileSha256: sha256(task.bytes),
      workspacePreparedSha256,
    },
  };
  manifest.packetSha256 =
    calculateRunMaterializationPacketDigest(manifest);
  assertRunMaterializationPacketManifest(manifest);
  await writeCanonicalFile(
    join(options.outputRoot, 'manifest.json'),
    manifest,
  );
  return manifest;
}

export async function verifyRunMaterializationPacket(options) {
  const actualEntries = (await readdir(options.packetRoot)).sort();
  if (
    JSON.stringify(actualEntries) !== JSON.stringify(PACKET_ENTRIES)
  ) {
    throw new Error('run materialization packet file set is invalid');
  }
  await assertPacketEntryTypes(options.packetRoot);
  const manifest = await readCanonical(
    join(options.packetRoot, 'manifest.json'),
    'run materialization manifest',
    assertRunMaterializationPacketManifest,
  );
  if (manifest.value.sourceCommit !== options.sourceCommit) {
    throw new Error(
      'run materialization packet source commit is stale',
    );
  }
  const plan = await readCanonical(
    join(options.packetRoot, 'run-plan.json'),
    'run plan',
    assertRunPlan,
  );
  const task = await readCanonical(
    join(options.packetRoot, 'task.json'),
    'task manifest',
    (value) =>
      assertTaskManifest(value, manifest.value.partition),
  );
  const prepared = await readCanonical(
    join(options.packetRoot, 'prepared-environment.json'),
    'prepared environment',
    assertPreparedEnvironment,
  );
  const verification = await readCanonical(
    join(options.packetRoot, 'prepared-verification.json'),
    'prepared workspace verification',
    assertPreparedVerification,
  );
  const preparedSource = await readCanonical(
    join(
      options.packetRoot,
      'prepared-workspace-source.json',
    ),
    'prepared workspace source',
    assertPreparedWorkspaceSource,
  );
  const matrix = await readCanonical(
    join(options.packetRoot, 'runtime-matrix.json'),
    'runtime matrix',
    (value) => assertRuntimeMatrix(value, { requireLocked: true }),
  );
  assertPreparedEnvironment(prepared.value, {
    task: task.value,
    runtimeMatrix: matrix.value,
  });
  assertPreparedSourceBindings({
    source: preparedSource.value,
    task: task.value,
    prepared: prepared.value,
    preparedBytes: prepared.bytes,
    verification: verification.value,
  });
  const authorization = await readCanonical(
    join(options.packetRoot, 'authorization.json'),
    'run authorization',
    assertRunAuthorization,
  );
  const candidateSource = await readCandidateSource(
    join(options.packetRoot, 'candidate-source.json'),
  );
  const candidatePath = join(
    options.packetRoot,
    'candidate',
    'candidate.json',
  );
  const candidateManifest = await readCanonical(
    candidatePath,
    'candidate manifest',
  );
  const candidate = await assertCandidateManifest(
    candidateManifest.value,
    candidatePath,
    {
      runtimeRoot: join(
        options.packetRoot,
        'candidate',
        'runtime',
      ),
    },
  );
  await assertCandidateSourceBindings({
    root: join(options.packetRoot, 'candidate'),
    manifest: candidateManifest,
    candidate,
    source: candidateSource,
  });
  const evaluatorClosure =
    await calculateSealedDirectoryClosure(
      join(options.packetRoot, 'evaluator'),
    );
  const contractBytes = await readFile(
    join(options.packetRoot, 'contract.json'),
  );
  const workspacePreparedSha256 =
    await hashQualificationWorkspace(
      join(options.packetRoot, 'workspace'),
    );
  const bindings = {
    authorizationFileSha256: sha256(authorization.bytes),
    candidateManifestFileSha256: candidate.manifestSha256,
    candidateProvenanceBundleFileSha256:
      candidateSource.source
        .candidateProvenanceBundleFileSha256,
    candidateRuntimeTreeSha256:
      candidate.runtime.runtimeTreeSha256,
    candidateSourceSha256: candidateSource.sourceSha256,
    candidateTarballSetSha256: candidate.tarballSetSha256,
    contractFileSha256: sha256(contractBytes),
    evaluatorClosureSha256: evaluatorClosure.closureSha256,
    preparedEnvironmentFileSha256: sha256(prepared.bytes),
    preparedSourceIndexSha256:
      manifest.value.bindings.preparedSourceIndexSha256,
    preparedSourceFileSha256:
      sha256(preparedSource.bytes),
    preparedVerificationFileSha256: sha256(verification.bytes),
    preparedVerificationSha256:
      verification.value.verificationSha256,
    runPlanFileSha256: sha256(plan.bytes),
    runPlanSha256: plan.value.planSha256,
    runtimeMatrixFileSha256: sha256(matrix.bytes),
    runtimeMatrixSha256: matrix.value.matrixSha256,
    splitPairSha256:
      manifest.value.bindings.splitPairSha256,
    taskManifestFileSha256: sha256(task.bytes),
    workspacePreparedSha256,
  };
  if (
    JSON.stringify(bindings) !==
      JSON.stringify(manifest.value.bindings) ||
    manifest.value.runId !== authorization.value.runId ||
    manifest.value.taskId !== task.value.taskId ||
    manifest.value.partition !== task.value.partition ||
    verification.value.taskId !== task.value.taskId ||
    verification.value.partition !== task.value.partition ||
    preparedSource.value.taskId !== task.value.taskId ||
    preparedSource.value.partition !== task.value.partition ||
    preparedSource.value.verificationSha256 !==
      verification.value.verificationSha256
  ) {
    throw new Error(
      'run materialization packet differs from its signed manifest',
    );
  }
  return manifest.value;
}

export function calculateRunMaterializationPacketDigest(manifest) {
  const copy = structuredClone(manifest);
  delete copy.packetSha256;
  return sha256Canonical(copy);
}

export function assertRunMaterializationPacketManifest(manifest) {
  assertExactKeys(
    manifest,
    [
      'schemaVersion',
      'program',
      'runId',
      'taskId',
      'partition',
      'materializedAt',
      'sourceCommit',
      'bindings',
      'packetSha256',
    ],
    'run materialization packet manifest',
  );
  const bindingKeys = [
    'authorizationFileSha256',
    'candidateManifestFileSha256',
    'candidateProvenanceBundleFileSha256',
    'candidateRuntimeTreeSha256',
    'candidateSourceSha256',
    'candidateTarballSetSha256',
    'contractFileSha256',
    'evaluatorClosureSha256',
    'preparedEnvironmentFileSha256',
    'preparedSourceIndexSha256',
    'preparedSourceFileSha256',
    'preparedVerificationFileSha256',
    'preparedVerificationSha256',
    'runPlanFileSha256',
    'runPlanSha256',
    'runtimeMatrixFileSha256',
    'runtimeMatrixSha256',
    'splitPairSha256',
    'taskManifestFileSha256',
    'workspacePreparedSha256',
  ];
  assertExactKeys(
    manifest.bindings,
    bindingKeys,
    'run materialization packet bindings',
  );
  if (
    manifest.schemaVersion !== SCHEMA_VERSION ||
    manifest.program !== PROGRAM ||
    typeof manifest.runId !== 'string' ||
    manifest.runId === '' ||
    typeof manifest.taskId !== 'string' ||
    manifest.taskId === '' ||
    !['development', 'qualification'].includes(
      manifest.partition,
    ) ||
    !Number.isFinite(Date.parse(manifest.materializedAt ?? '')) ||
    !GIT_SHA.test(manifest.sourceCommit ?? '') ||
    !bindingKeys.every((key) =>
      SHA256.test(manifest.bindings[key] ?? ''),
    ) ||
    manifest.packetSha256 !==
      calculateRunMaterializationPacketDigest(manifest)
  ) {
    throw new Error('run materialization packet manifest is invalid');
  }
  return manifest;
}

function assertPreparedVerification(value) {
  assertExactKeys(
    value,
    [
      'schemaVersion',
      'taskId',
      'partition',
      'executionAttestationFileSha256',
      'executionAttestationSha256',
      'preparedEnvironmentFileSha256',
      'preparedEnvironmentAttestationSha256',
      'environmentSha256',
      'workspaceTarFileSha256',
      'workspacePreparedSha256',
      'provenanceVerificationSha256',
      'sourceCommit',
      'verificationSha256',
    ],
    'prepared workspace verification',
  );
  const digestKeys = Object.keys(value).filter(
    (key) => key.endsWith('Sha256'),
  );
  if (
    value.schemaVersion !== PREPARED_VERIFICATION_VERSION ||
    typeof value.taskId !== 'string' ||
    !['development', 'qualification'].includes(value.partition) ||
    !GIT_SHA.test(value.sourceCommit ?? '') ||
    !digestKeys.every((key) => SHA256.test(value[key] ?? '')) ||
    value.verificationSha256 !==
      sha256Canonical(
        Object.fromEntries(
          Object.entries(value).filter(
            ([key]) => key !== 'verificationSha256',
          ),
        ),
      )
  ) {
    throw new Error('prepared workspace verification is invalid');
  }
  return value;
}

function assertPreparedSourceBindings(input) {
  const { source, task, prepared, preparedBytes, verification } =
    input;
  if (
    source.taskId !== task.taskId ||
    source.partition !== task.partition ||
    source.runnerRepositoryCommit !== verification.sourceCommit ||
    source.executionAttestationFileSha256 !==
      verification.executionAttestationFileSha256 ||
    source.preparedEnvironmentFileSha256 !==
      sha256(preparedBytes) ||
    source.preparedEnvironmentFileSha256 !==
      verification.preparedEnvironmentFileSha256 ||
    source.workspacePreparedSha256 !==
      verification.workspacePreparedSha256 ||
    source.verificationSha256 !==
      verification.verificationSha256 ||
    prepared.taskId !== task.taskId ||
    prepared.attestationSha256 !==
      verification.preparedEnvironmentAttestationSha256 ||
    prepared.environmentSha256 !== verification.environmentSha256
  ) {
    throw new Error(
      `${task.taskId}: prepared workspace source binding is stale`,
    );
  }
}

async function assertCandidateSourceBindings(input) {
  const { root, manifest, candidate, source } = input;
  const bundleBytes = await readFile(
    join(root, 'candidate.provenance.jsonl'),
  );
  const verificationBytes = await readFile(
    join(root, 'candidate.provenance-verification.json'),
  );
  const expected = source.source;
  if (
    sha256(manifest.bytes) !==
      expected.candidateManifestFileSha256 ||
    candidate.tarballSetSha256 !==
      expected.candidateTarballSetSha256 ||
    candidate.runtime?.runtimeTreeSha256 !==
      expected.candidateRuntimeTreeSha256 ||
    sha256(bundleBytes) !==
      expected.candidateProvenanceBundleFileSha256 ||
    sha256(verificationBytes) !==
      expected.candidateProvenanceVerificationFileSha256 ||
    candidate.source?.repository !==
      'https://github.com/decantr-ai/decantr' ||
    candidate.source?.commit !==
      expected.runnerRepositoryCommit ||
    candidate.source?.clean !== true
  ) {
    throw new Error('candidate artifact differs from its frozen source');
  }
}

async function copyCandidate(source, destination) {
  const entries = (await readdir(source)).sort();
  const expected = [
    'candidate.json',
    'candidate.provenance-verification.json',
    'candidate.provenance.jsonl',
    'runtime',
    'tarballs',
  ];
  if (JSON.stringify(entries) !== JSON.stringify(expected)) {
    throw new Error('candidate artifact file set is invalid');
  }
  await mkdir(destination, { recursive: true, mode: 0o700 });
  await Promise.all([
    copyRegular(
      join(source, 'candidate.json'),
      join(destination, 'candidate.json'),
    ),
    copyRegular(
      join(source, 'candidate.provenance.jsonl'),
      join(destination, 'candidate.provenance.jsonl'),
    ),
    copyRegular(
      join(source, 'candidate.provenance-verification.json'),
      join(destination, 'candidate.provenance-verification.json'),
    ),
    copyTree(
      join(source, 'runtime'),
      join(destination, 'runtime'),
    ),
    copyTree(
      join(source, 'tarballs'),
      join(destination, 'tarballs'),
    ),
  ]);
}

async function assertPacketEntryTypes(root) {
  const directories = new Set([
    'candidate',
    'evaluator',
    'workspace',
  ]);
  for (const entry of PACKET_ENTRIES) {
    const metadata = await lstat(join(root, entry));
    if (
      metadata.isSymbolicLink() ||
      (directories.has(entry)
        ? !metadata.isDirectory()
        : !metadata.isFile())
    ) {
      throw new Error(
        `run materialization packet entry type is invalid: ${entry}`,
      );
    }
  }
}

async function copyRegular(source, destination) {
  const metadata = await lstat(source);
  if (!metadata.isFile() || metadata.isSymbolicLink()) {
    throw new Error(`expected a regular file: ${source}`);
  }
  await mkdir(dirname(destination), {
    recursive: true,
    mode: 0o700,
  });
  await cp(source, destination, {
    force: false,
    preserveTimestamps: true,
  });
}

async function copyTree(source, destination) {
  const metadata = await lstat(source);
  if (!metadata.isDirectory() || metadata.isSymbolicLink()) {
    throw new Error(`expected a real directory: ${source}`);
  }
  await cp(source, destination, {
    recursive: true,
    force: false,
    preserveTimestamps: true,
    verbatimSymlinks: true,
  });
}

async function readCanonical(path, label, assertion = (value) => value) {
  const bytes = await readFile(path);
  const value = JSON.parse(bytes);
  if (!bytes.equals(Buffer.from(prettyCanonicalJson(value)))) {
    throw new Error(`${label} is not canonical`);
  }
  return { bytes, value: assertion(value) };
}

async function assertEmptyDirectory(path) {
  await mkdir(path, { recursive: true, mode: 0o700 });
  const metadata = await lstat(path);
  if (!metadata.isDirectory() || metadata.isSymbolicLink()) {
    throw new Error('materialization output must be a real directory');
  }
  if ((await readdir(path)).length !== 0) {
    throw new Error(`materialization output is not empty: ${path}`);
  }
}

function assertExactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (
    actual.length !== wanted.length ||
    actual.some((key, index) => key !== wanted[index])
  ) {
    throw new Error(`${label} fields are invalid`);
  }
}

function parseArgs(argv) {
  const options = {
    repositoryRoot: resolve(
      dirname(fileURLToPath(import.meta.url)),
      '..',
      '..',
      '..',
    ),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === '--mode') options.mode = value;
    else if (argument === '--plan') options.planPath = resolve(value);
    else if (argument === '--run-id') options.runId = value;
    else if (argument === '--prepared-source-index') {
      options.preparedSourceIndexPath = resolve(value);
    } else if (argument === '--candidate-source') {
      options.candidateSourcePath = resolve(value);
    } else if (argument === '--candidate-root') {
      options.candidateRoot = resolve(value);
    } else if (argument === '--prepared-environment') {
      options.preparedEnvironmentPath = resolve(value);
    } else if (argument === '--prepared-verification') {
      options.preparedVerificationPath = resolve(value);
    } else if (argument === '--workspace') {
      options.workspace = resolve(value);
    } else if (argument === '--development-task-root') {
      options.developmentTaskRoot = resolve(value);
    } else if (argument === '--qualification-task-root') {
      options.qualificationTaskRoot = resolve(value);
    } else if (argument === '--development-evaluator-root') {
      options.developmentEvaluatorRoot = resolve(value);
    } else if (argument === '--qualification-evaluator-root') {
      options.qualificationEvaluatorRoot = resolve(value);
    } else if (argument === '--runtime-matrix') {
      options.runtimeMatrixPath = resolve(value);
    } else if (argument === '--models') {
      options.modelsPath = resolve(value);
    } else if (argument === '--protocol') {
      options.protocolPath = resolve(value);
    } else if (argument === '--source-commit') {
      options.sourceCommit = value;
    } else if (argument === '--materialized-at') {
      options.materializedAt = value;
    } else if (argument === '--out') {
      options.outputRoot = resolve(value);
    } else if (argument === '--validation-out') {
      options.validationOutputRoot = resolve(value);
    } else if (argument === '--packet-root') {
      options.packetRoot = resolve(value);
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
    index += 1;
  }
  if (!['resolve', 'build', 'verify'].includes(options.mode)) {
    throw new Error('--mode must be resolve, build, or verify');
  }
  const required =
    options.mode === 'verify'
      ? ['packetRoot', 'sourceCommit']
      : [
          'planPath',
          'runId',
          'preparedSourceIndexPath',
          'candidateSourcePath',
        ];
  if (options.mode === 'build') {
    required.push(
      'candidateRoot',
      'preparedEnvironmentPath',
      'preparedVerificationPath',
      'workspace',
      'developmentTaskRoot',
      'qualificationTaskRoot',
      'developmentEvaluatorRoot',
      'qualificationEvaluatorRoot',
      'runtimeMatrixPath',
      'modelsPath',
      'protocolPath',
      'sourceCommit',
      'materializedAt',
      'outputRoot',
      'validationOutputRoot',
    );
  }
  for (const key of required) {
    if (!options[key]) throw new Error(`Missing required option: ${key}`);
  }
  if (
    options.sourceCommit &&
    !GIT_SHA.test(options.sourceCommit)
  ) {
    throw new Error('--source-commit must be a full Git SHA');
  }
  if (
    options.materializedAt &&
    !Number.isFinite(Date.parse(options.materializedAt))
  ) {
    throw new Error('--materialized-at must be a timestamp');
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    let result;
    if (options.mode === 'resolve') {
      const resolved =
        await resolveRunMaterializationSources(options);
      result = {
        runId: resolved.run.runId,
        taskId: resolved.run.taskId,
        partition: resolved.run.partition,
        preparedSource: resolved.preparedSource,
        candidateSource: resolved.candidateSource.source,
      };
    } else if (options.mode === 'build') {
      result = await buildRunMaterializationPacket(options);
    } else {
      result = await verifyRunMaterializationPacket(options);
    }
    process.stdout.write(prettyCanonicalJson({ ok: true, ...result }));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
