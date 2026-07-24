#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  canonicalJson,
  fileBinding,
  prettyCanonicalJson,
  readJsonFile,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from '../runner/canonical.mjs';
import {
  assertRunRecordV3,
  runCoreFromRecord,
} from '../runner/run-record.mjs';
import { verifyRunAuthorization } from '../runner/run-authorization.mjs';
import {
  assertAgentStageAttestation,
  assertEvaluatorStageAttestation,
  assertStageProvenanceVerification,
  stageProvenancePolicy,
  verifyStageProvenance,
} from '../runner/stage-provenance.mjs';
import { calculateStageControllerClosure } from '../runner/stage-controller.mjs';
import {
  assertBudgetApproval,
  assertCandidateManifest,
  assertEvaluatorContract,
  assertPowerPilot,
  assertQualificationIndex,
  assertRunPlan,
  assertTaskManifest,
  expectedAnalysisSeed,
  expectedReviewSeed,
} from '../runner/contracts.mjs';
import {
  assertFixedCommand,
  isForbiddenDecantrOracleToken,
  resolveContained,
} from '../runner/process.mjs';
import {
  assertTaskEnvironmentSpec,
  taskEnvironmentSubstanceSha256,
} from '../environments/contracts.mjs';
import { assertRuntimeMatrix } from '../environments/runtime-matrix.mjs';
import { assertPreparedEnvironment } from '../environments/prepared-environment.mjs';
import {
  assertQualificationReceipt,
  assertQualificationResultArtifact,
  assertStrictQualificationPolarity,
  calculatePrequalificationBundleDigest,
  calculateQualificationControllerDigest,
} from '../evaluators/qualification-task.mjs';
import {
  assertExecutionAttestation,
  calculateContainerControllerClosure,
} from '../evaluators/container-orchestrator.mjs';
import {
  qualificationProvenanceBundleFilename,
  qualificationProvenancePolicy,
  verifyQualificationProvenance,
} from '../evaluators/qualification-provenance.mjs';

const FUNCTIONAL_NONINFERIORITY_RULE =
  'treatment functional success no worse than control by more than 5 percentage points overall within each model; framework strata are reported as exploratory unless independently powered';
const BLIND_PREFERENCE_RULE =
  'at least 26 of 32 qualification task/model units are decisive, treatment is preferred in at least 60% of decisive units, and the two-sided 95% Wilson lower confidence bound is greater than 50%';
const REQUIRED_STATISTICAL_GATES = [
  'evidenceComplete',
  'modelLift',
  'governanceReduction',
  'governanceCi',
  'functionalNonInferiority',
  'blindPreference',
  'medianOverhead',
  'tailOverhead',
  'failureVisibility',
];
const benchmarkDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function auditReleaseGate(options) {
  const errors = [];
  const loaded = {};
  for (const [name, path] of Object.entries({
    corpus: options.corpusPath,
    models: options.modelsPath,
    protocol: options.protocolPath,
    runtimeMatrix: options.runtimeMatrixPath,
    qualificationIndex: options.qualificationIndexPath,
    plan: options.planPath,
    candidateManifest: options.candidateManifestPath,
    hiddenEvaluatorManifest: options.hiddenEvaluatorManifestPath,
    assignments: options.assignmentsPath,
    reviews: options.reviewWorkbookPath,
    statistics: options.statisticsPath,
    powerPilot: options.powerPilotPath,
    budgetApproval: options.budgetApprovalPath,
    claims: options.claimsPath,
  })) {
    try {
      loaded[name] = await readJsonFile(path);
    } catch (error) {
      errors.push(`${name}: missing or invalid JSON (${error.message})`);
    }
  }
  if (errors.length > 0) return finish(options, errors, {});

  let plan;
  let qualification;
  let candidate;
  let runtimeMatrix;
  try {
    plan = assertRunPlan(loaded.plan);
    qualification = assertQualificationIndex(loaded.qualificationIndex);
    candidate = await assertCandidateManifest(loaded.candidateManifest, options.candidateManifestPath);
    runtimeMatrix = assertRuntimeMatrix(loaded.runtimeMatrix, { requireLocked: true });
  } catch (error) {
    errors.push(error.message);
    return finish(options, errors, {});
  }
  if (!candidate.contextProvider) {
    errors.push('candidate manifest does not bind a treatment context provider');
  }
  if (!candidate.source || candidate.source.clean !== true) {
    errors.push('release candidate manifest does not bind a clean Git source');
  }

  await checkFrozenBinding(plan.bindings.corpus, options.corpusPath, errors, 'corpus');
  await checkFrozenBinding(plan.bindings.models, options.modelsPath, errors, 'models');
  await checkFrozenBinding(plan.bindings.protocol, options.protocolPath, errors, 'protocol');
  await checkFrozenBinding(plan.bindings.runtimeMatrix, options.runtimeMatrixPath, errors, 'runtime matrix');
  await checkFrozenBinding(
    plan.bindings.qualificationTaskIndex,
    options.qualificationIndexPath,
    errors,
    'qualification task index',
  );
  validateProgramArithmetic(loaded.corpus, loaded.models, loaded.protocol, plan, qualification, errors);
  const developmentTaskById = await checkDevelopmentTaskBindings(
    plan,
    options.developmentTaskRoot,
    errors,
  );
  const qualificationTaskById = await checkQualificationTaskBindings(
    plan,
    options.qualificationTaskRoot,
    errors,
  );
  const taskManifestById = new Map([...developmentTaskById, ...qualificationTaskById]);
  const environmentByTask = await checkTaskEnvironmentBindings(
    plan,
    options.developmentEnvironmentRoot,
    options.qualificationEnvironmentRoot,
    errors,
  );
  const preparedEnvironmentByTask = await checkPreparedEnvironmentBindings(
    plan,
    options.developmentEnvironmentRoot,
    options.qualificationEnvironmentRoot,
    options.preparedEnvironmentRoot,
    runtimeMatrix,
    errors,
  );

  const qualificationIndexSha256 = sha256(await readFile(options.qualificationIndexPath));
  const evaluatorByTask = await checkEvaluatorBindings({
    plan,
    qualification,
    qualificationIndexSha256,
    hiddenManifest: loaded.hiddenEvaluatorManifest,
    hiddenManifestPath: options.hiddenEvaluatorManifestPath,
    developmentReceiptRoot: options.developmentReceiptRoot,
    qualificationReceiptRoot: options.qualificationReceiptRoot,
    taskManifestById,
    errors,
  });
  const qualificationReceiptByTask = await checkQualificationReceiptChains({
    plan,
    qualification,
    corpusSha256: sha256(await readFile(options.corpusPath)),
    runtimeMatrix,
    runtimeMatrixFileSha256: sha256(await readFile(options.runtimeMatrixPath)),
    taskManifestById,
    environmentByTask,
    preparedEnvironmentByTask,
    evaluatorByTask,
    developmentReceiptRoot: options.developmentReceiptRoot,
    qualificationReceiptRoot: options.qualificationReceiptRoot,
    provenanceVerifier: options.provenanceVerifier ?? verifyQualificationProvenance,
    cosignPath: options.cosignPath,
    errors,
  });

  const recordAudit = await auditRunRecords({
    plan,
    recordRoot: options.recordRoot,
    candidate,
    candidateManifestSha256: candidate.manifestSha256,
    models: loaded.models,
    protocol: loaded.protocol,
    budgetApprovalPath: options.budgetApprovalPath,
    powerPilotPath: options.powerPilotPath,
    runtimeMatrix,
    preparedEnvironmentByTask,
    qualificationReceiptByTask,
    stageProvenanceVerifier:
      options.stageProvenanceVerifier ?? verifyStageProvenance,
    stageControllers: {
      agent: await calculateStageControllerClosure('agent', {
        root: resolve(benchmarkDirectory, '..', '..'),
      }),
      evaluator: await calculateStageControllerClosure('evaluator', {
        root: resolve(benchmarkDirectory, '..', '..'),
      }),
    },
    cosignPath: options.cosignPath,
    errors,
  });
  const powerPilotAudit = await auditPowerPilotEvidence({
    report: loaded.powerPilot,
    path: options.powerPilotPath,
    plan,
    candidate,
    recordAudit,
    errors,
  });
  const assignmentsBytes = await readFile(options.assignmentsPath);
  const reviewsBytes = await readFile(options.reviewWorkbookPath);
  const statisticsBytes = await readFile(options.statisticsPath);
  const assignmentsSha256 = sha256(assignmentsBytes);
  const reviewsSha256 = sha256(reviewsBytes);
  const statisticsSha256 = sha256(statisticsBytes);
  const analysisCodeSha256 = sha256(
    await readFile(join(benchmarkDirectory, 'statistics', 'analyze.mjs')),
  );
  auditReviews(
    loaded.assignments,
    loaded.reviews,
    assignmentsSha256,
    plan,
    recordAudit.qualificationRecordSetSha256,
    recordAudit.recordDigestByRun,
    errors,
  );
  auditStatistics(
    loaded.statistics,
    {
      planSha256: plan.planSha256,
      analysisCodeSha256,
      plan,
      protocol: loaded.protocol,
      protocolSha256: plan.bindings.protocol.sha256,
      qualificationIndexSha256,
      qualification,
      qualificationRecordSetSha256: recordAudit.qualificationRecordSetSha256,
      assignmentsSha256,
      reviewsSha256,
    },
    errors,
  );
  auditBudgetApproval(
    loaded.budgetApproval,
    loaded.models,
    loaded.protocol,
    plan.planSha256,
    candidate.tarballSetSha256,
    powerPilotAudit.sha256,
    errors,
  );
  if (
    recordAudit.approvalIds.size !== 1 ||
    !recordAudit.approvalIds.has(loaded.budgetApproval.approvalId)
  ) {
    errors.push('run records are not uniformly bound to the supplied budget approval');
  }
  if (recordAudit.actualCostUsd > loaded.budgetApproval.maximumSpendUsd + Number.EPSILON) {
    errors.push('aggregate run-record cost exceeds the approved budget');
  }
  auditClaims(
    loaded.claims,
    loaded.statistics,
    statisticsSha256,
    candidate.tarballSetSha256,
    loaded.protocol,
    plan,
    errors,
  );

  return finish(options, errors, {
    runPlanSha256: plan.planSha256,
    candidateManifestSha256: candidate.manifestSha256,
    candidateTarballSetSha256: candidate.tarballSetSha256,
    runtimeMatrixSha256: runtimeMatrix.matrixSha256,
    qualificationTaskIndexSha256: qualificationIndexSha256,
    allRunRecordSetSha256: recordAudit.allRecordSetSha256,
    developmentRunRecordSetSha256: recordAudit.developmentRecordSetSha256,
    qualificationRunRecordSetSha256: recordAudit.qualificationRecordSetSha256,
    assignmentsSha256,
    reviewWorkbookSha256: reviewsSha256,
    statisticsSha256,
    powerPilotSha256: powerPilotAudit.sha256,
    expectedRuns: plan.runs.length,
    observedRuns: recordAudit.observed,
  });
}

async function checkFrozenBinding(expected, path, errors, label) {
  try {
    const actual = await fileBinding(path, expected.logicalName);
    if (actual.sha256 !== expected.sha256 || actual.bytes !== expected.bytes) {
      errors.push(`${label}: bytes do not match run-plan binding`);
    }
  } catch (error) {
    errors.push(`${label}: unable to verify binding (${error.message})`);
  }
}

