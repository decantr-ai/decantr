#!/usr/bin/env node
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { executeEvaluator } from '../evaluator/run-evaluator.mjs';
import {
  assertPreparedEnvironment,
  verifyLockfiles,
  verifyPreparedDependencyTree,
} from '../environments/prepared-environment.mjs';
import {
  assertAdapterResponse,
  assertProxyReceipt,
} from '../model-proxy/contracts.mjs';
import { assertTaskManifest } from './contracts.mjs';
import {
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
  writeContentAddressed,
} from './canonical.mjs';
import { runFixed, sanitizedEnvironment } from './process.mjs';
import { RUN_CORE_SCHEMA_VERSION, assertRunCore } from './run-record.mjs';
import { verifyRunAuthorization } from './run-authorization.mjs';
import { calculateStageControllerClosure } from './stage-controller.mjs';
import { assertSanitizedAgentRequest } from './agent-stage.mjs';
import {
  assertAgentStageAttestation,
  assertStageProvenanceVerification,
  createEvaluatorStageAttestation,
  fileBinding,
  retainedStageProvenance,
  stageProvenancePolicy,
  verifyStageProvenance,
  writeStageAttestation,
} from './stage-provenance.mjs';
import { applyWorkspaceDelta } from './workspace-delta.mjs';

const PROVIDER_CREDENTIAL = /^(?:ANTHROPIC_API_KEY|OPENAI_API_KEY|DECANTR_MODEL_PROXY_(?:KEY|TOKEN))$/u;

