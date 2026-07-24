#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import {
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
} from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assertPreparedEnvironment,
  verifyLockfiles,
  verifyPreparedDependencyTree,
} from '../environments/prepared-environment.mjs';
import { assertRuntimeMatrix } from '../environments/runtime-matrix.mjs';
import {
  buildControlDelivery,
  buildTreatmentDelivery,
} from './arm-delivery.mjs';
import {
  prettyCanonicalJson,
  readJsonFile,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from './canonical.mjs';
import {
  assertCandidateManifest,
  assertEvaluatorContract,
  assertRunPlan,
  assertTaskManifest,
} from './contracts.mjs';
import { assertSanitizedAgentRequest } from './agent-stage.mjs';
import { calculateSealedDirectoryClosure } from './evaluator-stage.mjs';
import {
  assertRunAuthorization,
  verifyRunAuthorization,
} from './run-authorization.mjs';
import { buildSplitInputManifests } from './split-run-input.mjs';
import { calculateStageControllerClosure } from './stage-controller.mjs';

const benchmarkRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
);
const repositoryRoot = resolve(benchmarkRoot, '..', '..');
const GIT_SHA = /^[a-f0-9]{40}$/u;

export async function prepareSplitRunInput(options) {
  const outputRoot = resolve(options.outputRoot);
  await assertEmptyDirectory(outputRoot);
  const agentInputRoot = join(outputRoot, 'agent');
  const evaluatorInputRoot = join(outputRoot, 'evaluator');
  await Promise.all([
    mkdir(agentInputRoot, { recursive: true, mode: 0o700 }),
    mkdir(evaluatorInputRoot, { recursive: true, mode: 0o700 }),
  ]);

  const [
    plan,
    taskBytes,
    candidateManifest,
    models,
    protocol,
    runtimeMatrixBytes,
    preparedBytes,
    contractBytes,
    rawAuthorization,
  ] = await Promise.all([
    readJsonFile(options.planPath).then(assertRunPlan),
    readFile(options.taskManifestPath),
    readJsonFile(options.candidateManifestPath),
    readJsonFile(options.modelsPath),
    readJsonFile(options.protocolPath),
    readFile(options.runtimeMatrixPath),
    readFile(options.preparedEnvironmentPath),
    readFile(options.evaluatorContractPath),
    readJsonFile(options.authorizationPath).then(assertRunAuthorization),
  ]);
  const run = plan.runs.find((item) => item.runId === options.runId);
  if (!run) throw new Error(`run is absent from the frozen plan: ${options.runId}`);
  const plannedTask = plan.tasks.find(
    (item) => item.taskId === run.taskId,
  );
  if (!plannedTask) {
    throw new Error(`${run.runId}: planned task binding is missing`);
  }
  const task = assertTaskManifest(JSON.parse(taskBytes), run.partition);
  assertRunAndTaskBindings({ run, plannedTask, task, taskBytes });
  const runtimeMatrix = assertRuntimeMatrix(
    JSON.parse(runtimeMatrixBytes),
    { requireLocked: true },
  );
  assertFrozenFileBinding(
    plan.bindings.runtimeMatrix,
    runtimeMatrixBytes,
    'runtime matrix',
  );
  const profile = runtimeMatrix.profiles.find(
    (item) => item.id === task.environment.runtimeProfileId,
  );
  if (!profile) {
    throw new Error(
      `${task.taskId}: runtime profile is absent from the locked matrix`,
    );
  }
  if (
    task.environment.runtimeMatrixFileSha256 !==
      sha256(runtimeMatrixBytes) ||
    task.environment.runtimeMatrixSha256 !==
      runtimeMatrix.matrixSha256 ||
    task.environment.benchmarkImageDigest !==
      profile.benchmarkImage.digest
  ) {
    throw new Error(`${task.taskId}: runtime matrix binding mismatch`);
  }
  const prepared = assertPreparedEnvironment(
    JSON.parse(preparedBytes),
    { task, runtimeMatrix },
  );
  const contract = assertEvaluatorContract(
    JSON.parse(contractBytes),
    task,
  );
  if (sha256(contractBytes) !== task.evaluator.contractSha256) {
    throw new Error(`${task.taskId}: evaluator contract bytes differ`);
  }
  const evaluatorClosure = await calculateSealedDirectoryClosure(
    options.evaluatorRoot,
  );
  if (
    evaluatorClosure.closureSha256 !==
      task.evaluator.qualificationEvaluatorSourceClosureSha256 ||
    !evaluatorClosure.entries.some(
      (entry) =>
        entry.sha256 === task.evaluator.oracleSourceSha256,
    ) ||
    contract.oracle.sourceSha256 !==
      task.evaluator.oracleSourceSha256
  ) {
    throw new Error(`${task.taskId}: sealed evaluator closure differs`);
  }

  assertFrozenFileBinding(plan.bindings.models, await readFile(options.modelsPath), 'model lock');
  assertFrozenFileBinding(
    plan.bindings.protocol,
    await readFile(options.protocolPath),
    'protocol',
  );
  const model = models.models?.find(
    (item) => item.id === run.modelId,
  );
  if (
    !model ||
    model.provider !== run.provider ||
    model.requestedModel !== run.requestedModel
  ) {
    throw new Error(`${run.runId}: frozen model binding mismatch`);
  }
  if (
    protocol.program !== plan.program ||
    !Number.isFinite(protocol.budget?.maximumModelSpendUsd)
  ) {
    throw new Error('frozen protocol identity or budget is invalid');
  }

  const candidate = await assertCandidateManifest(
    candidateManifest,
    options.candidateManifestPath,
    {
      runtimeRoot:
        run.arm === 'treatment'
          ? options.candidateRuntimeRoot
          : undefined,
    },
  );
  const sourceCommit = assertSourceCommit(options.sourceCommit);
  const controllerRoot =
    options.repositoryRoot ?? repositoryRoot;
  const candidateSourceTree =
    rawAuthorization.paid && candidate.source
    ? git(controllerRoot, [
        'rev-parse',
        `${candidate.source.commit}^{tree}`,
      ])
    : null;
  if (
    rawAuthorization.paid &&
    (candidate.source?.clean !== true ||
      candidate.source.repository !==
        'https://github.com/decantr-ai/decantr' ||
      candidate.source.tree !== candidateSourceTree ||
      candidate.source.dirtyStatusSha256 !== sha256('') ||
      candidate.source.trackedDiffSha256 !== sha256(''))
  ) {
    throw new Error(
      'paid split input requires a clean, Git-verifiable public candidate source',
    );
  }
  if (
    rawAuthorization.paid &&
    (git(controllerRoot, [
      'rev-parse',
      'HEAD',
    ]) !== sourceCommit ||
      git(controllerRoot, [
        'status',
        '--porcelain=v1',
        '--untracked-files=all',
      ]) !== '')
  ) {
    throw new Error(
      'paid split input requires a clean controller checkout at the workflow source commit',
    );
  }
  const authorization = await verifyRunAuthorization({
    authorizationPath: options.authorizationPath,
    expectedSha256: sha256(await readFile(options.authorizationPath)),
    expected: {
      runId: run.runId,
      partition: run.partition,
      modelId: run.modelId,
      runPlanSha256: plan.planSha256,
      candidateManifestSha256: candidate.manifestSha256,
      candidateTarballSetSha256: candidate.tarballSetSha256,
      maxRunCostUsd: model.maxRunCostUsd,
      protocolMaximumUsd:
        protocol.budget.maximumModelSpendUsd,
      developmentTaskCount: plan.tasks.filter(
        (item) => item.partition === 'development',
      ).length,
    },
    paid: rawAuthorization.paid,
    now: options.now,
  });

  assertPreparedWorkspace(options.workspace, task, prepared);
  verifyLockfiles(options.workspace, prepared.lockfiles);
  await verifyPreparedDependencyTree(options.workspace, prepared);
  const [agentController, evaluatorController] = await Promise.all([
    calculateStageControllerClosure('agent', {
      root: controllerRoot,
    }),
    calculateStageControllerClosure('evaluator', {
      root: controllerRoot,
    }),
  ]);
  const delivery =
    run.arm === 'treatment'
      ? buildTreatmentDelivery({
          task,
          candidate,
          candidateRuntimeRoot: options.candidateRuntimeRoot,
          workspace: options.workspace,
          environment: options.environment ?? process.env,
        })
      : buildControlDelivery(task);
  const request = assertSanitizedAgentRequest({
    schemaVersion: 'decantr-benchmark-adapter-request.v1',
    runId: run.runId,
    taskId: task.taskId,
    modelId: model.id,
    provider: model.provider,
    requestedModel: model.requestedModel,
    reasoningEffort: model.reasoningEffort,
    maxRunCostUsd: model.maxRunCostUsd,
    arm: run.arm,
    repetition: run.repetition,
    prompt: task.prompt,
    context: delivery.context,
    informationEntitlement:
      structuredClone(task.informationEntitlement),
    workspace: '/work',
    projectPath: task.projectPath,
    scope: structuredClone(task.scope),
    limits: structuredClone(task.limits),
    isolation: {
      home: '/home/benchmark-empty',
      personalSkills: false,
      personalMcp: false,
      hostConfiguration: false,
      network: rawAuthorization.paid
        ? 'audited-model-proxy-only'
        : 'none',
    },
    bindings: {
      authorizationSha256: authorization.sha256,
      planSha256: plan.planSha256,
      taskManifestSha256: sha256(taskBytes),
      candidateManifestSha256: candidate.manifestSha256,
      candidateTarballSetSha256:
        candidate.tarballSetSha256,
      runtimeMatrixSha256: runtimeMatrix.matrixSha256,
      preparedEnvironmentAttestationSha256:
        sha256(preparedBytes),
      environmentSha256: prepared.environmentSha256,
      environmentSpecSha256:
        task.environment.specSha256,
      environmentSubstanceSha256:
        task.environment.substanceSha256,
      agentControllerSha256:
        agentController.controllerSha256,
      agentImageDigest: profile.agentImage.digest,
      informationEntitlementSha256:
        task.informationEntitlementSha256,
      deliverySha256: sha256Canonical(delivery.document),
      baseCommit: task.base.commit,
      baseTree: task.base.tree,
    },
  });

  await Promise.all([
    writeCanonicalFile(join(agentInputRoot, 'request.json'), request),
    copyExact(
      options.authorizationPath,
      join(agentInputRoot, 'authorization.json'),
    ),
    copyExact(
      options.authorizationPath,
      join(evaluatorInputRoot, 'authorization.json'),
    ),
    copyExact(
      options.preparedEnvironmentPath,
      join(agentInputRoot, 'prepared-environment.json'),
    ),
    copyExact(
      options.preparedEnvironmentPath,
      join(evaluatorInputRoot, 'prepared-environment.json'),
    ),
    copyExact(
      options.taskManifestPath,
      join(evaluatorInputRoot, 'task.json'),
    ),
    copyExact(
      options.evaluatorContractPath,
      join(evaluatorInputRoot, 'contract.json'),
    ),
    cp(options.workspace, join(agentInputRoot, 'workspace'), {
      recursive: true,
      verbatimSymlinks: true,
      preserveTimestamps: true,
    }),
    cp(options.workspace, join(evaluatorInputRoot, 'workspace'), {
      recursive: true,
      verbatimSymlinks: true,
      preserveTimestamps: true,
    }),
    cp(options.evaluatorRoot, join(evaluatorInputRoot, 'evaluator'), {
      recursive: true,
      verbatimSymlinks: true,
      preserveTimestamps: true,
    }),
  ]);
  await copyAuthorizationCompanions({
    authorization: authorization.authorization,
    authorizationPath: options.authorizationPath,
    roots: [agentInputRoot, evaluatorInputRoot],
  });
  const manifests = await buildSplitInputManifests({
    agentInputRoot,
    evaluatorInputRoot,
    runId: run.runId,
    taskId: task.taskId,
    partition: run.partition,
    sourceCommit,
    agentImageReference: profile.agentImage.reference,
    agentImageDigest: profile.agentImage.digest,
    evaluatorImageReference:
      profile.benchmarkImage.reference,
    evaluatorImageDigest: profile.benchmarkImage.digest,
    evaluatorControllerSha256:
      evaluatorController.controllerSha256,
    repositoryRoot: controllerRoot,
  });
  return {
    agentInputRoot,
    evaluatorInputRoot,
    runId: run.runId,
    taskId: task.taskId,
    partition: run.partition,
    paid: authorization.authorization.paid,
    authorizationSha256: authorization.sha256,
    pairSha256: manifests.agentManifest.pairSha256,
  };
}