function validateProgramArithmetic(corpus, models, protocol, plan, qualification, errors) {
  if (corpus.schemaVersion !== 'decantr-benchmark-corpus.v1' || corpus.repositories?.length !== 28) {
    errors.push('corpus must contain the frozen 28 repositories');
  }
  if (models.schemaVersion !== 'decantr-benchmark-model-lock.v1' || models.models?.length !== 2) {
    errors.push('model lock must contain exactly two models');
  }
  const design = protocol.design ?? {};
  if (
    protocol.schemaVersion !== 'decantr-benchmark-protocol.v1' ||
    design.taskCount !== 40 ||
    design.repositoryTaskCount !== 28 ||
    design.adversarialTaskCount !== 12 ||
    design.totalRuns !== 320
  ) {
    errors.push('protocol must be the frozen 320-run design');
  }
  if (
    protocol.releaseGates?.functionalNonInferiority !== FUNCTIONAL_NONINFERIORITY_RULE ||
    protocol.releaseGates?.blindPreference !== BLIND_PREFERENCE_RULE
  ) {
    errors.push('protocol statistical gate semantics are not recognized by this release audit');
  }
  if (
    plan.tasks.length !== design.taskCount ||
    plan.runs.length !== design.totalRuns ||
    plan.design.tasks !== design.taskCount ||
    plan.design.models !== design.models ||
    plan.design.arms !== design.arms ||
    plan.design.repetitions !== design.repetitions ||
    plan.design.totalRuns !== design.totalRuns
  ) {
    errors.push('run plan must contain 40 tasks and 320 runs');
  }
  const partitions = {
    development: plan.tasks.filter((task) => task.partition === 'development').length,
    qualification: plan.tasks.filter((task) => task.partition === 'qualification').length,
  };
  const kinds = {
    repository: plan.tasks.filter((task) => task.kind === 'repository').length,
    adversarial: plan.tasks.filter((task) => task.kind === 'adversarial').length,
  };
  const qualificationTaskCount = Number(design.minimumQualificationTasks);
  const developmentTaskCount = design.taskCount - qualificationTaskCount;
  if (
    partitions.qualification !== qualification.tasks.length ||
    partitions.qualification !== qualificationTaskCount ||
    partitions.development !== developmentTaskCount ||
    partitions.development + partitions.qualification !== design.taskCount
  ) {
    errors.push(
      `run plan and sealed index must contain ${developmentTaskCount} development and ${qualificationTaskCount} qualification tasks`,
    );
  }
  if (
    kinds.repository !== design.repositoryTaskCount ||
    kinds.adversarial !== design.adversarialTaskCount
  ) {
    errors.push('run plan task kinds must be 28 repository and 12 adversarial');
  }
  if (
    typeof protocol.design?.randomizationSeed === 'string' &&
    plan.seed !== protocol.design.randomizationSeed
  ) {
    errors.push('run plan seed differs from the committed protocol randomization seed');
  }

  const repositories = new Map((corpus.repositories ?? []).map((repository) => [repository.id, repository]));
  const repositoryCoverage = new Map();
  for (const task of plan.tasks) {
    const repository = repositories.get(task.repositoryId);
    if (!repository) {
      errors.push(`${task.taskId}: run plan references unknown repository ${task.repositoryId}`);
      continue;
    }
    if (
      task.framework !== repository.framework ||
      task.corpusProjectPath !== repository.projectPath ||
      task.corpusCommit !== repository.commit
    ) {
      errors.push(
        `${task.taskId}: framework, corpusProjectPath, or corpusCommit differs from the frozen corpus`,
      );
    }
    if (task.kind === 'repository') {
      repositoryCoverage.set(task.repositoryId, (repositoryCoverage.get(task.repositoryId) ?? 0) + 1);
    }
  }
  for (const repository of corpus.repositories ?? []) {
    if (repositoryCoverage.get(repository.id) !== 1) {
      errors.push(`repository task coverage must be exactly one for ${repository.id}`);
    }
  }

  const qualificationById = new Map(qualification.tasks.map((task) => [task.taskId, task]));
  for (const task of plan.tasks.filter((item) => item.partition === 'qualification')) {
    const indexed = qualificationById.get(task.taskId);
    if (!indexed) {
      errors.push(`${task.taskId}: qualification task is absent from the sealed index`);
      continue;
    }
    const fields = [
      'kind',
      'repositoryId',
      'framework',
      'projectPath',
      'corpusProjectPath',
      'corpusCommit',
      'manifestSha256',
      'candidateSha256',
      'evaluatorContractSha256',
      'evaluatorSpecSha256',
      'oracleSourceSha256',
      'qualificationControllerSha256',
      'qualificationReceiptFileSha256',
      'qualificationReceiptSha256',
      'qualificationExecutionAttestationFileSha256',
      'qualificationExecutionAttestationSha256',
      'qualificationExecutionControllerSha256',
      'qualificationEvaluatorSourceClosureSha256',
      'qualificationInputRequestFileSha256',
      'qualificationInputRequestSha256',
      'qualificationInputManifestFileSha256',
      'qualificationInputManifestSha256',
      'qualificationRunnerRepositoryCommit',
      'qualificationProvenanceBundleFileSha256',
      'qualificationProvenanceVerificationSha256',
      'informationEntitlementSha256',
      'environmentSpecSha256',
      'environmentSubstanceSha256',
      'runtimeProfileId',
      'runtimeMatrixFileSha256',
      'runtimeMatrixSha256',
      'benchmarkImageDigest',
    ];
    if (
      fields.some((field) => task[field] !== indexed[field]) ||
      task.base?.commit !== indexed.base?.commit ||
      task.base?.tree !== indexed.base?.tree ||
      task.sourceRef !== indexed.hiddenRef
    ) {
      errors.push(`${task.taskId}: run-plan task differs from the sealed qualification index`);
    }
  }

  const expectedCells = new Map();
  for (const task of plan.tasks) {
    for (const model of models.models ?? []) {
      for (const arm of ['control', 'treatment']) {
        for (let repetition = 1; repetition <= design.repetitions; repetition += 1) {
          expectedCells.set(`${task.taskId}:${model.id}:${arm}:${repetition}`, 0);
        }
      }
    }
  }
  const modelById = new Map((models.models ?? []).map((model) => [model.id, model]));
  for (const run of plan.runs) {
    const key = `${run.taskId}:${run.modelId}:${run.arm}:${run.repetition}`;
    if (!expectedCells.has(key)) {
      errors.push(`${run.runId}: run is outside the frozen task/model/arm/repetition matrix`);
      continue;
    }
    expectedCells.set(key, expectedCells.get(key) + 1);
    const model = modelById.get(run.modelId);
    if (run.provider !== model?.provider || run.requestedModel !== model?.requestedModel) {
      errors.push(`${run.runId}: requested model identity differs from the frozen model lock`);
    }
  }
  if ([...expectedCells.values()].some((count) => count !== 1)) {
    errors.push('run plan must contain every frozen task/model/arm/repetition cell exactly once');
  }
}

async function checkDevelopmentTaskBindings(plan, taskRoot, errors) {
  const manifests = new Map();
  const developmentTasks = plan.tasks.filter((item) => item.partition === 'development');
  const bindingByName = new Map(plan.bindings.developmentTasks.map((binding) => [binding.logicalName, binding]));
  if (
    plan.bindings.developmentTasks.length !== developmentTasks.length ||
    bindingByName.size !== developmentTasks.length
  ) {
    errors.push(`development task bindings must contain exactly ${developmentTasks.length} unique entries`);
  }
  const expectedNames = new Set(developmentTasks.map((task) => `development-task:${task.taskId}`));
  for (const name of bindingByName.keys()) {
    if (!expectedNames.has(name)) errors.push(`${name}: unexpected development task binding`);
  }
  for (const task of developmentTasks) {
    try {
      const path = resolveContained(taskRoot, task.sourceRef, `${task.taskId}: development task`);
      const bytes = await readFile(path);
      const digest = sha256(bytes);
      const manifest = assertTaskManifest(JSON.parse(bytes), 'development');
      if (digest !== task.manifestSha256) errors.push(`${task.taskId}: development task manifest digest mismatch`);
      validateTaskManifestAgainstPlan(manifest, task, errors);
      const binding = bindingByName.get(`development-task:${task.taskId}`);
      if (!binding || binding.sha256 !== digest || binding.bytes !== bytes.byteLength) {
        errors.push(`${task.taskId}: development task is absent from plan input bindings`);
      }
      manifests.set(task.taskId, { manifest, fileSha256: digest });
    } catch (error) {
      errors.push(`${task.taskId}: development task manifest unavailable (${error.message})`);
    }
  }
  return manifests;
}

async function checkQualificationTaskBindings(plan, taskRoot, errors) {
  const manifests = new Map();
  for (const task of plan.tasks.filter((item) => item.partition === 'qualification')) {
    try {
      const path = resolveContained(taskRoot, task.sourceRef, `${task.taskId}: qualification task`);
      const bytes = await readFile(path);
      const digest = sha256(bytes);
      const manifest = assertTaskManifest(JSON.parse(bytes), 'qualification');
      if (digest !== task.manifestSha256) {
        errors.push(`${task.taskId}: qualification task manifest digest mismatch`);
      }
      validateTaskManifestAgainstPlan(manifest, task, errors);
      manifests.set(task.taskId, { manifest, fileSha256: digest });
    } catch (error) {
      errors.push(`${task.taskId}: qualification task manifest unavailable (${error.message})`);
    }
  }
  return manifests;
}

function validateTaskManifestAgainstPlan(manifest, task, errors) {
  if (
    manifest.taskId !== task.taskId ||
    manifest.kind !== task.kind ||
    manifest.repositoryId !== task.repositoryId ||
    manifest.framework !== task.framework ||
    manifest.projectPath !== task.projectPath ||
    manifest.corpusProjectPath !== task.corpusProjectPath ||
    manifest.corpusCommit !== task.corpusCommit ||
    manifest.base?.commit !== task.base?.commit ||
    manifest.base?.tree !== task.base?.tree ||
    manifest.candidateSha256 !== task.candidateSha256 ||
    manifest.evaluator?.contractSha256 !== task.evaluatorContractSha256 ||
    manifest.evaluator?.specSha256 !== task.evaluatorSpecSha256 ||
    manifest.evaluator?.oracleSourceSha256 !== task.oracleSourceSha256 ||
    manifest.evaluator?.qualificationControllerSha256 !== task.qualificationControllerSha256 ||
    manifest.evaluator?.qualificationReceiptFileSha256 !== task.qualificationReceiptFileSha256 ||
    manifest.evaluator?.qualificationReceiptSha256 !== task.qualificationReceiptSha256 ||
    manifest.evaluator?.qualificationExecutionAttestationFileSha256 !==
      task.qualificationExecutionAttestationFileSha256 ||
    manifest.evaluator?.qualificationExecutionAttestationSha256 !==
      task.qualificationExecutionAttestationSha256 ||
    manifest.evaluator?.qualificationExecutionControllerSha256 !==
      task.qualificationExecutionControllerSha256 ||
    manifest.evaluator?.qualificationEvaluatorSourceClosureSha256 !==
      task.qualificationEvaluatorSourceClosureSha256 ||
    manifest.evaluator?.qualificationInputRequestFileSha256 !==
      task.qualificationInputRequestFileSha256 ||
    manifest.evaluator?.qualificationInputRequestSha256 !== task.qualificationInputRequestSha256 ||
    manifest.evaluator?.qualificationInputManifestFileSha256 !==
      task.qualificationInputManifestFileSha256 ||
    manifest.evaluator?.qualificationInputManifestSha256 !== task.qualificationInputManifestSha256 ||
    manifest.evaluator?.qualificationRunnerRepositoryCommit !==
      task.qualificationRunnerRepositoryCommit ||
    manifest.evaluator?.qualificationProvenanceBundleFileSha256 !==
      task.qualificationProvenanceBundleFileSha256 ||
    manifest.evaluator?.qualificationProvenanceVerificationSha256 !==
      task.qualificationProvenanceVerificationSha256 ||
    manifest.informationEntitlementSha256 !== task.informationEntitlementSha256 ||
    manifest.environment?.specSha256 !== task.environmentSpecSha256 ||
    manifest.environment?.substanceSha256 !== task.environmentSubstanceSha256 ||
    manifest.environment?.runtimeProfileId !== task.runtimeProfileId ||
    manifest.environment?.runtimeMatrixFileSha256 !== task.runtimeMatrixFileSha256 ||
    manifest.environment?.runtimeMatrixSha256 !== task.runtimeMatrixSha256 ||
    manifest.environment?.benchmarkImageDigest !== task.benchmarkImageDigest
  ) {
    errors.push(`${task.taskId}: task manifest differs from the frozen run plan`);
  }
}

async function checkTaskEnvironmentBindings(plan, developmentRoot, qualificationRoot, errors) {
  const environments = new Map();
  for (const task of plan.tasks) {
    try {
      const root = task.partition === 'qualification' ? qualificationRoot : developmentRoot;
      const path = resolveContained(
        root,
        join('specs', `${task.taskId}.json`),
        `${task.taskId}: environment spec`,
      );
      const bytes = await readFile(path);
      const spec = assertTaskEnvironmentSpec(
        JSON.parse(bytes),
        {
          taskId: task.taskId,
          partition: task.partition,
          base: task.base,
          repository: { projectPath: task.projectPath },
        },
        { reviewStatus: 'approved' },
      );
      if (
        sha256(bytes) !== task.environmentSpecSha256 ||
        taskEnvironmentSubstanceSha256(spec) !== task.environmentSubstanceSha256 ||
        spec.profile.id !== task.runtimeProfileId
      ) {
        errors.push(`${task.taskId}: reviewed environment differs from the frozen run plan`);
      }
      environments.set(task.taskId, {
        spec,
        fileSha256: sha256(bytes),
        substanceSha256: taskEnvironmentSubstanceSha256(spec),
      });
    } catch (error) {
      errors.push(`${task.taskId}: reviewed environment unavailable (${error.message})`);
    }
  }
  return environments;
}

async function checkPreparedEnvironmentBindings(
  plan,
  developmentEnvironmentRoot,
  qualificationEnvironmentRoot,
  preparedEnvironmentRoot,
  runtimeMatrix,
  errors,
) {
  const result = new Map();
  for (const task of plan.tasks) {
    try {
      const environmentRoot = task.partition === 'qualification'
        ? qualificationEnvironmentRoot
        : developmentEnvironmentRoot;
      const environmentPath = resolveContained(
        environmentRoot,
        join('specs', `${task.taskId}.json`),
        `${task.taskId}: environment spec`,
      );
      const environmentSpec = assertTaskEnvironmentSpec(
        await readJsonFile(environmentPath),
        {
          taskId: task.taskId,
          partition: task.partition,
          base: task.base,
          repository: { projectPath: task.projectPath },
        },
        { reviewStatus: 'approved' },
      );
      const path = resolveContained(
        preparedEnvironmentRoot,
        `${task.taskId}.json`,
        `${task.taskId}: prepared environment attestation`,
      );
      const bytes = await readFile(path);
      const attestation = assertPreparedEnvironment(JSON.parse(bytes), {
        task: {
          taskId: task.taskId,
          base: task.base,
          environment: {
            specSha256: task.environmentSpecSha256,
            substanceSha256: task.environmentSubstanceSha256,
            runtimeProfileId: task.runtimeProfileId,
          },
        },
        runtimeMatrix,
        environmentSpec,
      });
      if (
        Date.parse(attestation.preparedAt) < Date.parse(environmentSpec.review.reviewedAt) ||
        Date.parse(attestation.preparedAt) < Date.parse(runtimeMatrix.frozenAt)
      ) {
        throw new Error('prepared environment predates its approved spec or locked runtime matrix');
      }
      result.set(task.taskId, {
        attestation,
        fileSha256: sha256(bytes),
      });
    } catch (error) {
      errors.push(`${task.taskId}: prepared environment unavailable (${error.message})`);
    }
  }
  return result;
}