export async function executeEvaluatorStage(options, dependencies = {}) {
  assertNoProviderCredentials(options.environment ?? process.env);
  if (options.agentExitedBeforeMount !== true) {
    throw new Error('evaluator inputs may only mount after the agent process exits');
  }
  if (options.controllerRoot) {
    const controller = await calculateStageControllerClosure('evaluator', {
      root: options.controllerRoot,
      layout: 'evaluator-image',
    });
    if (controller.controllerSha256 !== options.evaluatorControllerSha256) {
      throw new Error('evaluator controller closure differs from the executing image');
    }
  } else if (options.execution?.runnerEnvironment === 'github-hosted') {
    throw new Error('GitHub-hosted evaluator stage requires a calculated controller closure');
  }

  const agentAttestationBytes = await readFile(resolve(options.agentAttestationPath));
  const agent = assertAgentStageAttestation(JSON.parse(agentAttestationBytes));
  assertStageIdentity(agent, options);
  const provenanceVerifier = dependencies.provenanceVerifier ?? verifyStageProvenance;
  const verification = await provenanceVerifier({
    subjectPath: resolve(options.agentAttestationPath),
    bundlePath: resolve(options.agentBundlePath),
    partition: agent.partition,
    repository: agent.execution.repository,
    sourceDigest: agent.execution.sourceDigest,
    cosignPath: options.cosignPath,
  });
  assertStageProvenanceVerification(
    verification,
    stageProvenancePolicy(
      agent.partition,
      agent.execution.sourceDigest,
      agent.execution.repository,
    ),
  );

  const outputRoot = resolve(options.outputRoot);
  const agentVerificationPath = join(outputRoot, 'agent-stage-verification.json');
  await writeCanonicalFile(agentVerificationPath, verification);
  const retainedAgent = await retainedStageProvenance({
    subjectPath: resolve(options.agentAttestationPath),
    bundlePath: resolve(options.agentBundlePath),
    verificationPath: agentVerificationPath,
  });

  const taskBytes = await readFile(resolve(options.taskManifestPath));
  const task = assertTaskManifest(JSON.parse(taskBytes), agent.partition);
  assertTaskBindings(task, taskBytes, agent);
  const preparedBytes = await readFile(resolve(options.preparedEnvironmentPath));
  const prepared = assertPreparedEnvironment(JSON.parse(preparedBytes), { task });
  assertPreparedBindings(prepared, preparedBytes, task, agent, options);

  const contractBytes = await readFile(resolve(options.evaluatorContractPath));
  if (sha256(contractBytes) !== task.evaluator.contractSha256) {
    throw new Error('evaluator contract differs from the task manifest');
  }
  const sourceClosure = await calculateSealedDirectoryClosure(
    resolve(options.evaluatorRoot),
  );
  if (
    sourceClosure.closureSha256 !== task.evaluator.qualificationEvaluatorSourceClosureSha256 ||
    !sourceClosure.entries.some((entry) => entry.sha256 === task.evaluator.oracleSourceSha256)
  ) {
    throw new Error('sealed evaluator source closure differs from the qualified task');
  }

  const requestBytes = await readFile(resolve(options.requestPath));
  const request = assertSanitizedAgentRequest(JSON.parse(requestBytes), {
    workspace: options.workspace,
    agentImageDigest: agent.image.digest,
  });
  if (
    sha256(requestBytes) !== agent.bindings.requestFileSha256 ||
    sha256Canonical(request) !== agent.bindings.requestSha256
  ) {
    throw new Error('agent request differs from the signed agent-stage subject');
  }
  assertRequestBindings(request, agent, task);
  const authorization = await verifyRunAuthorization({
    authorizationPath: resolve(options.authorizationPath),
    budgetApprovalPath: options.budgetApprovalPath
      ? resolve(options.budgetApprovalPath)
      : undefined,
    powerPilotPath: options.powerPilotPath
      ? resolve(options.powerPilotPath)
      : undefined,
    expectedSha256: agent.bindings.authorizationSha256,
    expected: {
      runId: agent.runId,
      partition: agent.partition,
      modelId: agent.model.modelId,
      runPlanSha256: agent.bindings.runPlanSha256,
      candidateManifestSha256:
        agent.bindings.candidateManifestSha256,
      candidateTarballSetSha256:
        agent.bindings.candidateTarballSetSha256,
      maxRunCostUsd: request.maxRunCostUsd,
      protocolMaximumUsd: options.protocolMaximumUsd,
      developmentTaskCount: options.developmentTaskCount,
    },
    paid: agent.output.providerReceiptFile !== null,
    now: agent.createdAt,
  });

  const responsePath = resolve(options.adapterResponsePath);
  const responseBytes = await readFile(responsePath);
  assertBoundFile(agent.output.adapterResponseFile, responsePath, responseBytes);
  const response = assertAdapterResponse(JSON.parse(responseBytes));
  if (
    response.provider !== agent.model.provider ||
    response.requestedModel !== agent.model.requestedModel
  ) {
    throw new Error('adapter response differs from the signed model request');
  }
  const providerReceipt = await verifyProviderReceipt({
    agent,
    request,
    response,
    providerReceiptPath: options.providerReceiptPath,
  });

  const deltaManifestPath = resolve(options.workspaceDeltaPath);
  const deltaBytes = await readFile(deltaManifestPath);
  assertBoundFile(agent.output.workspaceDeltaFile, deltaManifestPath, deltaBytes);
  const taskEnvironment = sanitizedEnvironment(resolve(outputRoot, 'home'), {
    ...(options.taskPath ? { PATH: options.taskPath } : {}),
  });
  await mkdir(taskEnvironment.HOME, { recursive: true, mode: 0o700 });
  assertCleanBase(options.workspace, agent, taskEnvironment);
  verifyLockfiles(options.workspace, prepared.lockfiles);
  await verifyPreparedDependencyTree(options.workspace, prepared);
  const reconstructed = await applyWorkspaceDelta({
    workspace: options.workspace,
    artifactRoot: resolve(options.workspaceDeltaArtifactRoot),
    manifestPath: deltaManifestPath,
    verificationRoot: join(outputRoot, 'workspace-reconstruction'),
    environment: taskEnvironment,
  });
  if (reconstructed.manifest.deltaSha256 !== agent.output.workspaceDeltaSha256) {
    throw new Error('reconstructed workspace delta differs from the signed agent stage');
  }
  verifyLockfiles(options.workspace, prepared.lockfiles);
  await verifyPreparedDependencyTree(options.workspace, prepared);

  const scopeViolations = changedPathViolations(
    reconstructed.manifest.changedPaths,
    task.scope,
  );
  const identityMatched =
    response.provider === agent.model.provider &&
    response.returnedModel === agent.model.requestedModel;
  const usageViolation = usageLimitViolation(response.usage, task.limits);
  const canEvaluate =
    agent.status === 'completed' &&
    response.status === 'completed' &&
    identityMatched &&
    usageViolation === null &&
    scopeViolations.length === 0;

  let evaluatorResult = null;
  let evaluatorError = null;
  if (canEvaluate) {
    try {
      evaluatorResult = await (dependencies.evaluator ?? executeEvaluator)({
        contractPath: resolve(options.evaluatorContractPath),
        expectedContractSha256: task.evaluator.contractSha256,
        workspace: resolve(options.workspace),
        evaluatorRoot: resolve(options.evaluatorRoot),
        evaluatorRuntimeRoot: options.evaluatorRuntimeRoot
          ? resolve(options.evaluatorRuntimeRoot)
          : undefined,
        evaluatorBrowsersPath: options.evaluatorBrowsersPath
          ? resolve(options.evaluatorBrowsersPath)
          : undefined,
        taskPath: options.taskPath,
        home: taskEnvironment.HOME,
        projectPath: task.projectPath,
        runId: agent.runId,
        taskId: task.taskId,
        contractId: task.evaluator.contractId,
      });
    } catch (error) {
      evaluatorError = error instanceof Error ? error.message : String(error);
    }
  }

  verifyLockfiles(options.workspace, prepared.lockfiles);
  await verifyPreparedDependencyTree(options.workspace, prepared);
  const artifacts = await writeRunArtifacts({
    outputRoot,
    task,
    agent,
    request,
    response,
    delta: reconstructed.manifest,
    deltaArtifactRoot: resolve(options.workspaceDeltaArtifactRoot),
    evaluatorResult,
    evaluatorError,
    scopeViolations,
    identityMatched,
    usageViolation,
    authorizationEvidence: authorization,
    startedAt: options.startedAt ?? agent.createdAt,
    finishedAt: options.finishedAt ?? new Date().toISOString(),
  });
  const outcome = determineOutcome({
    agent,
    response,
    identityMatched,
    usageViolation,
    scopeViolations,
    evaluatorResult,
    evaluatorError,
  });
  const paid = providerReceipt !== null;
  if (
    paid !== authorization.authorization.paid ||
    (paid && request.maxRunCostUsd <= 0)
  ) {
    throw new Error(
      'provider execution differs from the bound run authorization',
    );
  }
  const execution =
    options.execution ??
    executionIdentityFromEnvironment(agent.partition, process.env);
  const productionEligible =
    agent.productionEligible === true &&
    execution.runnerEnvironment === 'github-hosted' &&
    paid &&
    options.agentExitedBeforeMount === true;
  const runCore = assertRunCore({
    schemaVersion: RUN_CORE_SCHEMA_VERSION,
    runId: agent.runId,
    taskId: task.taskId,
    partition: task.partition,
    repositoryId: task.repositoryId,
    framework: task.framework,
    arm: agent.arm,
    repetition: agent.repetition,
    status: outcome.status,
    execution: {
      assurance: productionEligible
        ? 'github-host-split-stage-attested'
        : 'local-test-split-stage',
      productionEligible,
      agentEvaluatorStageSeparation: true,
      privateOracleAbsentDuringAgentStage: true,
      signedExternalProvenance: productionEligible,
    },
    bindings: {
      runPlanSha256: agent.bindings.runPlanSha256,
      candidateManifestSha256: agent.bindings.candidateManifestSha256,
      candidateTarballSetSha256: agent.bindings.candidateTarballSetSha256,
      taskManifestSha256: agent.bindings.taskManifestSha256,
      evaluatorContractSha256: task.evaluator.contractSha256,
      informationEntitlementSha256: task.informationEntitlementSha256,
      environmentSpecSha256: task.environment.specSha256,
      environmentSubstanceSha256: task.environment.substanceSha256,
      qualificationControllerSha256: task.evaluator.qualificationControllerSha256,
      qualificationReceiptFileSha256: task.evaluator.qualificationReceiptFileSha256,
      qualificationReceiptSha256: task.evaluator.qualificationReceiptSha256,
      qualificationExecutionAttestationFileSha256:
        task.evaluator.qualificationExecutionAttestationFileSha256,
      qualificationExecutionAttestationSha256:
        task.evaluator.qualificationExecutionAttestationSha256,
      qualificationExecutionControllerSha256:
        task.evaluator.qualificationExecutionControllerSha256,
      qualificationEvaluatorSourceClosureSha256:
        task.evaluator.qualificationEvaluatorSourceClosureSha256,
      qualificationInputRequestFileSha256:
        task.evaluator.qualificationInputRequestFileSha256,
      qualificationInputRequestSha256: task.evaluator.qualificationInputRequestSha256,
      qualificationInputManifestFileSha256:
        task.evaluator.qualificationInputManifestFileSha256,
      qualificationInputManifestSha256: task.evaluator.qualificationInputManifestSha256,
      qualificationRunnerRepositoryCommit:
        task.evaluator.qualificationRunnerRepositoryCommit,
      qualificationProvenanceBundleFileSha256:
        task.evaluator.qualificationProvenanceBundleFileSha256,
      qualificationProvenanceVerificationSha256:
        task.evaluator.qualificationProvenanceVerificationSha256,
      runtimeMatrixFileSha256: task.environment.runtimeMatrixFileSha256,
      runtimeMatrixSha256: task.environment.runtimeMatrixSha256,
      benchmarkImageDigest: task.environment.benchmarkImageDigest,
      agentImageDigest: agent.image.digest,
      authorizationSha256:
        agent.bindings.authorizationSha256,
      preparedEnvironmentAttestationSha256:
        agent.bindings.preparedEnvironmentAttestationSha256,
      deliverySha256: agent.bindings.deliverySha256,
      environmentSha256: agent.bindings.environmentSha256,
      agentControllerSha256: agent.controllerSha256,
      evaluatorControllerSha256: options.evaluatorControllerSha256,
    },
    model: {
      modelId: agent.model.modelId,
      provider: response.provider,
      requestedModel: agent.model.requestedModel,
      returnedModel: response.returnedModel,
      identityMatched,
    },
    workspace: {
      baseCommit: agent.bindings.baseCommit,
      baseTree: agent.bindings.baseTree,
      beforeClean: true,
      dependencyTreeBeforeVerified: true,
      dependencyTreeAfterVerified: true,
      afterTree:
        reconstructed.manifest.changedPaths.length === 0
          ? agent.bindings.baseTree
          : null,
      diffSha256: artifacts.workspaceChange.digest,
    },
    budget: {
      paid,
      reservedUsd: paid ? request.maxRunCostUsd : 0,
      actualUsd: paid ? response.usage.costUsd : 0,
      approvalId: paid
        ? authorization.authorization.budgetApproval.approvalId
        : null,
    },
    usage: {
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
      cachedInputTokens: response.usage.cachedInputTokens,
      requests: response.usage.requests,
      durationMs: nonnegativeInteger(
        options.durationMs ?? adapterDurationMs(response),
      ),
    },
    trajectoryManifestSha256: artifacts.trajectory.digest,
    evaluatorResultSha256: artifacts.evaluator?.digest ?? null,
    failure: outcome.failure,
  });
  const runCorePath = join(outputRoot, 'run-core.json');
  await writeCanonicalFile(runCorePath, runCore);

  const runCoreBytes = await readFile(runCorePath);
  const workspaceChangeBytes = await readFile(artifacts.workspaceChange.path);
  const trajectoryBytes = await readFile(artifacts.trajectory.path);
  const evaluatorBytes = artifacts.evaluator
    ? await readFile(artifacts.evaluator.path)
    : null;
  const authorizationArtifactBytes = await readFile(
    artifacts.authorization.path,
  );
  const budgetApprovalArtifactBytes = artifacts.budgetApproval
    ? await readFile(artifacts.budgetApproval.path)
    : null;
  const powerPilotArtifactBytes = artifacts.powerPilot
    ? await readFile(artifacts.powerPilot.path)
    : null;
  const attestation = createEvaluatorStageAttestation({
    runId: agent.runId,
    taskId: task.taskId,
    partition: task.partition,
    arm: agent.arm,
    repetition: agent.repetition,
    status: 'completed',
    productionEligible,
    createdAt: options.finishedAt ?? new Date().toISOString(),
    execution,
    image: {
      reference: options.evaluatorImageReference,
      digest: options.evaluatorImageDigest,
      runtimeProfileId: prepared.runtimeProfileId,
    },
    controllerSha256: options.evaluatorControllerSha256,
    agentStage: retainedAgent,
    sealedInput: {
      taskManifestSha256: sha256(taskBytes),
      evaluatorContractSha256: sha256(contractBytes),
      evaluatorSourceClosureSha256: sourceClosure.closureSha256,
      oracleSourceSha256: task.evaluator.oracleSourceSha256,
    },
    isolation: {
      agentExitedBeforeMount: true,
      network: 'none',
      providerCredentialsAbsent: true,
    },
    reconstruction: {
      baseCommit: agent.bindings.baseCommit,
      baseTree: agent.bindings.baseTree,
      workspaceDeltaSha256: reconstructed.manifest.deltaSha256,
      dependencyTreeBeforeVerified: true,
      dependencyTreeAfterVerified: true,
    },
    output: {
      authorizationFile: fileBinding(
        artifacts.authorization.path,
        authorizationArtifactBytes,
      ),
      budgetApprovalFile: artifacts.budgetApproval
        ? fileBinding(
            artifacts.budgetApproval.path,
            budgetApprovalArtifactBytes,
          )
        : null,
      evaluatorResultFile: artifacts.evaluator
        ? fileBinding(artifacts.evaluator.path, evaluatorBytes)
        : null,
      runCoreFile: fileBinding(runCorePath, runCoreBytes),
      powerPilotFile: artifacts.powerPilot
        ? fileBinding(
            artifacts.powerPilot.path,
            powerPilotArtifactBytes,
          )
        : null,
      trajectoryManifestFile: fileBinding(artifacts.trajectory.path, trajectoryBytes),
      workspaceChangeFile: fileBinding(
        artifacts.workspaceChange.path,
        workspaceChangeBytes,
      ),
    },
  });
  const attestationPath = join(outputRoot, 'evaluator-stage-attestation.json');
  await writeStageAttestation(attestationPath, attestation);
  return {
    attestation,
    attestationPath,
    runCore,
    runCorePath,
    artifacts,
  };
}