function assertRunAndTaskBindings(input) {
  const { run, plannedTask, task, taskBytes } = input;
  const expected = {
    taskId: task.taskId,
    partition: task.partition,
    repositoryId: task.repositoryId,
    framework: task.framework,
    projectPath: task.projectPath,
    corpusProjectPath: task.corpusProjectPath,
    corpusCommit: task.corpusCommit,
    base: task.base,
    candidateSha256: task.candidateSha256,
    informationEntitlementSha256:
      task.informationEntitlementSha256,
    environmentSpecSha256: task.environment.specSha256,
    environmentSubstanceSha256:
      task.environment.substanceSha256,
    runtimeProfileId: task.environment.runtimeProfileId,
    runtimeMatrixFileSha256:
      task.environment.runtimeMatrixFileSha256,
    runtimeMatrixSha256:
      task.environment.runtimeMatrixSha256,
    benchmarkImageDigest:
      task.environment.benchmarkImageDigest,
    evaluatorContractSha256:
      task.evaluator.contractSha256,
    evaluatorSpecSha256: task.evaluator.specSha256,
    oracleSourceSha256:
      task.evaluator.oracleSourceSha256,
    qualificationControllerSha256:
      task.evaluator.qualificationControllerSha256,
    qualificationReceiptFileSha256:
      task.evaluator.qualificationReceiptFileSha256,
    qualificationReceiptSha256:
      task.evaluator.qualificationReceiptSha256,
    qualificationExecutionAttestationFileSha256:
      task.evaluator
        .qualificationExecutionAttestationFileSha256,
    qualificationExecutionAttestationSha256:
      task.evaluator
        .qualificationExecutionAttestationSha256,
    qualificationExecutionControllerSha256:
      task.evaluator
        .qualificationExecutionControllerSha256,
    qualificationEvaluatorSourceClosureSha256:
      task.evaluator
        .qualificationEvaluatorSourceClosureSha256,
    qualificationInputRequestFileSha256:
      task.evaluator.qualificationInputRequestFileSha256,
    qualificationInputRequestSha256:
      task.evaluator.qualificationInputRequestSha256,
    qualificationInputManifestFileSha256:
      task.evaluator
        .qualificationInputManifestFileSha256,
    qualificationInputManifestSha256:
      task.evaluator.qualificationInputManifestSha256,
    qualificationRunnerRepositoryCommit:
      task.evaluator.qualificationRunnerRepositoryCommit,
    qualificationProvenanceBundleFileSha256:
      task.evaluator
        .qualificationProvenanceBundleFileSha256,
    qualificationProvenanceVerificationSha256:
      task.evaluator
        .qualificationProvenanceVerificationSha256,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (
      JSON.stringify(plannedTask[key]) !==
      JSON.stringify(value)
    ) {
      throw new Error(
        `${run.runId}: planned task ${key} binding mismatch`,
      );
    }
  }
  if (
    run.taskId !== task.taskId ||
    run.partition !== task.partition ||
    run.repositoryId !== task.repositoryId ||
    run.framework !== task.framework ||
    run.taskManifestSha256 !== sha256(taskBytes) ||
    plannedTask.manifestSha256 !== sha256(taskBytes)
  ) {
    throw new Error(`${run.runId}: task manifest binding mismatch`);
  }
}