async function checkEvaluatorBindings(options) {
  const result = new Map();
  const developmentEvaluatorRoot = dirname(options.developmentReceiptRoot);
  const qualificationEvaluatorRoot = dirname(options.qualificationReceiptRoot);
  let developmentManifest;
  try {
    developmentManifest = await readJsonFile(join(developmentEvaluatorRoot, 'manifest.json'));
    assertExactKeys(
      developmentManifest,
      ['bundleSha256', 'evaluators', 'program', 'schemaVersion', 'sealedAt'],
      'development evaluator manifest',
    );
    if (
      developmentManifest.schemaVersion !== 'decantr-benchmark-development-evaluator-manifest.v2' ||
      developmentManifest.program !== 'decantr-3.10-ui-change-control-proof' ||
      !Number.isFinite(Date.parse(developmentManifest.sealedAt)) ||
      developmentManifest.bundleSha256 !== sha256Canonical(developmentManifest.evaluators)
    ) {
      throw new Error('development evaluator manifest identity, seal, or bundle digest is invalid');
    }
  } catch (error) {
    options.errors.push(`development evaluator manifest is unavailable (${error.message})`);
    developmentManifest = { evaluators: [], sealedAt: null };
  }

  try {
    assertExactKeys(
      options.hiddenManifest,
      ['evaluators', 'qualificationTaskIndexSha256', 'schemaVersion'],
      'hidden evaluator manifest',
    );
    if (
      options.hiddenManifest.schemaVersion !== 'decantr-benchmark-hidden-evaluator-manifest.v2' ||
      options.hiddenManifest.qualificationTaskIndexSha256 !== options.qualificationIndexSha256
    ) {
      throw new Error('hidden evaluator manifest identity or qualification-index binding is invalid');
    }
    if (resolve(dirname(options.hiddenManifestPath)) !== resolve(qualificationEvaluatorRoot)) {
      throw new Error('hidden evaluator manifest and qualification receipt root have different owners');
    }
  } catch (error) {
    options.errors.push(`hidden evaluator manifest is invalid (${error.message})`);
  }

  const partitions = [
    {
      partition: 'development',
      manifest: developmentManifest,
      evaluatorRoot: developmentEvaluatorRoot,
      receiptRoot: options.developmentReceiptRoot,
      sealedAt: developmentManifest.sealedAt,
    },
    {
      partition: 'qualification',
      manifest: options.hiddenManifest,
      evaluatorRoot: qualificationEvaluatorRoot,
      receiptRoot: options.qualificationReceiptRoot,
      sealedAt: options.qualification.sealedAt,
    },
  ];
  for (const partition of partitions) {
    const plannedTasks = options.plan.tasks.filter((task) => task.partition === partition.partition);
    const entries = Array.isArray(partition.manifest?.evaluators) ? partition.manifest.evaluators : [];
    const byTask = new Map(entries.map((entry) => [entry.taskId, entry]));
    if (byTask.size !== entries.length || byTask.size !== plannedTasks.length) {
      options.errors.push(`${partition.partition} evaluator manifest has missing, extra, or duplicate tasks`);
    }
    for (const task of plannedTasks) {
      const entry = byTask.get(task.taskId);
      const taskManifest = options.taskManifestById.get(task.taskId)?.manifest;
      if (!entry || !taskManifest) {
        options.errors.push(`${task.taskId}: evaluator or task binding is missing`);
        continue;
      }
      try {
        const requiredEntryKeys = partition.partition === 'development'
          ? [
              'contractPath',
              'contractSha256',
              'deliverySpecSha256',
              'environmentSpecSha256',
              'manifestSha256',
              'oracleSourcePath',
              'oracleSourceSha256',
              'qualificationControllerSha256',
              'qualificationReceiptFileSha256',
              'qualificationReceiptPath',
              'qualificationReceiptSha256',
              'qualificationExecutionAttestationFileSha256',
              'qualificationExecutionAttestationSha256',
              'qualificationExecutionControllerSha256',
              'qualificationEvaluatorSourceClosureSha256',
              'qualificationInputRequestFileSha256',
              'qualificationInputRequestSha256',
              'qualificationInputManifestFileSha256',
              'qualificationInputManifestSha256',
              'qualificationRunnerRepositoryCommit',
              'qualificationProvenanceBundleFileSha256',
              'qualificationProvenanceVerificationSha256',
              'taskId',
            ]
          : [
              'contractPath',
              'contractSha256',
              'oracleSourcePath',
              'oracleSourceSha256',
              'qualificationControllerSha256',
              'qualificationReceiptFileSha256',
              'qualificationReceiptPath',
              'qualificationReceiptSha256',
              'qualificationExecutionAttestationFileSha256',
              'qualificationExecutionAttestationSha256',
              'qualificationExecutionControllerSha256',
              'qualificationEvaluatorSourceClosureSha256',
              'qualificationInputRequestFileSha256',
              'qualificationInputRequestSha256',
              'qualificationInputManifestFileSha256',
              'qualificationInputManifestSha256',
              'qualificationRunnerRepositoryCommit',
              'qualificationProvenanceBundleFileSha256',
              'qualificationProvenanceVerificationSha256',
              'taskId',
            ];
        assertExactKeys(entry, requiredEntryKeys, `${task.taskId}: evaluator manifest entry`);
        const receiptPath = resolveContained(
          partition.evaluatorRoot,
          entry.qualificationReceiptPath,
          `${task.taskId}: qualification receipt`,
        );
        if (receiptPath !== resolve(partition.receiptRoot, `${task.taskId}.json`)) {
          throw new Error('qualification receipt path differs from the partition receipt root');
        }
        const contractPath = resolveContained(
          partition.evaluatorRoot,
          entry.contractPath,
          `${task.taskId}: evaluator contract`,
        );
        const sourcePath = resolveContained(
          partition.evaluatorRoot,
          entry.oracleSourcePath,
          `${task.taskId}: evaluator oracle source`,
        );
        const specPath = resolveContained(
          partition.evaluatorRoot,
          join('specs', `${task.taskId}.json`),
          `${task.taskId}: evaluator spec`,
        );
        const [contractBytes, sourceBytes, specBytes] = await Promise.all([
          readFile(contractPath),
          readFile(sourcePath),
          readFile(specPath),
        ]);
        const contract = assertEvaluatorContract(JSON.parse(contractBytes), taskManifest);
        const spec = JSON.parse(specBytes);
        assertEvaluatorSpecBinding(spec, contract, entry, task, taskManifest);
        if (
          sha256(contractBytes) !== entry.contractSha256 ||
          sha256(sourceBytes) !== entry.oracleSourceSha256 ||
          sha256(specBytes) !== task.evaluatorSpecSha256 ||
          contract.oracle.sourceSha256 !== entry.oracleSourceSha256 ||
          entry.contractSha256 !== task.evaluatorContractSha256 ||
          entry.oracleSourceSha256 !== task.oracleSourceSha256 ||
          entry.qualificationControllerSha256 !== task.qualificationControllerSha256 ||
          entry.qualificationReceiptFileSha256 !== task.qualificationReceiptFileSha256 ||
          entry.qualificationReceiptSha256 !== task.qualificationReceiptSha256 ||
          entry.qualificationExecutionAttestationFileSha256 !==
            task.qualificationExecutionAttestationFileSha256 ||
          entry.qualificationExecutionAttestationSha256 !==
            task.qualificationExecutionAttestationSha256 ||
          entry.qualificationExecutionControllerSha256 !==
            task.qualificationExecutionControllerSha256 ||
          entry.qualificationEvaluatorSourceClosureSha256 !==
            task.qualificationEvaluatorSourceClosureSha256 ||
          entry.qualificationInputRequestFileSha256 !== task.qualificationInputRequestFileSha256 ||
          entry.qualificationInputRequestSha256 !== task.qualificationInputRequestSha256 ||
          entry.qualificationInputManifestFileSha256 !== task.qualificationInputManifestFileSha256 ||
          entry.qualificationInputManifestSha256 !== task.qualificationInputManifestSha256 ||
          entry.qualificationRunnerRepositoryCommit !== task.qualificationRunnerRepositoryCommit ||
          entry.qualificationProvenanceBundleFileSha256 !==
            task.qualificationProvenanceBundleFileSha256 ||
          entry.qualificationProvenanceVerificationSha256 !==
            task.qualificationProvenanceVerificationSha256 ||
          (partition.partition === 'development' &&
            (entry.manifestSha256 !== task.manifestSha256 ||
              entry.environmentSpecSha256 !== task.environmentSpecSha256))
        ) {
          throw new Error('evaluator bytes or provenance differ from the frozen task binding');
        }
        for (const command of contract.commands) {
          assertFixedCommand(command.executable, command.args);
          if (
            [command.executable, ...command.args].some(isForbiddenDecantrOracleToken) ||
            Object.keys(command.environment ?? {}).some((key) => /^DECANTR_/u.test(key))
          ) {
            throw new Error('Decantr output is named as evaluator input');
          }
        }
        result.set(task.taskId, {
          entry,
          contract,
          spec,
          sealedAt: partition.sealedAt,
        });
      } catch (error) {
        options.errors.push(`${task.taskId}: evaluator evidence is invalid (${error.message})`);
      }
    }
  }
  return result;
}

function assertEvaluatorSpecBinding(spec, contract, entry, task, taskManifest) {
  if (
    spec?.schemaVersion !== 'decantr-benchmark-evaluator-authoring-spec.v2' ||
    spec.taskId !== task.taskId ||
    spec.contractId !== taskManifest.evaluator.contractId ||
    spec.oracle?.sourcePath !== entry.oracleSourcePath ||
    sha256Canonical(spec.commands) !== sha256Canonical(contract.commands)
  ) {
    throw new Error('evaluator spec differs from the fixed contract or manifest');
  }
}

async function checkQualificationReceiptChains(options) {
  const receipts = new Map();
  const candidateSetByPartition = new Map();
  let controllerSha256;
  let containerController;
  try {
    controllerSha256 = await calculateQualificationControllerDigest();
    containerController = await calculateContainerControllerClosure();
  } catch (error) {
    options.errors.push(`qualification controller source closure is unavailable (${error.message})`);
    return receipts;
  }
  for (const task of options.plan.tasks) {
    const receiptRoot = task.partition === 'qualification'
      ? options.qualificationReceiptRoot
      : options.developmentReceiptRoot;
    const taskManifest = options.taskManifestById.get(task.taskId)?.manifest;
    const environment = options.environmentByTask.get(task.taskId);
    const prepared = options.preparedEnvironmentByTask.get(task.taskId);
    const evaluator = options.evaluatorByTask.get(task.taskId);
    if (!taskManifest || !environment || !prepared || !evaluator) {
      options.errors.push(`${task.taskId}: qualification receipt prerequisites are incomplete`);
      continue;
    }
    try {
      const receiptPath = resolveContained(
        receiptRoot,
        `${task.taskId}.json`,
        `${task.taskId}: qualification receipt`,
      );
      const receiptBytes = await readFile(receiptPath);
      const profile = options.runtimeMatrix.profiles.find((item) => item.id === task.runtimeProfileId);
      if (!profile) throw new Error('runtime profile is absent from the locked matrix');
      const receipt = assertQualificationReceipt(JSON.parse(receiptBytes), {
        taskId: task.taskId,
        partition: task.partition,
        candidateSha256: task.candidateSha256,
        corpusSha256: options.corpusSha256,
        evaluatorSpecSha256: task.evaluatorSpecSha256,
        oracleSourceSha256: task.oracleSourceSha256,
        evaluatorContractSha256: task.evaluatorContractSha256,
        qualificationControllerSha256: controllerSha256,
        environmentSpecSha256: task.environmentSpecSha256,
        environmentSubstanceSha256: task.environmentSubstanceSha256,
        runtimeMatrixFileSha256: options.runtimeMatrixFileSha256,
        runtimeMatrixSha256: options.runtimeMatrix.matrixSha256,
        runtimeProfileId: task.runtimeProfileId,
        benchmarkImageDigest: profile.benchmarkImage.digest,
        qualifiedOnOrBefore: evaluator.sealedAt,
      });
      const receiptFileSha256 = sha256(receiptBytes);
      if (
        receiptFileSha256 !== task.qualificationReceiptFileSha256 ||
        receipt.receiptSha256 !== task.qualificationReceiptSha256 ||
        receiptFileSha256 !== taskManifest.evaluator.qualificationReceiptFileSha256 ||
        receipt.receiptSha256 !== taskManifest.evaluator.qualificationReceiptSha256 ||
        receipt.qualificationControllerSha256 !== taskManifest.evaluator.qualificationControllerSha256 ||
        receipt.evaluatorSpecSha256 !== taskManifest.evaluator.specSha256 ||
        receipt.oracleSourceSha256 !== taskManifest.evaluator.oracleSourceSha256 ||
        receipt.evaluatorContractSha256 !== taskManifest.evaluator.contractSha256 ||
        receipt.environmentSpecSha256 !== taskManifest.environment.specSha256 ||
        receipt.environmentSubstanceSha256 !== taskManifest.environment.substanceSha256 ||
        receipt.runtimeMatrixFileSha256 !== taskManifest.environment.runtimeMatrixFileSha256 ||
        receipt.runtimeMatrixSha256 !== taskManifest.environment.runtimeMatrixSha256 ||
        receipt.benchmarkImageDigest !== taskManifest.environment.benchmarkImageDigest ||
        environment.fileSha256 !== receipt.environmentSpecSha256 ||
        environment.substanceSha256 !== receipt.environmentSubstanceSha256
      ) {
        throw new Error('receipt differs from task, evaluator, environment, runtime, or preparation evidence');
      }
      const executionEvidence = await assertAuditedQualificationExecution({
        task,
        taskManifest,
        receipt,
        receiptRoot,
        evaluator,
        environment,
        runtimeMatrix: options.runtimeMatrix,
        runtimeMatrixFileSha256: options.runtimeMatrixFileSha256,
        containerController,
        provenanceVerifier: options.provenanceVerifier,
        cosignPath: options.cosignPath,
      });
      const existingCandidateSet = candidateSetByPartition.get(task.partition);
      if (existingCandidateSet && existingCandidateSet !== receipt.candidateSetSha256) {
        throw new Error('candidate-set binding differs within the partition');
      }
      candidateSetByPartition.set(task.partition, receipt.candidateSetSha256);

      const results = {};
      for (const role of ['base', 'expected']) {
        const resultPath = resolveContained(
          receiptRoot,
          join('results', `${task.taskId}.${role}.json`),
          `${task.taskId}: retained ${role} qualification result`,
        );
        const resultBytes = await readFile(resultPath);
        const result = JSON.parse(resultBytes);
        if (
          sha256(resultBytes) !== receipt[`${role}ResultFileSha256`] ||
          sha256Canonical(result) !== receipt[`${role}ResultSha256`]
        ) {
          throw new Error(`${role} result bytes differ from the qualification receipt`);
        }
        assertQualificationResultArtifact(result, evaluator.contract, {
          taskId: task.taskId,
          role,
          runId: `qualification-${executionEvidence.attestation.executionId}-${role}`,
          contractSha256: task.evaluatorContractSha256,
        });
        results[role] = result;
      }
      const oracleToken = `\${EVALUATOR_ROOT}/${evaluator.spec.oracle.sourcePath}`;
      const requiredOracleIds = new Set(
        evaluator.contract.commands
          .filter(
            (command) =>
              command.kind === 'functional' &&
              command.runtime === 'controller' &&
              command.required === true &&
              command.resultFormat === 'json-stdout' &&
              command.args.includes(oracleToken),
          )
          .map((command) => command.id),
      );
      if (requiredOracleIds.size === 0) {
        throw new Error('fixed contract has no bound required controller oracle');
      }
      assertStrictQualificationPolarity(
        evaluator.contract,
        requiredOracleIds,
        results.base,
        results.expected,
        task.taskId,
      );
      receipts.set(task.taskId, {
        receipt,
        fileSha256: receiptFileSha256,
        attestation: executionEvidence.attestation,
      });
    } catch (error) {
      options.errors.push(`${task.taskId}: qualification receipt chain is invalid (${error.message})`);
    }
  }
  return receipts;
}