async function writeRunArtifacts(input) {
  const authorization = await writeExactContentAddressed(
    input.outputRoot,
    'run-authorizations',
    input.authorizationEvidence.bytes,
    input.agent.bindings.authorizationSha256,
  );
  const budgetApproval = input.authorizationEvidence.budgetApprovalBytes
    ? await writeExactContentAddressed(
        input.outputRoot,
        'budget-approvals',
        input.authorizationEvidence.budgetApprovalBytes,
        input.authorizationEvidence.authorization.budgetApproval.sha256,
      )
    : null;
  const powerPilot = input.authorizationEvidence.powerPilotBytes
    ? await writeExactContentAddressed(
        input.outputRoot,
        'power-pilots',
        input.authorizationEvidence.powerPilotBytes,
        input.authorizationEvidence.authorization.powerPilot.sha256,
      )
    : null;
  const delivery = JSON.parse(input.request.context);
  const deliveryArtifact = await writeContentAddressed(
    input.outputRoot,
    'arm-deliveries',
    delivery,
  );
  if (deliveryArtifact.digest !== input.agent.bindings.deliverySha256) {
    throw new Error('arm delivery differs from the signed agent request');
  }
  const requestArtifact = await writeContentAddressed(
    input.outputRoot,
    'adapter-requests',
    input.request,
  );
  if (requestArtifact.digest !== input.agent.bindings.requestSha256) {
    throw new Error('adapter request content address differs from the agent attestation');
  }
  const responseSummary = {
    schemaVersion: input.response.schemaVersion,
    provider: input.response.provider,
    requestedModel: input.response.requestedModel,
    returnedModel: input.response.returnedModel,
    status: input.response.status,
    usage: input.response.usage,
  };
  const responseArtifact = await writeContentAddressed(
    input.outputRoot,
    'adapter-responses',
    responseSummary,
  );
  const patchBytes = await readFile(
    resolve(input.deltaArtifactRoot, input.delta.patch.path),
  );
  const workspaceChange = await writeContentAddressed(
    input.outputRoot,
    'workspace-changes',
    {
      schemaVersion: 'decantr-benchmark-workspace-change.v1',
      diff: patchBytes.toString('utf8'),
      changedPaths: input.delta.changedPaths,
      untracked: input.delta.untracked.map(({ path, sha256: digest }) => ({
        path,
        sha256: digest,
      })),
    },
  );
  const evaluator = input.evaluatorResult
    ? await writeContentAddressed(
        input.outputRoot,
        'evaluator-results',
        input.evaluatorResult,
      )
    : null;
  const events = [
    event(input.agent.runId, 0, 'agent', 'agent.stage.verified', input.startedAt, {
      attestationSha256: input.agent.attestationSha256,
    }),
    event(input.agent.runId, 1, 'runner', 'workspace.reconstructed', input.finishedAt, {
      deltaSha256: input.delta.deltaSha256,
      changedPathCount: input.delta.changedPaths.length,
      scopeViolationCount: input.scopeViolations.length,
    }),
    event(
      input.agent.runId,
      2,
      'evaluator',
      input.evaluatorResult ? 'evaluation.finished' : 'evaluation.not_run',
      input.finishedAt,
      {
        resultSha256: evaluator?.digest ?? null,
        status: input.evaluatorResult?.status ?? null,
        error: input.evaluatorError,
        identityMatched: input.identityMatched,
        usageViolation: input.usageViolation,
      },
    ),
  ];
  const eventBindings = [];
  for (const item of events) {
    const artifact = await writeContentAddressed(
      input.outputRoot,
      'trajectory-events',
      item,
    );
    eventBindings.push({ sequence: item.sequence, sha256: artifact.digest });
  }
  const trajectory = await writeContentAddressed(
    input.outputRoot,
    'trajectory-manifests',
    {
      schemaVersion: 'decantr-benchmark-trajectory-manifest.v1',
      runId: input.agent.runId,
      complete: true,
      armDeliverySha256: deliveryArtifact.digest,
      adapterRequestSha256: requestArtifact.digest,
      adapterResponseSha256: responseArtifact.digest,
      events: eventBindings,
    },
  );
  return {
    authorization,
    budgetApproval,
    delivery: deliveryArtifact,
    request: requestArtifact,
    response: responseArtifact,
    workspaceChange,
    evaluator,
    powerPilot,
    trajectory,
  };
}

