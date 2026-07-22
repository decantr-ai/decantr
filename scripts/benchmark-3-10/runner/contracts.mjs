import { access, readFile } from 'node:fs/promises';
import { dirname, isAbsolute, resolve } from 'node:path';
import { canonicalJson, sha256, sha256Canonical } from './canonical.mjs';
import { assertProvider, verifyCandidateRuntime } from './candidate-runtime.mjs';

const SHA256 = /^[a-f0-9]{64}$/u;
const IMAGE_DIGEST = /^sha256:[a-f0-9]{64}$/u;
const GIT_SHA = /^[a-f0-9]{40}$/u;
const TASK_ID = /^[a-z0-9][a-z0-9._-]{2,95}$/u;
export const AUTHORIZATION_STATEMENT =
  'I approve paid Decantr 3.10 benchmark model execution up to the stated limit.';
export const CONTROL_DELIVERY_CONTEXT = 'Use the repository policy card.';
export const TREATMENT_DELIVERY_CONTEXT = 'Use the Decantr task context.';

export function expectedReviewSeed(planSeed) {
  return sha256(`${planSeed}:blinded-review:v1`);
}

export function expectedAnalysisSeed(protocolSeed) {
  return sha256(`${protocolSeed}:qualification-analysis:v1`);
}

export function assertTaskManifest(task, expectedPartition) {
  assertObject(task, 'task manifest');
  assertExactKeys(
    task,
    [
      'armInputs',
      'base',
      'candidateSha256',
      'corpusCommit',
      'corpusProjectPath',
      'environment',
      'evaluator',
      'framework',
      'informationEntitlement',
      'informationEntitlementSha256',
      'kind',
      'limits',
      'partition',
      'projectPath',
      'prompt',
      'repositoryId',
      'schemaVersion',
      'scope',
      'taskId',
    ],
    'task manifest',
  );
  assertEqual(task.schemaVersion, 'decantr-benchmark-task.v2', 'task schemaVersion');
  assertPattern(task.taskId, TASK_ID, 'taskId');
  assertOneOf(task.partition, ['development', 'qualification'], 'task partition');
  if (expectedPartition) assertEqual(task.partition, expectedPartition, 'task partition');
  assertOneOf(task.kind, ['repository', 'adversarial'], 'task kind');
  assertString(task.repositoryId, 'repositoryId');
  assertString(task.framework, 'framework');
  assertString(task.projectPath, 'projectPath');
  assertString(task.corpusProjectPath, 'corpusProjectPath');
  assertPattern(task.corpusCommit, GIT_SHA, 'corpusCommit');
  assertPattern(task.candidateSha256, SHA256, `${task.taskId}: candidate digest`);
  assertBase(task.base, 'task base');
  if (typeof task.prompt !== 'string' || task.prompt.trim().length < 20) {
    throw new Error(`${task.taskId}: prompt must contain at least 20 characters`);
  }
  if (/decantr/iu.test(task.prompt)) throw new Error(`${task.taskId}: shared prompt must be product-neutral`);
  assertObject(task.informationEntitlement, `${task.taskId}: informationEntitlement`);
  if (/decantr/iu.test(canonicalJson(task.informationEntitlement))) {
    throw new Error(`${task.taskId}: shared information entitlement must be product-neutral`);
  }
  assertSharedTaskInput(task.informationEntitlement.taskInput, task.taskId);
  const entitlementDigest = sha256Canonical(task.informationEntitlement);
  assertEqual(
    task.informationEntitlementSha256,
    entitlementDigest,
    `${task.taskId}: information entitlement digest`,
  );
  assertObject(task.armInputs, `${task.taskId}: armInputs`);
  assertExactKeys(task.armInputs, ['control', 'treatment'], `${task.taskId}: armInputs`);
  for (const arm of ['control', 'treatment']) {
    assertObject(task.armInputs[arm], `${task.taskId}: ${arm} input`);
    assertExactKeys(task.armInputs[arm], ['context', 'entitlementSha256'], `${task.taskId}: ${arm} input`);
    if (typeof task.armInputs[arm].context !== 'string') {
      throw new Error(`${task.taskId}: ${arm} context must be a string`);
    }
    assertEqual(
      task.armInputs[arm].entitlementSha256,
      entitlementDigest,
      `${task.taskId}: ${arm} entitlement digest`,
    );
  }
  assertEqual(task.armInputs.control.context, CONTROL_DELIVERY_CONTEXT, `${task.taskId}: control delivery context`);
  assertEqual(
    task.armInputs.treatment.context,
    TREATMENT_DELIVERY_CONTEXT,
    `${task.taskId}: treatment delivery context`,
  );
  assertObject(task.scope, `${task.taskId}: scope`);
  assertExactKeys(task.scope, ['allowedPaths', 'forbiddenPaths'], `${task.taskId}: scope`);
  assertStringArray(task.scope.allowedPaths, `${task.taskId}: allowedPaths`);
  assertStringArray(task.scope.forbiddenPaths, `${task.taskId}: forbiddenPaths`);
  assertObject(task.environment, `${task.taskId}: environment`);
  assertExactKeys(
    task.environment,
    [
      'benchmarkImageDigest',
      'runtimeMatrixFileSha256',
      'runtimeMatrixSha256',
      'runtimeProfileId',
      'specSha256',
      'substanceSha256',
    ],
    `${task.taskId}: environment`,
  );
  assertPattern(task.environment.specSha256, SHA256, `${task.taskId}: environment spec digest`);
  assertPattern(task.environment.substanceSha256, SHA256, `${task.taskId}: environment substance digest`);
  assertString(task.environment.runtimeProfileId, `${task.taskId}: runtime profile ID`);
  assertPattern(task.environment.runtimeMatrixFileSha256, SHA256, `${task.taskId}: runtime matrix file digest`);
  assertPattern(task.environment.runtimeMatrixSha256, SHA256, `${task.taskId}: runtime matrix digest`);
  assertPattern(task.environment.benchmarkImageDigest, IMAGE_DIGEST, `${task.taskId}: benchmark image digest`);
  assertObject(task.evaluator, `${task.taskId}: evaluator`);
  assertExactKeys(
    task.evaluator,
    [
      'contractId',
      'contractSha256',
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
      'specSha256',
    ],
    `${task.taskId}: evaluator`,
  );
  assertString(task.evaluator.contractId, `${task.taskId}: evaluator contractId`);
  assertPattern(task.evaluator.contractSha256, SHA256, `${task.taskId}: evaluator contract digest`);
  assertPattern(task.evaluator.specSha256, SHA256, `${task.taskId}: evaluator spec digest`);
  assertPattern(task.evaluator.oracleSourceSha256, SHA256, `${task.taskId}: evaluator oracle source digest`);
  assertPattern(
    task.evaluator.qualificationControllerSha256,
    SHA256,
    `${task.taskId}: qualification controller digest`,
  );
  assertPattern(
    task.evaluator.qualificationReceiptFileSha256,
    SHA256,
    `${task.taskId}: qualification receipt file digest`,
  );
  assertPattern(
    task.evaluator.qualificationReceiptSha256,
    SHA256,
    `${task.taskId}: qualification receipt digest`,
  );
  for (const key of [
    'qualificationExecutionAttestationFileSha256',
    'qualificationExecutionAttestationSha256',
    'qualificationExecutionControllerSha256',
    'qualificationEvaluatorSourceClosureSha256',
    'qualificationInputRequestFileSha256',
    'qualificationInputRequestSha256',
    'qualificationInputManifestFileSha256',
    'qualificationInputManifestSha256',
    'qualificationProvenanceBundleFileSha256',
    'qualificationProvenanceVerificationSha256',
  ]) {
    assertPattern(task.evaluator[key], SHA256, `${task.taskId}: ${key}`);
  }
  assertPattern(
    task.evaluator.qualificationRunnerRepositoryCommit,
    GIT_SHA,
    `${task.taskId}: qualification runner repository commit`,
  );
  assertObject(task.limits, `${task.taskId}: limits`);
  assertExactKeys(
    task.limits,
    ['maxInputTokens', 'maxOutputTokens', 'maxRequests', 'timeoutMs'],
    `${task.taskId}: limits`,
  );
  assertIntegerRange(task.limits.timeoutMs, 1000, 7_200_000, `${task.taskId}: timeoutMs`);
  assertIntegerRange(task.limits.maxRequests, 1, 100, `${task.taskId}: maxRequests`);
  assertIntegerRange(task.limits.maxInputTokens, 1, Number.MAX_SAFE_INTEGER, `${task.taskId}: maxInputTokens`);
  assertIntegerRange(task.limits.maxOutputTokens, 1, Number.MAX_SAFE_INTEGER, `${task.taskId}: maxOutputTokens`);
  return task;
}