async function assertAuditedQualificationExecution(options) {
  const taskId = options.task.taskId;
  const attestationPath = resolveContained(
    options.receiptRoot,
    join('attestations', `${taskId}.json`),
    `${taskId}: retained execution attestation`,
  );
  const provenancePath = resolveContained(
    options.receiptRoot,
    join(
      'provenance',
      qualificationProvenanceBundleFilename(
        taskId,
        options.receipt.execution.provenanceProvider,
      ),
    ),
    `${taskId}: retained provenance bundle`,
  );
  const prequalificationPath = resolveContained(
    options.receiptRoot,
    join('prequalification', `${taskId}.json`),
    `${taskId}: retained prequalification seal`,
  );
  const inputRequestPath = resolveContained(
    options.receiptRoot,
    join('qualification-input', `${taskId}.request.json`),
    `${taskId}: retained qualification input request`,
  );
  const inputManifestPath = resolveContained(
    options.receiptRoot,
    join('qualification-input', `${taskId}.manifest.json`),
    `${taskId}: retained qualification input manifest`,
  );
  const [attestationBytes, provenanceBytes, prequalificationBytes, inputRequestBytes, inputManifestBytes] = await Promise.all([
    readFile(attestationPath),
    readFile(provenancePath),
    readFile(prequalificationPath),
    readFile(inputRequestPath),
    readFile(inputManifestPath),
  ]);
  const attestation = assertExecutionAttestation(JSON.parse(attestationBytes));
  const prequalification = JSON.parse(prequalificationBytes);
  const execution = options.receipt.execution;
  const profile = options.runtimeMatrix.profiles.find((item) => item.id === options.task.runtimeProfileId);
  if (!profile) throw new Error('qualification runtime profile is absent from the locked matrix');
  const sourceClosure = attestation.bindings.evaluator.sourceClosure;
  const inputRequest = JSON.parse(inputRequestBytes);
  const inputManifest = JSON.parse(inputManifestBytes);
  const { requestSha256: _requestDigest, ...inputRequestBody } = inputRequest;
  const { manifestSha256: _manifestDigest, ...inputManifestBody } = inputManifest;
  if (
    sha256(attestationBytes) !== execution.attestationFileSha256 ||
    sha256(prequalificationBytes) !== options.receipt.prequalificationBundleFileSha256 ||
    prequalification.bundleSha256 !== options.receipt.prequalificationBundleSha256 ||
    prequalification.bundleSha256 !== calculatePrequalificationBundleDigest(prequalification) ||
    prequalification.taskId !== taskId ||
    prequalification.partition !== options.task.partition ||
    prequalification.candidateSha256 !== options.task.candidateSha256 ||
    prequalification.revisions?.base?.commit !== options.task.base.commit ||
    prequalification.revisions?.base?.tree !== options.task.base.tree ||
    attestation.attestationSha256 !== execution.attestationSha256 ||
    attestation.taskId !== taskId ||
    attestation.partition !== options.task.partition ||
    attestation.endedAt !== options.receipt.qualifiedAt ||
    attestation.bindings.candidate.canonicalSha256 !== options.task.candidateSha256 ||
    attestation.bindings.prequalificationBundle.fileSha256 !==
      options.receipt.prequalificationBundleFileSha256 ||
    attestation.bindings.prequalificationBundle.bundleSha256 !==
      options.receipt.prequalificationBundleSha256 ||
    attestation.bindings.evaluator.contractFileSha256 !== options.task.evaluatorContractSha256 ||
    attestation.bindings.evaluator.oracleSourceSha256 !== options.task.oracleSourceSha256 ||
    sourceClosure.length !== 1 ||
    sourceClosure[0].path !== options.evaluator.spec.oracle.sourcePath ||
    sourceClosure[0].sha256 !== options.task.oracleSourceSha256 ||
    attestation.bindings.evaluator.sourceClosureSha256 !== execution.evaluatorSourceClosureSha256 ||
    !inputRequestBytes.equals(Buffer.from(prettyCanonicalJson(inputRequest))) ||
    !inputManifestBytes.equals(Buffer.from(prettyCanonicalJson(inputManifest))) ||
    inputRequest.taskId !== taskId ||
    inputRequest.partition !== options.task.partition ||
    inputRequest.requestSha256 !== sha256Canonical(inputRequestBody) ||
    inputManifest.taskId !== taskId ||
    inputManifest.partition !== options.task.partition ||
    inputManifest.manifestSha256 !== sha256Canonical(inputManifestBody) ||
    sha256(inputRequestBytes) !== execution.inputRequestFileSha256 ||
    inputRequest.requestSha256 !== execution.inputRequestSha256 ||
    sha256(inputManifestBytes) !== execution.inputManifestFileSha256 ||
    inputManifest.manifestSha256 !== execution.inputManifestSha256 ||
    attestation.bindings.qualificationInput.requestFileSha256 !== execution.inputRequestFileSha256 ||
    attestation.bindings.qualificationInput.requestSha256 !== execution.inputRequestSha256 ||
    attestation.bindings.qualificationInput.manifestFileSha256 !== execution.inputManifestFileSha256 ||
    attestation.bindings.qualificationInput.manifestSha256 !== execution.inputManifestSha256 ||
    attestation.bindings.controller.closureSha256 !== execution.controllerSha256 ||
    attestation.bindings.controller.closureSha256 !== options.containerController.closureSha256 ||
    sha256Canonical(attestation.bindings.controller.entries) !==
      sha256Canonical(options.containerController.entries) ||
    attestation.bindings.sourceSnapshots.base.revision.commit !== options.task.base.commit ||
    attestation.bindings.sourceSnapshots.base.revision.tree !== options.task.base.tree ||
    attestation.bindings.sourceSnapshots.expected.revision.commit !==
      prequalification.revisions?.expected?.commit ||
    attestation.bindings.sourceSnapshots.expected.revision.tree !==
      prequalification.revisions?.expected?.tree ||
    attestation.bindings.environment.specFileSha256 !== options.environment.fileSha256 ||
    attestation.bindings.environment.substanceSha256 !== options.environment.substanceSha256 ||
    attestation.bindings.runtimeMatrix.fileSha256 !== options.runtimeMatrixFileSha256 ||
    attestation.bindings.runtimeMatrix.matrixSha256 !== options.runtimeMatrix.matrixSha256 ||
    attestation.bindings.runtimeProfile.id !== profile.id ||
    attestation.bindings.runtimeProfile.profileSha256 !== profile.profileSha256 ||
    attestation.bindings.benchmarkImage.reference !== profile.benchmarkImage.reference ||
    attestation.bindings.benchmarkImage.digest !== profile.benchmarkImage.digest ||
    attestation.runnerRepositoryCommit !== execution.runnerRepositoryCommit ||
    attestation.executionIdentity.provider !== 'github-actions' ||
    attestation.executionIdentity.repository !== execution.repository ||
    attestation.executionIdentity.ref !== execution.sourceRef ||
    attestation.executionIdentity.workflowRef !== `${execution.signerWorkflow}@${execution.sourceRef}` ||
    sha256(provenanceBytes) !== execution.provenanceBundleFileSha256
  ) {
    throw new Error('container execution attestation differs from the frozen qualification chain');
  }
  for (const [taskKey, executionKey] of [
    ['qualificationExecutionAttestationFileSha256', 'attestationFileSha256'],
    ['qualificationExecutionAttestationSha256', 'attestationSha256'],
    ['qualificationExecutionControllerSha256', 'controllerSha256'],
    ['qualificationEvaluatorSourceClosureSha256', 'evaluatorSourceClosureSha256'],
    ['qualificationInputRequestFileSha256', 'inputRequestFileSha256'],
    ['qualificationInputRequestSha256', 'inputRequestSha256'],
    ['qualificationInputManifestFileSha256', 'inputManifestFileSha256'],
    ['qualificationInputManifestSha256', 'inputManifestSha256'],
    ['qualificationRunnerRepositoryCommit', 'runnerRepositoryCommit'],
    ['qualificationProvenanceBundleFileSha256', 'provenanceBundleFileSha256'],
    ['qualificationProvenanceVerificationSha256', 'provenanceVerificationSha256'],
  ]) {
    if (
      options.task[taskKey] !== execution[executionKey] ||
      options.taskManifest.evaluator[taskKey] !== execution[executionKey]
    ) {
      throw new Error(`${taskKey} differs across task, manifest, and qualification receipt`);
    }
  }
  for (const role of ['base', 'expected']) {
    if (
      attestation.evaluation.roles[role].result.fileSha256 !==
        options.receipt[`${role}ResultFileSha256`] ||
      attestation.evaluation.roles[role].result.canonicalSha256 !==
        options.receipt[`${role}ResultSha256`]
    ) {
      throw new Error(`${role} result binding differs from the container execution attestation`);
    }
  }
  const provenance = await options.provenanceVerifier({
    attestationPath,
    bundlePath: provenancePath,
    partition: options.task.partition,
    sourceDigest: execution.runnerRepositoryCommit,
    sourceRef: execution.sourceRef,
    cosignPath: options.cosignPath,
  });
  const expectedPolicy = qualificationProvenancePolicy(options.task.partition, {
    sourceDigest: execution.runnerRepositoryCommit,
    sourceRef: execution.sourceRef,
  });
  if (
    provenance.attestationFileSha256 !== execution.attestationFileSha256 ||
    provenance.bundleFileSha256 !== execution.provenanceBundleFileSha256 ||
    provenance.verificationSha256 !== execution.provenanceVerificationSha256 ||
    sha256Canonical(provenance.policy) !== sha256Canonical(expectedPolicy)
  ) {
    throw new Error('offline provenance verification differs from the qualification receipt');
  }
  return { attestation };
}

async function auditRunRecords(options) {
  const expectedIds = new Set(options.plan.runs.map((run) => run.runId));
  let indexFiles = [];
  try {
    indexFiles = (await readdir(join(options.recordRoot, 'run-index'))).filter((file) => file.endsWith('.json'));
  } catch (error) {
    options.errors.push(`run record index is unavailable (${error.message})`);
  }
  const indexedIds = new Set(indexFiles.map((file) => file.slice(0, -5)));
  for (const runId of expectedIds) {
    if (!indexedIds.has(runId)) options.errors.push(`${runId}: expected run record is missing`);
  }
  for (const runId of indexedIds) {
    if (!expectedIds.has(runId)) options.errors.push(`${runId}: unexpected run record index entry`);
  }
  const bindings = [];
  const qualificationBindings = [];
  const developmentBindings = [];
  const records = [];
  const approvalIds = new Set();
  const recordDigestByRun = new Map();
  let observed = 0;
  let actualCostUsd = 0;
  let latestDevelopmentRecordedAt = null;
  let earliestQualificationRecordedAt = null;
  for (const run of options.plan.runs) {
    if (!indexedIds.has(run.runId)) {
      bindings.push({ runId: run.runId, recordSha256: null });
      if (run.partition === 'qualification') qualificationBindings.push({ runId: run.runId, recordSha256: null });
      else developmentBindings.push({ runId: run.runId, recordSha256: null });
      continue;
    }
    try {
      const index = await readJsonFile(join(options.recordRoot, 'run-index', `${run.runId}.json`));
      const recordPath = join(options.recordRoot, 'run-records', 'sha256', `${index.recordSha256}.json`);
      const bytes = await readFile(recordPath);
      if (sha256(bytes) !== index.recordSha256) throw new Error('content-address digest mismatch');
      const record = JSON.parse(bytes);
      assertRunRecordV3(record);
      observed += 1;
      validateRecordBinding(record, run, options, options.errors);
      const stageEvidence = await verifyRunStageProvenance(
        options.recordRoot,
        record,
        options.runtimeMatrix,
        options.stageProvenanceVerifier,
        options.cosignPath,
        options.errors,
      );
      await verifyRecordAuthorization({
        root: options.recordRoot,
        record,
        run,
        plan: options.plan,
        candidate: options.candidate,
        candidateManifestSha256:
          options.candidateManifestSha256,
        models: options.models,
        protocol: options.protocol,
        stageEvidence,
        errors: options.errors,
      });
      actualCostUsd += Number.isFinite(record.budget?.actualUsd) ? record.budget.actualUsd : 0;
      await verifyWorkspaceChange(
        options.recordRoot,
        record.workspace?.diffSha256,
        run.runId,
        options.errors,
      );
      const trajectoryTiming = await verifyTrajectory(
        options.recordRoot,
        record.trajectoryManifestSha256,
        run,
        record,
        options.errors,
      );
      if (trajectoryTiming) {
        const prepared = options.preparedEnvironmentByTask.get(run.taskId)?.attestation;
        if (!prepared || Date.parse(prepared.preparedAt) > Date.parse(trajectoryTiming.firstRecordedAt)) {
          options.errors.push(`${run.runId}: trajectory predates the prepared environment attestation`);
        }
        if (run.partition === 'qualification') {
          earliestQualificationRecordedAt = minTimestamp(
            earliestQualificationRecordedAt,
            trajectoryTiming.firstRecordedAt,
          );
        } else {
          latestDevelopmentRecordedAt = maxTimestamp(
            latestDevelopmentRecordedAt,
            trajectoryTiming.lastRecordedAt,
          );
        }
      }
      if (record.status === 'completed') {
        await verifyEvaluatorResult(
          options.recordRoot,
          record.evaluatorResultSha256,
          run,
          record,
          options.errors,
        );
      }
      records.push(record);
      if (record.budget?.approvalId) approvalIds.add(record.budget.approvalId);
      recordDigestByRun.set(run.runId, index.recordSha256);
      bindings.push({ runId: run.runId, recordSha256: index.recordSha256 });
      if (run.partition === 'qualification') {
        qualificationBindings.push({ runId: run.runId, recordSha256: index.recordSha256 });
      } else developmentBindings.push({ runId: run.runId, recordSha256: index.recordSha256 });
    } catch (error) {
      options.errors.push(`${run.runId}: invalid run record (${error.message})`);
      bindings.push({ runId: run.runId, recordSha256: null });
      if (run.partition === 'qualification') qualificationBindings.push({ runId: run.runId, recordSha256: null });
      else developmentBindings.push({ runId: run.runId, recordSha256: null });
    }
  }
  auditArmParity(records, options.errors);
  return {
    observed,
    actualCostUsd,
    approvalIds,
    recordDigestByRun,
    developmentRecordSetSha256: sha256Canonical(
      developmentBindings.sort((left, right) => left.runId.localeCompare(right.runId)),
    ),
    allRecordSetSha256: sha256Canonical(bindings.sort((left, right) => left.runId.localeCompare(right.runId))),
    qualificationRecordSetSha256: sha256Canonical(
      qualificationBindings.sort((left, right) => left.runId.localeCompare(right.runId)),
    ),
    latestDevelopmentRecordedAt,
    earliestQualificationRecordedAt,
  };
}