function assertFrozenFileBinding(binding, bytes, label) {
  if (
    binding.sha256 !== sha256(bytes) ||
    binding.bytes !== bytes.byteLength
  ) {
    throw new Error(`${label} differs from the frozen run plan`);
  }
}

function assertPreparedWorkspace(workspace, task, prepared) {
  const status = git(workspace, [
    'status',
    '--porcelain=v1',
    '--untracked-files=all',
  ]);
  const commit = git(workspace, ['rev-parse', 'HEAD']);
  const tree = git(workspace, ['rev-parse', 'HEAD^{tree}']);
  if (
    status !== '' ||
    commit !== task.base.commit ||
    tree !== task.base.tree ||
    prepared.base.commit !== commit ||
    prepared.base.tree !== tree
  ) {
    throw new Error(
      `${task.taskId}: prepared workspace is not the clean frozen base`,
    );
  }
}

async function copyAuthorizationCompanions(input) {
  const sourceRoot = dirname(resolve(input.authorizationPath));
  for (const binding of [
    input.authorization.budgetApproval,
    input.authorization.powerPilot,
  ].filter(Boolean)) {
    if (
      binding.path !== basename(binding.path) ||
      [
        'authorization.json',
        'contract.json',
        'manifest.json',
        'prepared-environment.json',
        'request.json',
        'task.json',
        'workspace',
        'evaluator',
      ].includes(binding.path)
    ) {
      throw new Error(
        `authorization companion path is not a safe top-level filename: ${binding.path}`,
      );
    }
    const source = resolve(sourceRoot, binding.path);
    const metadata = await lstat(source);
    const bytes = await readFile(source);
    if (
      !metadata.isFile() ||
      metadata.isSymbolicLink() ||
      sha256(bytes) !== binding.sha256 ||
      bytes.byteLength !== binding.bytes
    ) {
      throw new Error(
        `authorization companion differs from its binding: ${binding.path}`,
      );
    }
    await Promise.all(
      input.roots.map((root) =>
        copyExact(source, join(root, binding.path)),
      ),
    );
  }
}

