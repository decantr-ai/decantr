#!/usr/bin/env node
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile } from 'node:fs/promises';
import {
  CONTROL_DELIVERY_CONTEXT,
  TREATMENT_DELIVERY_CONTEXT,
  assertEvaluatorContract,
  assertQualificationIndex,
  assertTaskManifest,
} from '../runner/contracts.mjs';
import {
  fileBinding,
  prettyCanonicalJson,
  readJsonFile,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from '../runner/canonical.mjs';
import {
  assertFixedCommand,
  isForbiddenDecantrOracleToken,
  isForbiddenEvaluatorEnvironmentKey,
  resolveContained,
} from '../runner/process.mjs';
import {
  assertTaskEnvironmentSpec,
  taskEnvironmentSubstanceSha256,
} from '../environments/contracts.mjs';
import { assertPreparedEnvironment } from '../environments/prepared-environment.mjs';
import { assertRuntimeMatrix } from '../environments/runtime-matrix.mjs';
import {
  assertQualificationReceipt,
  assertQualificationResultArtifact,
  assertStrictQualificationPolarity,
  calculatePrequalificationBundleDigest,
  calculateQualificationControllerDigest,
} from './qualification-task.mjs';
import {
  assertExecutionAttestation,
  calculateContainerControllerClosure,
} from './container-orchestrator.mjs';
import {
  qualificationProvenanceBundleFilename,
  qualificationProvenancePolicy,
  verifyQualificationProvenance,
} from './qualification-provenance.mjs';

const benchmarkRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(benchmarkRoot, '..', '..');
const program = 'decantr-3.10-ui-change-control-proof';
const taskIdPattern = /^[a-z0-9][a-z0-9._-]{2,95}$/u;
const sha256Pattern = /^[a-f0-9]{64}$/u;

export async function materializeBenchmarkTasks(options) {
  assertTimestamp(options.sealedAt, 'sealedAt');
  const [
    corpus,
    protocol,
    pricing,
    developmentCandidates,
    qualificationCandidates,
    publicCandidateIndex,
    runtimeMatrixInput,
    corpusBinding,
    developmentCandidateBinding,
    qualificationCandidateBinding,
    runtimeMatrixBinding,
  ] =
    await Promise.all([
      readJsonFile(options.corpusPath),
      readJsonFile(options.protocolPath),
      readJsonFile(options.pricingPath),
      readJsonFile(options.developmentCandidatesPath),
      readJsonFile(options.qualificationCandidatesPath),
      readJsonFile(options.publicCandidateIndexPath),
      readJsonFile(options.runtimeMatrixPath),
      fileBinding(options.corpusPath, 'corpus'),
      fileBinding(options.developmentCandidatesPath, 'development-candidates'),
      fileBinding(options.qualificationCandidatesPath, 'qualification-candidates'),
      fileBinding(options.runtimeMatrixPath, 'runtime-matrix'),
    ]);

  assertProgramInputs(corpus, protocol, pricing, developmentCandidates, qualificationCandidates);
  const runtimeMatrix = assertRuntimeMatrix(runtimeMatrixInput, { requireLocked: true });
  const qualificationControllerSha256 = await calculateQualificationControllerDigest();
  const containerController = await calculateContainerControllerClosure();
  const provenanceVerifier = options.provenanceVerifier ?? verifyQualificationProvenance;
  const development = await materializePartition({
    records: developmentCandidates.records,
    partition: 'development',
    evaluatorRoot: options.developmentEvaluatorRoot,
    deliveryRoot: options.developmentDeliveryRoot,
    environmentRoot: options.developmentEnvironmentRoot,
    taskOutputRoot: options.developmentTaskOutputRoot,
    receiptRoot: options.developmentReceiptRoot,
    candidateSetFileSha256: developmentCandidateBinding.sha256,
    corpusFileSha256: corpusBinding.sha256,
    runtimeMatrix,
    runtimeMatrixFileSha256: runtimeMatrixBinding.sha256,
    qualificationControllerSha256,
    containerController,
    provenanceVerifier,
    cosignPath: options.cosignPath,
    sealedAt: options.sealedAt,
    pricing,
  });
  const qualification = await materializePartition({
    records: qualificationCandidates.records,
    partition: 'qualification',
    evaluatorRoot: options.qualificationEvaluatorRoot,
    deliveryRoot: options.qualificationDeliveryRoot,
    environmentRoot: options.qualificationEnvironmentRoot,
    taskOutputRoot: options.qualificationTaskOutputRoot,
    receiptRoot: options.qualificationReceiptRoot,
    candidateSetFileSha256: qualificationCandidateBinding.sha256,
    corpusFileSha256: corpusBinding.sha256,
    runtimeMatrix,
    runtimeMatrixFileSha256: runtimeMatrixBinding.sha256,
    qualificationControllerSha256,
    containerController,
    provenanceVerifier,
    cosignPath: options.cosignPath,
    sealedAt: options.sealedAt,
    pricing,
  });

  validateMaterializedArithmetic(development, qualification, corpus, protocol);
  await writeDevelopmentEvaluatorManifest(
    options.developmentEvaluatorRoot,
    options.sealedAt,
    development,
  );

  const qualificationTasks = qualification
    .map((item) => ({
      taskId: item.task.taskId,
      kind: item.task.kind,
      repositoryId: item.task.repositoryId,
      framework: item.task.framework,
      projectPath: item.task.projectPath,
      corpusProjectPath: item.task.corpusProjectPath,
      corpusCommit: item.task.corpusCommit,
      base: item.task.base,
      candidateSha256: item.task.candidateSha256,
      manifestSha256: item.manifestSha256,
      evaluatorContractSha256: item.contractSha256,
      evaluatorSpecSha256: item.task.evaluator.specSha256,
      oracleSourceSha256: item.sourceSha256,
      qualificationControllerSha256: item.receipt.qualificationControllerSha256,
      qualificationReceiptFileSha256: item.receiptFileSha256,
      qualificationReceiptSha256: item.receipt.receiptSha256,
      qualificationExecutionAttestationFileSha256: item.receipt.execution.attestationFileSha256,
      qualificationExecutionAttestationSha256: item.receipt.execution.attestationSha256,
      qualificationExecutionControllerSha256: item.receipt.execution.controllerSha256,
      qualificationEvaluatorSourceClosureSha256: item.receipt.execution.evaluatorSourceClosureSha256,
      qualificationInputRequestFileSha256: item.receipt.execution.inputRequestFileSha256,
      qualificationInputRequestSha256: item.receipt.execution.inputRequestSha256,
      qualificationInputManifestFileSha256: item.receipt.execution.inputManifestFileSha256,
      qualificationInputManifestSha256: item.receipt.execution.inputManifestSha256,
      qualificationRunnerRepositoryCommit: item.receipt.execution.runnerRepositoryCommit,
      qualificationProvenanceBundleFileSha256: item.receipt.execution.provenanceBundleFileSha256,
      qualificationProvenanceVerificationSha256: item.receipt.execution.provenanceVerificationSha256,
      informationEntitlementSha256: item.task.informationEntitlementSha256,
      environmentSpecSha256: item.task.environment.specSha256,
      environmentSubstanceSha256: item.task.environment.substanceSha256,
      runtimeProfileId: item.task.environment.runtimeProfileId,
      runtimeMatrixFileSha256: item.task.environment.runtimeMatrixFileSha256,
      runtimeMatrixSha256: item.task.environment.runtimeMatrixSha256,
      benchmarkImageDigest: item.task.environment.benchmarkImageDigest,
      hiddenRef: basename(item.manifestPath),
    }))
    .sort((left, right) => left.taskId.localeCompare(right.taskId));
  const qualificationIndex = assertQualificationIndex({
    schemaVersion: 'decantr-benchmark-qualification-task-index.v2',
    program,
    sealedAt: options.sealedAt,
    bundleSha256: sha256Canonical(qualificationTasks),
    tasks: qualificationTasks,
  });
  await writeCanonicalFile(options.qualificationIndexPath, qualificationIndex);
  const qualificationIndexSha256 = sha256(await readFile(options.qualificationIndexPath));
  await writeHiddenEvaluatorManifest(
    options.qualificationEvaluatorRoot,
    qualificationIndexSha256,
    qualification,
  );

  const publicBinding = await buildPublicQualificationBinding({
    sealedAt: options.sealedAt,
    publicCandidateIndex,
    publicCandidateIndexPath: options.publicCandidateIndexPath,
    qualificationIndexSha256,
    qualification,
  });
  await writeCanonicalFile(options.publicBindingPath, publicBinding);

  return {
    counts: {
      development: development.length,
      qualification: qualification.length,
      total: development.length + qualification.length,
    },
    qualificationIndexSha256,
    publicBindingSha256: sha256(await readFile(options.publicBindingPath)),
  };
}

async function materializePartition(options) {
  const output = [];
  const seen = new Set();
  for (const candidate of options.records) {
    if (candidate.partition !== options.partition) {
      throw new Error(`${candidate.taskId}: candidate partition differs from ${options.partition}`);
    }
    if (seen.has(candidate.taskId)) throw new Error(`duplicate ${options.partition} task: ${candidate.taskId}`);
    seen.add(candidate.taskId);
    const specPath = join(options.evaluatorRoot, 'specs', `${candidate.taskId}.json`);
    const specBytes = await readFile(specPath);
    const spec = JSON.parse(specBytes);
    assertAuthoringSpec(spec, candidate, options.evaluatorRoot, options.pricing);
    const deliverySpecPath = join(options.deliveryRoot, 'specs', `${candidate.taskId}.json`);
    const deliverySpecBytes = await readFile(deliverySpecPath);
    const deliverySpec = JSON.parse(deliverySpecBytes);
    assertTaskDeliverySpec(deliverySpec, candidate);
    const environmentSpecPath = join(options.environmentRoot, 'specs', `${candidate.taskId}.json`);
    const environmentSpecBytes = await readFile(environmentSpecPath);
    const environmentSpec = assertTaskEnvironmentSpec(JSON.parse(environmentSpecBytes), candidate, {
      reviewStatus: 'approved',
    });
    const sourcePath = resolveContained(
      options.evaluatorRoot,
      spec.oracle.sourcePath,
      `${candidate.taskId}: oracle source`,
    );
    const sourceBytes = await readFile(sourcePath);
    assertOracleSource(candidate.taskId, sourceBytes.toString('utf8'));
    const sourceSha256 = sha256(sourceBytes);
    const contract = assertEvaluatorContract(
      {
        schemaVersion: 'decantr-benchmark-evaluator-contract.v2',
        contractId: spec.contractId,
        taskId: candidate.taskId,
        oracle: {
          candidateIndependent: true,
          decantrOutputAllowed: false,
          sourceSha256,
        },
        commands: spec.commands,
      },
      { taskId: candidate.taskId, evaluator: { contractId: spec.contractId } },
    );
    const contractPath = join(options.evaluatorRoot, 'contracts', `${candidate.taskId}.json`);
    await writeCanonicalFile(contractPath, contract);
    const contractSha256 = sha256(await readFile(contractPath));
    const profile = options.runtimeMatrix.profiles.find((item) => item.id === environmentSpec.profile.id);
    if (!profile) throw new Error(`${candidate.taskId}: reviewed runtime profile is absent from the locked matrix`);
    const receiptPath = join(options.receiptRoot, `${candidate.taskId}.json`);
    const receiptBytes = await readFile(receiptPath);
    const receipt = assertQualificationReceipt(JSON.parse(receiptBytes), {
      taskId: candidate.taskId,
      partition: candidate.partition,
      candidateSetSha256: options.candidateSetFileSha256,
      candidateSha256: sha256Canonical(candidate),
      corpusSha256: options.corpusFileSha256,
      evaluatorSpecSha256: sha256(specBytes),
      oracleSourceSha256: sourceSha256,
      evaluatorContractSha256: contractSha256,
      qualificationControllerSha256: options.qualificationControllerSha256,
      environmentSpecSha256: sha256(environmentSpecBytes),
      environmentSubstanceSha256: taskEnvironmentSubstanceSha256(environmentSpec),
      runtimeMatrixFileSha256: options.runtimeMatrixFileSha256,
      runtimeMatrixSha256: options.runtimeMatrix.matrixSha256,
      runtimeProfileId: profile.id,
      benchmarkImageDigest: profile.benchmarkImage.digest,
      qualifiedOnOrBefore: options.sealedAt,
    });
    const qualificationExecution = await verifyQualificationExecutionEvidence({
      candidate,
      spec,
      contract,
      contractSha256,
      sourceSha256,
      environmentSpecSha256: sha256(environmentSpecBytes),
      environmentSubstanceSha256: taskEnvironmentSubstanceSha256(environmentSpec),
      environmentSpec,
      runtimeMatrix: options.runtimeMatrix,
      runtimeMatrixFileSha256: options.runtimeMatrixFileSha256,
      runtimeMatrixSha256: options.runtimeMatrix.matrixSha256,
      profile,
      receipt,
      receiptRoot: options.receiptRoot,
      containerController: options.containerController,
      provenanceVerifier: options.provenanceVerifier,
      cosignPath: options.cosignPath,
    });
    const qualificationResults = {};
    for (const role of ['base', 'expected']) {
      const resultPath = join(options.receiptRoot, 'results', `${candidate.taskId}.${role}.json`);
      const resultBytes = await readFile(resultPath);
      const result = JSON.parse(resultBytes);
      if (
        sha256(resultBytes) !== receipt[`${role}ResultFileSha256`] ||
        sha256Canonical(result) !== receipt[`${role}ResultSha256`] ||
        result.taskId !== candidate.taskId ||
        result.contractSha256 !== contractSha256 ||
        qualificationExecution.attestation.evaluation.roles[role].result.fileSha256 !==
          receipt[`${role}ResultFileSha256`] ||
        qualificationExecution.attestation.evaluation.roles[role].result.canonicalSha256 !==
          receipt[`${role}ResultSha256`]
      ) {
        throw new Error(`${candidate.taskId}: qualified ${role} result artifact is invalid or stale`);
      }
      assertQualificationResultArtifact(result, contract, {
        taskId: candidate.taskId,
        role,
        runId: `qualification-${qualificationExecution.attestation.executionId}-${role}`,
        contractSha256,
      });
      qualificationResults[role] = result;
    }
    const oracleToken = `\${EVALUATOR_ROOT}/${spec.oracle.sourcePath}`;
    const requiredOracleIds = new Set(
      contract.commands
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
    assertStrictQualificationPolarity(
      contract,
      requiredOracleIds,
      qualificationResults.base,
      qualificationResults.expected,
      candidate.taskId,
    );
    if (Date.parse(deliverySpec.review.reviewedAt) > Date.parse(options.sealedAt)) {
      throw new Error(`${candidate.taskId}: delivery review postdates the materialization seal`);
    }
    const task = buildTaskManifest(
      candidate,
      spec,
      contractSha256,
      sourceSha256,
      deliverySpec.input,
      environmentSpec,
      sha256(environmentSpecBytes),
      options.runtimeMatrixFileSha256,
      options.runtimeMatrix.matrixSha256,
      profile.benchmarkImage.digest,
      receipt,
      sha256(receiptBytes),
    );
    const filename =
      options.partition === 'qualification' ? `${candidate.opaqueId}.json` : `${candidate.taskId}.json`;
    const manifestPath = join(options.taskOutputRoot, filename);
    await writeCanonicalFile(manifestPath, task);
    output.push({
      candidate,
      task,
      manifestPath,
      manifestSha256: sha256(await readFile(manifestPath)),
      contractPath,
      contractSha256,
      sourcePath,
      sourceSha256,
      deliverySpecPath,
      deliverySpecSha256: sha256(deliverySpecBytes),
      environmentSpecPath,
      environmentSpecSha256: sha256(environmentSpecBytes),
      receipt,
      receiptPath,
      receiptFileSha256: sha256(receiptBytes),
    });
  }
  return output.sort((left, right) => left.task.taskId.localeCompare(right.task.taskId));
}

async function verifyQualificationExecutionEvidence(options) {
  const attestationPath = join(options.receiptRoot, 'attestations', `${options.candidate.taskId}.json`);
  const provenancePath = join(
    options.receiptRoot,
    'provenance',
    qualificationProvenanceBundleFilename(
      options.candidate.taskId,
      options.receipt.execution.provenanceProvider,
    ),
  );
  const prequalificationPath = join(
    options.receiptRoot,
    'prequalification',
    `${options.candidate.taskId}.json`,
  );
  const inputRequestPath = join(
    options.receiptRoot,
    'qualification-input',
    `${options.candidate.taskId}.request.json`,
  );
  const inputManifestPath = join(
    options.receiptRoot,
    'qualification-input',
    `${options.candidate.taskId}.manifest.json`,
  );
  const preparedEnvironmentPath = join(
    options.receiptRoot,
    'prepared-environments',
    `${options.candidate.taskId}.json`,
  );
  const [
    attestationBytes,
    provenanceBytes,
    prequalificationBytes,
    inputRequestBytes,
    inputManifestBytes,
    preparedEnvironmentBytes,
  ] = await Promise.all([
    readFile(attestationPath),
    readFile(provenancePath),
    readFile(prequalificationPath),
    readFile(inputRequestPath),
    readFile(inputManifestPath),
    readFile(preparedEnvironmentPath),
  ]);
  const attestation = assertExecutionAttestation(JSON.parse(attestationBytes));
  const preparedEnvironment = assertPreparedEnvironment(
    JSON.parse(preparedEnvironmentBytes),
    {
      task: {
        taskId: options.candidate.taskId,
        base: options.candidate.base,
        environment: {
          specSha256: options.environmentSpecSha256,
          substanceSha256: options.environmentSubstanceSha256,
          runtimeProfileId: options.profile.id,
        },
      },
      environmentSpec: options.environmentSpec,
      runtimeMatrix: options.runtimeMatrix,
    },
  );
  const prequalification = JSON.parse(prequalificationBytes);
  const execution = options.receipt.execution;
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
    prequalification.taskId !== options.candidate.taskId ||
    prequalification.partition !== options.candidate.partition ||
    prequalification.candidateSha256 !== sha256Canonical(options.candidate) ||
    prequalification.revisions?.base?.commit !== options.candidate.base.commit ||
    prequalification.revisions?.base?.tree !== options.candidate.base.tree ||
    prequalification.revisions?.expected?.commit !== options.candidate.expected.commit ||
    prequalification.revisions?.expected?.tree !== options.candidate.expected.tree ||
    attestation.attestationSha256 !== execution.attestationSha256 ||
    attestation.taskId !== options.candidate.taskId ||
    attestation.partition !== options.candidate.partition ||
    attestation.endedAt !== options.receipt.qualifiedAt ||
    attestation.bindings.candidate.canonicalSha256 !== sha256Canonical(options.candidate) ||
    attestation.bindings.prequalificationBundle.fileSha256 !==
      options.receipt.prequalificationBundleFileSha256 ||
    attestation.bindings.prequalificationBundle.bundleSha256 !==
      options.receipt.prequalificationBundleSha256 ||
    attestation.bindings.evaluator.contractFileSha256 !== options.contractSha256 ||
    attestation.bindings.evaluator.oracleSourceSha256 !== options.sourceSha256 ||
    sourceClosure.length !== 1 ||
    sourceClosure[0].path !== options.spec.oracle.sourcePath ||
    sourceClosure[0].sha256 !== options.sourceSha256 ||
    attestation.bindings.evaluator.sourceClosureSha256 !== execution.evaluatorSourceClosureSha256 ||
    !inputRequestBytes.equals(Buffer.from(prettyCanonicalJson(inputRequest))) ||
    !inputManifestBytes.equals(Buffer.from(prettyCanonicalJson(inputManifest))) ||
    inputRequest.taskId !== options.candidate.taskId ||
    inputRequest.partition !== options.candidate.partition ||
    inputRequest.requestSha256 !== sha256Canonical(inputRequestBody) ||
    inputManifest.taskId !== options.candidate.taskId ||
    inputManifest.partition !== options.candidate.partition ||
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
    attestation.bindings.sourceSnapshots.base.revision.commit !== options.candidate.base.commit ||
    attestation.bindings.sourceSnapshots.base.revision.tree !== options.candidate.base.tree ||
    attestation.bindings.sourceSnapshots.expected.revision.commit !== options.candidate.expected.commit ||
    attestation.bindings.sourceSnapshots.expected.revision.tree !== options.candidate.expected.tree ||
    attestation.bindings.environment.specFileSha256 !== options.environmentSpecSha256 ||
    attestation.bindings.environment.substanceSha256 !== options.environmentSubstanceSha256 ||
    attestation.bindings.runtimeMatrix.fileSha256 !== options.runtimeMatrixFileSha256 ||
    attestation.bindings.runtimeMatrix.matrixSha256 !== options.runtimeMatrixSha256 ||
    attestation.bindings.runtimeProfile.id !== options.profile.id ||
    attestation.bindings.runtimeProfile.profileSha256 !== options.profile.profileSha256 ||
    attestation.bindings.benchmarkImage.reference !== options.profile.benchmarkImage.reference ||
    attestation.bindings.benchmarkImage.digest !== options.profile.benchmarkImage.digest ||
    !preparedEnvironmentBytes.equals(Buffer.from(prettyCanonicalJson(preparedEnvironment))) ||
    sha256(preparedEnvironmentBytes) !==
      attestation.preparation.preparedEnvironment.fileSha256 ||
    sha256Canonical(preparedEnvironment) !==
      attestation.preparation.preparedEnvironment.canonicalSha256 ||
    preparedEnvironment.environmentSha256 !==
      attestation.preparation.preparedEnvironment.environmentSha256 ||
    preparedEnvironment.attestationSha256 !==
      attestation.preparation.preparedEnvironment.attestationSha256 ||
    attestation.runnerRepositoryCommit !== execution.runnerRepositoryCommit ||
    attestation.executionIdentity.provider !== 'github-actions' ||
    attestation.executionIdentity.repository !== execution.repository ||
    attestation.executionIdentity.ref !== execution.sourceRef ||
    attestation.executionIdentity.workflowRef !== `${execution.signerWorkflow}@${execution.sourceRef}` ||
    sha256(provenanceBytes) !== execution.provenanceBundleFileSha256
  ) {
    throw new Error(`${options.candidate.taskId}: retained container qualification evidence is invalid or stale`);
  }
  const provenance = await options.provenanceVerifier({
    attestationPath,
    bundlePath: provenancePath,
    partition: options.candidate.partition,
    sourceDigest: execution.runnerRepositoryCommit,
    sourceRef: execution.sourceRef,
    cosignPath: options.cosignPath,
  });
  const expectedPolicy = qualificationProvenancePolicy(options.candidate.partition, {
    sourceDigest: execution.runnerRepositoryCommit,
    sourceRef: execution.sourceRef,
  });
  if (
    provenance.attestationFileSha256 !== execution.attestationFileSha256 ||
    provenance.bundleFileSha256 !== execution.provenanceBundleFileSha256 ||
    provenance.verificationSha256 !== execution.provenanceVerificationSha256 ||
    sha256Canonical(provenance.policy) !== sha256Canonical(expectedPolicy)
  ) {
    throw new Error(`${options.candidate.taskId}: retained provenance verification is invalid`);
  }
  return { attestation, attestationPath, provenancePath };
}

function buildTaskManifest(
  candidate,
  spec,
  contractSha256,
  sourceSha256,
  taskInput,
  environmentSpec,
  environmentSpecSha256,
  runtimeMatrixFileSha256,
  runtimeMatrixSha256,
  benchmarkImageDigest,
  receipt,
  receiptFileSha256,
) {
  const informationEntitlement = buildInformationEntitlement(candidate, taskInput, environmentSpec);
  const informationEntitlementSha256 = sha256Canonical(informationEntitlement);
  return assertTaskManifest({
    schemaVersion: 'decantr-benchmark-task.v2',
    taskId: candidate.taskId,
    partition: candidate.partition,
    kind: candidate.kind,
    repositoryId: candidate.repository.id,
    framework: candidate.repository.framework,
    projectPath: candidate.repository.projectPath,
    corpusProjectPath: candidate.repository.corpusProjectPath,
    corpusCommit: candidate.repository.corpusPin,
    base: candidate.base,
    candidateSha256: sha256Canonical(candidate),
    prompt: candidate.prompt,
    informationEntitlement,
    informationEntitlementSha256,
    armInputs: {
      control: {
        context: CONTROL_DELIVERY_CONTEXT,
        entitlementSha256: informationEntitlementSha256,
      },
      treatment: {
        context: TREATMENT_DELIVERY_CONTEXT,
        entitlementSha256: informationEntitlementSha256,
      },
    },
    scope: {
      allowedPaths: [...candidate.scope.allowedPaths],
      forbiddenPaths: [...candidate.scope.forbiddenPaths],
    },
    environment: {
      specSha256: environmentSpecSha256,
      substanceSha256: taskEnvironmentSubstanceSha256(environmentSpec),
      runtimeProfileId: environmentSpec.profile.id,
      runtimeMatrixFileSha256,
      runtimeMatrixSha256,
      benchmarkImageDigest,
    },
    evaluator: {
      contractId: spec.contractId,
      contractSha256,
      specSha256: receipt.evaluatorSpecSha256,
      oracleSourceSha256: sourceSha256,
      qualificationControllerSha256: receipt.qualificationControllerSha256,
      qualificationReceiptFileSha256: receiptFileSha256,
      qualificationReceiptSha256: receipt.receiptSha256,
      qualificationExecutionAttestationFileSha256: receipt.execution.attestationFileSha256,
      qualificationExecutionAttestationSha256: receipt.execution.attestationSha256,
      qualificationExecutionControllerSha256: receipt.execution.controllerSha256,
      qualificationEvaluatorSourceClosureSha256: receipt.execution.evaluatorSourceClosureSha256,
      qualificationInputRequestFileSha256: receipt.execution.inputRequestFileSha256,
      qualificationInputRequestSha256: receipt.execution.inputRequestSha256,
      qualificationInputManifestFileSha256: receipt.execution.inputManifestFileSha256,
      qualificationInputManifestSha256: receipt.execution.inputManifestSha256,
      qualificationRunnerRepositoryCommit: receipt.execution.runnerRepositoryCommit,
      qualificationProvenanceBundleFileSha256: receipt.execution.provenanceBundleFileSha256,
      qualificationProvenanceVerificationSha256: receipt.execution.provenanceVerificationSha256,
    },
    limits: spec.limits,
  });
}

function buildInformationEntitlement(candidate, taskInput, environmentSpec) {
  return {
    parityRule:
      'Both experimental arms receive the same human-authored facts and repository access. Delivery may differ; factual entitlement may not.',
    sourceList: [
      {
        id: 'base-checkout',
        type: 'repository-tree',
        reference: `${candidate.repository.url}@${candidate.base.commit}`,
        paths: ['**/*'],
        access: 'All tracked files at the base commit are readable by both arms.',
      },
      {
        id: 'task-prompt',
        type: 'benchmark-input',
        reference: 'task.prompt',
        access: 'Both arms receive the identical plaintext task prompt.',
      },
      {
        id: 'scope-policy',
        type: 'benchmark-input',
        reference: 'task.scope',
        access: 'Both arms receive the identical allowed and forbidden path policy.',
      },
      {
        id: 'execution-contract',
        type: 'benchmark-input',
        reference: 'task.environment',
        access: 'Both arms receive the identical reviewed runtime, lockfile, and preparation contract.',
      },
    ],
    excludedFromAgent: [
      'expected commit, expected tree, and expected diff',
      'provenance implementation discussion',
      'hidden evaluator implementation and checks',
      'personal skills, tools, memory, and host configuration',
    ],
    executionEnvironment: {
      profile: structuredClone(environmentSpec.profile),
      lockfiles: structuredClone(environmentSpec.lockfiles),
      preparation: structuredClone(environmentSpec.preparation),
      cleanAfterPreparation: environmentSpec.cleanAfterPreparation,
    },
    taskInput: structuredClone(taskInput),
  };
}

function assertTaskDeliverySpec(spec, candidate) {
  assertExactKeys(spec, ['schemaVersion', 'taskId', 'input', 'oracle', 'review'], `${candidate.taskId}: delivery spec`);
  if (spec.schemaVersion !== 'decantr-benchmark-task-delivery-spec.v1' || spec.taskId !== candidate.taskId) {
    throw new Error(`${candidate.taskId}: task delivery binding is invalid`);
  }
  assertExactKeys(spec.input, ['target', 'policyCard'], `${candidate.taskId}: delivery input`);
  assertExactKeys(spec.input.target, ['selector'], `${candidate.taskId}: delivery target`);
  if (
    typeof spec.input.target.selector !== 'string' ||
    spec.input.target.selector.trim() === '' ||
    /decantr/iu.test(spec.input.target.selector)
  ) {
    throw new Error(`${candidate.taskId}: shared target selector is invalid or product-specific`);
  }
  assertExactKeys(spec.input.policyCard, ['statements'], `${candidate.taskId}: policy card`);
  if (!Array.isArray(spec.input.policyCard.statements) || spec.input.policyCard.statements.length === 0) {
    throw new Error(`${candidate.taskId}: shared policy card requires statements`);
  }
  const statementIds = new Set();
  for (const statement of spec.input.policyCard.statements) {
    assertExactKeys(statement, ['id', 'text', 'sources'], `${candidate.taskId}: policy statement`);
    if (!/^[a-z0-9][a-z0-9-]+$/u.test(statement.id) || statementIds.has(statement.id)) {
      throw new Error(`${candidate.taskId}: policy statement ids must be unique and stable`);
    }
    statementIds.add(statement.id);
    if (
      typeof statement.text !== 'string' ||
      statement.text.trim().length < 10 ||
      /decantr/iu.test(statement.text) ||
      !Array.isArray(statement.sources) ||
      statement.sources.length === 0 ||
      statement.sources.some((source) => typeof source !== 'string' || source.trim() === '')
    ) {
      throw new Error(`${candidate.taskId}: shared policy statement is invalid or product-specific`);
    }
  }
  if (/decantr/iu.test(JSON.stringify(spec.input))) {
    throw new Error(`${candidate.taskId}: shared delivery input must be product-neutral`);
  }
  assertExactKeys(
    spec.oracle,
    ['expectedKind', 'acceptedStatuses', 'rankOneFiles', 'forbiddenRankOnePatterns', 'styleAuthority'],
    `${candidate.taskId}: target oracle`,
  );
  if (
    !['route', 'layout', 'component', 'story', 'overlay', 'flow', 'package', 'runtime-state', 'file'].includes(
      spec.oracle.expectedKind,
    ) ||
    !Array.isArray(spec.oracle.acceptedStatuses) ||
    spec.oracle.acceptedStatuses.length === 0 ||
    spec.oracle.acceptedStatuses.some((status) => !['ready', 'limited'].includes(status)) ||
    !Array.isArray(spec.oracle.rankOneFiles) ||
    spec.oracle.rankOneFiles.length === 0 ||
    spec.oracle.rankOneFiles.some((file) => typeof file !== 'string' || file.trim() === '') ||
    !Array.isArray(spec.oracle.forbiddenRankOnePatterns) ||
    spec.oracle.forbiddenRankOnePatterns.length === 0
  ) {
    throw new Error(`${candidate.taskId}: target oracle is incomplete`);
  }
  for (const pattern of spec.oracle.forbiddenRankOnePatterns) {
    try {
      const matcher = new RegExp(pattern, 'iu');
      if (spec.oracle.rankOneFiles.some((file) => matcher.test(file))) {
        throw new Error(`${candidate.taskId}: target oracle promotes a forbidden authority file`);
      }
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error(`${candidate.taskId}: target oracle pattern is invalid`);
      throw error;
    }
  }
  assertExactKeys(
    spec.oracle.styleAuthority,
    ['approach', 'confidence', 'files'],
    `${candidate.taskId}: style authority oracle`,
  );
  if (
    typeof spec.oracle.styleAuthority.approach !== 'string' ||
    !['high', 'medium', 'low'].includes(spec.oracle.styleAuthority.confidence) ||
    !Array.isArray(spec.oracle.styleAuthority.files)
  ) {
    throw new Error(`${candidate.taskId}: style authority oracle is invalid`);
  }
  assertExactKeys(spec.review, ['status', 'reviewedBy', 'reviewedAt', 'notes'], `${candidate.taskId}: delivery review`);
  if (
    spec.review.status !== 'approved' ||
    typeof spec.review.reviewedBy !== 'string' ||
    spec.review.reviewedBy.trim() === '' ||
    typeof spec.review.notes !== 'string' ||
    spec.review.notes.trim().length < 20
  ) {
    throw new Error(`${candidate.taskId}: task delivery spec requires a substantive independent approval`);
  }
  assertTimestamp(spec.review.reviewedAt, `${candidate.taskId}: delivery review.reviewedAt`);
}

function assertAuthoringSpec(spec, candidate, evaluatorRoot, pricing) {
  assertExactKeys(
    spec,
    ['schemaVersion', 'taskId', 'contractId', 'review', 'oracle', 'commands', 'limits'],
    `${candidate.taskId}: evaluator spec`,
  );
  if (spec.schemaVersion !== 'decantr-benchmark-evaluator-authoring-spec.v2') {
    throw new Error(`${candidate.taskId}: evaluator authoring schemaVersion is invalid`);
  }
  if (spec.taskId !== candidate.taskId || !taskIdPattern.test(spec.taskId)) {
    throw new Error(`${candidate.taskId}: evaluator task binding is invalid`);
  }
  if (!/^[a-z0-9][a-z0-9._-]{2,127}$/u.test(spec.contractId)) {
    throw new Error(`${candidate.taskId}: evaluator contractId is invalid`);
  }
  assertExactKeys(spec.review, ['status', 'reviewedBy', 'reviewedAt', 'notes'], `${candidate.taskId}: review`);
  if (
    spec.review.status !== 'approved' ||
    typeof spec.review.reviewedBy !== 'string' ||
    spec.review.reviewedBy.trim() === '' ||
    typeof spec.review.notes !== 'string' ||
    spec.review.notes.trim().length < 20
  ) {
    throw new Error(`${candidate.taskId}: evaluator spec requires a substantive independent approval`);
  }
  assertTimestamp(spec.review.reviewedAt, `${candidate.taskId}: review.reviewedAt`);
  assertExactKeys(
    spec.oracle,
    ['candidateIndependent', 'decantrOutputAllowed', 'sourcePath'],
    `${candidate.taskId}: oracle`,
  );
  if (spec.oracle.candidateIndependent !== true || spec.oracle.decantrOutputAllowed !== false) {
    throw new Error(`${candidate.taskId}: evaluator oracle policy is invalid`);
  }
  const expectedSource = `sources/${candidate.taskId}.mjs`;
  if (spec.oracle.sourcePath !== expectedSource) {
    throw new Error(`${candidate.taskId}: oracle sourcePath must be ${expectedSource}`);
  }
  resolveContained(evaluatorRoot, spec.oracle.sourcePath, `${candidate.taskId}: oracle source`);
  if (!Array.isArray(spec.commands) || spec.commands.length < 2) {
    throw new Error(`${candidate.taskId}: evaluator requires functional and build commands`);
  }
  const ids = new Set();
  for (const command of spec.commands) {
    if (ids.has(command.id)) throw new Error(`${candidate.taskId}: duplicate evaluator command ${command.id}`);
    ids.add(command.id);
    assertFixedCommand(command.executable, command.args);
    if (
      command.runtime === 'controller' &&
      !['node', 'node.exe'].includes(basename(command.executable).toLowerCase())
    ) {
      throw new Error(`${candidate.taskId}: controller command ${command.id} must declare the Node executable`);
    }
    for (const token of [command.executable, ...command.args]) {
      if (isForbiddenDecantrOracleToken(token)) {
        throw new Error(`${candidate.taskId}: product output cannot be an evaluator input`);
      }
    }
    for (const key of Object.keys(command.environment ?? {})) {
      if (isForbiddenEvaluatorEnvironmentKey(key)) {
        throw new Error(`${candidate.taskId}: evaluator environment contains forbidden key ${key}`);
      }
    }
  }
  const oracleToken = `\${EVALUATOR_ROOT}/${spec.oracle.sourcePath}`;
  const requiredOracle = spec.commands.some(
    (command) =>
      command.kind === 'functional' &&
      command.runtime === 'controller' &&
      command.required === true &&
      command.resultFormat === 'json-stdout' &&
      ['node', 'node.exe'].includes(basename(command.executable).toLowerCase()) &&
      command.args.includes(oracleToken),
  );
  if (!requiredOracle) {
    throw new Error(`${candidate.taskId}: a required JSON functional command must execute ${oracleToken}`);
  }
  if (
    !spec.commands.some(
      (command) => command.kind === 'build' && command.runtime === 'task' && command.required === true,
    )
  ) {
    throw new Error(`${candidate.taskId}: at least one host build command must be required`);
  }
  assertLimitsWithinPricing(candidate.taskId, spec.limits, pricing);
}

function assertOracleSource(taskId, source) {
  if (/decantr/iu.test(source)) {
    throw new Error(`${taskId}: evaluator source names the product under test`);
  }
  if (/(?:from\s*|import\s*\()\s*['"]\.{1,2}\//u.test(source)) {
    throw new Error(`${taskId}: evaluator source must be self-contained and cannot import local files`);
  }
  if (!source.includes('json-stdout') && !source.includes('JSON.stringify')) {
    throw new Error(`${taskId}: evaluator source does not appear to emit a JSON result`);
  }
}

function assertLimitsWithinPricing(taskId, limits, pricing) {
  assertExactKeys(
    limits,
    ['timeoutMs', 'maxRequests', 'maxInputTokens', 'maxOutputTokens'],
    `${taskId}: limits`,
  );
  if (!Number.isInteger(limits.timeoutMs) || limits.timeoutMs < 1000 || limits.timeoutMs > 7_200_000) {
    throw new Error(`${taskId}: timeoutMs is invalid`);
  }
  if (!Number.isInteger(limits.maxRequests) || limits.maxRequests < 1 || limits.maxRequests > 100) {
    throw new Error(`${taskId}: maxRequests is invalid`);
  }
  for (const key of ['maxInputTokens', 'maxOutputTokens']) {
    if (!Number.isInteger(limits[key]) || limits[key] < 1) throw new Error(`${taskId}: ${key} is invalid`);
  }
  for (const model of pricing.models) {
    const maximum =
      (limits.maxInputTokens * model.inputPerMillionTokensUsd +
        limits.maxOutputTokens * model.outputPerMillionTokensUsd) /
      1_000_000;
    if (maximum > model.maximumRunCostUsd + Number.EPSILON) {
      throw new Error(
        `${taskId}: token limits can cost $${maximum.toFixed(2)} for ${model.modelId}, above $${model.maximumRunCostUsd}`,
      );
    }
  }
}

function assertProgramInputs(corpus, protocol, pricing, development, qualification) {
  if (corpus.schemaVersion !== 'decantr-benchmark-corpus.v1' || corpus.repositories?.length !== 28) {
    throw new Error('materialization requires the frozen 28-repository corpus');
  }
  if (
    protocol.schemaVersion !== 'decantr-benchmark-protocol.v1' ||
    protocol.design?.taskCount !== 40 ||
    protocol.design?.minimumQualificationTasks !== 16
  ) {
    throw new Error('materialization requires the frozen 40-task / 16-qualification protocol');
  }
  if (pricing.paidPricingLocked !== true || pricing.models?.length !== 2) {
    throw new Error('materialization requires the reviewed two-model pricing lock');
  }
  if (development.schemaVersion !== 'decantr-benchmark-development-task-candidates.v2') {
    throw new Error('development candidate schemaVersion is invalid');
  }
  if (qualification.schemaVersion !== 'decantr-benchmark-qualification-task-candidates.v2') {
    throw new Error('qualification candidate schemaVersion is invalid');
  }
}

function validateMaterializedArithmetic(development, qualification, corpus, protocol) {
  const tasks = [...development, ...qualification].map((item) => item.task);
  if (
    development.length !== protocol.design.taskCount - protocol.design.minimumQualificationTasks ||
    qualification.length !== protocol.design.minimumQualificationTasks ||
    tasks.length !== protocol.design.taskCount
  ) {
    throw new Error('materialized task partition arithmetic differs from the frozen protocol');
  }
  const repositoryTasks = tasks.filter((task) => task.kind === 'repository');
  const adversarialTasks = tasks.filter((task) => task.kind === 'adversarial');
  if (
    repositoryTasks.length !== protocol.design.repositoryTaskCount ||
    adversarialTasks.length !== protocol.design.adversarialTaskCount
  ) {
    throw new Error('materialized repository/adversarial arithmetic differs from the frozen protocol');
  }
  const coverage = new Map();
  for (const task of repositoryTasks) coverage.set(task.repositoryId, (coverage.get(task.repositoryId) ?? 0) + 1);
  for (const repository of corpus.repositories) {
    if (coverage.get(repository.id) !== 1) {
      throw new Error(`materialized repository coverage must be exactly one for ${repository.id}`);
    }
  }
}

async function writeDevelopmentEvaluatorManifest(root, sealedAt, tasks) {
  const entries = tasks.map((item) => ({
    taskId: item.task.taskId,
    manifestSha256: item.manifestSha256,
    contractPath: relative(root, item.contractPath).replaceAll('\\', '/'),
    contractSha256: item.contractSha256,
    oracleSourcePath: relative(root, item.sourcePath).replaceAll('\\', '/'),
    oracleSourceSha256: item.sourceSha256,
    qualificationReceiptPath: relative(root, item.receiptPath).replaceAll('\\', '/'),
    qualificationControllerSha256: item.receipt.qualificationControllerSha256,
    qualificationReceiptFileSha256: item.receiptFileSha256,
    qualificationReceiptSha256: item.receipt.receiptSha256,
    qualificationExecutionAttestationFileSha256: item.receipt.execution.attestationFileSha256,
    qualificationExecutionAttestationSha256: item.receipt.execution.attestationSha256,
    qualificationExecutionControllerSha256: item.receipt.execution.controllerSha256,
    qualificationEvaluatorSourceClosureSha256: item.receipt.execution.evaluatorSourceClosureSha256,
    qualificationInputRequestFileSha256: item.receipt.execution.inputRequestFileSha256,
    qualificationInputRequestSha256: item.receipt.execution.inputRequestSha256,
    qualificationInputManifestFileSha256: item.receipt.execution.inputManifestFileSha256,
    qualificationInputManifestSha256: item.receipt.execution.inputManifestSha256,
    qualificationRunnerRepositoryCommit: item.receipt.execution.runnerRepositoryCommit,
    qualificationProvenanceBundleFileSha256: item.receipt.execution.provenanceBundleFileSha256,
    qualificationProvenanceVerificationSha256: item.receipt.execution.provenanceVerificationSha256,
    deliverySpecSha256: item.deliverySpecSha256,
    environmentSpecSha256: item.environmentSpecSha256,
  }));
  await writeCanonicalFile(join(root, 'manifest.json'), {
    schemaVersion: 'decantr-benchmark-development-evaluator-manifest.v2',
    program,
    sealedAt,
    bundleSha256: sha256Canonical(entries),
    evaluators: entries,
  });
}

async function writeHiddenEvaluatorManifest(root, qualificationTaskIndexSha256, tasks) {
  const evaluators = tasks.map((item) => ({
    taskId: item.task.taskId,
    contractPath: relative(root, item.contractPath).replaceAll('\\', '/'),
    contractSha256: item.contractSha256,
    oracleSourcePath: relative(root, item.sourcePath).replaceAll('\\', '/'),
    oracleSourceSha256: item.sourceSha256,
    qualificationReceiptPath: relative(root, item.receiptPath).replaceAll('\\', '/'),
    qualificationControllerSha256: item.receipt.qualificationControllerSha256,
    qualificationReceiptFileSha256: item.receiptFileSha256,
    qualificationReceiptSha256: item.receipt.receiptSha256,
    qualificationExecutionAttestationFileSha256: item.receipt.execution.attestationFileSha256,
    qualificationExecutionAttestationSha256: item.receipt.execution.attestationSha256,
    qualificationExecutionControllerSha256: item.receipt.execution.controllerSha256,
    qualificationEvaluatorSourceClosureSha256: item.receipt.execution.evaluatorSourceClosureSha256,
    qualificationInputRequestFileSha256: item.receipt.execution.inputRequestFileSha256,
    qualificationInputRequestSha256: item.receipt.execution.inputRequestSha256,
    qualificationInputManifestFileSha256: item.receipt.execution.inputManifestFileSha256,
    qualificationInputManifestSha256: item.receipt.execution.inputManifestSha256,
    qualificationRunnerRepositoryCommit: item.receipt.execution.runnerRepositoryCommit,
    qualificationProvenanceBundleFileSha256: item.receipt.execution.provenanceBundleFileSha256,
    qualificationProvenanceVerificationSha256: item.receipt.execution.provenanceVerificationSha256,
  }));
  await writeCanonicalFile(join(root, 'manifest.json'), {
    schemaVersion: 'decantr-benchmark-hidden-evaluator-manifest.v2',
    qualificationTaskIndexSha256,
    evaluators,
  });
}

async function buildPublicQualificationBinding(options) {
  if (
    options.publicCandidateIndex.schemaVersion !== 'decantr-benchmark-public-qualification-index.v1' ||
    options.publicCandidateIndex.tasks?.length !== options.qualification.length
  ) {
    throw new Error('public qualification candidate index is invalid or incomplete');
  }
  const candidateByOpaque = new Map(
    options.publicCandidateIndex.tasks.map((item) => [item.opaqueId, item.canonicalSha256]),
  );
  const tasks = options.qualification
    .map((item) => {
      const candidateSha256 = candidateByOpaque.get(item.candidate.opaqueId);
      if (candidateSha256 !== sha256Canonical(item.candidate)) {
        throw new Error(`${item.candidate.opaqueId}: public candidate binding differs from private record`);
      }
      return {
        opaqueId: item.candidate.opaqueId,
        candidateSha256,
        manifestSha256: item.manifestSha256,
        evaluatorContractSha256: item.contractSha256,
        evaluatorSpecSha256: item.task.evaluator.specSha256,
        oracleSourceSha256: item.sourceSha256,
        qualificationControllerSha256: item.receipt.qualificationControllerSha256,
        qualificationReceiptFileSha256: item.receiptFileSha256,
        qualificationReceiptSha256: item.receipt.receiptSha256,
        qualificationExecutionAttestationFileSha256: item.receipt.execution.attestationFileSha256,
        qualificationExecutionAttestationSha256: item.receipt.execution.attestationSha256,
        qualificationExecutionControllerSha256: item.receipt.execution.controllerSha256,
        qualificationEvaluatorSourceClosureSha256: item.receipt.execution.evaluatorSourceClosureSha256,
        qualificationInputRequestFileSha256: item.receipt.execution.inputRequestFileSha256,
        qualificationInputRequestSha256: item.receipt.execution.inputRequestSha256,
        qualificationInputManifestFileSha256: item.receipt.execution.inputManifestFileSha256,
        qualificationInputManifestSha256: item.receipt.execution.inputManifestSha256,
        qualificationRunnerCommit: item.receipt.execution.runnerRepositoryCommit,
        qualificationProvenanceBundleFileSha256: item.receipt.execution.provenanceBundleFileSha256,
        qualificationProvenanceVerificationSha256: item.receipt.execution.provenanceVerificationSha256,
        deliverySpecSha256: item.deliverySpecSha256,
        environmentSpecSha256: item.environmentSpecSha256,
      };
    })
    .sort((left, right) => left.opaqueId.localeCompare(right.opaqueId));
  const output = {
    schemaVersion: 'decantr-benchmark-public-qualification-binding-index.v2',
    program,
    sealedAt: options.sealedAt,
    candidateIndexSha256: sha256(await readFile(options.publicCandidateIndexPath)),
    qualificationTaskIndexSha256: options.qualificationIndexSha256,
    runtimeMatrixFileSha256: options.qualification[0].task.environment.runtimeMatrixFileSha256,
    runtimeMatrixSha256: options.qualification[0].task.environment.runtimeMatrixSha256,
    bundleSha256: sha256Canonical(tasks),
    tasks,
  };
  assertOpaqueRunnableBinding(output);
  return output;
}

function assertOpaqueRunnableBinding(index) {
  assertExactKeys(
    index,
    [
      'schemaVersion',
      'program',
      'sealedAt',
      'candidateIndexSha256',
      'qualificationTaskIndexSha256',
      'runtimeMatrixFileSha256',
      'runtimeMatrixSha256',
      'bundleSha256',
      'tasks',
    ],
    'public qualification runnable binding',
  );
  for (const key of [
    'candidateIndexSha256',
    'qualificationTaskIndexSha256',
    'runtimeMatrixFileSha256',
    'runtimeMatrixSha256',
    'bundleSha256',
  ]) {
    if (!sha256Pattern.test(index[key])) throw new Error(`public qualification ${key} is invalid`);
  }
  if (index.bundleSha256 !== sha256Canonical(index.tasks)) {
    throw new Error('public qualification task bundle digest is invalid');
  }
  const serialized = JSON.stringify(index).toLowerCase();
  for (const forbidden of ['taskid', 'repository', 'framework', 'prompt', 'evaluator source', 'github']) {
    if (serialized.includes(forbidden)) {
      throw new Error(`public qualification runnable binding leaks forbidden token: ${forbidden}`);
    }
  }
  for (const task of index.tasks) {
    assertExactKeys(
      task,
      [
        'opaqueId',
        'candidateSha256',
        'manifestSha256',
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
        'qualificationRunnerCommit',
        'qualificationProvenanceBundleFileSha256',
        'qualificationProvenanceVerificationSha256',
        'deliverySpecSha256',
        'environmentSpecSha256',
      ],
      `${task.opaqueId}: public qualification binding`,
    );
    if (!/^q-[a-f0-9-]{36}$/u.test(task.opaqueId)) throw new Error(`${task.opaqueId}: opaque id is invalid`);
    for (const [key, value] of Object.entries(task).filter(([key]) => key !== 'opaqueId')) {
      const pattern = key === 'qualificationRunnerCommit' ? /^[a-f0-9]{40}$/u : sha256Pattern;
      if (!pattern.test(value)) throw new Error(`${task.opaqueId}: ${key} is invalid`);
    }
  }
}

function assertExactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.join('\n') !== wanted.join('\n')) {
    throw new Error(`${label} keys must be exactly ${wanted.join(', ')}`);
  }
}

function assertTimestamp(value, label) {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${label} must be a valid timestamp`);
  }
}

function parseArgs(argv) {
  const options = {
    corpusPath: join(benchmarkRoot, 'corpus.json'),
    protocolPath: join(benchmarkRoot, 'protocol.json'),
    pricingPath: join(benchmarkRoot, 'model-proxy', 'pricing.json'),
    developmentCandidatesPath: join(benchmarkRoot, 'tasks', 'development-candidates.json'),
    qualificationCandidatesPath: join(
      repoRoot,
      '.private',
      'benchmark-3-10',
      'task-freeze',
      'qualification-private.json',
    ),
    publicCandidateIndexPath: join(benchmarkRoot, 'tasks', 'qualification-index.json'),
    runtimeMatrixPath: join(benchmarkRoot, 'environments', 'runtime-matrix.locked.json'),
    developmentEvaluatorRoot: join(benchmarkRoot, 'evaluators', 'development'),
    qualificationEvaluatorRoot: join(repoRoot, '.private', 'benchmark-3-10', 'evaluators', 'qualification'),
    developmentDeliveryRoot: join(benchmarkRoot, 'task-context', 'development'),
    qualificationDeliveryRoot: join(repoRoot, '.private', 'benchmark-3-10', 'task-context', 'qualification'),
    developmentEnvironmentRoot: join(benchmarkRoot, 'environments', 'development'),
    qualificationEnvironmentRoot: join(repoRoot, '.private', 'benchmark-3-10', 'environments', 'qualification'),
    developmentReceiptRoot: join(benchmarkRoot, 'evaluators', 'development', 'qualification-receipts'),
    qualificationReceiptRoot: join(
      repoRoot,
      '.private',
      'benchmark-3-10',
      'evaluators',
      'qualification',
      'qualification-receipts',
    ),
    developmentTaskOutputRoot: join(benchmarkRoot, 'tasks', 'development'),
    qualificationTaskOutputRoot: join(repoRoot, '.private', 'benchmark-3-10', 'runnable', 'tasks'),
    qualificationIndexPath: join(repoRoot, '.private', 'benchmark-3-10', 'runnable', 'qualification-index.json'),
    publicBindingPath: join(benchmarkRoot, 'tasks', 'qualification-runnable-index.json'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--sealed-at') options.sealedAt = argv[++index];
    else if (argument === '--corpus') options.corpusPath = resolve(argv[++index]);
    else if (argument === '--protocol') options.protocolPath = resolve(argv[++index]);
    else if (argument === '--pricing') options.pricingPath = resolve(argv[++index]);
    else if (argument === '--development-candidates') options.developmentCandidatesPath = resolve(argv[++index]);
    else if (argument === '--qualification-candidates') options.qualificationCandidatesPath = resolve(argv[++index]);
    else if (argument === '--public-candidate-index') options.publicCandidateIndexPath = resolve(argv[++index]);
    else if (argument === '--runtime-matrix') options.runtimeMatrixPath = resolve(argv[++index]);
    else if (argument === '--development-evaluator-root') options.developmentEvaluatorRoot = resolve(argv[++index]);
    else if (argument === '--qualification-evaluator-root') options.qualificationEvaluatorRoot = resolve(argv[++index]);
    else if (argument === '--development-delivery-root') options.developmentDeliveryRoot = resolve(argv[++index]);
    else if (argument === '--qualification-delivery-root') options.qualificationDeliveryRoot = resolve(argv[++index]);
    else if (argument === '--development-environment-root') options.developmentEnvironmentRoot = resolve(argv[++index]);
    else if (argument === '--qualification-environment-root') options.qualificationEnvironmentRoot = resolve(argv[++index]);
    else if (argument === '--development-receipt-root') options.developmentReceiptRoot = resolve(argv[++index]);
    else if (argument === '--qualification-receipt-root') options.qualificationReceiptRoot = resolve(argv[++index]);
    else if (argument === '--development-task-root') options.developmentTaskOutputRoot = resolve(argv[++index]);
    else if (argument === '--qualification-task-root') options.qualificationTaskOutputRoot = resolve(argv[++index]);
    else if (argument === '--qualification-index') options.qualificationIndexPath = resolve(argv[++index]);
    else if (argument === '--public-binding') options.publicBindingPath = resolve(argv[++index]);
    else if (argument === '--cosign') options.cosignPath = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argument}`);
  }
  if (!options.sealedAt) throw new Error('--sealed-at is required');
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await materializeBenchmarkTasks(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