export function assertQualificationIndex(index) {
  assertObject(index, 'qualification task index');
  assertExactKeys(
    index,
    ['bundleSha256', 'program', 'schemaVersion', 'sealedAt', 'tasks'],
    'qualification task index',
  );
  assertEqual(
    index.schemaVersion,
    'decantr-benchmark-qualification-task-index.v2',
    'qualification index schemaVersion',
  );
  assertEqual(index.program, 'decantr-3.10-ui-change-control-proof', 'qualification index program');
  if (!Number.isFinite(Date.parse(index.sealedAt))) throw new Error('qualification sealedAt is invalid');
  assertPattern(index.bundleSha256, SHA256, 'qualification bundleSha256');
  if (!Array.isArray(index.tasks) || index.tasks.length === 0) {
    throw new Error('qualification index must contain tasks');
  }
  const seen = new Set();
  for (const task of index.tasks) {
    assertExactKeys(
      task,
      [
        'base',
        'benchmarkImageDigest',
        'candidateSha256',
        'corpusCommit',
        'corpusProjectPath',
        'environmentSpecSha256',
        'environmentSubstanceSha256',
        'evaluatorContractSha256',
        'evaluatorSpecSha256',
        'framework',
        'hiddenRef',
        'informationEntitlementSha256',
        'kind',
        'manifestSha256',
        'oracleSourceSha256',
        'projectPath',
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
        'repositoryId',
        'runtimeMatrixFileSha256',
        'runtimeMatrixSha256',
        'runtimeProfileId',
        'taskId',
      ],
      'qualification task binding',
    );
    assertPattern(task.taskId, TASK_ID, 'qualification taskId');
    if (seen.has(task.taskId)) throw new Error(`duplicate qualification task: ${task.taskId}`);
    seen.add(task.taskId);
    assertOneOf(task.kind, ['repository', 'adversarial'], `${task.taskId}: kind`);
    assertString(task.repositoryId, `${task.taskId}: repositoryId`);
    assertString(task.framework, `${task.taskId}: framework`);
    assertString(task.projectPath, `${task.taskId}: projectPath`);
    assertString(task.corpusProjectPath, `${task.taskId}: corpusProjectPath`);
    assertPattern(task.corpusCommit, GIT_SHA, `${task.taskId}: corpusCommit`);
    assertBase(task.base, `${task.taskId}: base`);
    assertPattern(task.candidateSha256, SHA256, `${task.taskId}: candidateSha256`);
    assertPattern(task.manifestSha256, SHA256, `${task.taskId}: manifestSha256`);
    assertPattern(task.evaluatorContractSha256, SHA256, `${task.taskId}: evaluatorContractSha256`);
    assertPattern(task.evaluatorSpecSha256, SHA256, `${task.taskId}: evaluatorSpecSha256`);
    assertPattern(task.oracleSourceSha256, SHA256, `${task.taskId}: oracleSourceSha256`);
    assertPattern(
      task.qualificationControllerSha256,
      SHA256,
      `${task.taskId}: qualificationControllerSha256`,
    );
    assertPattern(
      task.qualificationReceiptFileSha256,
      SHA256,
      `${task.taskId}: qualificationReceiptFileSha256`,
    );
    assertPattern(task.qualificationReceiptSha256, SHA256, `${task.taskId}: qualificationReceiptSha256`);
    for (const key of [
      'qualificationExecutionAttestationFileSha256',
      'qualificationExecutionAttestationSha256',
      'qualificationExecutionControllerSha256',
      'qualificationEvaluatorSourceClosureSha256',
      'qualificationInputRequestFileSha256',
      'qualificationInputRequestSha256',
      'qualificationInputManifestFileSha256',
      'qualificationInputManifestSha256',
      'qualificationProvenanceBundleFileSha256',
      'qualificationProvenanceVerificationSha256',
    ]) {
      assertPattern(task[key], SHA256, `${task.taskId}: ${key}`);
    }
    assertPattern(
      task.qualificationRunnerRepositoryCommit,
      GIT_SHA,
      `${task.taskId}: qualificationRunnerRepositoryCommit`,
    );
    assertPattern(task.informationEntitlementSha256, SHA256, `${task.taskId}: informationEntitlementSha256`);
    assertPattern(task.environmentSpecSha256, SHA256, `${task.taskId}: environmentSpecSha256`);
    assertPattern(task.environmentSubstanceSha256, SHA256, `${task.taskId}: environmentSubstanceSha256`);
    assertString(task.runtimeProfileId, `${task.taskId}: runtimeProfileId`);
    assertPattern(task.runtimeMatrixFileSha256, SHA256, `${task.taskId}: runtimeMatrixFileSha256`);
    assertPattern(task.runtimeMatrixSha256, SHA256, `${task.taskId}: runtimeMatrixSha256`);
    assertPattern(task.benchmarkImageDigest, IMAGE_DIGEST, `${task.taskId}: benchmarkImageDigest`);
    assertString(task.hiddenRef, `${task.taskId}: hiddenRef`);
  }
  assertEqual(index.bundleSha256, sha256Canonical(index.tasks), 'qualification task bundle digest');
  return index;
}