async function verifyRunStageProvenance(
  root,
  record,
  runtimeMatrix,
  provenanceVerifier,
  cosignPath,
  errors,
) {
  try {
    const agentRetained = await readRetainedStage(
      root,
      record.provenance.agentStage,
      'agent',
    );
    const evaluatorRetained = await readRetainedStage(
      root,
      record.provenance.evaluatorStage,
      'evaluator',
    );
    const agent = assertAgentStageAttestation(agentRetained.attestation);
    const evaluator = assertEvaluatorStageAttestation(
      evaluatorRetained.attestation,
    );
    const profile = runtimeMatrix.profiles.find(
      (item) =>
        item.agentImage.digest === record.bindings.agentImageDigest &&
        item.benchmarkImage.digest === record.bindings.benchmarkImageDigest,
    );
    if (!profile) {
      throw new Error('run images are absent from the locked runtime matrix');
    }
    if (
      agent.attestationSha256 !== record.provenance.agentStage.attestationSha256 ||
      evaluator.attestationSha256 !==
        record.provenance.evaluatorStage.attestationSha256
    ) {
      throw new Error('stage self digests differ from the run record');
    }
    for (const retained of [agentRetained, evaluatorRetained]) {
      const stage = retained.attestation;
      const policy = stageProvenancePolicy(
        stage.partition,
        stage.execution.sourceDigest,
      );
      assertStageProvenanceVerification(retained.verification, policy);
      const independentlyVerified = await provenanceVerifier({
        subjectPath: retained.attestationPath,
        bundlePath: retained.bundlePath,
        partition: stage.partition,
        sourceDigest: stage.execution.sourceDigest,
        cosignPath,
      });
      assertStageProvenanceVerification(independentlyVerified, policy);
      if (
        canonicalJson(independentlyVerified) !==
          canonicalJson(retained.verification) ||
        independentlyVerified.verificationSha256 !==
          retained.reference.verificationSha256
      ) {
        throw new Error(
          `${stage.stage} stage offline verification differs from retained provenance`,
        );
      }
    }
    const reconstructedCoreBytes = Buffer.from(
      prettyCanonicalJson(runCoreFromRecord(record)),
      'utf8',
    );
    if (
      evaluator.output.runCoreFile.sha256 !== sha256(reconstructedCoreBytes) ||
      evaluator.output.runCoreFile.bytes !== reconstructedCoreBytes.byteLength ||
      evaluator.agentStage.attestationFile.sha256 !==
        agentRetained.reference.attestationFile.sha256 ||
      evaluator.agentStage.attestationFile.bytes !==
        agentRetained.reference.attestationFile.bytes ||
      evaluator.agentStage.bundleFile.sha256 !==
        agentRetained.reference.bundleFile.sha256 ||
      evaluator.agentStage.bundleFile.bytes !==
        agentRetained.reference.bundleFile.bytes ||
      evaluator.agentStage.verificationFile.sha256 !==
        agentRetained.reference.verificationFile.sha256 ||
      evaluator.agentStage.verificationFile.bytes !==
        agentRetained.reference.verificationFile.bytes ||
      evaluator.agentStage.verificationSha256 !==
        agentRetained.reference.verificationSha256
    ) {
      throw new Error('evaluator stage is bound to different agent or run-core evidence');
    }
    if (
      agent.runId !== record.runId ||
      evaluator.runId !== record.runId ||
      agent.taskId !== record.taskId ||
      evaluator.taskId !== record.taskId ||
      agent.partition !== record.partition ||
      evaluator.partition !== record.partition ||
      agent.arm !== record.arm ||
      evaluator.arm !== record.arm ||
      agent.repetition !== record.repetition ||
      evaluator.repetition !== record.repetition ||
      agent.productionEligible !== true ||
      evaluator.productionEligible !== true
    ) {
      throw new Error('stage identity or production eligibility differs from the run record');
    }
    if (
      agent.execution.repository !== evaluator.execution.repository ||
      agent.execution.sourceDigest !== evaluator.execution.sourceDigest ||
      agent.execution.runId !== evaluator.execution.runId ||
      agent.execution.runAttempt !== evaluator.execution.runAttempt ||
      agent.execution.runnerEnvironment !== 'github-hosted' ||
      evaluator.execution.runnerEnvironment !== 'github-hosted'
    ) {
      throw new Error('agent and evaluator were not separate jobs in one GitHub-hosted run');
    }
    if (
      record.bindings.agentControllerSha256 !== agent.controllerSha256 ||
      record.bindings.agentImageDigest !== agent.image.digest ||
      record.bindings.authorizationSha256 !==
        agent.bindings.authorizationSha256 ||
      agent.image.reference !== profile?.agentImage?.reference ||
      record.bindings.evaluatorControllerSha256 !== evaluator.controllerSha256 ||
      record.bindings.benchmarkImageDigest !== evaluator.image.digest ||
      evaluator.image.reference !== profile?.benchmarkImage?.reference ||
      record.bindings.taskManifestSha256 !== agent.bindings.taskManifestSha256 ||
      record.bindings.runPlanSha256 !== agent.bindings.runPlanSha256 ||
      record.bindings.candidateManifestSha256 !==
        agent.bindings.candidateManifestSha256 ||
      record.bindings.candidateTarballSetSha256 !==
        agent.bindings.candidateTarballSetSha256 ||
      record.bindings.deliverySha256 !== agent.bindings.deliverySha256 ||
      record.bindings.environmentSha256 !== agent.bindings.environmentSha256 ||
      record.bindings.preparedEnvironmentAttestationSha256 !==
        agent.bindings.preparedEnvironmentAttestationSha256 ||
      record.workspace.baseCommit !== evaluator.reconstruction.baseCommit ||
      record.workspace.baseTree !== evaluator.reconstruction.baseTree ||
      record.bindings.evaluatorContractSha256 !==
        evaluator.sealedInput.evaluatorContractSha256 ||
      record.bindings.qualificationEvaluatorSourceClosureSha256 !==
        evaluator.sealedInput.evaluatorSourceClosureSha256
    ) {
      throw new Error('signed stage chain differs from run-record bindings');
    }
    await verifyEvaluatorOutputBinding(
      root,
      evaluator.output.authorizationFile,
      record.bindings.authorizationSha256,
      'run authorization',
    );
    await verifyEvaluatorOutputBinding(
      root,
      evaluator.output.evaluatorResultFile,
      record.evaluatorResultSha256,
      'evaluator result',
    );
    await verifyEvaluatorOutputBinding(
      root,
      evaluator.output.trajectoryManifestFile,
      record.trajectoryManifestSha256,
      'trajectory manifest',
    );
    await verifyEvaluatorOutputBinding(
      root,
      evaluator.output.workspaceChangeFile,
      record.workspace.diffSha256,
      'workspace change',
    );
    return { agent, evaluator };
  } catch (error) {
    errors.push(
      `${record.runId}: signed split-stage provenance is invalid (${error.message})`,
    );
    return null;
  }
}

async function verifyRecordAuthorization(options) {
  try {
    if (!options.stageEvidence) {
      throw new Error(
        'signed stage evidence is unavailable for authorization validation',
      );
    }
    const model = options.models.models?.find(
      (item) => item.id === options.run.modelId,
    );
    if (!model) {
      throw new Error('run model is absent from the frozen model lock');
    }
    const authorizationPath = join(
      options.root,
      'run-authorizations',
      'sha256',
      `${options.record.bindings.authorizationSha256}.json`,
    );
    const raw = JSON.parse(await readFile(authorizationPath, 'utf8'));
    const budgetApprovalPath = raw.budgetApproval
      ? join(
          options.root,
          'budget-approvals',
          'sha256',
          `${raw.budgetApproval.sha256}.json`,
        )
      : undefined;
    const powerPilotPath = raw.powerPilot
      ? join(
          options.root,
          'power-pilots',
          'sha256',
          `${raw.powerPilot.sha256}.json`,
        )
      : undefined;
    const evidence = await verifyRunAuthorization({
      authorizationPath,
      budgetApprovalPath,
      powerPilotPath,
      retainedCompanionPaths: true,
      expectedSha256:
        options.record.bindings.authorizationSha256,
      expected: {
        runId: options.run.runId,
        partition: options.run.partition,
        modelId: options.run.modelId,
        runPlanSha256: options.plan.planSha256,
        candidateManifestSha256:
          options.candidateManifestSha256,
        candidateTarballSetSha256:
          options.candidate.tarballSetSha256,
        maxRunCostUsd: model.maxRunCostUsd,
        protocolMaximumUsd:
          options.protocol.budget.maximumModelSpendUsd,
        developmentTaskCount: options.plan.tasks.filter(
          (task) => task.partition === 'development',
        ).length,
      },
      paid: true,
      now: options.stageEvidence.agent.createdAt,
    });
    if (
      evidence.authorization.budgetApproval.approvalId !==
      options.record.budget.approvalId
    ) {
      throw new Error(
        'run record approval identity differs from its authorization',
      );
    }
    await verifyEvaluatorOutputBinding(
      options.root,
      options.stageEvidence.evaluator.output.budgetApprovalFile,
      evidence.authorization.budgetApproval.sha256,
      'budget approval',
    );
    await verifyEvaluatorOutputBinding(
      options.root,
      options.stageEvidence.evaluator.output.powerPilotFile,
      evidence.authorization.powerPilot?.sha256 ?? null,
      'power pilot',
    );
  } catch (error) {
    options.errors.push(
      `${options.run.runId}: run authorization is invalid (${error.message})`,
    );
  }
}

async function readRetainedStage(root, reference, expectedStage) {
  const attestationPath = resolveContained(
    root,
    reference.attestationFile.path,
    `${expectedStage} stage attestation`,
  );
  const bundlePath = resolveContained(
    root,
    reference.bundleFile.path,
    `${expectedStage} stage bundle`,
  );
  const verificationPath = resolveContained(
    root,
    reference.verificationFile.path,
    `${expectedStage} stage verification`,
  );
  const [attestationBytes, bundleBytes, verificationBytes] = await Promise.all([
    readFile(attestationPath),
    readFile(bundlePath),
    readFile(verificationPath),
  ]);
  assertRetainedFile(reference.attestationFile, attestationBytes, 'stage attestation');
  assertRetainedFile(reference.bundleFile, bundleBytes, 'stage bundle');
  assertRetainedFile(reference.verificationFile, verificationBytes, 'stage verification');
  const attestation = JSON.parse(attestationBytes);
  if (attestation.stage !== expectedStage) {
    throw new Error(`expected ${expectedStage} stage provenance`);
  }
  return {
    reference,
    attestation,
    attestationPath,
    bundlePath,
    verification: JSON.parse(verificationBytes),
  };
}

async function verifyEvaluatorOutputBinding(root, binding, digest, label) {
  if (binding === null || digest === null) {
    if (binding !== null || digest !== null) {
      throw new Error(`${label} nullability differs between evaluator and run record`);
    }
    return;
  }
  const category =
    label === 'evaluator result'
      ? 'evaluator-results'
      : label === 'trajectory manifest'
        ? 'trajectory-manifests'
        : label === 'workspace change'
          ? 'workspace-changes'
          : label === 'run authorization'
            ? 'run-authorizations'
            : label === 'budget approval'
              ? 'budget-approvals'
              : label === 'power pilot'
                ? 'power-pilots'
                : null;
  if (!category) throw new Error(`unknown evaluator output binding: ${label}`);
  const path = join(root, category, 'sha256', `${digest}.json`);
  const bytes = await readFile(path);
  if (
    binding.sha256 !== sha256(bytes) ||
    binding.bytes !== bytes.byteLength ||
    binding.path !== `${digest}.json`
  ) {
    throw new Error(`${label} differs from the evaluator-stage output binding`);
  }
}

function assertRetainedFile(binding, bytes, label) {
  if (binding.sha256 !== sha256(bytes) || binding.bytes !== bytes.byteLength) {
    throw new Error(`${label} file binding mismatch`);
  }
}

