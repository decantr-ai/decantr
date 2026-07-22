#!/usr/bin/env node
import { readdir } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fileBinding, readJsonFile, sha256, writeCanonicalFile } from './canonical.mjs';
import {
  assertQualificationIndex,
  assertRunPlan,
  assertTaskManifest,
  calculateRunPlanDigest,
} from './contracts.mjs';
import { assertRuntimeMatrix } from '../environments/runtime-matrix.mjs';

const benchmarkDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function buildRunPlan(options) {
  if (typeof options.seed !== 'string' || options.seed.length < 16) {
    throw new Error('--seed is required and must contain at least 16 characters');
  }
  const corpus = await readJsonFile(options.corpusPath);
  const models = await readJsonFile(options.modelsPath);
  const protocol = await readJsonFile(options.protocolPath);
  const runtimeMatrix = assertRuntimeMatrix(await readJsonFile(options.runtimeMatrixPath), { requireLocked: true });
  const qualificationIndex = assertQualificationIndex(await readJsonFile(options.qualificationIndexPath));
  const developmentFiles = await listJsonFiles(options.tasksDirectory);
  if (developmentFiles.length === 0) throw new Error('development task directory is empty');

  const development = [];
  for (const path of developmentFiles) {
    const task = assertTaskManifest(await readJsonFile(path), 'development');
    development.push({
      task,
      path,
      binding: await fileBinding(path, `development-task:${task.taskId}`),
      sourceRef: relative(options.tasksDirectory, path).replaceAll('\\', '/'),
    });
  }

  validateFrozenInputs(corpus, models, protocol);
  if (
    typeof protocol.design.randomizationSeed === 'string' &&
    options.seed !== protocol.design.randomizationSeed
  ) {
    throw new Error('--seed does not match protocol.design.randomizationSeed');
  }
  const tasks = combineAndValidateTasks(corpus, protocol, development, qualificationIndex);
  const runtimeMatrixBinding = await fileBinding(options.runtimeMatrixPath, basename(options.runtimeMatrixPath));
  validateRuntimeMatrixTasks(tasks, runtimeMatrix, runtimeMatrixBinding.sha256);
  const bindings = {
    corpus: await fileBinding(options.corpusPath, basename(options.corpusPath)),
    models: await fileBinding(options.modelsPath, basename(options.modelsPath)),
    protocol: await fileBinding(options.protocolPath, basename(options.protocolPath)),
    runtimeMatrix: runtimeMatrixBinding,
    qualificationTaskIndex: await fileBinding(
      options.qualificationIndexPath,
      basename(options.qualificationIndexPath),
    ),
    developmentTasks: development
      .map(({ binding }) => binding)
      .sort((left, right) => left.logicalName.localeCompare(right.logicalName)),
  };

  const arms = experimentArms(protocol);
  const taskBlocks = deterministicOrder(tasks, `${options.seed}:task-blocks`);
  const runs = [];
  for (let blockIndex = 0; blockIndex < taskBlocks.length; blockIndex += 1) {
    const task = taskBlocks[blockIndex];
    const combinations = [];
    for (const model of models.models) {
      for (const arm of arms) {
        for (let repetition = 1; repetition <= protocol.design.repetitions; repetition += 1) {
          combinations.push({ model, arm, repetition });
        }
      }
    }
    for (const combination of deterministicOrder(combinations, `${options.seed}:${task.taskId}`)) {
      const identity = {
        seed: options.seed,
        taskId: task.taskId,
        modelId: combination.model.id,
        arm: combination.arm,
        repetition: combination.repetition,
      };
      runs.push({
        runId: `run-${sha256(JSON.stringify(identity)).slice(0, 24)}`,
        ordinal: runs.length + 1,
        block: blockIndex + 1,
        taskId: task.taskId,
        partition: task.partition,
        repositoryId: task.repositoryId,
        framework: task.framework,
        modelId: combination.model.id,
        provider: combination.model.provider,
        requestedModel: combination.model.requestedModel,
        arm: combination.arm,
        repetition: combination.repetition,
        taskManifestSha256: task.manifestSha256,
      });
    }
  }

  const plan = {
    schemaVersion: 'decantr-benchmark-run-plan.v2',
    program: protocol.program,
    seed: options.seed,
    bindings,
    design: {
      tasks: tasks.length,
      models: models.models.length,
      arms: arms.length,
      repetitions: protocol.design.repetitions,
      totalRuns: runs.length,
    },
    tasks: tasks.sort((left, right) => left.taskId.localeCompare(right.taskId)),
    runs,
  };
  plan.planSha256 = calculateRunPlanDigest(plan);
  return assertRunPlan(plan);
}