export function calculateRunPlanDigest(plan) {
  const { planSha256: _ignored, ...body } = plan;
  return sha256Canonical(body);
}

export function assertRunPlan(plan) {
  assertObject(plan, 'run plan');
  assertExactKeys(
    plan,
    ['bindings', 'design', 'planSha256', 'program', 'runs', 'schemaVersion', 'seed', 'tasks'],
    'run plan',
  );
  assertEqual(plan.schemaVersion, 'decantr-benchmark-run-plan.v2', 'run plan schemaVersion');
  assertEqual(plan.program, 'decantr-3.10-ui-change-control-proof', 'run plan program');
  if (typeof plan.seed !== 'string' || plan.seed.length < 16) throw new Error('run plan seed is missing or too short');
  assertPattern(plan.planSha256, SHA256, 'run plan digest');
  assertEqual(plan.planSha256, calculateRunPlanDigest(plan), 'run plan self digest');
  assertObject(plan.bindings, 'run plan bindings');
  assertExactKeys(
    plan.bindings,
    ['corpus', 'developmentTasks', 'models', 'protocol', 'qualificationTaskIndex', 'runtimeMatrix'],
    'run plan bindings',
  );
  for (const name of ['corpus', 'models', 'protocol', 'qualificationTaskIndex', 'runtimeMatrix']) {
    assertFileBinding(plan.bindings[name], `run plan ${name}`);
  }
  if (!Array.isArray(plan.bindings.developmentTasks) || plan.bindings.developmentTasks.length === 0) {
    throw new Error('run plan development task bindings are required');
  }
  for (const binding of plan.bindings.developmentTasks) {
    assertFileBinding(binding, 'run plan development task');
  }
  assertExactKeys(
    plan.design,
    ['arms', 'models', 'repetitions', 'tasks', 'totalRuns'],
    'run plan design',
  );
  for (const key of ['arms', 'models', 'repetitions', 'tasks', 'totalRuns']) {
    assertIntegerRange(plan.design[key], 1, Number.MAX_SAFE_INTEGER, `run plan design ${key}`);
  }
  if (!Array.isArray(plan.tasks) || !Array.isArray(plan.runs)) throw new Error('run plan tasks and runs are required');
  const taskIds = new Set();
  for (const task of plan.tasks) {
    assertExactKeys(
      task,
      [
        'base',
        'benchmarkImageDigest',
        'candidateSha256',
        'corpusCommit',
        'corpusProjectPath',
        'environmentSpecSha256',
        'environmentSubstanceSha256',
        'evaluatorContractSha256',
        'evaluatorSpecSha256',
        'framework',
        'informationEntitlementSha256',
        'kind',
        'manifestSha256',
        'oracleSourceSha256',
        'partition',
        'projectPath',
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
        'repositoryId',
        'runtimeMatrixFileSha256',
        'runtimeMatrixSha256',
        'runtimeProfileId',
        'sourceRef',
        'taskId',
      ],
      'planned task binding',
    );
    assertPattern(task.taskId, TASK_ID, 'planned taskId');
    if (taskIds.has(task.taskId)) throw new Error(`duplicate planned task: ${task.taskId}`);
    taskIds.add(task.taskId);
    assertOneOf(task.partition, ['development', 'qualification'], `${task.taskId}: planned partition`);
    assertOneOf(task.kind, ['repository', 'adversarial'], `${task.taskId}: planned kind`);
    assertString(task.repositoryId, `${task.taskId}: planned repositoryId`);
    assertString(task.framework, `${task.taskId}: planned framework`);
    assertString(task.projectPath, `${task.taskId}: planned projectPath`);
    assertString(task.corpusProjectPath, `${task.taskId}: planned corpusProjectPath`);
    assertPattern(task.corpusCommit, GIT_SHA, `${task.taskId}: planned corpusCommit`);
    assertPattern(task.manifestSha256, SHA256, `${task.taskId}: planned manifest digest`);
    assertPattern(task.candidateSha256, SHA256, `${task.taskId}: planned candidate digest`);
    assertPattern(task.evaluatorContractSha256, SHA256, `${task.taskId}: planned evaluator digest`);
    assertPattern(task.evaluatorSpecSha256, SHA256, `${task.taskId}: planned evaluator spec digest`);
    assertPattern(task.oracleSourceSha256, SHA256, `${task.taskId}: planned oracle source digest`);
    assertPattern(
      task.qualificationControllerSha256,
      SHA256,
      `${task.taskId}: planned qualification controller digest`,
    );
    assertPattern(
      task.qualificationReceiptFileSha256,
      SHA256,
      `${task.taskId}: planned qualification receipt file digest`,
    );
    assertPattern(
      task.qualificationReceiptSha256,
      SHA256,
      `${task.taskId}: planned qualification receipt digest`,
    );
    for (const key of [
      'qualificationExecutionAttestationFileSha256',
      'qualificationExecutionAttestationSha256',
      'qualificationExecutionControllerSha256',
      'qualificationEvaluatorSourceClosureSha256',
      'qualificationInputRequestFileSha256',
      'qualificationInputRequestSha256',
      'qualificationInputManifestFileSha256',
      'qualificationInputManifestSha256',
      'qualificationProvenanceBundleFileSha256',
      'qualificationProvenanceVerificationSha256',
    ]) {
      assertPattern(task[key], SHA256, `${task.taskId}: planned ${key}`);
    }
    assertPattern(
      task.qualificationRunnerRepositoryCommit,
      GIT_SHA,
      `${task.taskId}: planned qualification runner repository commit`,
    );
    assertPattern(task.informationEntitlementSha256, SHA256, `${task.taskId}: planned entitlement digest`);
    assertPattern(task.environmentSpecSha256, SHA256, `${task.taskId}: planned environment spec digest`);
    assertPattern(task.environmentSubstanceSha256, SHA256, `${task.taskId}: planned environment substance digest`);
    assertString(task.runtimeProfileId, `${task.taskId}: planned runtime profile ID`);
    assertPattern(task.runtimeMatrixFileSha256, SHA256, `${task.taskId}: planned runtime matrix file digest`);
    assertPattern(task.runtimeMatrixSha256, SHA256, `${task.taskId}: planned runtime matrix digest`);
    assertPattern(task.benchmarkImageDigest, IMAGE_DIGEST, `${task.taskId}: planned benchmark image digest`);
    assertString(task.sourceRef, `${task.taskId}: planned sourceRef`);
    assertBase(task.base, `${task.taskId}: planned base`);
  }
  const runIds = new Set();
  for (const run of plan.runs) {
    assertExactKeys(
      run,
      [
        'arm',
        'block',
        'framework',
        'modelId',
        'ordinal',
        'partition',
        'provider',
        'repetition',
        'repositoryId',
        'requestedModel',
        'runId',
        'taskId',
        'taskManifestSha256',
      ],
      'planned run',
    );
    if (runIds.has(run.runId)) throw new Error(`duplicate planned run: ${run.runId}`);
    runIds.add(run.runId);
    assertString(run.runId, 'planned runId');
    if (!taskIds.has(run.taskId)) throw new Error(`${run.runId}: unknown task ${run.taskId}`);
    assertIntegerRange(run.ordinal, 1, plan.runs.length, `${run.runId}: ordinal`);
    assertIntegerRange(run.block, 1, plan.design.tasks, `${run.runId}: block`);
    assertOneOf(run.partition, ['development', 'qualification'], `${run.runId}: partition`);
    assertString(run.repositoryId, `${run.runId}: repositoryId`);
    assertString(run.framework, `${run.runId}: framework`);
    assertString(run.modelId, `${run.runId}: modelId`);
    assertString(run.provider, `${run.runId}: provider`);
    assertString(run.requestedModel, `${run.runId}: requestedModel`);
    assertPattern(run.taskManifestSha256, SHA256, `${run.runId}: task manifest digest`);
    assertOneOf(run.arm, ['control', 'treatment'], `${run.runId}: arm`);
    assertIntegerRange(run.repetition, 1, plan.design.repetitions, `${run.runId}: repetition`);
  }
  const arithmetic = plan.design.tasks * plan.design.models * plan.design.arms * plan.design.repetitions;
  assertEqual(plan.design.totalRuns, arithmetic, 'run plan arithmetic');
  assertEqual(plan.runs.length, arithmetic, 'run plan run count');
  return plan;
}

