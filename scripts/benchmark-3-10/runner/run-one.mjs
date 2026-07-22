#!/usr/bin/env node
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { executeEvaluator } from '../evaluator/run-evaluator.mjs';
import {
  canonicalJson,
  prettyCanonicalJson,
  readJsonFile,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
  writeContentAddressed,
} from './canonical.mjs';
import {
  assertCandidateManifest,
  assertEvaluatorContract,
  assertRunPlan,
  assertTaskManifest,
} from './contracts.mjs';
import { reserveRunBudget, settleRunBudget } from './budget.mjs';
import { buildControlDelivery, buildTreatmentDelivery } from './arm-delivery.mjs';
import { runFixed, sanitizedEnvironment } from './process.mjs';
import {
  assertTaskEnvironmentSpec,
  taskEnvironmentSubstanceSha256,
} from '../environments/contracts.mjs';
import { assertRuntimeMatrix } from '../environments/runtime-matrix.mjs';
import {
  assertPreparedEnvironment,
  verifyLockfiles,
  verifyPreparedDependencyTree,
} from '../environments/prepared-environment.mjs';
import { createVerifiedTaskEnvironment } from '../environments/execution-runtime.mjs';

const runnerDirectory = dirname(fileURLToPath(import.meta.url));
const benchmarkDirectory = resolve(runnerDirectory, '..');
const defaultFakeAdapter = resolve(benchmarkDirectory, 'model-proxy', 'fake-adapter.mjs');
export async function runOne(options) {
  const plan = assertRunPlan(await readJsonFile(options.planPath));
  const planned = plan.runs.find((item) => item.runId === options.runId);
  if (!planned) throw new Error(`run id is not present in plan: ${options.runId}`);
  assertExplicitIdentity(planned, options);

  const taskBytes = await readFile(options.taskManifestPath);
  const task = assertTaskManifest(JSON.parse(taskBytes), planned.partition);
  const taskBinding = plan.tasks.find((item) => item.taskId === planned.taskId);
  if (!taskBinding) throw new Error(`planned task binding is missing: ${planned.taskId}`);
  assertEqual(task.taskId, planned.taskId, 'task id');
  assertEqual(task.taskId, taskBinding.taskId, 'task plan id');
  assertEqual(sha256(taskBytes), planned.taskManifestSha256, 'task manifest bytes');
  assertEqual(planned.taskManifestSha256, taskBinding.manifestSha256, 'planned task manifest binding');
  assertEqual(task.partition, taskBinding.partition, 'task partition binding');
  assertEqual(planned.partition, taskBinding.partition, 'run partition binding');
  assertEqual(task.kind, taskBinding.kind, 'task kind binding');
  assertEqual(task.repositoryId, planned.repositoryId, 'task repository');
  assertEqual(task.repositoryId, taskBinding.repositoryId, 'task repository binding');
  assertEqual(planned.repositoryId, taskBinding.repositoryId, 'run repository binding');
  assertEqual(task.framework, planned.framework, 'task framework');
  assertEqual(task.framework, taskBinding.framework, 'task framework binding');
  assertEqual(planned.framework, taskBinding.framework, 'run framework binding');
  assertEqual(task.projectPath, taskBinding.projectPath, 'task projectPath');
  assertEqual(task.corpusProjectPath, taskBinding.corpusProjectPath, 'task corpusProjectPath binding');
  assertEqual(task.corpusCommit, taskBinding.corpusCommit, 'task corpus commit binding');
  assertEqual(task.base.commit, taskBinding.base.commit, 'task base commit binding');
  assertEqual(task.base.tree, taskBinding.base.tree, 'task base tree binding');
  assertEqual(task.candidateSha256, taskBinding.candidateSha256, 'task candidate binding');
  assertEqual(task.evaluator.contractSha256, taskBinding.evaluatorContractSha256, 'task evaluator binding');
  assertEqual(task.evaluator.specSha256, taskBinding.evaluatorSpecSha256, 'task evaluator spec binding');
  assertEqual(task.evaluator.oracleSourceSha256, taskBinding.oracleSourceSha256, 'task oracle source binding');
  assertEqual(
    task.evaluator.qualificationControllerSha256,
    taskBinding.qualificationControllerSha256,
    'task qualification controller binding',
  );
  assertEqual(
    task.evaluator.qualificationReceiptFileSha256,
    taskBinding.qualificationReceiptFileSha256,
    'task qualification receipt file binding',
  );
  assertEqual(
    task.evaluator.qualificationReceiptSha256,
    taskBinding.qualificationReceiptSha256,
    'task qualification receipt binding',
  );
  for (const [manifestKey, planKey] of [
    ['qualificationExecutionAttestationFileSha256', 'qualificationExecutionAttestationFileSha256'],
    ['qualificationExecutionAttestationSha256', 'qualificationExecutionAttestationSha256'],
    ['qualificationExecutionControllerSha256', 'qualificationExecutionControllerSha256'],
    ['qualificationEvaluatorSourceClosureSha256', 'qualificationEvaluatorSourceClosureSha256'],
    ['qualificationInputRequestFileSha256', 'qualificationInputRequestFileSha256'],
    ['qualificationInputRequestSha256', 'qualificationInputRequestSha256'],
    ['qualificationInputManifestFileSha256', 'qualificationInputManifestFileSha256'],
    ['qualificationInputManifestSha256', 'qualificationInputManifestSha256'],
    ['qualificationRunnerRepositoryCommit', 'qualificationRunnerRepositoryCommit'],
    ['qualificationProvenanceBundleFileSha256', 'qualificationProvenanceBundleFileSha256'],
    ['qualificationProvenanceVerificationSha256', 'qualificationProvenanceVerificationSha256'],
  ]) {
    assertEqual(
      task.evaluator[manifestKey],
      taskBinding[planKey],
      `task ${planKey} binding`,
    );
  }
  assertEqual(task.informationEntitlementSha256, taskBinding.informationEntitlementSha256, 'task entitlement binding');
  assertEqual(task.environment.specSha256, taskBinding.environmentSpecSha256, 'task environment spec binding');
  assertEqual(
    task.environment.substanceSha256,
    taskBinding.environmentSubstanceSha256,
    'task environment substance binding',
  );
  assertEqual(task.environment.runtimeProfileId, taskBinding.runtimeProfileId, 'task runtime profile binding');
  assertEqual(
    task.environment.runtimeMatrixFileSha256,
    taskBinding.runtimeMatrixFileSha256,
    'task runtime matrix file binding',
  );
  assertEqual(
    task.environment.runtimeMatrixSha256,
    taskBinding.runtimeMatrixSha256,
    'task runtime matrix binding',
  );
  assertEqual(
    task.environment.benchmarkImageDigest,
    taskBinding.benchmarkImageDigest,
    'task benchmark image binding',
  );

  const environmentSpecBytes = await readFile(options.environmentSpecPath);
  const environmentSpec = assertTaskEnvironmentSpec(
    JSON.parse(environmentSpecBytes),
    {
      taskId: task.taskId,
      partition: task.partition,
      base: task.base,
      repository: { projectPath: task.projectPath },
    },
    { reviewStatus: 'approved' },
  );
  assertEqual(sha256(environmentSpecBytes), task.environment.specSha256, 'environment spec bytes');
  assertEqual(
    taskEnvironmentSubstanceSha256(environmentSpec),
    task.environment.substanceSha256,
    'environment spec substance',
  );
  assertEqual(environmentSpec.profile.id, task.environment.runtimeProfileId, 'environment runtime profile');

  const runtimeMatrixBytes = await readFile(options.runtimeMatrixPath);
  const runtimeMatrix = assertRuntimeMatrix(JSON.parse(runtimeMatrixBytes), { requireLocked: true });
  const runtimeMatrixFileSha256 = sha256(runtimeMatrixBytes);
  assertEqual(runtimeMatrixFileSha256, plan.bindings.runtimeMatrix.sha256, 'runtime matrix bytes');
  assertEqual(runtimeMatrixBytes.byteLength, plan.bindings.runtimeMatrix.bytes, 'runtime matrix byte length');
  assertEqual(
    task.environment.runtimeMatrixFileSha256,
    runtimeMatrixFileSha256,
    'task runtime matrix file bytes',
  );
  assertEqual(task.environment.runtimeMatrixSha256, runtimeMatrix.matrixSha256, 'task runtime matrix identity');
  const runtimeProfile = runtimeMatrix.profiles.find((profile) => profile.id === task.environment.runtimeProfileId);
  if (!runtimeProfile) throw new Error(`runtime matrix does not contain profile ${task.environment.runtimeProfileId}`);
  assertEqual(
    task.environment.benchmarkImageDigest,
    runtimeProfile.benchmarkImage.digest,
    'task benchmark image identity',
  );
  const preparedEnvironmentBytes = await readFile(options.preparedEnvironmentPath);
  const preparedEnvironment = assertPreparedEnvironment(JSON.parse(preparedEnvironmentBytes), {
    task,
    runtimeMatrix,
    environmentSpec,
  });
  const preparedEnvironmentAttestationSha256 = sha256(preparedEnvironmentBytes);

  const evaluatorBytes = await readFile(options.evaluatorContractPath);
  const evaluatorContract = assertEvaluatorContract(JSON.parse(evaluatorBytes), task);
  assertEqual(sha256(evaluatorBytes), task.evaluator.contractSha256, 'evaluator contract bytes');
  assertEqual(
    evaluatorContract.oracle.sourceSha256,
    task.evaluator.oracleSourceSha256,
    'evaluator oracle source binding',
  );

  const candidateManifest = await readJsonFile(options.candidateManifestPath);
  const candidate = await assertCandidateManifest(candidateManifest, options.candidateManifestPath, {
    runtimeRoot: planned.arm === 'treatment' ? options.candidateRuntimeRoot : undefined,
  });
  const models = await readJsonFile(options.modelsPath);
  const protocol = await readJsonFile(options.protocolPath);
  const model = models.models?.find((item) => item.id === planned.modelId);
  if (!model) throw new Error(`model lock does not contain ${planned.modelId}`);
  assertEqual(model.requestedModel, planned.requestedModel, 'requested model');

  const adapter = await resolveAdapter(options);
  const controllerSha256 = await controllerDigest(adapter.command, adapter.args);
  const scratch = resolve(options.outputRoot, 'scratch', planned.runId);
  const home = join(scratch, 'home');
  await createEmptyDirectory(scratch);
  await mkdir(home, { mode: 0o700 });
  const controllerEnvironment = sanitizedEnvironment(home);
  const taskEnvironment = createVerifiedTaskEnvironment({
    profile: environmentSpec.profile,
    source: options.executionEnvironment ?? process.env,
    home,
    workspace: options.workspace,
    allowHostRuntime: options.allowHostRuntime === true,
    benchmarkImageDigest: preparedEnvironment.benchmarkImageDigest,
  });

  const base = verifyWorkspace(options.workspace, task, taskEnvironment, planned.arm);
  verifyLockfiles(options.workspace, preparedEnvironment.lockfiles);
  await verifyPreparedDependencyTree(options.workspace, preparedEnvironment);
  await verifyArmParity(options.outputRoot, planned, {
    taskManifestSha256: planned.taskManifestSha256,
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
    runtimeMatrixFileSha256,
    runtimeMatrixSha256: runtimeMatrix.matrixSha256,
    benchmarkImageDigest: runtimeProfile.benchmarkImage.digest,
    preparedEnvironmentAttestationSha256,
    environmentSha256: preparedEnvironment.environmentSha256,
    agentControllerSha256: controllerSha256,
    candidateTarballSetSha256: candidate.tarballSetSha256,
    baseCommit: base.commit,
    baseTree: base.tree,
    limits: task.limits,
  });

  const delivery =
    planned.arm === 'treatment'
      ? buildTreatmentDelivery({
          task,
          candidate,
          candidateRuntimeRoot: options.candidateRuntimeRoot,
          workspace: options.workspace,
          environment: taskEnvironment,
        })
      : buildControlDelivery(task);
  const deliveryArtifact = await writeContentAddressed(options.outputRoot, 'arm-deliveries', delivery.document);

  const reservation = await reserveRunBudget({
    paid: options.paid,
    approvalPath: options.budgetApprovalPath,
    ledgerPath: options.budgetLedgerPath,
    pricingPath: options.pricingPath,
    runPlanSha256: plan.planSha256,
    candidateTarballSetSha256: candidate.tarballSetSha256,
    model,
    protocolMaximumUsd: protocol.budget.maximumModelSpendUsd,
    requiresPowerPilot: planned.partition === 'qualification',
    powerPilotPath: options.powerPilotPath,
    developmentTaskCount: plan.tasks.filter((task) => task.partition === 'development').length,
    runId: planned.runId,
  });

  const events = [];
  const addEvent = (source, type, payload = {}) => {
    events.push({
      schemaVersion: 'decantr-benchmark-trajectory-event.v1',
      runId: planned.runId,
      sequence: events.length,
      source,
      type,
      recordedAt: new Date().toISOString(),
      payload: redactSecrets(payload),
    });
  };
  addEvent('runner', 'run.started', {
    taskManifestSha256: planned.taskManifestSha256,
    runtimeMatrixSha256: runtimeMatrix.matrixSha256,
    preparedEnvironmentAttestationSha256,
    environmentSha256: preparedEnvironment.environmentSha256,
    environmentSpecSha256: task.environment.specSha256,
    runtimeProfileId: task.environment.runtimeProfileId,
    baseTree: base.tree,
  });
  addEvent('runner', 'delivery.prepared', {
    arm: planned.arm,
    deliverySha256: deliveryArtifact.digest,
    contextGenerationDurationMs: delivery.generation?.durationMs ?? 0,
    candidateRuntimeTreeSha256: delivery.generation?.runtimeTreeSha256 ?? null,
  });
  addEvent('runner', 'budget.reserved', {
    paid: reservation.paid,
    reservedUsd: reservation.reservedUsd,
    approvalId: reservation.approvalId,
  });

  const request = {
    schemaVersion: 'decantr-benchmark-adapter-request.v1',
    runId: planned.runId,
    taskId: task.taskId,
    modelId: model.id,
    provider: model.provider,
    requestedModel: model.requestedModel,
    reasoningEffort: model.reasoningEffort,
    arm: planned.arm,
    repetition: planned.repetition,
    prompt: task.prompt,
    context: delivery.context,
    informationEntitlement: task.informationEntitlement,
    workspace: options.workspace,
    projectPath: task.projectPath,
    scope: task.scope,
    limits: task.limits,
    isolation: {
      home,
      personalSkills: false,
      personalMcp: false,
      hostConfiguration: false,
      network: options.paid ? 'audited-model-proxy-only' : 'none',
    },
    bindings: {
      planSha256: plan.planSha256,
      taskManifestSha256: planned.taskManifestSha256,
      candidateTarballSetSha256: candidate.tarballSetSha256,
      runtimeMatrixSha256: runtimeMatrix.matrixSha256,
      preparedEnvironmentAttestationSha256,
      environmentSha256: preparedEnvironment.environmentSha256,
      environmentSpecSha256: task.environment.specSha256,
      environmentSubstanceSha256: task.environment.substanceSha256,
      agentControllerSha256: controllerSha256,
      informationEntitlementSha256: task.informationEntitlementSha256,
      deliverySha256: deliveryArtifact.digest,
    },
  };
  const requestPath = join(scratch, 'adapter-request.json');
  const responsePath = join(scratch, 'adapter-response.json');
  await writeCanonicalFile(requestPath, request);
  const requestArtifact = await writeContentAddressed(options.outputRoot, 'adapter-requests', request);
  addEvent('runner', 'adapter.requested', { requestSha256: requestArtifact.digest });

  const adapterStartedAt = Date.now();
  const adapterRun = runFixed(
    adapter.command,
    [...adapter.args, '--request', requestPath, '--response', responsePath],
    {
      cwd: options.workspace,
      timeoutMs: task.limits.timeoutMs,
      env: controllerEnvironment,
      maxBuffer: 4 * 1024 * 1024,
    },
  );
  let response = null;
  let adapterError = null;
  if (adapterRun.exitCode !== 0) {
    adapterError = `adapter exited ${adapterRun.exitCode ?? 'without status'}: ${adapterRun.stderr.slice(0, 500)}`;
  } else {
    try {
      response = await readJsonFile(responsePath);
      assertAdapterResponse(response);
    } catch (error) {
      adapterError = error instanceof Error ? error.message : String(error);
    }
  }

  const actualCostUsd = Number(response?.usage?.costUsd ?? 0);
  let budgetError = null;
  try {
    await settleRunBudget(reservation, planned.runId, actualCostUsd);
  } catch (error) {
    budgetError = error instanceof Error ? error.message : String(error);
  }
  const responseSummary = response
    ? {
        schemaVersion: response.schemaVersion,
        provider: response.provider,
        requestedModel: response.requestedModel,
        returnedModel: response.returnedModel,
        status: response.status,
        usage: response.usage,
      }
    : { schemaVersion: 'decantr-benchmark-adapter-response-summary.v1', error: adapterError };
  const responseArtifact = await writeContentAddressed(options.outputRoot, 'adapter-responses', responseSummary);
  for (const item of response?.trajectory ?? []) addEvent('adapter', item.type, item.payload ?? {});
  addEvent('runner', 'adapter.finished', {
    exitCode: adapterRun.exitCode,
    durationMs: adapterRun.durationMs,
    responseSha256: responseArtifact.digest,
    status: response?.status ?? 'invalid',
  });

  let agentEnvironmentDrift = null;
  try {
    verifyLockfiles(options.workspace, preparedEnvironment.lockfiles);
    await verifyPreparedDependencyTree(options.workspace, preparedEnvironment);
  } catch (error) {
    agentEnvironmentDrift = error instanceof Error ? error.message : String(error);
    addEvent('runner', 'environment.drifted', { stage: 'adapter', error: agentEnvironmentDrift });
  }

  const changes = captureWorkspaceChanges(options.workspace, taskEnvironment);
  const changeArtifact = await writeContentAddressed(options.outputRoot, 'workspace-changes', changes);
  const scopeViolations = changedPathViolations(changes.changedPaths, task.scope);
  addEvent('runner', 'workspace.captured', {
    changeSha256: changeArtifact.digest,
    changedPathCount: changes.changedPaths.length,
    scopeViolationCount: scopeViolations.length,
  });

  let evaluatorResult = null;
  let evaluatorArtifact = null;
  let evaluatorExecutionError = null;
  const identityMatched =
    response?.returnedModel === model.requestedModel && response?.provider === model.provider;
  const usageWithinLimits = response ? assertUsageWithinLimits(response.usage, task.limits) : null;
  const canEvaluate =
    !adapterError &&
    !budgetError &&
    response?.status === 'completed' &&
    identityMatched &&
    usageWithinLimits === null &&
    agentEnvironmentDrift === null;
  let evaluatorEnvironmentDrift = null;
  if (canEvaluate) {
    try {
      evaluatorResult = await executeEvaluator({
        contractPath: options.evaluatorContractPath,
        expectedContractSha256: task.evaluator.contractSha256,
        workspace: options.workspace,
        evaluatorRoot: options.evaluatorRoot,
        evaluatorRuntimeRoot: options.evaluatorRuntimeRoot,
        evaluatorBrowsersPath: options.evaluatorBrowsersPath,
        taskPath: taskEnvironment.PATH,
        home,
        projectPath: task.projectPath,
        runId: planned.runId,
        taskId: task.taskId,
        contractId: evaluatorContract.contractId,
      });
      evaluatorArtifact = await writeContentAddressed(options.outputRoot, 'evaluator-results', evaluatorResult);
      addEvent('evaluator', 'evaluation.finished', {
        resultSha256: evaluatorArtifact.digest,
        status: evaluatorResult.status,
        commandCount: evaluatorResult.commands.length,
      });
    } catch (error) {
      evaluatorExecutionError = error instanceof Error ? error.message : String(error);
      addEvent('evaluator', 'evaluation.failed', { error: evaluatorExecutionError });
    }
  } else {
    addEvent('evaluator', 'evaluation.not_run', {
      adapterError,
      budgetError,
      adapterStatus: response?.status ?? null,
      identityMatched,
      usageWithinLimits,
    });
  }

  if (agentEnvironmentDrift === null) {
    try {
      verifyLockfiles(options.workspace, preparedEnvironment.lockfiles);
      await verifyPreparedDependencyTree(options.workspace, preparedEnvironment);
    } catch (error) {
      evaluatorEnvironmentDrift = error instanceof Error ? error.message : String(error);
      addEvent('runner', 'environment.drifted', { stage: 'evaluator', error: evaluatorEnvironmentDrift });
    }
  }

  const outcome = determineOutcome({
    adapterError,
    budgetError,
    response,
    identityMatched,
    usageWithinLimits,
    agentEnvironmentDrift,
    evaluatorEnvironmentDrift,
    scopeViolations,
    evaluatorResult,
    evaluatorExecutionError,
  });
  addEvent('runner', 'run.finished', { status: outcome.status, failureCode: outcome.failure?.code ?? null });
  const eventBindings = [];
  for (const event of events) {
    const artifact = await writeContentAddressed(options.outputRoot, 'trajectory-events', event);
    eventBindings.push({ sequence: event.sequence, sha256: artifact.digest });
  }
  const trajectoryManifest = {
    schemaVersion: 'decantr-benchmark-trajectory-manifest.v1',
    runId: planned.runId,
    complete: true,
    armDeliverySha256: deliveryArtifact.digest,
    adapterRequestSha256: requestArtifact.digest,
    adapterResponseSha256: responseArtifact.digest,
    events: eventBindings,
  };
  const trajectoryArtifact = await writeContentAddressed(
    options.outputRoot,
    'trajectory-manifests',
    trajectoryManifest,
  );

  const record = {
    schemaVersion: 'decantr-benchmark-run-record.v2',
    runId: planned.runId,
    taskId: planned.taskId,
    partition: planned.partition,
    repositoryId: planned.repositoryId,
    framework: planned.framework,
    arm: planned.arm,
    repetition: planned.repetition,
    status: outcome.status,
    execution: {
      assurance: 'test-only-host',
      productionEligible: false,
      agentEvaluatorStageSeparation: false,
      privateOracleAbsentDuringAgentStage: false,
      signedExternalProvenance: false,
    },
    bindings: {
      runPlanSha256: plan.planSha256,
      candidateManifestSha256: candidate.manifestSha256,
      candidateTarballSetSha256: candidate.tarballSetSha256,
      taskManifestSha256: planned.taskManifestSha256,
      evaluatorContractSha256: task.evaluator.contractSha256,
      informationEntitlementSha256: task.informationEntitlementSha256,
      environmentSpecSha256: task.environment.specSha256,
      environmentSubstanceSha256: task.environment.substanceSha256,
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
      runtimeMatrixFileSha256,
      runtimeMatrixSha256: runtimeMatrix.matrixSha256,
      benchmarkImageDigest: runtimeProfile.benchmarkImage.digest,
      preparedEnvironmentAttestationSha256,
      deliverySha256: deliveryArtifact.digest,
      environmentSha256: preparedEnvironment.environmentSha256,
      agentControllerSha256: controllerSha256,
    },
    model: {
      modelId: model.id,
      provider: response?.provider ?? model.provider,
      requestedModel: model.requestedModel,
      returnedModel: response?.returnedModel ?? null,
      identityMatched,
    },
    workspace: {
      baseCommit: base.commit,
      baseTree: base.tree,
      beforeClean: true,
      dependencyTreeBeforeVerified: true,
      dependencyTreeAfterVerified: agentEnvironmentDrift === null && evaluatorEnvironmentDrift === null,
      afterTree: changes.changedPaths.length === 0 ? base.tree : null,
      diffSha256: changeArtifact.digest,
    },
    budget: {
      paid: reservation.paid,
      reservedUsd: reservation.reservedUsd,
      actualUsd: Number.isFinite(actualCostUsd) && actualCostUsd >= 0 ? actualCostUsd : 0,
      approvalId: reservation.approvalId,
    },
    usage: {
      inputTokens: safeNonnegativeInteger(response?.usage?.inputTokens),
      outputTokens: safeNonnegativeInteger(response?.usage?.outputTokens),
      cachedInputTokens: safeNonnegativeInteger(response?.usage?.cachedInputTokens),
      requests: safeNonnegativeInteger(response?.usage?.requests),
      durationMs: Date.now() - adapterStartedAt,
    },
    trajectoryManifestSha256: trajectoryArtifact.digest,
    evaluatorResultSha256: evaluatorArtifact?.digest ?? null,
    failure: outcome.failure,
  };
  const recordArtifact = await writeContentAddressed(options.outputRoot, 'run-records', record);
  await writeCanonicalFile(join(options.outputRoot, 'run-index', `${planned.runId}.json`), {
    schemaVersion: 'decantr-benchmark-run-index-entry.v1',
    runId: planned.runId,
    recordSha256: recordArtifact.digest,
  });
  await rm(scratch, { recursive: true, force: true });
  return { record, recordSha256: recordArtifact.digest, recordPath: recordArtifact.path };
}