function validateRuntimeMatrixTasks(tasks, matrix, matrixFileSha256) {
  const expected = new Map();
  for (const task of tasks) expected.set(task.runtimeProfileId, (expected.get(task.runtimeProfileId) ?? 0) + 1);
  const profiles = new Map(matrix.profiles.map((profile) => [profile.id, profile]));
  const actual = new Map(matrix.profiles.map((profile) => [profile.id, profile.taskCount]));
  if (expected.size !== actual.size) throw new Error('runtime matrix profile set differs from planned tasks');
  for (const [profileId, count] of expected) {
    if (actual.get(profileId) !== count) {
      throw new Error(`${profileId}: runtime matrix task count differs from planned tasks`);
    }
  }
  for (const task of tasks) {
    const profile = profiles.get(task.runtimeProfileId);
    if (!profile) throw new Error(`${task.taskId}: runtime profile is absent from locked matrix`);
    if (task.runtimeMatrixFileSha256 !== matrixFileSha256) {
      throw new Error(`${task.taskId}: runtime matrix file binding differs from locked matrix bytes`);
    }
    if (task.runtimeMatrixSha256 !== matrix.matrixSha256) {
      throw new Error(`${task.taskId}: runtime matrix binding differs from locked matrix identity`);
    }
    if (task.benchmarkImageDigest !== profile.benchmarkImage.digest) {
      throw new Error(`${task.taskId}: benchmark image binding differs from locked runtime profile`);
    }
  }
}

function validateFrozenInputs(corpus, models, protocol) {
  if (corpus.schemaVersion !== 'decantr-benchmark-corpus.v1' || corpus.repositories?.length !== 28) {
    throw new Error('frozen corpus must contain exactly 28 repositories');
  }
  if (models.schemaVersion !== 'decantr-benchmark-model-lock.v1' || models.models?.length !== 2) {
    throw new Error('frozen model lock must contain exactly two models');
  }
  if (protocol.schemaVersion !== 'decantr-benchmark-protocol.v1') throw new Error('unsupported protocol');
  const design = protocol.design;
  if (
    design.taskCount !== 40 ||
    design.repositoryTaskCount !== 28 ||
    design.adversarialTaskCount !== 12 ||
    design.repositoryTaskCount + design.adversarialTaskCount !== design.taskCount
  ) {
    throw new Error('protocol task design must remain 40 total, 28 repository, and 12 adversarial');
  }
  if (
    !Number.isInteger(design.minimumQualificationTasks) ||
    design.minimumQualificationTasks < 1 ||
    design.minimumQualificationTasks > design.taskCount
  ) {
    throw new Error('protocol minimumQualificationTasks is invalid');
  }
  const arithmetic = design.taskCount * design.models * design.arms * design.repetitions;
  if (arithmetic !== design.totalRuns || arithmetic !== 320) {
    throw new Error(`protocol arithmetic drift: expected 320 runs, found ${arithmetic}`);
  }
  if (design.models !== models.models.length || design.arms !== experimentArms(protocol).length) {
    throw new Error('protocol model or arm count does not match frozen inputs');
  }
}

function experimentArms(protocol) {
  const arms = ['control', 'treatment'].filter((arm) => typeof protocol.arms?.[arm] === 'string');
  if (arms.length !== 2) throw new Error('protocol must define control and treatment arms');
  return arms;
}

