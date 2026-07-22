#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { executeEvaluator } from '../evaluator/run-evaluator.mjs';
import {
  assertPreparedEnvironment,
  verifyLockfiles,
  verifyPreparedDependencyTree,
} from '../environments/prepared-environment.mjs';
import { prepareWorkspace } from '../environments/prepare-workspace.mjs';
import { assertTaskEnvironmentSpec, taskEnvironmentSubstanceSha256 } from '../environments/contracts.mjs';
import { createVerifiedTaskEnvironment } from '../environments/execution-runtime.mjs';
import { assertRuntimeMatrix } from '../environments/runtime-matrix.mjs';
import {
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from '../runner/canonical.mjs';
import { runFixed, sanitizedEnvironment } from '../runner/process.mjs';
import { checkoutDirectory } from '../lib.mjs';
import {
  assertCandidateCorpusBinding,
  assertCandidateSet,
  assertCorpus,
  loadAuthoredEvaluators,
} from './qualify.mjs';
import {
  assertExecutionAttestation,
  calculateContainerControllerClosure,
} from './container-orchestrator.mjs';
import {
  QUALIFICATION_PREDICATE_TYPE,
  QUALIFICATION_REPOSITORY,
  QUALIFICATION_SIGNER_WORKFLOW,
  verifyQualificationProvenance,
} from './github-provenance.mjs';

const directory = dirname(fileURLToPath(import.meta.url));
const benchmarkRoot = resolve(directory, '..');
const repoRoot = resolve(benchmarkRoot, '..', '..');
const PROGRAM = 'decantr-3.10-ui-change-control-proof';
const SHA256 = /^[a-f0-9]{64}$/u;
const IMAGE_DIGEST = /^sha256:[a-f0-9]{64}$/u;

export async function prepareEvaluatorQualificationTask(inputOptions) {
  const options = normalizeOptions(inputOptions, 'prepare');
  const inputs = await loadTaskInputs(options);
  assertApprovedInputs(inputs);
  const checkout = join(options.corpusRoot, checkoutDirectory(inputs.corpusEntry.repo));
  assertFrozenCheckout(checkout, inputs);
  const candidateSha256 = sha256Canonical(inputs.candidate);
  await Promise.all([
    mkdir(options.contractRoot, { recursive: true, mode: 0o700 }),
    mkdir(options.bundleRoot, { recursive: true, mode: 0o700 }),
  ]);

  const contractPath = join(options.contractRoot, `${inputs.candidate.taskId}.json`);
  await writeCanonicalFile(contractPath, inputs.authored.contract);
  const contractBytes = await readFile(contractPath);
  const bundle = {
    schemaVersion: 'decantr-benchmark-prequalification-task.v2',
    program: PROGRAM,
    taskId: inputs.candidate.taskId,
    partition: inputs.candidate.partition,
    candidateSetSha256: inputs.candidateSetFileSha256,
    candidateSha256,
    corpusSha256: inputs.corpusFileSha256,
    evaluatorSpecSha256: inputs.authored.specSha256,
    oracleSourceSha256: inputs.authored.sourceSha256,
    evaluatorContractSha256: sha256(contractBytes),
    qualificationControllerSha256: inputs.qualificationControllerSha256,
    environmentSpecSha256: inputs.environmentSpecFileSha256,
    environmentSubstanceSha256: taskEnvironmentSubstanceSha256(inputs.environmentSpec),
    runtimeMatrixFileSha256: inputs.runtimeMatrixFileSha256,
    runtimeMatrixSha256: inputs.runtimeMatrix.matrixSha256,
    runtimeProfileId: inputs.profile.id,
    benchmarkImageDigest: inputs.profile.benchmarkImage.digest,
    revisions: {
      base: structuredClone(inputs.candidate.base),
      expected: structuredClone(inputs.candidate.expected),
    },
    sealedAt: options.sealedAt,
  };
  bundle.bundleSha256 = calculatePrequalificationBundleDigest(bundle);
  const bundlePath = join(options.bundleRoot, `${inputs.candidate.taskId}.json`);
  await writeCanonicalFile(bundlePath, bundle);
  return { bundle, bundlePath, contractPath };
}

export async function probePreparedEvaluatorTask(inputOptions) {
  const options = normalizeOptions(inputOptions, 'host-probe');
  const inputs = await loadTaskInputs(options);
  assertApprovedInputs(inputs);
  const candidateSha256 = sha256Canonical(inputs.candidate);
  const bundlePath = join(options.bundleRoot, `${inputs.candidate.taskId}.json`);
  const bundleBytes = await readFile(bundlePath);
  const bundle = JSON.parse(bundleBytes);
  assertPrequalificationBundle(bundle, inputs, candidateSha256);
  const contractPath = join(options.contractRoot, `${inputs.candidate.taskId}.json`);
  const contractBytes = await readFile(contractPath);
  if (sha256(contractBytes) !== bundle.evaluatorContractSha256) {
    throw new Error(`${inputs.candidate.taskId}: compiled evaluator contract drifted after preparation`);
  }
  const currentContractBytes = Buffer.from(prettyCanonicalJson(inputs.authored.contract));
  if (sha256(currentContractBytes) !== bundle.evaluatorContractSha256) {
    throw new Error(`${inputs.candidate.taskId}: current evaluator inputs differ from the prepared contract`);
  }
  const checkout = join(options.corpusRoot, checkoutDirectory(inputs.corpusEntry.repo));
  assertFrozenCheckout(checkout, inputs);
  const taskWorkspaceRoot = join(options.workspaceRoot, inputs.candidate.taskId);
  const taskPreparedRoot = join(options.preparedRoot, inputs.candidate.taskId);
  await Promise.all([
    mkdir(taskWorkspaceRoot, { recursive: true, mode: 0o700 }),
    mkdir(taskPreparedRoot, { recursive: true, mode: 0o700 }),
  ]);
  for (const role of ['base', 'expected']) {
    const revision = inputs.candidate[role];
    const workspace = join(taskWorkspaceRoot, role);
    addWorktree(checkout, workspace, revision.commit, inputs.candidate.taskId, role);
    createVerifiedTaskEnvironment({
      profile: inputs.environmentSpec.profile,
      source: options.executionEnvironment,
      home: join(taskWorkspaceRoot, `.prepare-home-${role}`),
      workspace,
      allowHostRuntime: options.allowHostRuntime,
      benchmarkImageDigest: inputs.profile.benchmarkImage.digest,
      networkMode: 'dependency-registry',
    });
    await prepareWorkspace({
      environmentSpecPath: options.environmentSpecPath,
      runtimeMatrixPath: options.runtimeMatrixPath,
      workspace,
      outputPath: join(taskPreparedRoot, `${role}.json`),
      networkPolicy: 'dependency-registry',
      preparedAt: options.probedPreparationAt,
      environment: options.executionEnvironment,
      allowHostRuntime: options.allowHostRuntime,
      revisionRole: role,
      revision,
      candidateSha256: role === 'expected' ? candidateSha256 : null,
    });
  }
  const taskEnvironment = createVerifiedTaskEnvironment({
    profile: inputs.environmentSpec.profile,
    source: options.executionEnvironment,
    home: join(taskWorkspaceRoot, '.qualification-runtime-home'),
    workspace: join(taskWorkspaceRoot, 'base'),
    allowHostRuntime: options.allowHostRuntime,
    benchmarkImageDigest: inputs.profile.benchmarkImage.digest,
    networkMode: 'none',
  });
  const executions = {};
  const preparedBindings = {};
  for (const role of ['base', 'expected']) {
    const revision = inputs.candidate[role];
    const workspace = join(taskWorkspaceRoot, role);
    verifyWorkspaceRevision(workspace, revision, inputs.candidate.taskId, role, taskEnvironment);
    const attestationPath = join(taskPreparedRoot, `${role}.json`);
    const attestationBytes = await readFile(attestationPath);
    const attestation = assertPreparedEnvironment(JSON.parse(attestationBytes), {
      task: {
        taskId: inputs.candidate.taskId,
        base: inputs.candidate.base,
        environment: {
          specSha256: inputs.environmentSpecFileSha256,
          substanceSha256: taskEnvironmentSubstanceSha256(inputs.environmentSpec),
          runtimeProfileId: inputs.environmentSpec.profile.id,
        },
      },
      revisionRole: role,
      revision,
      candidateSha256: role === 'expected' ? candidateSha256 : null,
      runtimeMatrix: inputs.runtimeMatrix,
      environmentSpec: inputs.environmentSpec,
    });
    assertTemporalOrder(inputs, attestation, options.qualifiedAt, options.allowHostRuntime);
    verifyLockfiles(workspace, attestation.lockfiles);
    await verifyPreparedDependencyTree(workspace, attestation);
    const result = await executeEvaluator({
      contractPath,
      expectedContractSha256: bundle.evaluatorContractSha256,
      workspace,
      evaluatorRoot: options.evaluatorRoot,
      evaluatorRuntimeRoot: options.evaluatorRuntimeRoot,
      evaluatorBrowsersPath: options.evaluatorBrowsersPath,
      home: join(taskWorkspaceRoot, `.qualification-home-${role}`),
      projectPath: inputs.candidate.repository.projectPath,
      taskPath: taskEnvironment.PATH,
      runId: `qualification-${inputs.candidate.taskId}-${role}`,
      taskId: inputs.candidate.taskId,
      contractId: inputs.authored.spec.contractId,
    });
    verifyWorkspaceRevision(workspace, revision, inputs.candidate.taskId, role, taskEnvironment);
    verifyLockfiles(workspace, attestation.lockfiles);
    await verifyPreparedDependencyTree(workspace, attestation);
    executions[role] = result;
    preparedBindings[role] = {
      attestationFileSha256: sha256(attestationBytes),
      attestationSha256: attestation.attestationSha256,
      environmentSha256: attestation.environmentSha256,
    };
  }
  assertStrictQualificationPolarity(
    inputs.authored.contract,
    inputs.authored.requiredOracleIds,
    executions.base,
    executions.expected,
    inputs.candidate.taskId,
  );

  await mkdir(options.resultRoot, { recursive: true, mode: 0o700 });
  const resultBindings = {};
  for (const role of ['base', 'expected']) {
    const resultPath = join(options.resultRoot, `${inputs.candidate.taskId}.${role}.json`);
    await writeCanonicalFile(resultPath, executions[role]);
    resultBindings[role] = {
      canonicalSha256: sha256Canonical(executions[role]),
      fileSha256: sha256(await readFile(resultPath)),
    };
  }

  const probe = {
    schemaVersion: 'decantr-benchmark-evaluator-host-probe.v1',
    program: PROGRAM,
    taskId: inputs.candidate.taskId,
    partition: inputs.candidate.partition,
    materializable: false,
    executionAssurance: 'test-only-host',
    probedAt: options.qualifiedAt,
    candidateSetSha256: inputs.candidateSetFileSha256,
    candidateSha256,
    corpusSha256: inputs.corpusFileSha256,
    prequalificationBundleFileSha256: sha256(bundleBytes),
    prequalificationBundleSha256: bundle.bundleSha256,
    evaluatorSpecSha256: inputs.authored.specSha256,
    oracleSourceSha256: inputs.authored.sourceSha256,
    evaluatorContractSha256: bundle.evaluatorContractSha256,
    qualificationControllerSha256: inputs.qualificationControllerSha256,
    environmentSpecSha256: inputs.environmentSpecFileSha256,
    environmentSubstanceSha256: taskEnvironmentSubstanceSha256(inputs.environmentSpec),
    runtimeMatrixFileSha256: inputs.runtimeMatrixFileSha256,
    runtimeMatrixSha256: inputs.runtimeMatrix.matrixSha256,
    runtimeProfileId: inputs.profile.id,
    benchmarkImageDigest: inputs.profile.benchmarkImage.digest,
    networkMode: 'none',
    prepared: preparedBindings,
    baseResultSha256: resultBindings.base.canonicalSha256,
    baseResultFileSha256: resultBindings.base.fileSha256,
    expectedResultSha256: resultBindings.expected.canonicalSha256,
    expectedResultFileSha256: resultBindings.expected.fileSha256,
  };
  probe.probeSha256 = calculateHostProbeDigest(probe);
  await mkdir(options.receiptRoot, { recursive: true, mode: 0o700 });
  const probePath = join(options.receiptRoot, `${inputs.candidate.taskId}.host-probe.json`);
  await writeCanonicalFile(probePath, probe);
  return { probe, probePath };
}

// Kept as a source-compatible alias for authoring automation. It never emits a
// materializable qualification receipt.
export const qualifyPreparedEvaluatorTask = probePreparedEvaluatorTask;

export async function finalizeContainerQualificationTask(inputOptions) {
  const options = normalizeOptions(inputOptions, 'finalize-container');
  const inputs = await loadTaskInputs(options);
  assertApprovedInputs(inputs);
  const candidateSha256 = sha256Canonical(inputs.candidate);
  const bundlePath = join(options.bundleRoot, `${inputs.candidate.taskId}.json`);
  const bundleBytes = await readFile(bundlePath);
  const bundle = JSON.parse(bundleBytes);
  assertPrequalificationBundle(bundle, inputs, candidateSha256);

  const contractPath = join(options.contractRoot, `${inputs.candidate.taskId}.json`);
  const contractBytes = await readFile(contractPath);
  if (
    sha256(contractBytes) !== bundle.evaluatorContractSha256 ||
    sha256(Buffer.from(prettyCanonicalJson(inputs.authored.contract))) !== bundle.evaluatorContractSha256
  ) {
    throw new Error(`${inputs.candidate.taskId}: finalized evaluator contract differs from the sealed bundle`);
  }

  const attestationBytes = await readFile(options.executionAttestationPath);
  const attestation = assertExecutionAttestation(JSON.parse(attestationBytes));
  const qualificationInput = await verifyRetainedQualificationInput(
    options.executionArtifactRoot,
    attestation,
  );
  const containerController = await calculateContainerControllerClosure();
  const sourceClosure = attestation.bindings.evaluator.sourceClosure;
  const expectedSourcePath = inputs.authored.spec.oracle.sourcePath;
  const expectedRunnerCommit = options.expectedRunnerCommit ?? git(
    repoRoot,
    ['rev-parse', 'HEAD'],
    sanitizedEnvironment(join(repoRoot, '.benchmark-finalize-git-home')),
  );
  const expectedWorkflowRef = `${QUALIFICATION_SIGNER_WORKFLOW}@${attestation.executionIdentity.ref}`;
  if (
    attestation.taskId !== inputs.candidate.taskId ||
    attestation.partition !== inputs.candidate.partition ||
    attestation.bindings.candidate.canonicalSha256 !== candidateSha256 ||
    attestation.bindings.prequalificationBundle.fileSha256 !== sha256(bundleBytes) ||
    attestation.bindings.prequalificationBundle.bundleSha256 !== bundle.bundleSha256 ||
    attestation.bindings.evaluator.contractFileSha256 !== bundle.evaluatorContractSha256 ||
    attestation.bindings.evaluator.oracleSourceSha256 !== inputs.authored.sourceSha256 ||
    sourceClosure.length !== 1 ||
    sourceClosure[0].path !== expectedSourcePath ||
    sourceClosure[0].sha256 !== inputs.authored.sourceSha256 ||
    sourceClosure[0].kind !== 'file' ||
    attestation.bindings.controller.closureSha256 !== containerController.closureSha256 ||
    sha256Canonical(attestation.bindings.controller.entries) !== sha256Canonical(containerController.entries) ||
    attestation.bindings.sourceSnapshots.base.revision.commit !== inputs.candidate.base.commit ||
    attestation.bindings.sourceSnapshots.base.revision.tree !== inputs.candidate.base.tree ||
    attestation.bindings.sourceSnapshots.expected.revision.commit !== inputs.candidate.expected.commit ||
    attestation.bindings.sourceSnapshots.expected.revision.tree !== inputs.candidate.expected.tree ||
    attestation.bindings.environment.specFileSha256 !== inputs.environmentSpecFileSha256 ||
    attestation.bindings.environment.substanceSha256 !== taskEnvironmentSubstanceSha256(inputs.environmentSpec) ||
    attestation.bindings.runtimeMatrix.fileSha256 !== inputs.runtimeMatrixFileSha256 ||
    attestation.bindings.runtimeMatrix.matrixSha256 !== inputs.runtimeMatrix.matrixSha256 ||
    attestation.bindings.runtimeProfile.id !== inputs.profile.id ||
    attestation.bindings.runtimeProfile.profileSha256 !== inputs.profile.profileSha256 ||
    attestation.bindings.benchmarkImage.reference !== inputs.profile.benchmarkImage.reference ||
    attestation.bindings.benchmarkImage.digest !== inputs.profile.benchmarkImage.digest ||
    attestation.runnerRepositoryCommit !== expectedRunnerCommit ||
    attestation.executionIdentity.provider !== 'github-actions' ||
    attestation.executionIdentity.repository !== QUALIFICATION_REPOSITORY ||
    attestation.executionIdentity.workflowRef !== expectedWorkflowRef
  ) {
    throw new Error(`${inputs.candidate.taskId}: container execution attestation is stale or not authoritative`);
  }
  assertContainerQualificationTemporalOrder(inputs, attestation, bundle.sealedAt);

  const provenanceVerifier = options.provenanceVerifier ?? verifyQualificationProvenance;
  const provenance = await provenanceVerifier({
    attestationPath: options.executionAttestationPath,
    bundlePath: options.provenanceBundlePath,
    repository: QUALIFICATION_REPOSITORY,
    signerWorkflow: QUALIFICATION_SIGNER_WORKFLOW,
    sourceDigest: expectedRunnerCommit,
    sourceRef: attestation.executionIdentity.ref,
    predicateType: QUALIFICATION_PREDICATE_TYPE,
  });
  const provenanceBytes = await readFile(options.provenanceBundlePath);
  assertFinalizedProvenance(provenance, attestation, attestationBytes, provenanceBytes);

  await Promise.all([
    mkdir(options.resultRoot, { recursive: true, mode: 0o700 }),
    mkdir(join(options.receiptRoot, 'attestations'), { recursive: true, mode: 0o700 }),
    mkdir(join(options.receiptRoot, 'provenance'), { recursive: true, mode: 0o700 }),
    mkdir(join(options.receiptRoot, 'prequalification'), { recursive: true, mode: 0o700 }),
    mkdir(join(options.receiptRoot, 'qualification-input'), { recursive: true, mode: 0o700 }),
  ]);
  const executions = {};
  const resultBindings = {};
  for (const role of ['base', 'expected']) {
    const evidence = attestation.evaluation.roles[role].result;
    const sourcePath = containedArtifactPath(
      options.executionArtifactRoot,
      evidence.logicalPath,
      `${inputs.candidate.taskId}: ${role} execution result`,
    );
    const resultBytes = await readFile(sourcePath);
    const result = JSON.parse(resultBytes);
    if (
      sha256(resultBytes) !== evidence.fileSha256 ||
      sha256Canonical(result) !== evidence.canonicalSha256 ||
      result.status !== evidence.status
    ) {
      throw new Error(`${inputs.candidate.taskId}: ${role} result differs from the signed execution attestation`);
    }
    assertQualificationResultArtifact(result, inputs.authored.contract, {
      taskId: inputs.candidate.taskId,
      role,
      runId: `qualification-${attestation.executionId}-${role}`,
      contractSha256: bundle.evaluatorContractSha256,
    });
    const destination = join(options.resultRoot, `${inputs.candidate.taskId}.${role}.json`);
    await writeFile(destination, resultBytes, { mode: 0o600 });
    const persistedBytes = await readFile(destination);
    if (sha256(persistedBytes) !== evidence.fileSha256) {
      throw new Error(`${inputs.candidate.taskId}: ${role} retained result changed while finalizing`);
    }
    executions[role] = result;
    resultBindings[role] = {
      canonicalSha256: evidence.canonicalSha256,
      fileSha256: evidence.fileSha256,
    };
  }
  assertStrictQualificationPolarity(
    inputs.authored.contract,
    inputs.authored.requiredOracleIds,
    executions.base,
    executions.expected,
    inputs.candidate.taskId,
  );

  const retainedAttestationPath = join(options.receiptRoot, 'attestations', `${inputs.candidate.taskId}.json`);
  const retainedProvenancePath = join(options.receiptRoot, 'provenance', `${inputs.candidate.taskId}.jsonl`);
  const retainedPrequalificationPath = join(
    options.receiptRoot,
    'prequalification',
    `${inputs.candidate.taskId}.json`,
  );
  const retainedInputRequestPath = join(
    options.receiptRoot,
    'qualification-input',
    `${inputs.candidate.taskId}.request.json`,
  );
  const retainedInputManifestPath = join(
    options.receiptRoot,
    'qualification-input',
    `${inputs.candidate.taskId}.manifest.json`,
  );
  await Promise.all([
    writeFile(retainedAttestationPath, attestationBytes, { mode: 0o600 }),
    writeFile(retainedProvenancePath, provenanceBytes, { mode: 0o600 }),
    writeFile(retainedPrequalificationPath, bundleBytes, { mode: 0o600 }),
    writeFile(retainedInputRequestPath, qualificationInput.requestBytes, { mode: 0o600 }),
    writeFile(retainedInputManifestPath, qualificationInput.manifestBytes, { mode: 0o600 }),
  ]);

  const receipt = {
    schemaVersion: 'decantr-benchmark-evaluator-qualification-task-receipt.v2',
    program: PROGRAM,
    taskId: inputs.candidate.taskId,
    partition: inputs.candidate.partition,
    qualified: true,
    qualifiedAt: attestation.endedAt,
    executionAssurance: 'github-host-container-attested',
    candidateSetSha256: inputs.candidateSetFileSha256,
    candidateSha256,
    corpusSha256: inputs.corpusFileSha256,
    prequalificationBundleFileSha256: sha256(bundleBytes),
    prequalificationBundleSha256: bundle.bundleSha256,
    evaluatorSpecSha256: inputs.authored.specSha256,
    oracleSourceSha256: inputs.authored.sourceSha256,
    evaluatorContractSha256: bundle.evaluatorContractSha256,
    qualificationControllerSha256: inputs.qualificationControllerSha256,
    environmentSpecSha256: inputs.environmentSpecFileSha256,
    environmentSubstanceSha256: taskEnvironmentSubstanceSha256(inputs.environmentSpec),
    runtimeMatrixFileSha256: inputs.runtimeMatrixFileSha256,
    runtimeMatrixSha256: inputs.runtimeMatrix.matrixSha256,
    runtimeProfileId: inputs.profile.id,
    benchmarkImageDigest: inputs.profile.benchmarkImage.digest,
    networkMode: 'none',
    execution: {
      attestationFileSha256: sha256(attestationBytes),
      attestationSha256: attestation.attestationSha256,
      controllerSha256: attestation.bindings.controller.closureSha256,
      evaluatorSourceClosureSha256: attestation.bindings.evaluator.sourceClosureSha256,
      inputRequestFileSha256: attestation.bindings.qualificationInput.requestFileSha256,
      inputRequestSha256: attestation.bindings.qualificationInput.requestSha256,
      inputManifestFileSha256: attestation.bindings.qualificationInput.manifestFileSha256,
      inputManifestSha256: attestation.bindings.qualificationInput.manifestSha256,
      runnerRepositoryCommit: attestation.runnerRepositoryCommit,
      provenanceBundleFileSha256: sha256(provenanceBytes),
      provenanceVerificationSha256: provenance.verificationSha256,
      repository: QUALIFICATION_REPOSITORY,
      signerWorkflow: QUALIFICATION_SIGNER_WORKFLOW,
      sourceRef: attestation.executionIdentity.ref,
      predicateType: QUALIFICATION_PREDICATE_TYPE,
      denySelfHostedRunners: true,
    },
    baseResultSha256: resultBindings.base.canonicalSha256,
    baseResultFileSha256: resultBindings.base.fileSha256,
    expectedResultSha256: resultBindings.expected.canonicalSha256,
    expectedResultFileSha256: resultBindings.expected.fileSha256,
  };
  receipt.receiptSha256 = calculateQualificationReceiptDigest(receipt);
  const receiptPath = join(options.receiptRoot, `${inputs.candidate.taskId}.json`);
  await writeCanonicalFile(receiptPath, receipt);
  return {
    receipt,
    receiptPath,
    retainedAttestationPath,
    retainedProvenancePath,
    retainedPrequalificationPath,
    retainedInputRequestPath,
    retainedInputManifestPath,
  };
}

async function verifyRetainedQualificationInput(executionArtifactRoot, attestation) {
  const requestPath = containedArtifactPath(
    executionArtifactRoot,
    'qualification-input/request.json',
    `${attestation.taskId}: qualification input request`,
  );
  const manifestPath = containedArtifactPath(
    executionArtifactRoot,
    'qualification-input/manifest.json',
    `${attestation.taskId}: qualification input manifest`,
  );
  const [requestBytes, manifestBytes] = await Promise.all([
    readFile(requestPath),
    readFile(manifestPath),
  ]);
  const request = JSON.parse(requestBytes);
  const manifest = JSON.parse(manifestBytes);
  const { requestSha256: _requestDigest, ...requestBody } = request;
  const { manifestSha256: _manifestDigest, ...manifestBody } = manifest;
  const binding = attestation.bindings.qualificationInput;
  if (
    !requestBytes.equals(Buffer.from(prettyCanonicalJson(request))) ||
    !manifestBytes.equals(Buffer.from(prettyCanonicalJson(manifest))) ||
    request.taskId !== attestation.taskId ||
    request.partition !== attestation.partition ||
    request.requestSha256 !== sha256Canonical(requestBody) ||
    manifest.taskId !== attestation.taskId ||
    manifest.partition !== attestation.partition ||
    manifest.manifestSha256 !== sha256Canonical(manifestBody) ||
    request.bindings?.inputManifest?.fileSha256 !== binding.manifestFileSha256 ||
    request.bindings?.inputManifest?.manifestSha256 !== binding.manifestSha256 ||
    sha256(requestBytes) !== binding.requestFileSha256 ||
    request.requestSha256 !== binding.requestSha256 ||
    sha256(manifestBytes) !== binding.manifestFileSha256 ||
    manifest.manifestSha256 !== binding.manifestSha256
  ) {
    throw new Error(`${attestation.taskId}: retained qualification input differs from the signed attestation`);
  }
  return { requestBytes, manifestBytes };
}

export function calculatePrequalificationBundleDigest(bundle) {
  const { bundleSha256: _ignored, ...body } = bundle;
  return sha256Canonical(body);
}

export function calculateQualificationReceiptDigest(receipt) {
  const { receiptSha256: _ignored, ...body } = receipt;
  return sha256Canonical(body);
}

export function calculateHostProbeDigest(probe) {
  const { probeSha256: _ignored, ...body } = probe;
  return sha256Canonical(body);
}

export async function calculateQualificationControllerDigest() {
  const paths = await collectQualificationControllerPaths(benchmarkRoot);
  paths.push(
    resolve(repoRoot, '.github', 'workflows', 'benchmark-3-10-evaluator-qualification.yml'),
    resolve(repoRoot, '.github', 'workflows', 'benchmark-3-10-qualification-input.yml'),
    resolve(repoRoot, '.github', 'workflows', 'benchmark-3-10-runtime-profiles.yml'),
  );
  const entries = await Promise.all(
    paths.map(async (path) => ({
      path: relative(repoRoot, path).replaceAll('\\', '/'),
      sha256: sha256(await readFile(path)),
    })),
  );
  return sha256Canonical(entries.sort((left, right) => left.path.localeCompare(right.path)));
}

async function collectQualificationControllerPaths(root) {
  const output = [];
  const visit = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name === 'node_modules') continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(path);
      } else if (
        entry.isFile() &&
        !entry.name.endsWith('.test.mjs') &&
        (entry.name.endsWith('.mjs') ||
          (directory === join(root, 'schemas') && entry.name.endsWith('.json')))
      ) {
        output.push(path);
      }
    }
  };
  await visit(root);
  return output.sort();
}