async function writeExactContentAddressed(
  root,
  category,
  bytes,
  expectedDigest,
) {
  const digest = sha256(bytes);
  if (digest !== expectedDigest) {
    throw new Error(
      `${category} bytes differ from their signed digest`,
    );
  }
  const path = join(
    root,
    category,
    'sha256',
    `${digest}.json`,
  );
  await mkdir(resolve(path, '..'), { recursive: true });
  try {
    await writeFile(path, bytes, { mode: 0o600, flag: 'wx' });
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    const existing = await readFile(path);
    if (!existing.equals(bytes)) {
      throw new Error(
        `${category} content address contains different bytes`,
      );
    }
  }
  return { digest, path };
}

function determineOutcome(input) {
  if (input.agent.status === 'unsupported' || input.response.status === 'unsupported') {
    return failure(
      'unsupported',
      'adapter',
      'UNSUPPORTED',
      'adapter reported the task or model unsupported',
    );
  }
  if (input.agent.status !== 'completed' || input.response.status !== 'completed') {
    return failure(
      'agent_failure',
      'adapter',
      'AGENT_FAILURE',
      `agent stage was ${input.agent.status}; adapter response was ${input.response.status}`,
    );
  }
  if (!input.identityMatched) {
    return failure(
      'model_substitution',
      'model',
      'MODEL_IDENTITY_MISMATCH',
      'provider returned a different model identifier',
    );
  }
  if (input.usageViolation) {
    return failure(
      'agent_failure',
      'adapter',
      'USAGE_LIMIT_BREACH',
      input.usageViolation,
    );
  }
  if (input.scopeViolations.length > 0) {
    return failure(
      'evaluation_failed',
      'workspace',
      'SCOPE_VIOLATION',
      `changed paths violate task scope: ${input.scopeViolations.slice(0, 10).join(', ')}`,
    );
  }
  if (input.evaluatorError) {
    return failure(
      'evaluator_failure',
      'evaluator',
      'EVALUATOR_EXECUTION_FAILURE',
      input.evaluatorError,
    );
  }
  if (!input.evaluatorResult) {
    return failure(
      'evaluator_failure',
      'evaluator',
      'MISSING_EVALUATOR_RESULT',
      'evaluator result is missing',
    );
  }
  if (input.evaluatorResult.status === 'build_failure') {
    return failure(
      'build_failure',
      'build',
      'BUILD_FAILURE',
      input.evaluatorResult.failures?.join('; ') || 'required build failed',
    );
  }
  if (input.evaluatorResult.status === 'evaluator_failure') {
    return failure(
      'evaluator_failure',
      'evaluator',
      'EVALUATOR_FAILURE',
      input.evaluatorResult.failures?.join('; ') || 'required evaluator was unavailable',
    );
  }
  if (input.evaluatorResult.status !== 'passed') {
    return failure(
      'evaluation_failed',
      'evaluator',
      'EVALUATION_FAILED',
      input.evaluatorResult.failures?.join('; ') || 'evaluator rejected the change',
    );
  }
  return { status: 'completed', failure: null };
}