function verifyWorkspace(workspace, task, environment, arm) {
  const status = git(workspace, ['status', '--porcelain=v1', '--untracked-files=all'], environment);
  if (status.stdout.trim() !== '') throw new Error('workspace must be clean before every run');
  const commit = git(workspace, ['rev-parse', 'HEAD'], environment).stdout.trim();
  const tree = git(workspace, ['rev-parse', 'HEAD^{tree}'], environment).stdout.trim();
  assertEqual(commit, task.base.commit, 'workspace base commit');
  assertEqual(tree, task.base.tree, 'workspace base tree');
  const project = resolve(workspace, task.projectPath);
  const relation = relative(resolve(workspace), project);
  if (relation.startsWith('..') || isAbsolute(relation)) throw new Error('task projectPath escapes workspace');
  if (arm === 'control') {
    const tracked = git(workspace, ['ls-files'], environment).stdout.split('\n').filter(Boolean);
    const contaminated = tracked.filter(isDecantrArtifactPath);
    if (contaminated.length > 0) {
      throw new Error(`control workspace contains Decantr artifacts: ${contaminated.slice(0, 5).join(', ')}`);
    }
  }
  return { commit, tree };
}

function captureWorkspaceChanges(workspace, environment) {
  const diff = git(workspace, ['diff', '--binary', '--no-ext-diff', 'HEAD'], environment).stdout;
  const porcelain = git(workspace, ['status', '--porcelain=v1', '--untracked-files=all'], environment).stdout;
  const changedPaths = porcelain
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).replace(/^.* -> /u, ''))
    .sort();
  const untrackedPaths = porcelain
    .split('\n')
    .filter((line) => line.startsWith('?? '))
    .map((line) => line.slice(3))
    .sort();
  return {
    schemaVersion: 'decantr-benchmark-workspace-change.v1',
    diff,
    changedPaths,
    untracked: untrackedPaths.map((path) => {
      const absolute = resolve(workspace, path);
      let digest = null;
      try {
        digest = sha256(requireFile(absolute));
      } catch {
        digest = null;
      }
      return { path, sha256: digest };
    }),
  };
}