export function assertQualificationReceipt(receipt, expected = {}) {
  assertExactKeys(
    receipt,
    [
      'schemaVersion',
      'program',
      'taskId',
      'partition',
      'qualified',
      'qualifiedAt',
      'executionAssurance',
      'candidateSetSha256',
      'candidateSha256',
      'corpusSha256',
      'prequalificationBundleFileSha256',
      'prequalificationBundleSha256',
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
      'networkMode',
      'execution',
      'baseResultSha256',
      'baseResultFileSha256',
      'expectedResultSha256',
      'expectedResultFileSha256',
      'receiptSha256',
    ],
    'qualification receipt',
  );
  if (
    receipt.schemaVersion !== 'decantr-benchmark-evaluator-qualification-task-receipt.v2' ||
    receipt.program !== PROGRAM ||
    receipt.qualified !== true ||
    receipt.executionAssurance !== 'github-host-container-attested' ||
    receipt.networkMode !== 'none' ||
    !['development', 'qualification'].includes(receipt.partition) ||
    typeof receipt.taskId !== 'string' ||
    receipt.taskId.length < 3 ||
    !Number.isFinite(Date.parse(receipt.qualifiedAt)) ||
    !IMAGE_DIGEST.test(receipt.benchmarkImageDigest) ||
    typeof receipt.runtimeProfileId !== 'string' ||
    receipt.runtimeProfileId.length < 3
  ) {
    throw new Error('qualification receipt identity or execution policy is invalid');
  }
  for (const key of [
    'candidateSetSha256',
    'candidateSha256',
    'corpusSha256',
    'prequalificationBundleFileSha256',
    'prequalificationBundleSha256',
    'evaluatorSpecSha256',
    'oracleSourceSha256',
    'evaluatorContractSha256',
    'qualificationControllerSha256',
    'environmentSpecSha256',
    'environmentSubstanceSha256',
    'runtimeMatrixFileSha256',
    'runtimeMatrixSha256',
    'baseResultSha256',
    'baseResultFileSha256',
    'expectedResultSha256',
    'expectedResultFileSha256',
    'receiptSha256',
  ]) {
    if (!SHA256.test(receipt[key])) throw new Error(`qualification receipt ${key} is invalid`);
  }
  assertExactKeys(
    receipt.execution,
    [
      'attestationFileSha256',
      'attestationSha256',
      'controllerSha256',
      'evaluatorSourceClosureSha256',
      'inputRequestFileSha256',
      'inputRequestSha256',
      'inputManifestFileSha256',
      'inputManifestSha256',
      'runnerRepositoryCommit',
      'provenanceBundleFileSha256',
      'provenanceVerificationSha256',
      'repository',
      'signerWorkflow',
      'sourceRef',
      'predicateType',
      'denySelfHostedRunners',
    ],
    'qualification execution binding',
  );
  for (const key of [
    'attestationFileSha256',
    'attestationSha256',
    'controllerSha256',
    'evaluatorSourceClosureSha256',
    'inputRequestFileSha256',
    'inputRequestSha256',
    'inputManifestFileSha256',
    'inputManifestSha256',
    'provenanceBundleFileSha256',
    'provenanceVerificationSha256',
  ]) {
    if (!SHA256.test(receipt.execution[key])) {
      throw new Error(`qualification execution ${key} is invalid`);
    }
  }
  if (
    !/^[a-f0-9]{40}$/u.test(receipt.execution.runnerRepositoryCommit ?? '') ||
    receipt.execution.repository !== QUALIFICATION_REPOSITORY ||
    receipt.execution.signerWorkflow !== QUALIFICATION_SIGNER_WORKFLOW ||
    typeof receipt.execution.sourceRef !== 'string' ||
    receipt.execution.sourceRef.length === 0 ||
    receipt.execution.predicateType !== QUALIFICATION_PREDICATE_TYPE ||
    receipt.execution.denySelfHostedRunners !== true
  ) {
    throw new Error('qualification execution provenance policy is invalid');
  }
  if (receipt.receiptSha256 !== calculateQualificationReceiptDigest(receipt)) {
    throw new Error('qualification receipt self digest is invalid');
  }
  for (const [key, value] of Object.entries(expected)) {
    if (key === 'qualifiedOnOrBefore') {
      const boundary = Date.parse(value);
      if (!Number.isFinite(boundary) || Date.parse(receipt.qualifiedAt) > boundary) {
        throw new Error('qualification receipt postdates the materialization seal');
      }
    } else if (receipt[key] !== value) {
      throw new Error(`qualification receipt ${key} differs from the materialization input`);
    }
  }
  return receipt;
}