function combineAndValidateTasks(corpus, protocol, development, qualificationIndex) {
  const repositories = new Map(corpus.repositories.map((repository) => [repository.id, repository]));
  const tasks = development.map(({ task, binding, sourceRef }) => ({
    taskId: task.taskId,
    partition: task.partition,
    kind: task.kind,
    repositoryId: task.repositoryId,
    framework: task.framework,
    projectPath: task.projectPath,
    corpusProjectPath: task.corpusProjectPath,
    corpusCommit: task.corpusCommit,
    base: task.base,
    manifestSha256: binding.sha256,
    candidateSha256: task.candidateSha256,
    evaluatorContractSha256: task.evaluator.contractSha256,
    evaluatorSpecSha256: task.evaluator.specSha256,
    oracleSourceSha256: task.evaluator.oracleSourceSha256,
    qualificationControllerSha256: task.evaluator.qualificationControllerSha256,
    qualificationReceiptFileSha256: task.evaluator.qualificationReceiptFileSha256,
    qualificationReceiptSha256: task.evaluator.qualificationReceiptSha256,
    qualificationExecutionAttestationFileSha256:
      task.evaluator.qualificationExecutionAttestationFileSha256,
    qualificationExecutionAttestationSha256: task.evaluator.qualificationExecutionAttestationSha256,
    qualificationExecutionControllerSha256: task.evaluator.qualificationExecutionControllerSha256,
    qualificationEvaluatorSourceClosureSha256:
      task.evaluator.qualificationEvaluatorSourceClosureSha256,
    qualificationInputRequestFileSha256: task.evaluator.qualificationInputRequestFileSha256,
    qualificationInputRequestSha256: task.evaluator.qualificationInputRequestSha256,
    qualificationInputManifestFileSha256: task.evaluator.qualificationInputManifestFileSha256,
    qualificationInputManifestSha256: task.evaluator.qualificationInputManifestSha256,
    qualificationRunnerRepositoryCommit: task.evaluator.qualificationRunnerRepositoryCommit,
    qualificationProvenanceBundleFileSha256:
      task.evaluator.qualificationProvenanceBundleFileSha256,
    qualificationProvenanceVerificationSha256:
      task.evaluator.qualificationProvenanceVerificationSha256,
    informationEntitlementSha256: task.informationEntitlementSha256,
    environmentSpecSha256: task.environment.specSha256,
    environmentSubstanceSha256: task.environment.substanceSha256,
    runtimeProfileId: task.environment.runtimeProfileId,
    runtimeMatrixFileSha256: task.environment.runtimeMatrixFileSha256,
    runtimeMatrixSha256: task.environment.runtimeMatrixSha256,
    benchmarkImageDigest: task.environment.benchmarkImageDigest,
    sourceRef,
  }));
  for (const task of qualificationIndex.tasks) {
    tasks.push({
      taskId: task.taskId,
      partition: 'qualification',
      kind: task.kind,
      repositoryId: task.repositoryId,
      framework: task.framework,
      projectPath: task.projectPath,
      corpusProjectPath: task.corpusProjectPath,
      corpusCommit: task.corpusCommit,
      base: task.base,
      manifestSha256: task.manifestSha256,
      candidateSha256: task.candidateSha256,
      evaluatorContractSha256: task.evaluatorContractSha256,
      evaluatorSpecSha256: task.evaluatorSpecSha256,
      oracleSourceSha256: task.oracleSourceSha256,
      qualificationControllerSha256: task.qualificationControllerSha256,
      qualificationReceiptFileSha256: task.qualificationReceiptFileSha256,
      qualificationReceiptSha256: task.qualificationReceiptSha256,
      qualificationExecutionAttestationFileSha256: task.qualificationExecutionAttestationFileSha256,
      qualificationExecutionAttestationSha256: task.qualificationExecutionAttestationSha256,
      qualificationExecutionControllerSha256: task.qualificationExecutionControllerSha256,
      qualificationEvaluatorSourceClosureSha256: task.qualificationEvaluatorSourceClosureSha256,
      qualificationInputRequestFileSha256: task.qualificationInputRequestFileSha256,
      qualificationInputRequestSha256: task.qualificationInputRequestSha256,
      qualificationInputManifestFileSha256: task.qualificationInputManifestFileSha256,
      qualificationInputManifestSha256: task.qualificationInputManifestSha256,
      qualificationRunnerRepositoryCommit: task.qualificationRunnerRepositoryCommit,
      qualificationProvenanceBundleFileSha256: task.qualificationProvenanceBundleFileSha256,
      qualificationProvenanceVerificationSha256: task.qualificationProvenanceVerificationSha256,
      informationEntitlementSha256: task.informationEntitlementSha256,
      environmentSpecSha256: task.environmentSpecSha256,
      environmentSubstanceSha256: task.environmentSubstanceSha256,
      runtimeProfileId: task.runtimeProfileId,
      runtimeMatrixFileSha256: task.runtimeMatrixFileSha256,
      runtimeMatrixSha256: task.runtimeMatrixSha256,
      benchmarkImageDigest: task.benchmarkImageDigest,
      sourceRef: task.hiddenRef,
    });
  }
  const seen = new Set();
  for (const task of tasks) {
    if (seen.has(task.taskId)) throw new Error(`duplicate task id: ${task.taskId}`);
    seen.add(task.taskId);
    const repository = repositories.get(task.repositoryId);
    if (!repository) throw new Error(`${task.taskId}: unknown repository ${task.repositoryId}`);
    if (
      task.framework !== repository.framework ||
      task.corpusProjectPath !== repository.projectPath ||
      task.corpusCommit !== repository.commit
    ) {
      throw new Error(
        `${task.taskId}: framework, corpusProjectPath, or corpusCommit differs from corpus`,
      );
    }
  }
  if (tasks.length !== protocol.design.taskCount) {
    throw new Error(`missing task manifests: expected ${protocol.design.taskCount}, found ${tasks.length}`);
  }
  const repositoryTasks = tasks.filter((task) => task.kind === 'repository');
  const adversarialTasks = tasks.filter((task) => task.kind === 'adversarial');
  if (repositoryTasks.length !== protocol.design.repositoryTaskCount) {
    throw new Error(`repository task arithmetic drift: ${repositoryTasks.length}`);
  }
  if (adversarialTasks.length !== protocol.design.adversarialTaskCount) {
    throw new Error(`adversarial task arithmetic drift: ${adversarialTasks.length}`);
  }
  const repositoryCoverage = new Map();
  for (const task of repositoryTasks) {
    repositoryCoverage.set(task.repositoryId, (repositoryCoverage.get(task.repositoryId) ?? 0) + 1);
  }
  for (const repository of corpus.repositories) {
    if (repositoryCoverage.get(repository.id) !== 1) {
      throw new Error(`repository task coverage must be exactly one for ${repository.id}`);
    }
  }
  const developmentCount = tasks.filter((task) => task.partition === 'development').length;
  const qualificationCount = tasks.filter((task) => task.partition === 'qualification').length;
  const qualificationTaskCount = Number(protocol.design.minimumQualificationTasks);
  const developmentTaskCount = protocol.design.taskCount - qualificationTaskCount;
  if (qualificationCount !== qualificationTaskCount || developmentCount !== developmentTaskCount) {
    throw new Error(
      `task partitions must contain ${developmentTaskCount} development and ${qualificationTaskCount} qualification tasks; found ${developmentCount}/${qualificationCount}`,
    );
  }
  return tasks;
}