function assertFileBinding(binding, label) {
  assertObject(binding, label);
  assertExactKeys(binding, ['bytes', 'logicalName', 'sha256'], label);
  assertString(binding.logicalName, `${label} logicalName`);
  assertPattern(binding.sha256, SHA256, `${label} digest`);
  assertIntegerRange(binding.bytes, 1, Number.MAX_SAFE_INTEGER, `${label} bytes`);
}

export async function assertCandidateManifest(manifest, manifestPath, options = {}) {
  assertObject(manifest, 'candidate manifest');
  assertEqual(manifest.schemaVersion, 'decantr-benchmark-candidate.v1', 'candidate schemaVersion');
  if (!Array.isArray(manifest.tarballs) || manifest.tarballs.length === 0) {
    throw new Error('candidate manifest must bind at least one tarball');
  }
  const tarballs = [];
  const packages = new Set();
  for (const item of manifest.tarballs) {
    assertString(item.package, 'candidate package');
    if (packages.has(item.package)) throw new Error(`candidate manifest repeats package ${item.package}`);
    packages.add(item.package);
    assertString(item.path, `${item.package}: tarball path`);
    assertPattern(item.sha256, SHA256, `${item.package}: tarball digest`);
    const path = isAbsolute(item.path) ? resolve(item.path) : resolve(dirname(manifestPath), item.path);
    await access(path);
    const actual = sha256(await readFile(path));
    assertEqual(actual, item.sha256, `${item.package}: tarball bytes`);
    tarballs.push({ package: item.package, sha256: item.sha256 });
  }
  let contextProvider = null;
  let runtime = null;
  let source = null;
  if (manifest.source !== undefined) {
    assertObject(manifest.source, 'candidate source');
    for (const key of ['repository', 'commit', 'tree', 'clean', 'dirtyStatusSha256', 'trackedDiffSha256']) {
      if (!(key in manifest.source)) throw new Error(`candidate source is missing ${key}`);
    }
    assertString(manifest.source.repository, 'candidate source repository');
    assertPattern(manifest.source.commit, GIT_SHA, 'candidate source commit');
    assertPattern(manifest.source.tree, GIT_SHA, 'candidate source tree');
    if (typeof manifest.source.clean !== 'boolean') throw new Error('candidate source clean flag is invalid');
    assertPattern(manifest.source.dirtyStatusSha256, SHA256, 'candidate source status digest');
    assertPattern(manifest.source.trackedDiffSha256, SHA256, 'candidate source diff digest');
    source = structuredClone(manifest.source);
  }
  if (manifest.contextProvider !== undefined) {
    contextProvider = assertProvider(manifest.contextProvider);
    if (!packages.has(contextProvider.package)) {
      throw new Error(`candidate context provider package is absent from tarballs: ${contextProvider.package}`);
    }
    if (options.runtimeRoot) runtime = await verifyCandidateRuntime(contextProvider, options.runtimeRoot);
  }
  return {
    manifestSha256: sha256(await readFile(manifestPath)),
    tarballSetSha256: sha256Canonical(tarballs.sort((a, b) => a.package.localeCompare(b.package))),
    contextProvider,
    runtime,
    source,
  };
}

