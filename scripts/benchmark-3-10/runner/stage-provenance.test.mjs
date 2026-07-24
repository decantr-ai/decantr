import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createAgentStageAttestation,
  createEvaluatorStageAttestation,
  stageProvenancePolicy,
} from './stage-provenance.mjs';

test('agent stage subject binds exact input, image, isolation, and model identity', () => {
  const value = createAgentStageAttestation(agentInput());
  assert.equal(value.productionEligible, true);
  assert.equal(value.isolation.providerCredentialPresent, false);
  assert.equal(value.bindings.agentImageDigest, `sha256:${'1'.repeat(64)}`);
  const tampered = structuredClone(value);
  tampered.isolation.privateOracleAbsentDuringAgentStage = false;
  assert.throws(
    () => createAgentStageAttestation(tampered),
    /fields are invalid|isolation is invalid/u,
  );
});

test('evaluator stage subject requires verified agent provenance and offline sealed evaluation', () => {
  const value = createEvaluatorStageAttestation(evaluatorInput());
  assert.equal(value.isolation.network, 'none');
  assert.equal(value.isolation.agentExitedBeforeMount, true);
  const tampered = structuredClone(value);
  tampered.reconstruction.baseTree = 'bad';
  tampered.attestationSha256 = '0'.repeat(64);
  assert.throws(() => createEvaluatorStageAttestation(tampered), /reconstruction|self digest/u);
});

test('stage subjects reject file bindings outside their artifact root', () => {
  const input = agentInput();
  input.output.adapterResponseFile.path =
    '../adapter-response.json';
  assert.throws(
    () => createAgentStageAttestation(input),
    /file binding is invalid/u,
  );
});

test('stage provenance policy permits private orchestration without weakening qualification privacy', () => {
  const sourceDigest = 'a'.repeat(40);
  assert.equal(
    stageProvenancePolicy('development', sourceDigest).repository,
    'decantr-ai/decantr',
  );
  assert.equal(
    stageProvenancePolicy('qualification', sourceDigest).repository,
    'decantr-ai/decantr-qualification-private',
  );
  assert.equal(
    stageProvenancePolicy(
      'development',
      sourceDigest,
      'decantr-ai/decantr-qualification-private',
    ).repository,
    'decantr-ai/decantr-qualification-private',
  );
  assert.throws(
    () =>
      stageProvenancePolicy(
        'qualification',
        sourceDigest,
        'decantr-ai/decantr',
      ),
    /partition or source digest is invalid/u,
  );
  const privateDevelopment = agentInput();
  privateDevelopment.execution.repository =
    'decantr-ai/decantr-qualification-private';
  assert.equal(
    createAgentStageAttestation(privateDevelopment).execution
      .repository,
    'decantr-ai/decantr-qualification-private',
  );
});