function deterministicOrder(values, seed) {
  return [...values].sort((left, right) => {
    const leftKey = sha256(`${seed}:${stableIdentity(left)}`);
    const rightKey = sha256(`${seed}:${stableIdentity(right)}`);
    return leftKey.localeCompare(rightKey) || stableIdentity(left).localeCompare(stableIdentity(right));
  });
}

function stableIdentity(value) {
  if (value.taskId) return value.taskId;
  return `${value.model.id}:${value.arm}:${value.repetition}`;
}

async function listJsonFiles(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await listJsonFiles(path)));
    else if (entry.isFile() && entry.name.endsWith('.json')) output.push(path);
  }
  return output.sort();
}

function parseArgs(argv) {
  const options = {
    corpusPath: join(benchmarkDirectory, 'corpus.json'),
    modelsPath: join(benchmarkDirectory, 'models.json'),
    protocolPath: join(benchmarkDirectory, 'protocol.json'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--seed') options.seed = argv[++index];
    else if (argument === '--tasks-dir') options.tasksDirectory = resolve(argv[++index]);
    else if (argument === '--qualification-index') options.qualificationIndexPath = resolve(argv[++index]);
    else if (argument === '--corpus') options.corpusPath = resolve(argv[++index]);
    else if (argument === '--models') options.modelsPath = resolve(argv[++index]);
    else if (argument === '--protocol') options.protocolPath = resolve(argv[++index]);
    else if (argument === '--runtime-matrix') options.runtimeMatrixPath = resolve(argv[++index]);
    else if (argument === '--out') options.outputPath = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argument}`);
  }
  for (const name of ['seed', 'tasksDirectory', 'qualificationIndexPath', 'runtimeMatrixPath', 'outputPath']) {
    if (!options[name]) throw new Error(`Missing required option: ${name}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const plan = await buildRunPlan(options);
    await writeCanonicalFile(options.outputPath, plan);
    console.log(JSON.stringify({ ok: true, output: options.outputPath, planSha256: plan.planSha256, runs: plan.runs.length }));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