export function assertBudgetApproval(approval, context) {
  assertObject(approval, 'budget approval');
  assertEqual(approval.schemaVersion, 'decantr-benchmark-budget-approval.v1', 'approval schemaVersion');
  assertEqual(approval.program, 'decantr-3.10-ui-change-control-proof', 'approval program');
  assertString(approval.approvalId, 'approvalId');
  assertString(approval.approvedBy, 'approvedBy');
  assertEqual(approval.authorizationStatement, AUTHORIZATION_STATEMENT, 'authorization statement');
  const approvedAt = Date.parse(approval.approvedAt);
  const expiresAt = Date.parse(approval.expiresAt);
  if (!Number.isFinite(approvedAt) || !Number.isFinite(expiresAt) || expiresAt <= approvedAt) {
    throw new Error('budget approval timestamps are invalid');
  }
  if (expiresAt <= (context.now ?? Date.now())) throw new Error('budget approval has expired');
  if (!(approval.maximumSpendUsd > 0) || approval.maximumSpendUsd > context.protocolMaximumUsd) {
    throw new Error('budget approval exceeds the frozen protocol maximum');
  }
  assertEqual(approval.runPlanSha256, context.runPlanSha256, 'approval run plan binding');
  assertEqual(
    approval.candidateTarballSetSha256,
    context.candidateTarballSetSha256,
    'approval candidate binding',
  );
  if (!Array.isArray(approval.modelIds) || !approval.modelIds.includes(context.modelId)) {
    throw new Error(`budget approval does not authorize model ${context.modelId}`);
  }
  if (context.powerPilotSha256) {
    assertEqual(approval.powerPilotSha256, context.powerPilotSha256, 'approval power-pilot binding');
  }
  return approval;
}