async function copyExact(source, destination) {
  const metadata = await lstat(source);
  if (!metadata.isFile() || metadata.isSymbolicLink()) {
    throw new Error(`expected a regular input file: ${source}`);
  }
  await cp(source, destination, {
    force: false,
    preserveTimestamps: true,
  });
}

async function assertEmptyDirectory(path) {
  await mkdir(path, { recursive: true, mode: 0o700 });
  if ((await readdir(path)).length !== 0) {
    throw new Error(`split-input output is not empty: ${path}`);
  }
}

function assertSourceCommit(value) {
  if (!GIT_SHA.test(value ?? '')) {
    throw new Error('source commit must be a full Git SHA');
  }
  return value;
}

function git(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function parseArgs(argv) {
  const options = {
    modelsPath: join(benchmarkRoot, 'models.json'),
    protocolPath: join(benchmarkRoot, 'protocol.json'),
    repositoryRoot,
    environment: process.env,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--plan') {
      options.planPath = resolve(argv[++index]);
    } else if (argument === '--run-id') {
      options.runId = argv[++index];
    } else if (argument === '--task-manifest') {
      options.taskManifestPath = resolve(argv[++index]);
    } else if (argument === '--workspace') {
      options.workspace = resolve(argv[++index]);
    } else if (argument === '--prepared-environment') {
      options.preparedEnvironmentPath = resolve(argv[++index]);
    } else if (argument === '--evaluator-contract') {
      options.evaluatorContractPath = resolve(argv[++index]);
    } else if (argument === '--evaluator-root') {
      options.evaluatorRoot = resolve(argv[++index]);
    } else if (argument === '--candidate-manifest') {
      options.candidateManifestPath = resolve(argv[++index]);
    } else if (argument === '--candidate-runtime-root') {
      options.candidateRuntimeRoot = resolve(argv[++index]);
    } else if (argument === '--runtime-matrix') {
      options.runtimeMatrixPath = resolve(argv[++index]);
    } else if (argument === '--authorization') {
      options.authorizationPath = resolve(argv[++index]);
    } else if (argument === '--models') {
      options.modelsPath = resolve(argv[++index]);
    } else if (argument === '--protocol') {
      options.protocolPath = resolve(argv[++index]);
    } else if (argument === '--source-commit') {
      options.sourceCommit = argv[++index];
    } else if (argument === '--repository-root') {
      options.repositoryRoot = resolve(argv[++index]);
    } else if (argument === '--out') {
      options.outputRoot = resolve(argv[++index]);
    } else if (argument === '--now') {
      options.now = argv[++index];
    } else {
      throw new Error(`unknown option: ${argument}`);
    }
  }
  for (const key of [
    'planPath',
    'runId',
    'taskManifestPath',
    'workspace',
    'preparedEnvironmentPath',
    'evaluatorContractPath',
    'evaluatorRoot',
    'candidateManifestPath',
    'runtimeMatrixPath',
    'authorizationPath',
    'sourceCommit',
    'outputRoot',
  ]) {
    if (!options[key]) throw new Error(`missing required option: ${key}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await prepareSplitRunInput(
      parseArgs(process.argv.slice(2)),
    );
    process.stdout.write(
      prettyCanonicalJson({ ok: true, ...result }),
    );
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