async function loadTaskInputs(options) {
  const [candidateSetFile, corpusFile, authoringSchemaFile, contractSchemaFile, environmentSpecFile, runtimeMatrixFile] =
    await Promise.all([
      readJson(options.candidatesPath),
      readJson(options.corpusPath),
      readJson(join(benchmarkRoot, 'schemas', 'evaluator-authoring-spec.schema.json')),
      readJson(join(benchmarkRoot, 'schemas', 'evaluator-contract.schema.json')),
      readJson(options.environmentSpecPath),
      readJson(options.runtimeMatrixPath),
    ]);
  const candidates = assertCandidateSet(candidateSetFile.value, options.partition);
  const candidate = candidates.find((item) => item.taskId === options.taskId);
  if (!candidate) throw new Error(`task is absent from the ${options.partition} candidate set: ${options.taskId}`);
  const corpusById = assertCorpus(corpusFile.value);
  assertCandidateCorpusBinding(candidate, corpusById);
  const authored = await loadAuthoredEvaluators({
    candidates,
    evaluatorRoot: options.evaluatorRoot,
    schema: authoringSchemaFile.value,
    schemas: {
      'evaluator-authoring-spec.schema.json': authoringSchemaFile.value,
      'evaluator-contract.schema.json': contractSchemaFile.value,
    },
  });
  const authoredTask = authored.find((item) => item.candidate.taskId === candidate.taskId);
  const environmentSpec = assertTaskEnvironmentSpec(environmentSpecFile.value, candidate, {
    reviewStatus: 'approved',
  });
  const runtimeMatrix = assertRuntimeMatrix(runtimeMatrixFile.value, { requireLocked: true });
  const profile = runtimeMatrix.profiles.find((item) => item.id === environmentSpec.profile.id);
  if (!profile) throw new Error(`${candidate.taskId}: reviewed runtime profile is absent from the locked matrix`);
  return {
    candidate,
    candidateSetFileSha256: sha256(candidateSetFile.bytes),
    corpusEntry: corpusById.get(candidate.repository.id),
    corpusFileSha256: sha256(corpusFile.bytes),
    authored: authoredTask,
    environmentSpec,
    environmentSpecFileSha256: sha256(environmentSpecFile.bytes),
    runtimeMatrix,
    runtimeMatrixFileSha256: sha256(runtimeMatrixFile.bytes),
    profile,
    qualificationControllerSha256: await calculateQualificationControllerDigest(),
  };
}