function requireFile(path) {
  return readFileSync(path);
}

function changedPathViolations(paths, scope) {
  return paths.filter((path) => {
    if (scope.forbiddenPaths.some((pattern) => matchesPathPattern(path, pattern))) return true;
    return scope.allowedPaths.length > 0 && !scope.allowedPaths.some((pattern) => matchesPathPattern(path, pattern));
  });
}

function matchesPathPattern(path, pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/gu, '\\$&')
    .replaceAll('**', '\u0000')
    .replaceAll('*', '[^/]*')
    .replaceAll('\u0000', '.*');
  return new RegExp(`^${escaped}$`, 'u').test(path);
}

function determineOutcome(input) {
  if (input.budgetError) return failure('budget_failure', 'budget', 'BUDGET_ENFORCEMENT', input.budgetError);
  if (input.adapterError) return failure('agent_failure', 'adapter', 'ADAPTER_FAILURE', input.adapterError);
  if (input.response.status === 'unsupported') {
    return failure('unsupported', 'adapter', 'UNSUPPORTED', 'adapter reported the task or model unsupported');
  }
  if (input.response.status !== 'completed') {
    return failure('agent_failure', 'adapter', 'AGENT_FAILURE', `adapter status was ${input.response.status}`);
  }
  if (!input.identityMatched) {
    return failure('model_substitution', 'model', 'MODEL_IDENTITY_MISMATCH', 'provider returned a different model identifier');
  }
  if (input.usageWithinLimits) {
    return failure('agent_failure', 'adapter', 'USAGE_LIMIT_BREACH', input.usageWithinLimits);
  }
  if (input.agentEnvironmentDrift) {
    return failure(
      'evaluation_failed',
      'workspace',
      'PREPARED_ENVIRONMENT_DRIFT',
      input.agentEnvironmentDrift,
    );
  }
  if (input.scopeViolations.length > 0) {
    return failure(
      'evaluation_failed',
      'workspace',
      'SCOPE_VIOLATION',
      `changed paths violate the frozen task scope: ${input.scopeViolations.slice(0, 10).join(', ')}`,
    );
  }
  if (input.evaluatorExecutionError) {
    return failure('evaluator_failure', 'evaluator', 'EVALUATOR_EXECUTION_FAILURE', input.evaluatorExecutionError);
  }
  if (input.evaluatorEnvironmentDrift) {
    return failure(
      'evaluator_failure',
      'evaluator',
      'EVALUATOR_ENVIRONMENT_DRIFT',
      input.evaluatorEnvironmentDrift,
    );
  }
  if (!input.evaluatorResult) {
    return failure('evaluator_failure', 'evaluator', 'MISSING_EVALUATOR_RESULT', 'evaluator result is missing');
  }
  if (input.evaluatorResult.status === 'build_failure') {
    return failure('build_failure', 'build', 'BUILD_FAILURE', input.evaluatorResult.failures.join('; '));
  }
  if (input.evaluatorResult.status === 'evaluator_failure') {
    return failure('evaluator_failure', 'evaluator', 'EVALUATOR_FAILURE', input.evaluatorResult.failures.join('; '));
  }
  if (input.evaluatorResult.status !== 'passed') {
    return failure('evaluation_failed', 'evaluator', 'EVALUATION_FAILED', input.evaluatorResult.failures.join('; '));
  }
  return { status: 'completed', failure: null };
}