export function assertPowerPilot(report, context) {
  assertObject(report, 'power pilot');
  assertEqual(report.schemaVersion, 'decantr-benchmark-power-pilot.v1', 'power pilot schemaVersion');
  assertEqual(report.program, 'decantr-3.10-ui-change-control-proof', 'power pilot program');
  assertEqual(report.runPlanSha256, context.runPlanSha256, 'power pilot run-plan binding');
  assertEqual(
    report.candidateTarballSetSha256,
    context.candidateTarballSetSha256,
    'power pilot candidate binding',
  );
  assertPattern(report.developmentRunRecordSetSha256, SHA256, 'power pilot development record set');
  assertPattern(report.analysisCodeSha256, SHA256, 'power pilot analysis code');
  if (typeof report.analysisSeed !== 'string' || report.analysisSeed.length < 16) {
    throw new Error('power pilot analysis seed is missing or too short');
  }
  assertEqual(report.developmentTaskCount, context.developmentTaskCount, 'power pilot development task count');
  assertEqual(report.targetEffectPoints, 5, 'power pilot target effect');
  assertEqual(report.alpha, 0.05, 'power pilot alpha');
  if (!Number.isFinite(report.estimatedPower) || report.estimatedPower < 0.8 || report.estimatedPower > 1) {
    throw new Error('power pilot must demonstrate at least 80% power');
  }
  const frozenAt = Date.parse(report.frozenAt);
  const qualificationExecutionOpenedAt = Date.parse(report.qualificationExecutionOpenedAt);
  if (
    !Number.isFinite(frozenAt) ||
    !Number.isFinite(qualificationExecutionOpenedAt) ||
    qualificationExecutionOpenedAt <= frozenAt
  ) {
    throw new Error('power pilot must be frozen before qualification execution opens');
  }
  if (typeof report.method !== 'string' || report.method.trim().length < 20) {
    throw new Error('power pilot method is missing');
  }
  return report;
}