function assertApprovedInputs(inputs) {
  const review = inputs.authored.spec.review;
  if (
    review.status !== 'approved' ||
    typeof review.reviewedBy !== 'string' ||
    review.reviewedBy.trim() === '' ||
    !Number.isFinite(Date.parse(review.reviewedAt ?? ''))
  ) {
    throw new Error(`${inputs.candidate.taskId}: evaluator requires independent approval before qualification`);
  }
}

function assertPrequalificationBundle(bundle, inputs, candidateSha256) {
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
    'prequalification bundle',
  );
  assertExactKeys(bundle.revisions, ['base', 'expected'], 'prequalification revision bindings');
  for (const role of ['base', 'expected']) {
    assertExactKeys(
      bundle.revisions[role],
      ['commit', 'tree'],
      `prequalification ${role} revision`,
    );
    if (
      bundle.revisions[role].commit !== inputs.candidate[role].commit ||
      bundle.revisions[role].tree !== inputs.candidate[role].tree
    ) {
      throw new Error(`${inputs.candidate.taskId}: prequalification ${role} revision is stale`);
    }
  }
  if (
    bundle?.schemaVersion !== 'decantr-benchmark-prequalification-task.v2' ||
    bundle.program !== PROGRAM ||
    bundle.taskId !== inputs.candidate.taskId ||
    bundle.partition !== inputs.candidate.partition ||
    bundle.candidateSetSha256 !== inputs.candidateSetFileSha256 ||
    bundle.candidateSha256 !== candidateSha256 ||
    bundle.corpusSha256 !== inputs.corpusFileSha256 ||
    bundle.evaluatorSpecSha256 !== inputs.authored.specSha256 ||
    bundle.oracleSourceSha256 !== inputs.authored.sourceSha256 ||
    bundle.qualificationControllerSha256 !== inputs.qualificationControllerSha256 ||
    bundle.environmentSpecSha256 !== inputs.environmentSpecFileSha256 ||
    bundle.environmentSubstanceSha256 !== taskEnvironmentSubstanceSha256(inputs.environmentSpec) ||
    bundle.runtimeMatrixFileSha256 !== inputs.runtimeMatrixFileSha256 ||
    bundle.runtimeMatrixSha256 !== inputs.runtimeMatrix.matrixSha256 ||
    bundle.runtimeProfileId !== inputs.profile.id ||
    bundle.benchmarkImageDigest !== inputs.profile.benchmarkImage.digest ||
    !Number.isFinite(Date.parse(bundle.sealedAt ?? '')) ||
    bundle.bundleSha256 !== calculatePrequalificationBundleDigest(bundle)
  ) {
    throw new Error(`${inputs.candidate.taskId}: prequalification bundle is invalid or stale`);
  }
}

function assertExactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.join('\n') !== wanted.join('\n')) {
    throw new Error(`${label} keys must be exactly ${wanted.join(', ')}`);
  }
}

export function assertStrictQualificationPolarity(contract, requiredOracleIds, base, expected, taskId) {
  const byId = new Map(contract.commands.map((command) => [command.id, command]));
  const baseOracleFailed = base.commands.some(
    (result) => requiredOracleIds.has(result.id) && result.status === 'failed',
  );
  const invalidBase = base.commands.filter((result) => {
    const command = byId.get(result.id);
    if (!command?.required || requiredOracleIds.has(result.id)) return false;
    return result.status !== 'passed';
  });
  const passingBaseOracles = base.commands.filter(
    (result) => requiredOracleIds.has(result.id) && result.status !== 'failed',
  );
  if (
    base.status !== 'failed' ||
    !baseOracleFailed ||
    invalidBase.length > 0 ||
    passingBaseOracles.length > 0
  ) {
    throw new Error(`${taskId}: base must fail every bound oracle while all other required commands pass`);
  }
  if (expected.status !== 'passed' || expected.commands.some((result) => byId.get(result.id)?.required && result.status !== 'passed')) {
    throw new Error(`${taskId}: every required command must pass at the expected revision`);
  }
}

export function assertQualificationResultArtifact(result, contract, expected) {
  assertExactKeys(
    result,
    ['commands', 'contractSha256', 'failures', 'metrics', 'runId', 'schemaVersion', 'status', 'taskId'],
    `${expected.taskId}: ${expected.role} qualification result`,
  );
  if (
    result.schemaVersion !== 'decantr-benchmark-evaluator-result.v1' ||
    result.taskId !== expected.taskId ||
    result.contractSha256 !== expected.contractSha256 ||
    result.runId !== expected.runId ||
    !['passed', 'failed', 'build_failure', 'evaluator_failure'].includes(result.status) ||
    !Array.isArray(result.commands) ||
    !Array.isArray(result.failures) ||
    !result.metrics ||
    typeof result.metrics !== 'object'
  ) {
    throw new Error(`${expected.taskId}: ${expected.role} qualification result identity is invalid`);
  }
  const contractById = new Map(contract.commands.map((command) => [command.id, command]));
  const resultIds = new Set();
  for (const command of result.commands) {
    assertExactKeys(
      command,
      ['id', 'kind', 'status', 'exitCode', 'durationMs', 'stdoutSha256', 'stderrSha256'],
      `${expected.taskId}: ${expected.role} qualification command result`,
    );
    if (
      resultIds.has(command.id) ||
      !contractById.has(command.id) ||
      command.kind !== contractById.get(command.id).kind ||
      !['passed', 'failed', 'malformed', 'unavailable'].includes(command.status) ||
      !Number.isFinite(command.durationMs) ||
      !SHA256.test(command.stdoutSha256 ?? '') ||
      !SHA256.test(command.stderrSha256 ?? '')
    ) {
      throw new Error(`${expected.taskId}: ${expected.role} qualification command set is invalid`);
    }
    resultIds.add(command.id);
  }
  if (resultIds.size !== contractById.size) {
    throw new Error(`${expected.taskId}: ${expected.role} qualification result omits fixed commands`);
  }
  return result;
}