async function auditPowerPilotEvidence(options) {
  let digest = null;
  try {
    const bytes = await readFile(options.path);
    digest = sha256(bytes);
    const report = assertPowerPilot(options.report, {
      runPlanSha256: options.plan.planSha256,
      candidateTarballSetSha256: options.candidate.tarballSetSha256,
      developmentTaskCount: options.plan.tasks.filter((task) => task.partition === 'development').length,
    });
    if (report.developmentRunRecordSetSha256 !== options.recordAudit.developmentRecordSetSha256) {
      options.errors.push('power pilot is bound to a different development run-record set');
    }
    if (
      !options.recordAudit.latestDevelopmentRecordedAt ||
      Date.parse(options.recordAudit.latestDevelopmentRecordedAt) > Date.parse(report.frozenAt)
    ) {
      options.errors.push('power pilot was frozen before the complete development trajectory set existed');
    }
    if (
      !options.recordAudit.earliestQualificationRecordedAt ||
      Date.parse(options.recordAudit.earliestQualificationRecordedAt) <
        Date.parse(report.qualificationExecutionOpenedAt)
    ) {
      options.errors.push('qualification execution began before the frozen power gate opened');
    }
  } catch (error) {
    options.errors.push(`power pilot: ${error.message}`);
  }
  return { sha256: digest };
}

function validateRecordBinding(record, run, options, errors) {
  if (
    record.execution?.assurance !== 'github-host-split-stage-attested' ||
    record.execution?.productionEligible !== true ||
    record.execution?.agentEvaluatorStageSeparation !== true ||
    record.execution?.privateOracleAbsentDuringAgentStage !== true ||
    record.execution?.signedExternalProvenance !== true
  ) {
    errors.push(
      `${run.runId}: host run evidence is test-only; release evidence requires signed split-stage agent/evaluator execution`,
    );
  }
  if (record.runId !== run.runId || record.taskId !== run.taskId || record.arm !== run.arm) {
    errors.push(`${run.runId}: run identity, task, or arm mismatch`);
  }
  if (record.repetition !== run.repetition || record.model?.modelId !== run.modelId) {
    errors.push(`${run.runId}: repetition or model mismatch`);
  }
  if (
    record.partition !== run.partition ||
    record.repositoryId !== run.repositoryId ||
    record.framework !== run.framework
  ) {
    errors.push(`${run.runId}: partition, repository, or framework mismatch`);
  }
  if (record.bindings?.runPlanSha256 !== options.plan.planSha256) {
    errors.push(`${run.runId}: run-plan binding mismatch`);
  }
  if (record.bindings?.candidateManifestSha256 !== options.candidateManifestSha256) {
    errors.push(`${run.runId}: candidate manifest binding mismatch`);
  }
  if (record.bindings?.candidateTarballSetSha256 !== options.candidate.tarballSetSha256) {
    errors.push(`${run.runId}: candidate tarball binding mismatch`);
  }
  if (record.bindings?.taskManifestSha256 !== run.taskManifestSha256) {
    errors.push(`${run.runId}: task manifest binding mismatch`);
  }
  const task = options.plan.tasks.find((item) => item.taskId === run.taskId);
  if (record.bindings?.evaluatorContractSha256 !== task?.evaluatorContractSha256) {
    errors.push(`${run.runId}: evaluator contract binding mismatch`);
  }
  if (record.bindings?.qualificationControllerSha256 !== task?.qualificationControllerSha256) {
    errors.push(`${run.runId}: qualification controller binding mismatch`);
  }
  if (record.bindings?.qualificationReceiptFileSha256 !== task?.qualificationReceiptFileSha256) {
    errors.push(`${run.runId}: qualification receipt file binding mismatch`);
  }
  if (record.bindings?.qualificationReceiptSha256 !== task?.qualificationReceiptSha256) {
    errors.push(`${run.runId}: qualification receipt binding mismatch`);
  }
  for (const key of [
    'qualificationExecutionAttestationFileSha256',
    'qualificationExecutionAttestationSha256',
    'qualificationExecutionControllerSha256',
    'qualificationEvaluatorSourceClosureSha256',
    'qualificationInputRequestFileSha256',
    'qualificationInputRequestSha256',
    'qualificationInputManifestFileSha256',
    'qualificationInputManifestSha256',
    'qualificationRunnerRepositoryCommit',
    'qualificationProvenanceBundleFileSha256',
    'qualificationProvenanceVerificationSha256',
  ]) {
    if (record.bindings?.[key] !== task?.[key]) {
      errors.push(`${run.runId}: ${key} binding mismatch`);
    }
  }
  const receipt = options.qualificationReceiptByTask.get(run.taskId);
  if (
    !receipt ||
    record.bindings?.qualificationReceiptFileSha256 !== receipt.fileSha256 ||
    record.bindings?.qualificationReceiptSha256 !== receipt.receipt.receiptSha256 ||
    record.bindings?.qualificationControllerSha256 !== receipt.receipt.qualificationControllerSha256 ||
    record.bindings?.qualificationExecutionAttestationFileSha256 !==
      receipt.receipt.execution.attestationFileSha256 ||
    record.bindings?.qualificationExecutionAttestationSha256 !==
      receipt.receipt.execution.attestationSha256 ||
    record.bindings?.qualificationExecutionControllerSha256 !== receipt.receipt.execution.controllerSha256 ||
    record.bindings?.qualificationEvaluatorSourceClosureSha256 !==
      receipt.receipt.execution.evaluatorSourceClosureSha256 ||
    record.bindings?.qualificationInputRequestFileSha256 !==
      receipt.receipt.execution.inputRequestFileSha256 ||
    record.bindings?.qualificationInputRequestSha256 !== receipt.receipt.execution.inputRequestSha256 ||
    record.bindings?.qualificationInputManifestFileSha256 !==
      receipt.receipt.execution.inputManifestFileSha256 ||
    record.bindings?.qualificationInputManifestSha256 !== receipt.receipt.execution.inputManifestSha256 ||
    record.bindings?.qualificationRunnerRepositoryCommit !==
      receipt.receipt.execution.runnerRepositoryCommit ||
    record.bindings?.qualificationProvenanceBundleFileSha256 !==
      receipt.receipt.execution.provenanceBundleFileSha256 ||
    record.bindings?.qualificationProvenanceVerificationSha256 !==
      receipt.receipt.execution.provenanceVerificationSha256
  ) {
    errors.push(`${run.runId}: run record is not bound to the audited qualification receipt chain`);
  }
  if (record.bindings?.informationEntitlementSha256 !== task?.informationEntitlementSha256) {
    errors.push(`${run.runId}: information-entitlement binding mismatch`);
  }
  if (record.bindings?.environmentSpecSha256 !== task?.environmentSpecSha256) {
    errors.push(`${run.runId}: environment spec binding mismatch`);
  }
  if (record.bindings?.environmentSubstanceSha256 !== task?.environmentSubstanceSha256) {
    errors.push(`${run.runId}: environment substance binding mismatch`);
  }
  const prepared = options.preparedEnvironmentByTask.get(run.taskId);
  if (record.bindings?.runtimeMatrixFileSha256 !== task?.runtimeMatrixFileSha256) {
    errors.push(`${run.runId}: runtime matrix file binding mismatch`);
  }
  if (record.bindings?.runtimeMatrixSha256 !== options.runtimeMatrix.matrixSha256) {
    errors.push(`${run.runId}: runtime matrix binding mismatch`);
  }
  if (record.bindings?.benchmarkImageDigest !== task?.benchmarkImageDigest) {
    errors.push(`${run.runId}: benchmark image binding mismatch`);
  }
  const profile = options.runtimeMatrix.profiles.find(
    (item) => item.id === task?.runtimeProfileId,
  );
  if (record.bindings?.agentImageDigest !== profile?.agentImage?.digest) {
    errors.push(`${run.runId}: agent image binding mismatch`);
  }
  if (record.bindings?.preparedEnvironmentAttestationSha256 !== prepared?.fileSha256) {
    errors.push(`${run.runId}: prepared environment attestation binding mismatch`);
  }
  if (!/^[a-f0-9]{64}$/u.test(record.bindings?.deliverySha256 ?? '')) {
    errors.push(`${run.runId}: arm-delivery digest is missing`);
  }
  if (
    !/^[a-f0-9]{64}$/u.test(
      record.bindings?.authorizationSha256 ?? '',
    )
  ) {
    errors.push(`${run.runId}: run-authorization digest is missing`);
  }
  if (record.bindings?.environmentSha256 !== prepared?.attestation.environmentSha256) {
    errors.push(`${run.runId}: prepared environment identity mismatch`);
  }
  if (!/^[a-f0-9]{64}$/u.test(record.bindings?.agentControllerSha256 ?? '')) {
    errors.push(`${run.runId}: agent-controller digest is missing`);
  }
  if (!/^[a-f0-9]{64}$/u.test(record.bindings?.evaluatorControllerSha256 ?? '')) {
    errors.push(`${run.runId}: evaluator-stage controller digest is missing`);
  }
  if (
    record.bindings?.agentControllerSha256 !==
      options.stageControllers.agent.controllerSha256 ||
    record.bindings?.evaluatorControllerSha256 !==
      options.stageControllers.evaluator.controllerSha256
  ) {
    errors.push(`${run.runId}: stage controller closure differs from the audited release source`);
  }
  if (
    record.workspace?.beforeClean !== true ||
    record.workspace?.dependencyTreeBeforeVerified !== true ||
    record.workspace?.dependencyTreeAfterVerified !== true ||
    record.workspace?.baseCommit !== task?.base?.commit ||
    record.workspace?.baseTree !== task?.base?.tree ||
    !/^[a-f0-9]{64}$/u.test(record.workspace?.diffSha256 ?? '')
  ) {
    errors.push(`${run.runId}: clean workspace or base-tree evidence is invalid`);
  }
  if (
    record.model?.provider !== run.provider ||
    record.model?.returnedModel !== run.requestedModel ||
    record.model?.identityMatched !== true
  ) {
    errors.push(`${run.runId}: provider-returned model identity does not match the frozen model`);
  }
  if (record.budget?.paid !== true || typeof record.budget?.approvalId !== 'string') {
    errors.push(`${run.runId}: release evidence must come from an approved paid run`);
  }
  const model = options.models.models?.find((item) => item.id === run.modelId);
  if (
    !model ||
    record.budget?.reservedUsd !== model.maxRunCostUsd ||
    !Number.isFinite(record.budget?.actualUsd) ||
    record.budget.actualUsd < 0 ||
    record.budget.actualUsd > record.budget.reservedUsd + Number.EPSILON
  ) {
    errors.push(`${run.runId}: per-run budget reservation or settlement is invalid`);
  }
}

async function verifyWorkspaceChange(root, digest, runId, errors) {
  const change = await readContentAddressedArtifact(
    root,
    'workspace-changes',
    digest,
    `${runId}: workspace change`,
    errors,
  );
  if (
    change &&
    (change.schemaVersion !== 'decantr-benchmark-workspace-change.v1' ||
      typeof change.diff !== 'string' ||
      !Array.isArray(change.changedPaths) ||
      !Array.isArray(change.untracked))
  ) {
    errors.push(`${runId}: workspace change artifact is invalid`);
  }
}

async function readContentAddressedArtifact(root, category, digest, label, errors) {
  if (!/^[a-f0-9]{64}$/u.test(digest ?? '')) {
    errors.push(`${label}: digest is missing`);
    return null;
  }
  try {
    const bytes = await readFile(join(root, category, 'sha256', `${digest}.json`));
    if (sha256(bytes) !== digest) {
      errors.push(`${label}: content-address digest mismatch`);
      return null;
    }
    return JSON.parse(bytes);
  } catch (error) {
    errors.push(`${label}: artifact unavailable (${error.message})`);
    return null;
  }
}