function agentInput() {
  return {
    runId: 'run-fixture',
    taskId: 'task-fixture',
    partition: 'development',
    arm: 'control',
    repetition: 1,
    model: {
      modelId: 'openai-gpt-5.6-sol',
      provider: 'openai',
      requestedModel: 'gpt-5.6-sol',
    },
    status: 'completed',
    productionEligible: true,
    createdAt: '2026-07-24T18:00:00.000Z',
    execution: execution('development', 'agent'),
    image: {
      reference: 'ghcr.io/decantr-ai/decantr-benchmark-3-10-agent:fixture@sha256:' + '1'.repeat(64),
      digest: `sha256:${'1'.repeat(64)}`,
      runtimeProfileId: 'node-22.19.0-pnpm-10.33.0',
    },
    controllerSha256: '2'.repeat(64),
    bindings: {
      authorizationSha256: '0'.repeat(64),
      requestFileSha256: '3'.repeat(64),
      requestSha256: '4'.repeat(64),
      runPlanSha256: '5'.repeat(64),
      taskManifestSha256: '6'.repeat(64),
      candidateManifestSha256: '0'.repeat(64),
      candidateTarballSetSha256: '7'.repeat(64),
      runtimeMatrixSha256: '8'.repeat(64),
      preparedEnvironmentAttestationSha256: '9'.repeat(64),
      environmentSha256: 'a'.repeat(64),
      environmentSpecSha256: 'b'.repeat(64),
      environmentSubstanceSha256: 'c'.repeat(64),
      informationEntitlementSha256: 'd'.repeat(64),
      deliverySha256: 'e'.repeat(64),
      baseCommit: 'f'.repeat(40),
      baseTree: '1'.repeat(40),
      agentImageDigest: `sha256:${'1'.repeat(64)}`,
    },
    isolation: {
      inputMaterial: ['adapter-request', 'prepared-workspace'],
      excludedMaterial: [
        'evaluator-contract',
        'evaluator-source',
        'expected-patch',
        'hidden-review',
        'private-oracle',
        'qualification-controller',
      ],
      providerCredentialPresent: false,
      personalSkills: false,
      personalMcp: false,
      hostConfiguration: false,
      modelNetwork: 'audited-run-local-proxy-only',
    },
    output: {
      adapterResponseFile: file('adapter-response.json', '1'),
      providerReceiptFile: file('provider-receipt.json', '2'),
      workspaceDeltaFile: file('workspace-delta.json', '3'),
      workspaceDeltaSha256: '4'.repeat(64),
    },
  };
}

function evaluatorInput() {
  return {
    runId: 'run-fixture',
    taskId: 'task-fixture',
    partition: 'development',
    arm: 'control',
    repetition: 1,
    status: 'completed',
    productionEligible: true,
    createdAt: '2026-07-24T18:10:00.000Z',
    execution: execution('development', 'evaluator'),
    image: {
      reference: 'ghcr.io/decantr-ai/decantr-benchmark-3-10:fixture@sha256:' + '2'.repeat(64),
      digest: `sha256:${'2'.repeat(64)}`,
      runtimeProfileId: 'node-22.19.0-pnpm-10.33.0',
    },
    controllerSha256: '3'.repeat(64),
    agentStage: {
      attestationFile: file('agent-stage-attestation.json', '4'),
      bundleFile: file('agent-stage.sigstore.json', '5'),
      verificationFile: file('agent-stage-verification.json', '6'),
      verificationSha256: '7'.repeat(64),
    },
    sealedInput: {
      taskManifestSha256: '8'.repeat(64),
      evaluatorContractSha256: '9'.repeat(64),
      evaluatorSourceClosureSha256: 'a'.repeat(64),
      oracleSourceSha256: 'b'.repeat(64),
    },
    isolation: {
      agentExitedBeforeMount: true,
      network: 'none',
      providerCredentialsAbsent: true,
    },
    reconstruction: {
      baseCommit: 'c'.repeat(40),
      baseTree: 'd'.repeat(40),
      workspaceDeltaSha256: 'e'.repeat(64),
      dependencyTreeBeforeVerified: true,
      dependencyTreeAfterVerified: true,
    },
    output: {
      authorizationFile: file('authorization.json', '5'),
      budgetApprovalFile: null,
      evaluatorResultFile: file('evaluator-result.json', '1'),
      powerPilotFile: null,
      runCoreFile: file('run-core.json', '2'),
      trajectoryManifestFile: file('trajectory.json', '3'),
      workspaceChangeFile: file('workspace-change.json', '4'),
    },
  };
}

function execution(partition, job) {
  return {
    repository:
      partition === 'development'
        ? 'decantr-ai/decantr'
        : 'decantr-ai/decantr-qualification-private',
    workflowFile: 'benchmark-3-10-split-run.yml',
    sourceDigest: 'a'.repeat(40),
    sourceRef: 'refs/heads/main',
    eventName: 'workflow_dispatch',
    runId: '123',
    runAttempt: '1',
    job,
    runnerEnvironment: 'github-hosted',
    runnerOs: 'Linux',
    runnerArch: 'X64',
  };
}

function file(path, digit) {
  return { path, sha256: digit.repeat(64), bytes: 1 };
}