function failure(status, stage, code, message) {
  return { status, failure: { stage, code, message: message || code } };
}

function assertAdapterResponse(response) {
  if (response?.schemaVersion !== 'decantr-benchmark-adapter-response.v1') {
    throw new Error('adapter response schemaVersion is invalid');
  }
  if (!['completed', 'unsupported', 'failed'].includes(response.status)) {
    throw new Error('adapter response status is invalid');
  }
  for (const field of ['provider', 'requestedModel', 'returnedModel']) {
    if (typeof response[field] !== 'string' || response[field] === '') throw new Error(`adapter response is missing ${field}`);
  }
  if (!response.usage || typeof response.usage !== 'object') throw new Error('adapter response is missing usage');
  for (const field of ['inputTokens', 'outputTokens', 'cachedInputTokens', 'requests']) {
    if (!Number.isInteger(response.usage[field]) || response.usage[field] < 0) {
      throw new Error(`adapter usage ${field} is invalid`);
    }
  }
  if (!Number.isFinite(response.usage.costUsd) || response.usage.costUsd < 0) {
    throw new Error('adapter usage costUsd is invalid');
  }
  if (!Array.isArray(response.trajectory)) throw new Error('adapter response trajectory is invalid');
}

function assertUsageWithinLimits(usage, limits) {
  if (usage.requests > limits.maxRequests) return `requests ${usage.requests} exceed ${limits.maxRequests}`;
  if (usage.inputTokens > limits.maxInputTokens) return `input tokens ${usage.inputTokens} exceed ${limits.maxInputTokens}`;
  if (usage.outputTokens > limits.maxOutputTokens) return `output tokens ${usage.outputTokens} exceed ${limits.maxOutputTokens}`;
  return null;
}