export function assertEvaluatorContract(contract, task) {
  assertObject(contract, 'evaluator contract');
  assertEqual(contract.schemaVersion, 'decantr-benchmark-evaluator-contract.v2', 'evaluator schemaVersion');
  assertEqual(contract.taskId, task.taskId, 'evaluator task binding');
  assertEqual(contract.contractId, task.evaluator.contractId, 'evaluator contractId binding');
  assertObject(contract.oracle, 'evaluator oracle');
  assertEqual(contract.oracle.candidateIndependent, true, 'candidate-independent evaluator');
  assertEqual(contract.oracle.decantrOutputAllowed, false, 'Decantr output oracle policy');
  assertPattern(contract.oracle.sourceSha256, SHA256, 'evaluator oracle source digest');
  if (!Array.isArray(contract.commands) || contract.commands.length === 0) {
    throw new Error('evaluator contract must contain commands');
  }
  const ids = new Set();
  for (const command of contract.commands) {
    assertString(command.id, 'evaluator command id');
    if (ids.has(command.id)) throw new Error(`duplicate evaluator command: ${command.id}`);
    ids.add(command.id);
    assertOneOf(command.kind, ['build', 'functional', 'governance', 'accessibility', 'visual'], `${command.id}: kind`);
    assertOneOf(command.runtime, ['controller', 'task'], `${command.id}: runtime`);
    assertString(command.executable, `${command.id}: executable`);
    if (!Array.isArray(command.args) || command.args.some((arg) => typeof arg !== 'string')) {
      throw new Error(`${command.id}: args must be a fixed string array`);
    }
    assertString(command.cwd, `${command.id}: cwd`);
    assertIntegerRange(command.timeoutMs, 100, 7_200_000, `${command.id}: timeoutMs`);
    if (typeof command.required !== 'boolean') throw new Error(`${command.id}: required must be boolean`);
    assertOneOf(command.resultFormat, ['exit-code', 'json-stdout'], `${command.id}: resultFormat`);
  }
  return contract;
}