function assertContainerQualificationTemporalOrder(inputs, attestation, sealedAt) {
  const earliestExecution = Math.min(
    ...[
      inputs.authored.spec.review.reviewedAt,
      inputs.environmentSpec.review.reviewedAt,
      inputs.runtimeMatrix.frozenAt,
      sealedAt,
    ].map((value) => Date.parse(value)),
  );
  const latestInput = Math.max(
    ...[
      inputs.authored.spec.review.reviewedAt,
      inputs.environmentSpec.review.reviewedAt,
      inputs.runtimeMatrix.frozenAt,
      sealedAt,
    ].map((value) => Date.parse(value)),
  );
  const startedAt = Date.parse(attestation.startedAt);
  const endedAt = Date.parse(attestation.endedAt);
  if (
    !Number.isFinite(earliestExecution) ||
    !Number.isFinite(latestInput) ||
    latestInput > startedAt ||
    startedAt > endedAt
  ) {
    throw new Error(`${inputs.candidate.taskId}: reviews, runtime lock, and container execution order is invalid`);
  }
}

function assertFinalizedProvenance(provenance, attestation, attestationBytes, provenanceBytes) {
  if (
    provenance?.policy?.repository !== QUALIFICATION_REPOSITORY ||
    provenance.policy.signerWorkflow !== QUALIFICATION_SIGNER_WORKFLOW ||
    provenance.policy.sourceDigest !== attestation.runnerRepositoryCommit ||
    provenance.policy.sourceRef !== attestation.executionIdentity.ref ||
    provenance.policy.predicateType !== QUALIFICATION_PREDICATE_TYPE ||
    provenance.policy.denySelfHostedRunners !== true ||
    provenance.attestationFileSha256 !== sha256(attestationBytes) ||
    provenance.bundleFileSha256 !== sha256(provenanceBytes) ||
    !SHA256.test(provenance.verificationSha256 ?? '')
  ) {
    throw new Error('GitHub qualification provenance does not satisfy the frozen verification policy');
  }
}