async function resolveAdapter(options) {
  if (options.paid && !options.adapterCommand) {
    throw new Error('paid execution requires an explicit external adapter command');
  }
  const command = options.adapterCommand ?? process.execPath;
  const args = options.adapterCommand ? options.adapterArgs : [defaultFakeAdapter];
  if (!options.paid && options.adapterCommand && options.allowExternalNoCostAdapter !== true) {
    throw new Error('external no-cost adapters require --allow-external-no-cost-adapter');
  }
  if (options.adapterCommand && !isAbsolute(options.adapterCommand)) {
    throw new Error('external adapter command must be an absolute executable path');
  }
  return { command, args };
}

async function controllerDigest(command, args) {
  const files = [];
  for (const token of [command, ...args]) {
    if (!isAbsolute(token)) continue;
    try {
      files.push({ path: token, sha256: sha256(await readFile(token)) });
    } catch {
      files.push({ path: token, sha256: null });
    }
  }
  return sha256Canonical({ command, args, files });
}

async function verifyArmParity(outputRoot, run, binding) {
  const key = sha256Canonical({ taskId: run.taskId, modelId: run.modelId, repetition: run.repetition });
  const path = join(outputRoot, 'parity', `${key}.json`);
  await mkdir(dirname(path), { recursive: true });
  try {
    await writeFile(path, prettyCanonicalJson(binding), { encoding: 'utf8', mode: 0o600, flag: 'wx' });
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    const existing = JSON.parse(await readFile(path, 'utf8'));
    if (canonicalJson(existing) !== canonicalJson(binding)) {
      throw new Error(`arm parity binding mismatch for ${run.taskId}/${run.modelId}/repetition-${run.repetition}`);
    }
  }
}