export function assertSha256(value, label) {
  assertPattern(value, SHA256, label);
}

function assertBase(base, label) {
  assertObject(base, label);
  assertExactKeys(base, ['commit', 'tree'], label);
  assertPattern(base.commit, GIT_SHA, `${label}.commit`);
  assertPattern(base.tree, GIT_SHA, `${label}.tree`);
}

function assertSharedTaskInput(input, taskId) {
  assertObject(input, `${taskId}: shared task input`);
  assertObject(input.target, `${taskId}: shared target`);
  assertString(input.target.selector, `${taskId}: shared target selector`);
  assertObject(input.policyCard, `${taskId}: shared policy card`);
  if (!Array.isArray(input.policyCard.statements) || input.policyCard.statements.length === 0) {
    throw new Error(`${taskId}: shared policy card must contain statements`);
  }
  const ids = new Set();
  for (const statement of input.policyCard.statements) {
    assertObject(statement, `${taskId}: shared policy statement`);
    assertString(statement.id, `${taskId}: shared policy statement id`);
    assertString(statement.text, `${taskId}: shared policy statement text`);
    assertStringArray(statement.sources, `${taskId}: shared policy statement sources`);
    if (ids.has(statement.id)) throw new Error(`${taskId}: duplicate shared policy statement ${statement.id}`);
    ids.add(statement.id);
  }
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
}

function assertExactKeys(value, expected, label) {
  assertObject(value, label);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${label} keys mismatch: expected ${wanted.join(', ')}, received ${actual.join(', ')}`);
  }
}

function assertString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} must be a non-empty string`);
}

function assertStringArray(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item === '')) {
    throw new Error(`${label} must be an array of non-empty strings`);
  }
  if (new Set(value).size !== value.length) throw new Error(`${label} must not contain duplicates`);
}

function assertPattern(value, pattern, label) {
  if (typeof value !== 'string' || !pattern.test(value)) throw new Error(`${label} is invalid`);
}

function assertOneOf(value, allowed, label) {
  if (!allowed.includes(value)) throw new Error(`${label} must be one of ${allowed.join(', ')}`);
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} mismatch: expected ${expected}, received ${actual}`);
}

function assertIntegerRange(value, minimum, maximum, label) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${label} must be an integer between ${minimum} and ${maximum}`);
  }
}

export function canonicalDigest(value) {
  return sha256(canonicalJson(value));
}