function assertTaskBindings(task, taskBytes, agent) {
  if (
    task.taskId !== agent.taskId ||
    task.partition !== agent.partition ||
    sha256(taskBytes) !== agent.bindings.taskManifestSha256 ||
    task.base.commit !== agent.bindings.baseCommit ||
    task.base.tree !== agent.bindings.baseTree ||
    task.informationEntitlementSha256 !==
      agent.bindings.informationEntitlementSha256 ||
    task.environment.specSha256 !== agent.bindings.environmentSpecSha256 ||
    task.environment.substanceSha256 !==
      agent.bindings.environmentSubstanceSha256 ||
    task.environment.runtimeMatrixSha256 !== agent.bindings.runtimeMatrixSha256
  ) {
    throw new Error('sealed task differs from the signed agent stage');
  }
}

function assertPreparedBindings(prepared, bytes, task, agent, options) {
  if (
    sha256(bytes) !== agent.bindings.preparedEnvironmentAttestationSha256 ||
    prepared.environmentSha256 !== agent.bindings.environmentSha256 ||
    prepared.runtimeProfileId !== agent.image.runtimeProfileId ||
    prepared.benchmarkImageDigest !== options.evaluatorImageDigest ||
    prepared.benchmarkImageDigest !== task.environment.benchmarkImageDigest ||
    agent.image.digest === options.evaluatorImageDigest
  ) {
    throw new Error('prepared environment or evaluator image differs from the signed run');
  }
}