function git(workspace, args, environment) {
  const result = runFixed('git', ['-C', workspace, ...args], {
    cwd: workspace,
    timeoutMs: 30_000,
    env: environment,
  });
  if (result.exitCode !== 0) throw new Error(`git ${args[0]} failed: ${result.stderr.trim()}`);
  return result;
}

function isDecantrArtifactPath(path) {
  return (
    /(^|\/)\.decantr(?:\/|$)/iu.test(path) ||
    /(^|\/)DECANTR\.md$/iu.test(path) ||
    /(^|\/)decantr\.essence\.json$/iu.test(path) ||
    /(^|\/)decantr\.mdc$/iu.test(path)
  );
}

function redactSecrets(value) {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (!value || typeof value !== 'object') return typeof value === 'string' ? redactString(value) : value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      /(?:AUTH|CREDENTIAL|KEY|PASSWORD|SECRET|TOKEN)/iu.test(key) ? '[REDACTED]' : redactSecrets(item),
    ]),
  );
}

function redactString(value) {
  return value
    .replace(/(?:sk|key|token)-[A-Za-z0-9_-]{12,}/gu, '[REDACTED]')
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/giu, 'Bearer [REDACTED]');
}

async function createEmptyDirectory(path) {
  await mkdir(dirname(path), { recursive: true });
  try {
    await mkdir(path, { mode: 0o700 });
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    const entries = await readdir(path);
    if (entries.length > 0) throw new Error(`run scratch directory is not empty: ${path}`);
  }
}