function containedArtifactPath(root, logicalPath, label) {
  if (typeof logicalPath !== 'string' || logicalPath.length === 0 || isAbsolute(logicalPath)) {
    throw new Error(`${label} path is invalid`);
  }
  const candidate = resolve(root, logicalPath);
  const relation = relative(resolve(root), candidate);
  if (relation.startsWith('..') || isAbsolute(relation)) throw new Error(`${label} escapes the artifact root`);
  return candidate;
}

function assertTemporalOrder(inputs, attestation, qualifiedAt, allowHostRuntime) {
  const times = [
    Date.parse(inputs.authored.spec.review.reviewedAt),
    Date.parse(inputs.environmentSpec.review.reviewedAt),
    Date.parse(inputs.runtimeMatrix.frozenAt),
  ];
  const preparedAt = Date.parse(attestation.preparedAt);
  const qualificationTime = Date.parse(qualifiedAt);
  if (times.some((time) => !Number.isFinite(time) || time > preparedAt) || preparedAt > qualificationTime) {
    throw new Error(`${inputs.candidate.taskId}: review, runtime lock, preparation, and qualification order is invalid`);
  }
  if (!allowHostRuntime) {
    const now = Date.now();
    if (
      qualificationTime > now + 5 * 60_000 ||
      qualificationTime < now - 15 * 60_000 ||
      preparedAt < qualificationTime - 24 * 60 * 60_000
    ) {
      throw new Error(`${inputs.candidate.taskId}: production qualification timestamps are stale or outside clock skew`);
    }
  }
}

function assertFrozenCheckout(checkout, inputs) {
  const environment = sanitizedEnvironment(join(checkout, '.qualification-git-home'));
  const head = git(checkout, ['rev-parse', 'HEAD'], environment);
  const tree = git(checkout, ['rev-parse', 'HEAD^{tree}'], environment);
  const status = git(checkout, ['status', '--porcelain=v1', '--untracked-files=no'], environment);
  if (
    head !== inputs.corpusEntry.commit ||
    head !== inputs.candidate.repository.corpusPin ||
    tree !== inputs.candidate.repository.corpusTree ||
    status !== ''
  ) {
    throw new Error(`${inputs.candidate.taskId}: corpus checkout is not the frozen clean commit/tree`);
  }
  for (const role of ['base', 'expected']) {
    const revision = inputs.candidate[role];
    if (
      git(checkout, ['rev-parse', `${revision.commit}^{commit}`], environment) !== revision.commit ||
      git(checkout, ['rev-parse', `${revision.commit}^{tree}`], environment) !== revision.tree
    ) {
      throw new Error(`${inputs.candidate.taskId}: ${role} Git object differs from the frozen candidate`);
    }
  }
}