async function verifyTrajectory(root, digest, run, record, errors) {
  const runId = run.runId;
  const manifest = await readContentAddressedArtifact(
    root,
    'trajectory-manifests',
    digest,
    `${runId}: trajectory manifest`,
    errors,
  );
  if (!manifest) return null;
  if (manifest.runId !== runId || manifest.complete !== true) {
    errors.push(`${runId}: trajectory manifest identity or completeness mismatch`);
  }
  if (manifest.armDeliverySha256 !== record.bindings?.deliverySha256) {
    errors.push(`${runId}: trajectory arm-delivery binding mismatch`);
  }
  const delivery = await readContentAddressedArtifact(
    root,
    'arm-deliveries',
    manifest.armDeliverySha256,
    `${runId}: arm delivery`,
    errors,
  );
  if (
    delivery &&
    (delivery.schemaVersion !== 'decantr-benchmark-arm-delivery.v1' ||
      delivery.arm !== run.arm ||
      delivery.sharedTaskInputSha256 !== sha256Canonical(delivery.sharedTaskInput) ||
      !Array.isArray(delivery.instructions) ||
      delivery.instructions.length === 0 ||
      (run.arm === 'control' && delivery.productContext !== null) ||
      (run.arm === 'treatment' &&
        (delivery.productContext?.schemaVersion !== 'ui-surface-task-context.v1' ||
          !['ready', 'limited'].includes(delivery.productContext?.status) ||
          !Array.isArray(delivery.productContext?.read) ||
          delivery.productContext.read.length === 0)))
  ) {
    errors.push(`${runId}: arm-delivery artifact is invalid`);
  }
  const request = await readContentAddressedArtifact(
    root,
    'adapter-requests',
    manifest.adapterRequestSha256,
    `${runId}: adapter request`,
    errors,
  );
  if (
    request &&
    (request.runId !== runId ||
      request.taskId !== run.taskId ||
      request.modelId !== run.modelId ||
      request.provider !== run.provider ||
      request.requestedModel !== run.requestedModel ||
      request.arm !== run.arm ||
      request.repetition !== run.repetition ||
      request.bindings?.planSha256 !== record.bindings?.runPlanSha256 ||
      request.bindings?.candidateManifestSha256 !==
        record.bindings?.candidateManifestSha256 ||
      request.bindings?.candidateTarballSetSha256 !== record.bindings?.candidateTarballSetSha256 ||
      request.bindings?.taskManifestSha256 !== record.bindings?.taskManifestSha256 ||
      request.bindings?.informationEntitlementSha256 !== record.bindings?.informationEntitlementSha256 ||
      request.bindings?.environmentSpecSha256 !== record.bindings?.environmentSpecSha256 ||
      request.bindings?.environmentSubstanceSha256 !== record.bindings?.environmentSubstanceSha256 ||
      request.bindings?.runtimeMatrixSha256 !== record.bindings?.runtimeMatrixSha256 ||
      request.bindings?.preparedEnvironmentAttestationSha256 !==
        record.bindings?.preparedEnvironmentAttestationSha256 ||
      request.bindings?.deliverySha256 !== record.bindings?.deliverySha256 ||
      request.bindings?.environmentSha256 !== record.bindings?.environmentSha256 ||
      request.bindings?.agentControllerSha256 !== record.bindings?.agentControllerSha256 ||
      request.bindings?.agentImageDigest !== record.bindings?.agentImageDigest ||
      request.bindings?.baseCommit !== record.workspace?.baseCommit ||
      request.bindings?.baseTree !== record.workspace?.baseTree ||
      (delivery && request.context !== canonicalJson(delivery)) ||
      (delivery &&
        delivery.sharedTaskInputSha256 !== sha256Canonical(request.informationEntitlement?.taskInput)))
  ) {
    errors.push(`${runId}: adapter request differs from the plan or run record`);
  }
  const response = await readContentAddressedArtifact(
    root,
    'adapter-responses',
    manifest.adapterResponseSha256,
    `${runId}: adapter response`,
    errors,
  );
  if (
    response &&
    (response.provider !== run.provider ||
      response.requestedModel !== run.requestedModel ||
      response.returnedModel !== record.model?.returnedModel ||
      response.status !== (record.status === 'completed' ? 'completed' : response.status) ||
      response.usage?.inputTokens !== record.usage?.inputTokens ||
      response.usage?.outputTokens !== record.usage?.outputTokens ||
      response.usage?.cachedInputTokens !== record.usage?.cachedInputTokens ||
      response.usage?.requests !== record.usage?.requests ||
      response.usage?.costUsd !== record.budget?.actualUsd)
  ) {
    errors.push(`${runId}: adapter response differs from the run record`);
  }
  if (!Array.isArray(manifest.events) || manifest.events.length === 0) {
    errors.push(`${runId}: trajectory manifest contains no events`);
    return null;
  }
  const eventSequences = new Set();
  const recordedTimes = [];
  for (const event of manifest.events) {
    if (eventSequences.has(event.sequence)) errors.push(`${runId}: duplicate trajectory event sequence ${event.sequence}`);
    eventSequences.add(event.sequence);
    const value = await readContentAddressedArtifact(
      root,
      'trajectory-events',
      event.sha256,
      `${runId}: trajectory event ${event.sequence}`,
      errors,
    );
    if (value && (value.runId !== runId || value.sequence !== event.sequence)) {
      errors.push(`${runId}: trajectory event ${event.sequence} identity mismatch`);
    }
    if (value) {
      const recordedAt = Date.parse(value.recordedAt);
      if (!Number.isFinite(recordedAt)) errors.push(`${runId}: trajectory event ${event.sequence} timestamp is invalid`);
      else recordedTimes.push(recordedAt);
    }
  }
  for (let sequence = 0; sequence < manifest.events.length; sequence += 1) {
    if (!eventSequences.has(sequence)) errors.push(`${runId}: trajectory event sequence ${sequence} is missing`);
  }
  if (recordedTimes.length === 0) return null;
  return {
    firstRecordedAt: new Date(Math.min(...recordedTimes)).toISOString(),
    lastRecordedAt: new Date(Math.max(...recordedTimes)).toISOString(),
  };
}

function minTimestamp(left, right) {
  if (!left) return right;
  return Date.parse(left) <= Date.parse(right) ? left : right;
}

function maxTimestamp(left, right) {
  if (!left) return right;
  return Date.parse(left) >= Date.parse(right) ? left : right;
}

async function verifyEvaluatorResult(root, digest, run, record, errors) {
  const runId = run.runId;
  const result = await readContentAddressedArtifact(
    root,
    'evaluator-results',
    digest,
    `${runId}: evaluator result`,
    errors,
  );
  if (
    result &&
    (result.schemaVersion !== 'decantr-benchmark-evaluator-result.v1' ||
      result.runId !== runId ||
      result.taskId !== run.taskId ||
      result.contractSha256 !== record.bindings?.evaluatorContractSha256 ||
      result.status !== 'passed' ||
      result.metrics?.functionalSuccess !== true ||
      result.metrics?.buildPassed !== true ||
      !Number.isFinite(result.metrics?.governanceViolations) ||
      result.metrics.governanceViolations < 0)
  ) {
    errors.push(`${runId}: evaluator result identity, contract, status, or metrics mismatch`);
  }
}

function auditArmParity(records, errors) {
  const groups = new Map();
  for (const record of records) {
    const key = `${record.taskId}:${record.model?.modelId}:${record.repetition}`;
    const items = groups.get(key) ?? [];
    items.push(record);
    groups.set(key, items);
  }
  const bindingFields = [
    'candidateTarballSetSha256',
    'taskManifestSha256',
    'evaluatorContractSha256',
    'informationEntitlementSha256',
    'environmentSpecSha256',
    'environmentSubstanceSha256',
    'qualificationControllerSha256',
    'qualificationReceiptFileSha256',
    'qualificationReceiptSha256',
    'runtimeMatrixFileSha256',
    'runtimeMatrixSha256',
    'benchmarkImageDigest',
    'preparedEnvironmentAttestationSha256',
    'environmentSha256',
    'agentControllerSha256',
  ];
  for (const [key, items] of groups) {
    if (items.length !== 2 || new Set(items.map((item) => item.arm)).size !== 2) {
      errors.push(`${key}: arm parity requires exactly one control and one treatment record`);
      continue;
    }
    for (const field of bindingFields) {
      if (items[0].bindings?.[field] !== items[1].bindings?.[field]) {
        errors.push(`${key}: arm parity mismatch for ${field}`);
      }
    }
    if (
      items[0].workspace?.baseCommit !== items[1].workspace?.baseCommit ||
      items[0].workspace?.baseTree !== items[1].workspace?.baseTree
    ) {
      errors.push(`${key}: arm parity base tree mismatch`);
    }
  }
}

function auditReviews(
  assignments,
  reviews,
  assignmentsSha256,
  plan,
  qualificationRecordSetSha256,
  recordDigestByRun,
  errors,
) {
  if (assignments.schemaVersion !== 'decantr-benchmark-review-assignments.v1') {
    errors.push('private review assignments schemaVersion is invalid');
  }
  if (assignments.runPlanSha256 !== plan.planSha256) errors.push('review assignments run-plan binding mismatch');
  if (assignments.seed !== expectedReviewSeed(plan.seed)) {
    errors.push('review assignments seed differs from the committed deterministic seed');
  }
  if (assignments.recordSetSha256 !== qualificationRecordSetSha256) {
    errors.push('review assignments run-record-set binding mismatch');
  }
  if (reviews.schemaVersion !== 'decantr-benchmark-review-workbook.v1' || reviews.blinded !== true) {
    errors.push('sealed blinded review workbook is required');
  }
  if (reviews.assignmentsSha256 !== assignmentsSha256) errors.push('review workbook assignments binding mismatch');
  const reviewers = Array.isArray(reviews.reviewers) ? reviews.reviewers : [];
  if (reviewers.length !== 2 || new Set(reviewers).size !== 2) {
    errors.push('review workbook must identify exactly two distinct reviewers');
  }
  const expectedAssignments =
    plan.runs.filter((run) => run.partition === 'qualification').length / 2;
  if (assignments.assignments?.length !== expectedAssignments) {
    errors.push(`review assignment count must be ${expectedAssignments}`);
  }
  const declaredAssignmentIds = new Set(
    (assignments.assignments ?? []).map((assignment) => assignment.assignmentId),
  );
  if (declaredAssignmentIds.size !== (assignments.assignments?.length ?? 0)) {
    errors.push('private review assignments contain duplicate assignment IDs');
  }
  const reviewsByAssignment = new Map();
  for (const review of reviews.reviews ?? []) {
    if (!declaredAssignmentIds.has(review.assignmentId)) {
      errors.push(`${review.assignmentId}: review references an unknown assignment`);
    }
    if (!reviewers.includes(review.reviewerId)) {
      errors.push(`${review.assignmentId}: review references an unknown reviewer`);
    }
    validateReviewEvidence(review, errors);
    const items = reviewsByAssignment.get(review.assignmentId) ?? [];
    items.push(review);
    reviewsByAssignment.set(review.assignmentId, items);
  }
  const adjudications = new Map();
  for (const adjudication of reviews.adjudications ?? []) {
    if (!declaredAssignmentIds.has(adjudication.assignmentId)) {
      errors.push(`${adjudication.assignmentId}: adjudication references an unknown assignment`);
    }
    if (adjudications.has(adjudication.assignmentId)) {
      errors.push(`${adjudication.assignmentId}: duplicate adjudication`);
    }
    validateAdjudicationEvidence(adjudication, errors);
    adjudications.set(adjudication.assignmentId, adjudication);
  }
  const expectedRunIds = new Set(
    plan.runs.filter((run) => run.partition === 'qualification').map((run) => run.runId),
  );
  const runById = new Map(plan.runs.map((run) => [run.runId, run]));
  const assignedRunIds = new Set();
  const assignmentIds = new Set();
  for (const assignment of assignments.assignments ?? []) {
    if (assignmentIds.has(assignment.assignmentId)) {
      errors.push(`${assignment.assignmentId}: duplicate review assignment`);
    }
    assignmentIds.add(assignment.assignmentId);
    if (
      assignment.candidates?.length !== 2 ||
      new Set(assignment.candidates.map((item) => item.label)).size !== 2 ||
      !assignment.candidates.some((item) => item.label === 'A') ||
      !assignment.candidates.some((item) => item.label === 'B') ||
      new Set(assignment.candidates.map((item) => item.arm)).size !== 2 ||
      !assignment.candidates.some((item) => item.arm === 'control') ||
      !assignment.candidates.some((item) => item.arm === 'treatment')
    ) {
      errors.push(`${assignment.assignmentId}: candidates must be blinded A/B control/treatment pairs`);
    }
    for (const candidate of assignment.candidates ?? []) {
      const run = runById.get(candidate.runId);
      if (!expectedRunIds.has(candidate.runId)) {
        errors.push(`${assignment.assignmentId}: candidate references an unexpected run`);
      }
      if (assignedRunIds.has(candidate.runId)) {
        errors.push(`${assignment.assignmentId}: run appears in more than one review assignment`);
      }
      assignedRunIds.add(candidate.runId);
      if (recordDigestByRun.get(candidate.runId) !== candidate.recordSha256) {
        errors.push(`${assignment.assignmentId}: candidate record digest mismatch`);
      }
      if (
        !run ||
        candidate.arm !== run.arm ||
        candidate.modelId !== run.modelId ||
        candidate.repetition !== run.repetition ||
        assignment.taskId !== run.taskId ||
        assignment.framework !== run.framework
      ) {
        errors.push(`${assignment.assignmentId}: private candidate mapping differs from the frozen run plan`);
      }
    }
    if (
      new Set((assignment.candidates ?? []).map((item) => item.modelId)).size !== 1 ||
      new Set((assignment.candidates ?? []).map((item) => item.repetition)).size !== 1
    ) {
      errors.push(`${assignment.assignmentId}: candidates must share model and repetition`);
    }
    const items = reviewsByAssignment.get(assignment.assignmentId) ?? [];
    if (
      items.length !== 2 ||
      new Set(items.map((item) => item.reviewerId)).size !== 2 ||
      reviewers.some((reviewer) => !items.some((item) => item.reviewerId === reviewer))
    ) {
      errors.push(`${assignment.assignmentId}: exactly two independent reviews are required`);
      continue;
    }
    if (items[0].preference !== items[1].preference && !adjudications.has(assignment.assignmentId)) {
      errors.push(`${assignment.assignmentId}: reviewer disagreement lacks adjudication`);
    }
  }
  if (assignedRunIds.size !== expectedRunIds.size) errors.push('review assignments do not cover every qualification run exactly once');
}

function validateReviewEvidence(review, errors) {
  if (!['A', 'B', 'tie'].includes(review.preference)) {
    errors.push(`${review.assignmentId}: review preference is invalid`);
  }
  for (const label of ['A', 'B']) {
    if (!Number.isFinite(review.scores?.[label]) || review.scores[label] < 0 || review.scores[label] > 100) {
      errors.push(`${review.assignmentId}: review score ${label} is invalid`);
    }
  }
  if (!Number.isFinite(Date.parse(review.completedAt))) {
    errors.push(`${review.assignmentId}: review completion timestamp is invalid`);
  }
}

function validateAdjudicationEvidence(adjudication, errors) {
  if (!['A', 'B', 'tie'].includes(adjudication.preference)) {
    errors.push(`${adjudication.assignmentId}: adjudication preference is invalid`);
  }
  if (typeof adjudication.adjudicatorId !== 'string' || adjudication.adjudicatorId === '') {
    errors.push(`${adjudication.assignmentId}: adjudicatorId is required`);
  }
  if (typeof adjudication.reason !== 'string' || adjudication.reason.trim() === '') {
    errors.push(`${adjudication.assignmentId}: adjudication reason is required`);
  }
  if (!Number.isFinite(Date.parse(adjudication.completedAt))) {
    errors.push(`${adjudication.assignmentId}: adjudication completion timestamp is invalid`);
  }
}

