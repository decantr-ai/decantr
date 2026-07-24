import assert from 'node:assert/strict';
import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  SIGSTORE_KEYLESS_PROVIDER,
  SIGSTORE_KEYLESS_SCHEMA_VERSION,
  SIGSTORE_OIDC_ISSUER,
} from '../provenance/sigstore-keyless.mjs';
import {
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from './canonical.mjs';
import { finalizeSplitRun } from './finalize-split-run.mjs';
import { RUN_CORE_SCHEMA_VERSION, assertRunCore } from './run-record.mjs';
import {
  createAgentStageAttestation,
  createEvaluatorStageAttestation,
  fileBinding,
  stageProvenancePolicy,
  writeStageAttestation,
} from './stage-provenance.mjs';

test('finalizer creates a v3 record from two independently verified stage subjects', async () => {
  const fixture = await createFixture();
  try {
    const result = await finalizeSplitRun(
      {
        agentAttestationPath: fixture.agentPath,
        agentBundlePath: fixture.agentBundlePath,
        evaluatorAttestationPath: fixture.evaluatorPath,
        evaluatorBundlePath: fixture.evaluatorBundlePath,
        runCorePath: fixture.runCorePath,
        outputRoot: fixture.outputRoot,
      },
      { provenanceVerifier: fixtureProvenanceVerifier },
    );
    assert.equal(result.record.schemaVersion, 'decantr-benchmark-run-record.v3');
    assert.equal(result.record.execution.productionEligible, true);
    assert.equal(result.record.provenance.agentStage.attestationSha256, fixture.agent.attestationSha256);
    assert.equal(
      result.record.provenance.evaluatorStage.attestationSha256,
      fixture.evaluator.attestationSha256,
    );
    assert.equal(
      result.record.provenance.agentStage.attestationFile.path,
      'stage-provenance/run-fixture/agent/attestation.json',
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('finalizer rejects a run core changed after evaluator attestation', async () => {
  const fixture = await createFixture();
  try {
    const changed = structuredClone(fixture.runCore);
    changed.usage.durationMs = 2;
    await writeCanonicalFile(fixture.runCorePath, changed);
    await assert.rejects(
      finalizeSplitRun(
        {
          agentAttestationPath: fixture.agentPath,
          agentBundlePath: fixture.agentBundlePath,
          evaluatorAttestationPath: fixture.evaluatorPath,
          evaluatorBundlePath: fixture.evaluatorBundlePath,
          runCorePath: fixture.runCorePath,
          outputRoot: fixture.outputRoot,
        },
        { provenanceVerifier: fixtureProvenanceVerifier },
      ),
      /different agent or run-core bytes/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'decantr-finalizer-'));
  const outputRoot = join(root, 'evidence');
  const agentPath = join(root, 'agent.json');
  const agentBundlePath = join(root, 'agent-bundle.json');
  const evaluatorPath = join(root, 'evaluator.json');
  const evaluatorBundlePath = join(root, 'evaluator-bundle.json');
  const runCorePath = join(root, 'run-core.json');
  await Promise.all([
    writeFile(agentBundlePath, '{"stage":"agent"}\n'),
    writeFile(evaluatorBundlePath, '{"stage":"evaluator"}\n'),
  ]);
  const agent = createAgentStageAttestation({
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
    execution: githubExecution('agent'),
    image: {
      reference: `ghcr.io/decantr-ai/agent@sha256:${'1'.repeat(64)}`,
      digest: `sha256:${'1'.repeat(64)}`,
      runtimeProfileId: 'node-22.19.0-npm-11.4.2',
    },
    controllerSha256: '2'.repeat(64),
    bindings: {
      authorizationSha256: '0'.repeat(64),
      requestFileSha256: '3'.repeat(64),
      requestSha256: '4'.repeat(64),
      runPlanSha256: '5'.repeat(64),
      taskManifestSha256: '6'.repeat(64),
      candidateManifestSha256: '7'.repeat(64),
      candidateTarballSetSha256: '8'.repeat(64),
      runtimeMatrixSha256: '9'.repeat(64),
      preparedEnvironmentAttestationSha256: 'a'.repeat(64),
      environmentSha256: 'b'.repeat(64),
      environmentSpecSha256: 'c'.repeat(64),
      environmentSubstanceSha256: 'd'.repeat(64),
      informationEntitlementSha256: 'e'.repeat(64),
      deliverySha256: 'f'.repeat(64),
      baseCommit: '1'.repeat(40),
      baseTree: '2'.repeat(40),
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
      adapterResponseFile: fixtureFile('adapter-response.json', '1'),
      providerReceiptFile: fixtureFile('provider-receipt.json', '2'),
      workspaceDeltaFile: fixtureFile('workspace-delta.json', '3'),
      workspaceDeltaSha256: '4'.repeat(64),
    },
  });
  await writeStageAttestation(agentPath, agent);
  const agentBytes = await readFile(agentPath);
  const agentBundleBytes = await readFile(agentBundlePath);
  const agentVerification = await fixtureProvenanceVerifier({
    subjectPath: agentPath,
    bundlePath: agentBundlePath,
    partition: agent.partition,
    sourceDigest: agent.execution.sourceDigest,
  });
  const agentVerificationBytes = Buffer.from(
    prettyCanonicalJson(agentVerification),
    'utf8',
  );
  const runCore = assertRunCore({
    schemaVersion: RUN_CORE_SCHEMA_VERSION,
    runId: agent.runId,
    taskId: agent.taskId,
    partition: agent.partition,
    repositoryId: 'fixture-repository',
    framework: 'react',
    arm: agent.arm,
    repetition: agent.repetition,
    status: 'completed',
    execution: {
      assurance: 'github-host-split-stage-attested',
      productionEligible: true,
      agentEvaluatorStageSeparation: true,
      privateOracleAbsentDuringAgentStage: true,
      signedExternalProvenance: true,
    },
    bindings: {
      authorizationSha256: agent.bindings.authorizationSha256,
      runPlanSha256: agent.bindings.runPlanSha256,
      candidateManifestSha256: agent.bindings.candidateManifestSha256,
      candidateTarballSetSha256: agent.bindings.candidateTarballSetSha256,
      taskManifestSha256: agent.bindings.taskManifestSha256,
      evaluatorContractSha256: '1'.repeat(64),
      informationEntitlementSha256: agent.bindings.informationEntitlementSha256,
      environmentSpecSha256: agent.bindings.environmentSpecSha256,
      environmentSubstanceSha256: agent.bindings.environmentSubstanceSha256,
      qualificationControllerSha256: '2'.repeat(64),
      qualificationReceiptFileSha256: '3'.repeat(64),
      qualificationReceiptSha256: '4'.repeat(64),
      qualificationExecutionAttestationFileSha256: '5'.repeat(64),
      qualificationExecutionAttestationSha256: '6'.repeat(64),
      qualificationExecutionControllerSha256: '7'.repeat(64),
      qualificationEvaluatorSourceClosureSha256: '8'.repeat(64),
      qualificationInputRequestFileSha256: '9'.repeat(64),
      qualificationInputRequestSha256: 'a'.repeat(64),
      qualificationInputManifestFileSha256: 'b'.repeat(64),
      qualificationInputManifestSha256: 'c'.repeat(64),
      qualificationRunnerRepositoryCommit: '3'.repeat(40),
      qualificationProvenanceBundleFileSha256: 'd'.repeat(64),
      qualificationProvenanceVerificationSha256: 'e'.repeat(64),
      runtimeMatrixFileSha256: 'f'.repeat(64),
      runtimeMatrixSha256: agent.bindings.runtimeMatrixSha256,
      benchmarkImageDigest: `sha256:${'2'.repeat(64)}`,
      agentImageDigest: agent.image.digest,
      preparedEnvironmentAttestationSha256:
        agent.bindings.preparedEnvironmentAttestationSha256,
      deliverySha256: agent.bindings.deliverySha256,
      environmentSha256: agent.bindings.environmentSha256,
      agentControllerSha256: agent.controllerSha256,
      evaluatorControllerSha256: 'f'.repeat(64),
    },
    model: {
      modelId: agent.model.modelId,
      provider: agent.model.provider,
      requestedModel: agent.model.requestedModel,
      returnedModel: agent.model.requestedModel,
      identityMatched: true,
    },
    workspace: {
      baseCommit: agent.bindings.baseCommit,
      baseTree: agent.bindings.baseTree,
      beforeClean: true,
      dependencyTreeBeforeVerified: true,
      dependencyTreeAfterVerified: true,
      afterTree: agent.bindings.baseTree,
      diffSha256: '1'.repeat(64),
    },
    budget: {
      paid: true,
      reservedUsd: 10,
      actualUsd: 1,
      approvalId: 'approval-fixture',
    },
    usage: {
      inputTokens: 100,
      outputTokens: 20,
      cachedInputTokens: 0,
      requests: 1,
      durationMs: 1,
    },
    trajectoryManifestSha256: '2'.repeat(64),
    evaluatorResultSha256: '3'.repeat(64),
    failure: null,
  });
  await writeCanonicalFile(runCorePath, runCore);
  const runCoreBytes = await readFile(runCorePath);
  const evaluator = createEvaluatorStageAttestation({
    runId: agent.runId,
    taskId: agent.taskId,
    partition: agent.partition,
    arm: agent.arm,
    repetition: agent.repetition,
    status: 'completed',
    productionEligible: true,
    createdAt: '2026-07-24T18:10:00.000Z',
    execution: githubExecution('evaluator'),
    image: {
      reference: `ghcr.io/decantr-ai/evaluator@sha256:${'2'.repeat(64)}`,
      digest: `sha256:${'2'.repeat(64)}`,
      runtimeProfileId: agent.image.runtimeProfileId,
    },
    controllerSha256: runCore.bindings.evaluatorControllerSha256,
    agentStage: {
      attestationFile: fileBinding(agentPath, agentBytes),
      bundleFile: fileBinding(agentBundlePath, agentBundleBytes),
      verificationFile: {
        path: 'agent-verification.json',
        sha256: sha256(agentVerificationBytes),
        bytes: agentVerificationBytes.byteLength,
      },
      verificationSha256: agentVerification.verificationSha256,
    },
    sealedInput: {
      taskManifestSha256: runCore.bindings.taskManifestSha256,
      evaluatorContractSha256: runCore.bindings.evaluatorContractSha256,
      evaluatorSourceClosureSha256:
        runCore.bindings.qualificationEvaluatorSourceClosureSha256,
      oracleSourceSha256: '4'.repeat(64),
    },
    isolation: {
      agentExitedBeforeMount: true,
      network: 'none',
      providerCredentialsAbsent: true,
    },
    reconstruction: {
      baseCommit: runCore.workspace.baseCommit,
      baseTree: runCore.workspace.baseTree,
      workspaceDeltaSha256: agent.output.workspaceDeltaSha256,
      dependencyTreeBeforeVerified: true,
      dependencyTreeAfterVerified: true,
    },
    output: {
      authorizationFile: null,
      budgetApprovalFile: null,
      evaluatorResultFile: null,
      powerPilotFile: null,
      runCoreFile: fileBinding(runCorePath, runCoreBytes),
      trajectoryManifestFile: null,
      workspaceChangeFile: null,
    },
  });
  await writeStageAttestation(evaluatorPath, evaluator);
  return {
    root,
    outputRoot,
    agent,
    agentPath,
    agentBundlePath,
    evaluator,
    evaluatorPath,
    evaluatorBundlePath,
    runCore,
    runCorePath,
  };
}

async function fixtureProvenanceVerifier(input) {
  const [subject, bundle] = await Promise.all([
    readFile(input.subjectPath),
    readFile(input.bundlePath),
  ]);
  const policy = stageProvenancePolicy(input.partition, input.sourceDigest);
  const verification = {
    schemaVersion: SIGSTORE_KEYLESS_SCHEMA_VERSION,
    provider: SIGSTORE_KEYLESS_PROVIDER,
    verified: true,
    subject: { bytes: subject.byteLength, sha256: sha256(subject) },
    bundle: { bytes: bundle.byteLength, sha256: sha256(bundle) },
    policy: {
      certificateIdentity:
        `https://github.com/${policy.repository}/.github/workflows/` +
        `${policy.workflowFile}@${policy.sourceRef}`,
      certificateOidcIssuer: SIGSTORE_OIDC_ISSUER,
      repository: policy.repository,
      workflowFile: policy.workflowFile,
      sourceDigest: policy.sourceDigest,
      sourceRef: policy.sourceRef,
      eventName: policy.eventName,
      transparencyLogRequired: true,
      certificateTransparencyRequired: true,
      githubHostedRunnerRequired: true,
    },
  };
  verification.verificationSha256 = sha256Canonical(verification);
  return verification;
}

function githubExecution(job) {
  return {
    repository: 'decantr-ai/decantr',
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

function fixtureFile(path, fill) {
  return { path, sha256: fill.repeat(64), bytes: 1 };
}