function addWorktree(checkout, workspace, commit, taskId, role) {
  const result = runFixed('git', ['-c', 'core.hooksPath=/dev/null', '-C', checkout, 'worktree', 'add', '--detach', workspace, commit], {
    env: sanitizedEnvironment(join(checkout, '.qualification-git-home')),
    timeoutMs: 120_000,
  });
  if (result.exitCode !== 0) {
    throw new Error(`${taskId}: unable to create ${role} qualification worktree: ${result.stderr.trim()}`);
  }
}

function verifyWorkspaceRevision(workspace, revision, taskId, role, environment) {
  const status = git(workspace, ['status', '--porcelain=v1', '--untracked-files=all'], environment);
  const commit = git(workspace, ['rev-parse', 'HEAD'], environment);
  const tree = git(workspace, ['rev-parse', 'HEAD^{tree}'], environment);
  if (status !== '' || commit !== revision.commit || tree !== revision.tree) {
    throw new Error(`${taskId}: ${role} qualification workspace drifted`);
  }
}

function git(cwd, args, environment) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: environment,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

async function readJson(path) {
  const bytes = await readFile(path);
  return { bytes, value: JSON.parse(bytes.toString('utf8')) };
}

function normalizeOptions(input, mode) {
  const options = {
    ...input,
    executionEnvironment: input.executionEnvironment ?? process.env,
    allowHostRuntime: input.allowHostRuntime === true,
  };
  for (const name of [
    'candidatesPath',
    'corpusPath',
    'evaluatorRoot',
    'environmentRoot',
    'runtimeMatrixPath',
    'contractRoot',
    'bundleRoot',
  ]) {
    if (!options[name]) throw new Error(`missing required option: ${name}`);
    options[name] = resolve(options[name]);
  }
  if (!['development', 'qualification'].includes(options.partition)) {
    throw new Error('partition must be development or qualification');
  }
  if (typeof options.taskId !== 'string' || options.taskId.length < 3) {
    throw new Error('taskId is required');
  }
  options.environmentSpecPath = join(options.environmentRoot, 'specs', `${options.taskId}.json`);
  if (options.evaluatorRuntimeRoot) options.evaluatorRuntimeRoot = resolve(options.evaluatorRuntimeRoot);
  if (options.evaluatorBrowsersPath) options.evaluatorBrowsersPath = resolve(options.evaluatorBrowsersPath);
  if (mode === 'prepare') {
    for (const name of ['corpusRoot']) {
      if (!options[name]) throw new Error(`missing required option: ${name}`);
      options[name] = resolve(options[name]);
    }
    if (!options.allowHostRuntime && (options.sealedAt !== undefined || options.preparedAt !== undefined)) {
      throw new Error('sealedAt override is test-only');
    }
    options.sealedAt = options.sealedAt ?? options.preparedAt ?? new Date().toISOString();
    if (!Number.isFinite(Date.parse(options.sealedAt))) throw new Error('sealedAt must be a timestamp');
  } else if (mode === 'host-probe') {
    for (const name of ['corpusRoot', 'workspaceRoot', 'preparedRoot', 'receiptRoot']) {
      if (!options[name]) throw new Error(`missing required option: ${name}`);
      options[name] = resolve(options[name]);
    }
    options.resultRoot = resolve(options.resultRoot ?? join(options.receiptRoot, 'results'));
    if (!options.allowHostRuntime && options.qualifiedAt !== undefined) {
      throw new Error('qualifiedAt override is test-only');
    }
    options.qualifiedAt = options.qualifiedAt ?? new Date().toISOString();
    if (!Number.isFinite(Date.parse(options.qualifiedAt))) throw new Error('qualifiedAt must be a timestamp');
    options.probedPreparationAt = options.probedPreparationAt ?? new Date().toISOString();
    if (!Number.isFinite(Date.parse(options.probedPreparationAt))) {
      throw new Error('probedPreparationAt must be a timestamp');
    }
  } else if (mode === 'finalize-container') {
    for (const name of [
      'receiptRoot',
      'executionArtifactRoot',
      'executionAttestationPath',
      'provenanceBundlePath',
    ]) {
      if (!options[name]) throw new Error(`missing required option: ${name}`);
      options[name] = resolve(options[name]);
    }
    options.resultRoot = resolve(options.resultRoot ?? join(options.receiptRoot, 'results'));
  } else {
    throw new Error(`unsupported qualification mode: ${mode}`);
  }
  return options;
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[++index];
    if (!argument?.startsWith('--') || !value || value.startsWith('--')) {
      throw new Error(`invalid option: ${argument ?? 'missing'}`);
    }
    parsed[argument.slice(2)] = value;
  }
  const options = {
    mode: parsed.mode,
    partition: parsed.partition,
    taskId: parsed['task-id'],
    candidatesPath: parsed.candidates,
    corpusPath: parsed.corpus,
    corpusRoot: parsed['corpus-root'],
    evaluatorRoot: parsed['evaluator-root'],
    evaluatorRuntimeRoot: parsed['evaluator-runtime-root'],
    evaluatorBrowsersPath: parsed['evaluator-browsers-path'],
    environmentRoot: parsed['environment-root'],
    runtimeMatrixPath: parsed['runtime-matrix'],
    workspaceRoot: parsed['workspace-root'],
    preparedRoot: parsed['prepared-root'],
    contractRoot: parsed['contract-root'],
    bundleRoot: parsed['bundle-root'],
    receiptRoot: parsed['receipt-root'],
    resultRoot: parsed['result-root'],
    executionArtifactRoot: parsed['execution-artifact-root'],
    executionAttestationPath: parsed['execution-attestation'],
    provenanceBundlePath: parsed['provenance-bundle'],
    preparedAt: parsed['prepared-at'],
    sealedAt: parsed['sealed-at'],
    probedPreparationAt: parsed['probed-preparation-at'],
    qualifiedAt: parsed['qualified-at'],
  };
  if (!['prepare', 'host-probe', 'finalize-container'].includes(options.mode)) {
    throw new Error('--mode must be prepare, host-probe, or finalize-container');
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = options.mode === 'prepare'
      ? await prepareEvaluatorQualificationTask(options)
      : options.mode === 'host-probe'
        ? await probePreparedEvaluatorTask(options)
        : await finalizeContainerQualificationTask(options);
    console.log(
      JSON.stringify(
        options.mode === 'prepare'
          ? { ok: true, taskId: result.bundle.taskId, bundleSha256: result.bundle.bundleSha256 }
          : options.mode === 'host-probe'
            ? { ok: true, taskId: result.probe.taskId, probeSha256: result.probe.probeSha256, materializable: false }
            : { ok: true, taskId: result.receipt.taskId, receiptSha256: result.receipt.receiptSha256 },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