function assertRequestBindings(request, agent, task) {
  if (
    request.runId !== agent.runId ||
    request.taskId !== task.taskId ||
    request.arm !== agent.arm ||
    request.repetition !== agent.repetition ||
    request.bindings.taskManifestSha256 !== agent.bindings.taskManifestSha256 ||
    request.bindings.candidateManifestSha256 !==
      agent.bindings.candidateManifestSha256 ||
    request.bindings.candidateTarballSetSha256 !==
      agent.bindings.candidateTarballSetSha256 ||
    request.bindings.authorizationSha256 !==
      agent.bindings.authorizationSha256 ||
    request.bindings.deliverySha256 !== agent.bindings.deliverySha256 ||
    request.bindings.agentControllerSha256 !== agent.controllerSha256
  ) {
    throw new Error('agent request identity differs from the signed stage or sealed task');
  }
}

async function verifyProviderReceipt(input) {
  if (input.agent.output.providerReceiptFile === null) {
    if (input.providerReceiptPath) {
      throw new Error('unsigned provider receipt was supplied to the evaluator');
    }
    return null;
  }
  if (!input.providerReceiptPath) {
    throw new Error('signed agent stage requires its provider receipt');
  }
  const path = resolve(input.providerReceiptPath);
  const bytes = await readFile(path);
  assertBoundFile(input.agent.output.providerReceiptFile, path, bytes);
  const receipt = assertProxyReceipt(JSON.parse(bytes), input.request);
  if (
    input.response.providerReceiptSha256 !== receipt.receiptSha256 ||
    input.response.returnedModel !== receipt.returnedModel
  ) {
    throw new Error('adapter response differs from the audited provider receipt');
  }
  return receipt;
}

export async function calculateSealedDirectoryClosure(root) {
  const entries = [];
  await walkSealedFiles(root, root, entries);
  entries.sort((left, right) => left.path.localeCompare(right.path));
  if (entries.length === 0) throw new Error('sealed evaluator source directory is empty');
  return { entries, closureSha256: sha256Canonical(entries) };
}