function auditStatistics(statistics, bindings, errors) {
  if (statistics.schemaVersion !== 'decantr-benchmark-statistics.v1') {
    errors.push('statistics schemaVersion is invalid');
    return;
  }
  if (statistics.analysisSeed !== expectedAnalysisSeed(bindings.plan.seed)) {
    errors.push('statistics analysis seed differs from the committed deterministic seed');
  }
  for (const [name, expected] of Object.entries({
    analysisCodeSha256: bindings.analysisCodeSha256,
    runPlanSha256: bindings.planSha256,
    protocolSha256: bindings.protocolSha256,
    qualificationTaskIndexSha256: bindings.qualificationIndexSha256,
    runRecordSetSha256: bindings.qualificationRecordSetSha256,
    assignmentsSha256: bindings.assignmentsSha256,
    reviewWorkbookSha256: bindings.reviewsSha256,
  })) {
    if (statistics.bindings?.[name] !== expected) errors.push(`statistics ${name} binding mismatch`);
  }
  if (statistics.allGatesPassed !== true) errors.push('statistics do not pass every predeclared gate');
  if (
    !statistics.gates ||
    REQUIRED_STATISTICAL_GATES.some((gate) => statistics.gates[gate] !== true) ||
    Object.values(statistics.gates).some((value) => value !== true)
  ) {
    errors.push('one or more statistics gates are false or missing');
  }

  const functional = statistics.functionalNonInferiority;
  if (
    functional?.margin !== -0.05 ||
    functional?.confirmatoryScope !== 'overall-within-model' ||
    !Array.isArray(functional?.overallByModel) ||
    !Array.isArray(functional?.exploratoryByFramework)
  ) {
    errors.push('functional noninferiority statistics do not match the frozen protocol scope');
    return;
  }
  const qualificationTasks = bindings.plan.tasks.filter((task) => task.partition === 'qualification');
  const qualificationRuns = bindings.plan.runs.filter((run) => run.partition === 'qualification');
  const modelIds = [...new Set(bindings.plan.runs.map((run) => run.modelId))].sort();
  if (
    statistics.denominators?.sealedQualificationTasks !== qualificationTasks.length ||
    statistics.denominators?.expectedRuns !== qualificationRuns.length ||
    statistics.denominators?.observedRuns !== qualificationRuns.length
  ) {
    errors.push('statistics qualification denominators do not match the sealed run plan');
  }

  auditModelEstimates(
    statistics.modelLift,
    modelIds,
    qualificationTasks.length,
    (item) => item.estimate >= 5 && item.confidenceInterval?.lower > 0,
    'model lift',
    errors,
  );
  auditModelEstimates(
    statistics.governanceReduction,
    modelIds,
    qualificationTasks.length,
    (item) => item.estimate >= 25 && item.confidenceInterval?.lower > 0,
    'governance reduction',
    errors,
  );
  const overallByModel = new Map(
    functional.overallByModel.map((item) => [item.modelId, item]),
  );
  if (overallByModel.size !== modelIds.length || functional.overallByModel.length !== modelIds.length) {
    errors.push('functional noninferiority must contain exactly one confirmatory result per model');
  }
  for (const modelId of modelIds) {
    const result = overallByModel.get(modelId);
    if (
      !result ||
      result.n !== qualificationTasks.length ||
      !Number.isFinite(result.confidenceInterval?.lower) ||
      result.confidenceInterval.lower < functional.margin
    ) {
      errors.push(`${modelId}: overall functional noninferiority evidence is missing or failing`);
    }
  }

  const frameworkCounts = new Map();
  for (const task of qualificationTasks) {
    frameworkCounts.set(task.framework, (frameworkCounts.get(task.framework) ?? 0) + 1);
  }
  const exploratoryByCell = new Map();
  for (const item of functional.exploratoryByFramework) {
    const key = `${item.modelId}:${item.framework}`;
    if (exploratoryByCell.has(key)) errors.push(`${key}: duplicate exploratory framework result`);
    exploratoryByCell.set(key, item);
    if (
      item.powered !== false ||
      item.gateEligible !== false ||
      item.interpretation !== 'exploratory-unpowered'
    ) {
      errors.push(`${key}: framework result is not visibly marked exploratory and unpowered`);
    }
  }
  for (const modelId of modelIds) {
    for (const [framework, taskCount] of frameworkCounts) {
      const item = exploratoryByCell.get(`${modelId}:${framework}`);
      if (!item || item.n !== taskCount) {
        errors.push(`${modelId}:${framework}: exploratory framework result is missing or has the wrong denominator`);
      }
    }
  }
  if (exploratoryByCell.size !== modelIds.length * frameworkCounts.size) {
    errors.push('exploratory functional results must cover every qualification model/framework cell');
  }

  if (
    statistics.blindPreference?.analysisUnit !== 'qualification-task-model' ||
    statistics.blindPreference?.population !== 'sealed-qualification-only' ||
    statistics.blindPreference?.plannedUnits !== 32 ||
    statistics.blindPreference?.minimumDecisiveUnits !== 26 ||
    statistics.blindPreference?.pointEstimateMinimum !== 0.6 ||
    statistics.blindPreference?.wilsonLowerBoundMustExceed !== 0.5 ||
    statistics.blindPreference?.n < 26 ||
    !Number.isFinite(statistics.blindPreference?.estimate) ||
    statistics.blindPreference.estimate < 0.6 ||
    !Number.isFinite(statistics.blindPreference?.confidenceInterval?.lower) ||
    statistics.blindPreference.confidenceInterval.lower <= 0.5 ||
    !Number.isFinite(statistics.blindPreference?.confidenceInterval?.upper) ||
    statistics.claimAuthorization?.mixedValueClaim !== 'no-value-claim' ||
    statistics.claimAuthorization?.scopedHypothesesPredeclaredAndPowered !== false ||
    (statistics.claimAuthorization?.outcome !== 'pass' &&
      statistics.claimAuthorization?.valueClaim !== 'no-value-claim')
  ) {
    errors.push('blinded task/model preference does not meet the predeclared denominator, rate, and Wilson gates');
  }
  for (const [name, limit] of [
    ['medianPercent', 15],
    ['p95Percent', 25],
  ]) {
    for (const kind of ['tokens', 'cost']) {
      const summary = statistics.overhead?.[kind];
      if (
        !Number.isFinite(summary?.[name]) ||
        summary[name] > limit ||
        summary.undefinedPairs !== 0
      ) {
        errors.push(`${kind} overhead ${name} does not meet the frozen gate`);
      }
    }
  }
}

function auditModelEstimates(items, modelIds, expectedN, passes, label, errors) {
  if (!Array.isArray(items)) {
    errors.push(`${label} results are missing`);
    return;
  }
  const byModel = new Map(items.map((item) => [item.modelId, item]));
  if (byModel.size !== modelIds.length || items.length !== modelIds.length) {
    errors.push(`${label} must contain exactly one result per model`);
  }
  for (const modelId of modelIds) {
    const item = byModel.get(modelId);
    if (!item || item.n !== expectedN || !passes(item)) {
      errors.push(`${modelId}: ${label} evidence is missing or failing`);
    }
  }
}

function auditBudgetApproval(
  approval,
  models,
  protocol,
  runPlanSha256,
  tarballSetSha256,
  powerPilotSha256,
  errors,
) {
  for (const model of models.models ?? []) {
    try {
      assertBudgetApproval(approval, {
        runPlanSha256,
        candidateTarballSetSha256: tarballSetSha256,
        modelId: model.id,
        protocolMaximumUsd: protocol.budget.maximumModelSpendUsd,
        powerPilotSha256,
      });
    } catch (error) {
      errors.push(`budget approval: ${error.message}`);
      break;
    }
  }
}

function auditClaims(claims, statistics, statisticsSha256, tarballSetSha256, protocol, plan, errors) {
  if (claims.schemaVersion !== 'decantr-benchmark-claims.v1') {
    errors.push('claims schemaVersion is invalid');
    return;
  }
  if (claims.statisticsSha256 !== statisticsSha256) errors.push('claims statistics binding mismatch');
  if (claims.candidateTarballSetSha256 !== tarballSetSha256) errors.push('claims candidate binding mismatch');
  if (!Array.isArray(claims.claims) || claims.claims.length === 0) {
    errors.push('at least one bounded claim is required');
    return;
  }
  const knownModels = new Set(plan.runs.map((run) => run.modelId));
  const knownFrameworks = new Set(
    plan.tasks.filter((task) => task.partition === 'qualification').map((task) => task.framework),
  );
  for (const claim of claims.claims) {
    if (!['measured-improvement', 'scoped-improvement', 'no-value-claim'].includes(claim.claimType)) {
      errors.push(`${claim.id ?? 'claim'}: claimType is invalid`);
    }
    if (typeof claim.statement !== 'string' || claim.statement.length < 20 || claim.statement.length > 500) {
      errors.push(`${claim.id ?? 'claim'}: statement length is invalid`);
    }
    if (/(?:guarantee|all UI projects|industry-wide|human-qualified|adoption-proven|waiver)/iu.test(claim.statement ?? '')) {
      errors.push(`${claim.id ?? 'claim'}: statement contains an unbounded or waived claim`);
    }
    if (claim.taskPopulation !== 'sealed-qualification-2026-07-22') {
      errors.push(`${claim.id ?? 'claim'}: task population is not bounded`);
    }
    if (!Array.isArray(claim.models) || claim.models.length === 0 || claim.models.some((id) => !knownModels.has(id))) {
      errors.push(`${claim.id ?? 'claim'}: model scope is missing or invalid`);
    }
    if (
      !Array.isArray(claim.frameworks) ||
      claim.frameworks.length === 0 ||
      claim.frameworks.some((framework) => !knownFrameworks.has(framework))
    ) {
      errors.push(`${claim.id ?? 'claim'}: framework scope is missing or invalid`);
    }
    if (!Array.isArray(claim.limitations) || claim.limitations.length === 0) {
      errors.push(`${claim.id ?? 'claim'}: limitations are required`);
    }
    if (
      !Array.isArray(claim.gateIds) ||
      claim.gateIds.length === 0 ||
      claim.gateIds.some((gate) => statistics.gates?.[gate] !== true)
    ) {
      errors.push(`${claim.id ?? 'claim'}: claim references a missing or failed gate`);
    }
    if (claim.claimType === 'measured-improvement' && statistics.allGatesPassed !== true) {
      errors.push(`${claim.id ?? 'claim'}: measured improvement requires every release gate`);
    }
    if (claim.claimType === 'scoped-improvement') {
      errors.push(
        `${claim.id ?? 'claim'}: framework-scoped improvement is unavailable because framework strata are exploratory and unpowered`,
      );
    }
    if (
      claim.claimType === 'measured-improvement' &&
      (!Array.isArray(claim.models) ||
        !Array.isArray(claim.frameworks) ||
        !Array.isArray(claim.gateIds) ||
        new Set(claim.models).size !== knownModels.size ||
        new Set(claim.frameworks).size !== knownFrameworks.size ||
        REQUIRED_STATISTICAL_GATES.some((gate) => !claim.gateIds.includes(gate)))
    ) {
      errors.push(
        `${claim.id ?? 'claim'}: measured improvement must cover the full qualification population and every predeclared gate`,
      );
    }
  }
  if (
    claims.claims.some((claim) => claim.claimType === 'measured-improvement') &&
    !claims.claims.some((claim) => claim.statement === protocol.productClaim)
  ) {
    errors.push('measured-improvement claims must include the frozen protocol claim verbatim');
  }
}

async function finish(options, errors, bindings) {
  const report = {
    schemaVersion: 'decantr-benchmark-release-gate-audit.v1',
    ok: errors.length === 0,
    errors,
    bindings,
    humanReviewWaiverAllowed: false,
  };
  if (options.outputPath) await writeCanonicalFile(options.outputPath, report);
  return report;
}

function assertExactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${label} keys mismatch: expected ${wanted.join(', ')}, received ${actual.join(', ')}`);
  }
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--corpus') options.corpusPath = resolve(argv[++index]);
    else if (argument === '--models') options.modelsPath = resolve(argv[++index]);
    else if (argument === '--protocol') options.protocolPath = resolve(argv[++index]);
    else if (argument === '--runtime-matrix') options.runtimeMatrixPath = resolve(argv[++index]);
    else if (argument === '--development-task-root') options.developmentTaskRoot = resolve(argv[++index]);
    else if (argument === '--qualification-task-root') options.qualificationTaskRoot = resolve(argv[++index]);
    else if (argument === '--development-receipt-root') options.developmentReceiptRoot = resolve(argv[++index]);
    else if (argument === '--qualification-receipt-root') options.qualificationReceiptRoot = resolve(argv[++index]);
    else if (argument === '--development-environment-root') options.developmentEnvironmentRoot = resolve(argv[++index]);
    else if (argument === '--qualification-environment-root') options.qualificationEnvironmentRoot = resolve(argv[++index]);
    else if (argument === '--prepared-environment-root') options.preparedEnvironmentRoot = resolve(argv[++index]);
    else if (argument === '--qualification-index') options.qualificationIndexPath = resolve(argv[++index]);
    else if (argument === '--plan') options.planPath = resolve(argv[++index]);
    else if (argument === '--candidate-manifest') options.candidateManifestPath = resolve(argv[++index]);
    else if (argument === '--record-root') options.recordRoot = resolve(argv[++index]);
    else if (argument === '--hidden-evaluator-manifest') options.hiddenEvaluatorManifestPath = resolve(argv[++index]);
    else if (argument === '--assignments') options.assignmentsPath = resolve(argv[++index]);
    else if (argument === '--reviews') options.reviewWorkbookPath = resolve(argv[++index]);
    else if (argument === '--statistics') options.statisticsPath = resolve(argv[++index]);
    else if (argument === '--power-pilot') options.powerPilotPath = resolve(argv[++index]);
    else if (argument === '--budget-approval') options.budgetApprovalPath = resolve(argv[++index]);
    else if (argument === '--claims') options.claimsPath = resolve(argv[++index]);
    else if (argument === '--cosign') options.cosignPath = resolve(argv[++index]);
    else if (argument === '--out') options.outputPath = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argument}`);
  }
  for (const name of [
    'corpusPath',
    'modelsPath',
    'protocolPath',
    'runtimeMatrixPath',
    'developmentTaskRoot',
    'qualificationTaskRoot',
    'developmentReceiptRoot',
    'qualificationReceiptRoot',
    'developmentEnvironmentRoot',
    'qualificationEnvironmentRoot',
    'preparedEnvironmentRoot',
    'qualificationIndexPath',
    'planPath',
    'candidateManifestPath',
    'recordRoot',
    'hiddenEvaluatorManifestPath',
    'assignmentsPath',
    'reviewWorkbookPath',
    'statisticsPath',
    'powerPilotPath',
    'budgetApprovalPath',
    'claimsPath',
  ]) {
    if (!options[name]) throw new Error(`Missing required option: ${name}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const report = await auditReleaseGate(parseArgs(process.argv.slice(2)));
    console.log(prettyCanonicalJson(report).trim());
    if (!report.ok) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