function assertExplicitIdentity(planned, options) {
  if (!options.modelId || !options.arm || !Number.isInteger(options.repetition)) {
    throw new Error('--model-id, --arm, and --repetition are required for every run');
  }
  assertEqual(options.modelId, planned.modelId, 'explicit model identity');
  assertEqual(options.arm, planned.arm, 'explicit arm identity');
  assertEqual(options.repetition, planned.repetition, 'explicit repetition');
}

function safeNonnegativeInteger(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} mismatch: expected ${expected}, received ${actual}`);
}

function parseArgs(argv) {
  const options = {
    modelsPath: resolve(benchmarkDirectory, 'models.json'),
    protocolPath: resolve(benchmarkDirectory, 'protocol.json'),
    pricingPath: resolve(benchmarkDirectory, 'model-proxy', 'pricing.json'),
    adapterArgs: [],
    paid: false,
    allowExternalNoCostAdapter: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--plan') options.planPath = resolve(argv[++index]);
    else if (argument === '--run-id') options.runId = argv[++index];
    else if (argument === '--model-id') options.modelId = argv[++index];
    else if (argument === '--arm') options.arm = argv[++index];
    else if (argument === '--repetition') options.repetition = Number(argv[++index]);
    else if (argument === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argument === '--task-manifest') options.taskManifestPath = resolve(argv[++index]);
    else if (argument === '--evaluator-contract') options.evaluatorContractPath = resolve(argv[++index]);
    else if (argument === '--evaluator-root') options.evaluatorRoot = resolve(argv[++index]);
    else if (argument === '--evaluator-runtime-root') options.evaluatorRuntimeRoot = resolve(argv[++index]);
    else if (argument === '--evaluator-browsers-path') options.evaluatorBrowsersPath = resolve(argv[++index]);
    else if (argument === '--candidate-manifest') options.candidateManifestPath = resolve(argv[++index]);
    else if (argument === '--candidate-runtime-root') options.candidateRuntimeRoot = resolve(argv[++index]);
    else if (argument === '--environment-spec') options.environmentSpecPath = resolve(argv[++index]);
    else if (argument === '--runtime-matrix') options.runtimeMatrixPath = resolve(argv[++index]);
    else if (argument === '--prepared-environment') options.preparedEnvironmentPath = resolve(argv[++index]);
    else if (argument === '--adapter-command') options.adapterCommand = argv[++index];
    else if (argument === '--adapter-arg') options.adapterArgs.push(argv[++index]);
    else if (argument === '--allow-external-no-cost-adapter') options.allowExternalNoCostAdapter = true;
    else if (argument === '--output-root') options.outputRoot = resolve(argv[++index]);
    else if (argument === '--models') options.modelsPath = resolve(argv[++index]);
    else if (argument === '--protocol') options.protocolPath = resolve(argv[++index]);
    else if (argument === '--pricing') options.pricingPath = resolve(argv[++index]);
    else if (argument === '--paid') options.paid = true;
    else if (argument === '--budget-approval') options.budgetApprovalPath = resolve(argv[++index]);
    else if (argument === '--budget-ledger') options.budgetLedgerPath = resolve(argv[++index]);
    else if (argument === '--power-pilot') options.powerPilotPath = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argument}`);
  }
  for (const name of [
    'planPath',
    'runId',
    'modelId',
    'arm',
    'repetition',
    'workspace',
    'taskManifestPath',
    'evaluatorContractPath',
    'evaluatorRoot',
    'candidateManifestPath',
    'environmentSpecPath',
    'runtimeMatrixPath',
    'preparedEnvironmentPath',
    'outputRoot',
  ]) {
    if (options[name] === undefined) throw new Error(`Missing required option: ${name}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await runOne(parseArgs(process.argv.slice(2)));
    console.log(
      prettyCanonicalJson({
        ok: result.record.status === 'completed',
        runId: result.record.runId,
        status: result.record.status,
        recordSha256: result.recordSha256,
        recordPath: result.recordPath,
      }).trim(),
    );
    if (result.record.status !== 'completed') process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