async function walkSealedFiles(root, directory, output) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    const logicalPath = relative(root, path).replaceAll('\\', '/');
    const metadata = await lstat(path);
    if (metadata.isSymbolicLink()) {
      throw new Error(`symlink is forbidden in sealed evaluator input: ${logicalPath}`);
    }
    if (metadata.isDirectory()) {
      await walkSealedFiles(root, path, output);
    } else if (metadata.isFile()) {
      const bytes = await readFile(path);
      output.push({
        path: logicalPath,
        kind: 'file',
        sha256: sha256(bytes),
        bytes: bytes.byteLength,
        mode: metadata.mode & 0o777,
      });
    } else {
      throw new Error(`special file is forbidden in sealed evaluator input: ${logicalPath}`);
    }
  }
}

function assertStageIdentity(agent, options) {
  if (
    agent.partition !== options.partition ||
    agent.image.digest !== options.agentImageDigest ||
    (options.runId && agent.runId !== options.runId)
  ) {
    throw new Error('agent-stage subject differs from the requested evaluator execution');
  }
}

function assertBoundFile(binding, path, bytes) {
  if (
    binding.path !== path.split('/').at(-1) ||
    binding.sha256 !== sha256(bytes) ||
    binding.bytes !== bytes.byteLength
  ) {
    throw new Error(`signed file binding mismatch: ${path}`);
  }
}

function assertCleanBase(workspace, agent, environment) {
  const status = git(
    workspace,
    ['status', '--porcelain=v1', '--untracked-files=all'],
    environment,
  ).stdout;
  const commit = git(workspace, ['rev-parse', 'HEAD'], environment).stdout.trim();
  const tree = git(workspace, ['rev-parse', 'HEAD^{tree}'], environment).stdout.trim();
  if (
    status !== '' ||
    commit !== agent.bindings.baseCommit ||
    tree !== agent.bindings.baseTree
  ) {
    throw new Error('evaluator workspace is not a fresh copy of the signed base');
  }
}

function usageLimitViolation(usage, limits) {
  if (usage.requests > limits.maxRequests) {
    return `requests ${usage.requests} exceed ${limits.maxRequests}`;
  }
  if (usage.inputTokens > limits.maxInputTokens) {
    return `input tokens ${usage.inputTokens} exceed ${limits.maxInputTokens}`;
  }
  if (usage.outputTokens > limits.maxOutputTokens) {
    return `output tokens ${usage.outputTokens} exceed ${limits.maxOutputTokens}`;
  }
  return null;
}

function changedPathViolations(paths, scope) {
  return paths.filter((path) => {
    if (scope.forbiddenPaths.some((pattern) => matchesPathPattern(path, pattern))) {
      return true;
    }
    return (
      scope.allowedPaths.length > 0 &&
      !scope.allowedPaths.some((pattern) => matchesPathPattern(path, pattern))
    );
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

function event(runId, sequence, source, type, recordedAt, payload) {
  return {
    schemaVersion: 'decantr-benchmark-trajectory-event.v1',
    runId,
    sequence,
    source,
    type,
    recordedAt,
    payload,
  };
}

function failure(status, stage, code, message) {
  return { status, failure: { stage, code, message } };
}

function assertNoProviderCredentials(environment) {
  const keys = Object.keys(environment).filter((key) => PROVIDER_CREDENTIAL.test(key));
  if (keys.length > 0) {
    throw new Error(`provider credentials are forbidden in evaluator stage: ${keys.join(', ')}`);
  }
}

function executionIdentityFromEnvironment(partition, environment) {
  const repository = requiredEnvironment(
    environment,
    'GITHUB_REPOSITORY',
  );
  if (
    (partition === 'qualification' &&
      repository !==
        'decantr-ai/decantr-qualification-private') ||
    (partition === 'development' &&
      ![
        'decantr-ai/decantr',
        'decantr-ai/decantr-qualification-private',
      ].includes(repository))
  ) {
    throw new Error(
      'GITHUB_REPOSITORY is invalid for the run partition',
    );
  }
  return {
    repository,
    workflowFile: 'benchmark-3-10-split-run.yml',
    sourceDigest: requiredEnvironment(environment, 'GITHUB_SHA'),
    sourceRef: requiredEnvironment(environment, 'GITHUB_REF'),
    eventName: requiredEnvironment(environment, 'GITHUB_EVENT_NAME'),
    runId: requiredEnvironment(environment, 'GITHUB_RUN_ID'),
    runAttempt: requiredEnvironment(environment, 'GITHUB_RUN_ATTEMPT'),
    job: 'evaluator',
    runnerEnvironment: requiredEnvironment(environment, 'RUNNER_ENVIRONMENT'),
    runnerOs: requiredEnvironment(environment, 'RUNNER_OS'),
    runnerArch: requiredEnvironment(environment, 'RUNNER_ARCH'),
  };
}

function requiredEnvironment(environment, key) {
  const value = environment[key];
  if (typeof value !== 'string' || value === '') throw new Error(`${key} is required`);
  return value;
}

function nonnegativeInteger(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

function adapterDurationMs(response) {
  return response.trajectory.find(
    (item) => item?.type === 'agent.process.finished',
  )?.payload?.durationMs;
}

function git(workspace, args, environment) {
  const result = runFixed('git', ['-C', workspace, ...args], {
    cwd: workspace,
    env: environment,
    timeoutMs: 60_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.exitCode !== 0) {
    throw new Error(`git ${args[0]} failed: ${result.stderr.slice(0, 500)}`);
  }
  return result;
}

function parseArgs(argv) {
  const options = { agentExitedBeforeMount: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--agent-attestation') options.agentAttestationPath = resolve(argv[++index]);
    else if (argument === '--agent-bundle') options.agentBundlePath = resolve(argv[++index]);
    else if (argument === '--agent-image-digest') options.agentImageDigest = argv[++index];
    else if (argument === '--request') options.requestPath = resolve(argv[++index]);
    else if (argument === '--adapter-response') options.adapterResponsePath = resolve(argv[++index]);
    else if (argument === '--provider-receipt') options.providerReceiptPath = resolve(argv[++index]);
    else if (argument === '--authorization') options.authorizationPath = resolve(argv[++index]);
    else if (argument === '--budget-approval') options.budgetApprovalPath = resolve(argv[++index]);
    else if (argument === '--power-pilot') options.powerPilotPath = resolve(argv[++index]);
    else if (argument === '--protocol-maximum-usd') {
      options.protocolMaximumUsd = Number(argv[++index]);
    } else if (argument === '--development-task-count') {
      options.developmentTaskCount = Number(argv[++index]);
    }
    else if (argument === '--workspace-delta') options.workspaceDeltaPath = resolve(argv[++index]);
    else if (argument === '--workspace-delta-root') {
      options.workspaceDeltaArtifactRoot = resolve(argv[++index]);
    } else if (argument === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argument === '--prepared-environment') {
      options.preparedEnvironmentPath = resolve(argv[++index]);
    } else if (argument === '--task-manifest') options.taskManifestPath = resolve(argv[++index]);
    else if (argument === '--evaluator-contract') {
      options.evaluatorContractPath = resolve(argv[++index]);
    } else if (argument === '--evaluator-root') options.evaluatorRoot = resolve(argv[++index]);
    else if (argument === '--evaluator-runtime-root') {
      options.evaluatorRuntimeRoot = resolve(argv[++index]);
    } else if (argument === '--evaluator-browsers-path') {
      options.evaluatorBrowsersPath = resolve(argv[++index]);
    } else if (argument === '--evaluator-image-reference') {
      options.evaluatorImageReference = argv[++index];
    } else if (argument === '--evaluator-image-digest') {
      options.evaluatorImageDigest = argv[++index];
    } else if (argument === '--evaluator-controller-sha256') {
      options.evaluatorControllerSha256 = argv[++index];
    } else if (argument === '--controller-root') {
      options.controllerRoot = resolve(argv[++index]);
    } else if (argument === '--task-path') options.taskPath = argv[++index];
    else if (argument === '--partition') options.partition = argv[++index];
    else if (argument === '--run-id') options.runId = argv[++index];
    else if (argument === '--cosign') options.cosignPath = resolve(argv[++index]);
    else if (argument === '--output-root') options.outputRoot = resolve(argv[++index]);
    else if (argument === '--agent-exited-before-mount') {
      options.agentExitedBeforeMount = true;
    } else {
      throw new Error(`unknown option: ${argument}`);
    }
  }
  for (const key of [
    'agentAttestationPath',
    'agentBundlePath',
    'agentImageDigest',
    'requestPath',
    'adapterResponsePath',
    'authorizationPath',
    'workspaceDeltaPath',
    'workspaceDeltaArtifactRoot',
    'workspace',
    'preparedEnvironmentPath',
    'taskManifestPath',
    'evaluatorContractPath',
    'evaluatorRoot',
    'evaluatorImageReference',
    'evaluatorImageDigest',
    'evaluatorControllerSha256',
    'partition',
    'outputRoot',
    'cosignPath',
    'protocolMaximumUsd',
    'developmentTaskCount',
  ]) {
    if (!options[key]) throw new Error(`missing required option: ${key}`);
  }
  if (!isAbsolute(options.workspace)) throw new Error('--workspace must be absolute');
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await executeEvaluatorStage(parseArgs(process.argv.slice(2)));
    process.stdout.write(
      prettyCanonicalJson({
        ok: result.attestation.status === 'completed',
        runId: result.attestation.runId,
        attestationSha256: result.attestation.attestationSha256,
        attestationPath: result.attestationPath,
        runCorePath: result.runCorePath,
      }),
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
