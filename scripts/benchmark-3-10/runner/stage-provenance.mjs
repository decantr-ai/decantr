import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from './canonical.mjs';
import {
  assertSigstoreKeylessVerification,
  verifySigstoreKeylessBlob,
} from '../provenance/sigstore-keyless.mjs';

export const AGENT_STAGE_SCHEMA_VERSION = 'decantr-benchmark-agent-stage-attestation.v1';
export const EVALUATOR_STAGE_SCHEMA_VERSION =
  'decantr-benchmark-evaluator-stage-attestation.v1';
export const SPLIT_RUN_WORKFLOW_FILE = 'benchmark-3-10-split-run.yml';
export const SPLIT_RUN_SOURCE_REF = 'refs/heads/main';

const SHA256 = /^[a-f0-9]{64}$/u;
const GIT_SHA = /^[a-f0-9]{40}$/u;
const IMAGE_DIGEST = /^sha256:[a-f0-9]{64}$/u;
const REPOSITORIES = {
  development: 'decantr-ai/decantr',
  qualification: 'decantr-ai/decantr-qualification-private',
};

export function createAgentStageAttestation(input) {
  const attestation = {
    schemaVersion: AGENT_STAGE_SCHEMA_VERSION,
    stage: 'agent',
    runId: input.runId,
    taskId: input.taskId,
    partition: input.partition,
    arm: input.arm,
    repetition: input.repetition,
    model: structuredClone(input.model),
    status: input.status,
    productionEligible: input.productionEligible,
    createdAt: input.createdAt,
    execution: structuredClone(input.execution),
    image: structuredClone(input.image),
    controllerSha256: input.controllerSha256,
    bindings: structuredClone(input.bindings),
    isolation: structuredClone(input.isolation),
    output: structuredClone(input.output),
    attestationSha256: null,
  };
  attestation.attestationSha256 = calculateStageAttestationDigest(attestation);
  return assertAgentStageAttestation(attestation);
}

export function createEvaluatorStageAttestation(input) {
  const attestation = {
    schemaVersion: EVALUATOR_STAGE_SCHEMA_VERSION,
    stage: 'evaluator',
    runId: input.runId,
    taskId: input.taskId,
    partition: input.partition,
    arm: input.arm,
    repetition: input.repetition,
    status: input.status,
    productionEligible: input.productionEligible,
    createdAt: input.createdAt,
    execution: structuredClone(input.execution),
    image: structuredClone(input.image),
    controllerSha256: input.controllerSha256,
    agentStage: structuredClone(input.agentStage),
    sealedInput: structuredClone(input.sealedInput),
    isolation: structuredClone(input.isolation),
    reconstruction: structuredClone(input.reconstruction),
    output: structuredClone(input.output),
    attestationSha256: null,
  };
  attestation.attestationSha256 = calculateStageAttestationDigest(attestation);
  return assertEvaluatorStageAttestation(attestation);
}

export function assertAgentStageAttestation(value) {
  assertExactKeys(
    value,
    [
      'arm',
      'attestationSha256',
      'bindings',
      'controllerSha256',
      'createdAt',
      'execution',
      'image',
      'isolation',
      'model',
      'output',
      'partition',
      'productionEligible',
      'repetition',
      'runId',
      'schemaVersion',
      'stage',
      'status',
      'taskId',
    ],
    'agent stage attestation',
  );
  assertIdentity(value, AGENT_STAGE_SCHEMA_VERSION, 'agent');
  assertExecution(value.execution, value.partition, 'agent');
  assertImage(value.image, 'agent image');
  assertHash(value.controllerSha256, 'agent controller digest');
  assertExactKeys(
    value.model,
    ['modelId', 'provider', 'requestedModel'],
    'agent stage model',
  );
  if (
    !['openai', 'anthropic'].includes(value.model.provider) ||
    [value.model.modelId, value.model.requestedModel].some(
      (item) => typeof item !== 'string' || item === '',
    )
  ) {
    throw new Error('agent stage model binding is invalid');
  }
  assertAgentBindings(value.bindings);
  assertExactKeys(
    value.isolation,
    [
      'excludedMaterial',
      'hostConfiguration',
      'inputMaterial',
      'modelNetwork',
      'personalMcp',
      'personalSkills',
      'providerCredentialPresent',
    ],
    'agent stage isolation',
  );
  if (
    canonical(value.isolation.inputMaterial) !==
      canonical(['adapter-request', 'prepared-workspace']) ||
    canonical(value.isolation.excludedMaterial) !==
      canonical([
        'evaluator-contract',
        'evaluator-source',
        'expected-patch',
        'hidden-review',
        'private-oracle',
        'qualification-controller',
      ]) ||
    value.isolation.providerCredentialPresent !== false ||
    value.isolation.personalSkills !== false ||
    value.isolation.personalMcp !== false ||
    value.isolation.hostConfiguration !== false ||
    !['none', 'audited-run-local-proxy-only'].includes(value.isolation.modelNetwork)
  ) {
    throw new Error('agent stage isolation is invalid');
  }
  assertExactKeys(
    value.output,
    [
      'adapterResponseFile',
      'providerReceiptFile',
      'workspaceDeltaFile',
      'workspaceDeltaSha256',
    ],
    'agent stage output',
  );
  assertFileBinding(value.output.adapterResponseFile, 'agent adapter response');
  assertNullableFileBinding(value.output.providerReceiptFile, 'agent provider receipt');
  assertFileBinding(value.output.workspaceDeltaFile, 'agent workspace delta');
  assertHash(value.output.workspaceDeltaSha256, 'agent workspace delta digest');
  assertProductionEligibility(value);
  return value;
}

export function assertEvaluatorStageAttestation(value) {
  assertExactKeys(
    value,
    [
      'agentStage',
      'arm',
      'attestationSha256',
      'controllerSha256',
      'createdAt',
      'execution',
      'image',
      'isolation',
      'output',
      'partition',
      'productionEligible',
      'reconstruction',
      'repetition',
      'runId',
      'schemaVersion',
      'sealedInput',
      'stage',
      'status',
      'taskId',
    ],
    'evaluator stage attestation',
  );
  assertIdentity(value, EVALUATOR_STAGE_SCHEMA_VERSION, 'evaluator');
  assertExecution(value.execution, value.partition, 'evaluator');
  assertImage(value.image, 'evaluator image');
  assertHash(value.controllerSha256, 'evaluator controller digest');
  assertExactKeys(
    value.agentStage,
    ['attestationFile', 'bundleFile', 'verificationFile', 'verificationSha256'],
    'evaluator agent-stage provenance',
  );
  assertFileBinding(value.agentStage.attestationFile, 'agent stage attestation');
  assertFileBinding(value.agentStage.bundleFile, 'agent stage provenance bundle');
  assertFileBinding(value.agentStage.verificationFile, 'agent stage provenance verification');
  assertHash(value.agentStage.verificationSha256, 'agent stage provenance verification digest');
  assertExactKeys(
    value.sealedInput,
    [
      'evaluatorContractSha256',
      'evaluatorSourceClosureSha256',
      'oracleSourceSha256',
      'taskManifestSha256',
    ],
    'evaluator sealed input',
  );
  for (const item of Object.values(value.sealedInput)) assertHash(item, 'evaluator sealed input digest');
  assertExactKeys(
    value.isolation,
    ['agentExitedBeforeMount', 'network', 'providerCredentialsAbsent'],
    'evaluator stage isolation',
  );
  if (
    value.isolation.agentExitedBeforeMount !== true ||
    value.isolation.network !== 'none' ||
    value.isolation.providerCredentialsAbsent !== true
  ) {
    throw new Error('evaluator stage isolation is invalid');
  }
  assertExactKeys(
    value.reconstruction,
    [
      'baseCommit',
      'baseTree',
      'dependencyTreeAfterVerified',
      'dependencyTreeBeforeVerified',
      'workspaceDeltaSha256',
    ],
    'evaluator reconstruction',
  );
  if (
    !GIT_SHA.test(value.reconstruction.baseCommit ?? '') ||
    !GIT_SHA.test(value.reconstruction.baseTree ?? '') ||
    value.reconstruction.dependencyTreeBeforeVerified !== true ||
    value.reconstruction.dependencyTreeAfterVerified !== true
  ) {
    throw new Error('evaluator reconstruction is invalid');
  }
  assertHash(value.reconstruction.workspaceDeltaSha256, 'evaluator workspace delta digest');
  assertExactKeys(
    value.output,
    [
      'authorizationFile',
      'budgetApprovalFile',
      'evaluatorResultFile',
      'powerPilotFile',
      'runCoreFile',
      'trajectoryManifestFile',
      'workspaceChangeFile',
    ],
    'evaluator stage output',
  );
  for (const [key, binding] of Object.entries(value.output)) {
    assertNullableFileBinding(binding, `evaluator output ${key}`);
  }
  assertProductionEligibility(value);
  return value;
}

export function calculateStageAttestationDigest(attestation) {
  const { attestationSha256: _attestationSha256, ...body } = attestation;
  return sha256Canonical(body);
}

export function stageProvenancePolicy(partition, sourceDigest) {
  const repository = REPOSITORIES[partition];
  if (!repository || !GIT_SHA.test(sourceDigest ?? '')) {
    throw new Error('stage provenance partition or source digest is invalid');
  }
  return {
    repository,
    workflowFile: SPLIT_RUN_WORKFLOW_FILE,
    sourceDigest,
    sourceRef: SPLIT_RUN_SOURCE_REF,
    eventName: 'workflow_dispatch',
  };
}

export async function verifyStageProvenance(input) {
  const policy = stageProvenancePolicy(input.partition, input.sourceDigest);
  const verification = await verifySigstoreKeylessBlob({
    subjectPath: input.subjectPath,
    bundlePath: input.bundlePath,
    repository: policy.repository,
    workflowFile: policy.workflowFile,
    sourceDigest: policy.sourceDigest,
    sourceRef: policy.sourceRef,
    eventName: policy.eventName,
    cosignPath: input.cosignPath,
    commandRunner: input.commandRunner,
  });
  return assertStageProvenanceVerification(
    assertSigstoreKeylessVerification(verification),
    policy,
  );
}

export function assertStageProvenanceVerification(verification, policy) {
  assertSigstoreKeylessVerification(verification);
  if (
    verification.policy.repository !== policy.repository ||
    verification.policy.workflowFile !== policy.workflowFile ||
    verification.policy.sourceDigest !== policy.sourceDigest ||
    verification.policy.sourceRef !== policy.sourceRef ||
    verification.policy.eventName !== policy.eventName
  ) {
    throw new Error('stage provenance verification differs from the required signing policy');
  }
  return verification;
}

export async function retainedStageProvenance(input) {
  const subjectPath = resolve(input.subjectPath);
  const bundlePath = resolve(input.bundlePath);
  const verificationPath = resolve(input.verificationPath);
  const [subjectBytes, bundleBytes, verificationBytes] = await Promise.all([
    readFile(subjectPath),
    readFile(bundlePath),
    readFile(verificationPath),
  ]);
  const subject = JSON.parse(subjectBytes);
  if (subject.stage === 'agent') assertAgentStageAttestation(subject);
  else if (subject.stage === 'evaluator') assertEvaluatorStageAttestation(subject);
  else throw new Error('retained stage subject has an invalid stage');
  const verification = assertSigstoreKeylessVerification(JSON.parse(verificationBytes));
  if (verification.subject.sha256 !== sha256(subjectBytes)) {
    throw new Error('stage provenance verification is bound to a different subject');
  }
  if (verification.bundle.sha256 !== sha256(bundleBytes)) {
    throw new Error('stage provenance verification is bound to a different bundle');
  }
  return {
    attestationFile: fileBinding(subjectPath, subjectBytes),
    bundleFile: fileBinding(bundlePath, bundleBytes),
    verificationFile: fileBinding(verificationPath, verificationBytes),
    verificationSha256: verification.verificationSha256,
  };
}

export async function writeStageAttestation(path, attestation) {
  if (attestation.stage === 'agent') assertAgentStageAttestation(attestation);
  else assertEvaluatorStageAttestation(attestation);
  await writeCanonicalFile(path, attestation);
}

export function fileBinding(path, bytes) {
  return {
    path: basename(path),
    sha256: sha256(bytes),
    bytes: bytes.byteLength,
  };
}

function assertIdentity(value, schemaVersion, stage) {
  if (
    value.schemaVersion !== schemaVersion ||
    value.stage !== stage ||
    typeof value.runId !== 'string' ||
    value.runId === '' ||
    typeof value.taskId !== 'string' ||
    value.taskId === '' ||
    !['development', 'qualification'].includes(value.partition) ||
    !['control', 'treatment'].includes(value.arm) ||
    !Number.isInteger(value.repetition) ||
    value.repetition < 1 ||
    !['completed', 'failed', 'unsupported'].includes(value.status) ||
    typeof value.productionEligible !== 'boolean' ||
    !Number.isFinite(Date.parse(value.createdAt ?? '')) ||
    value.attestationSha256 !== calculateStageAttestationDigest(value)
  ) {
    throw new Error(`${stage} stage identity or self digest is invalid`);
  }
}

function assertExecution(execution, partition, expectedJob) {
  assertExactKeys(
    execution,
    [
      'eventName',
      'job',
      'repository',
      'runAttempt',
      'runId',
      'runnerArch',
      'runnerEnvironment',
      'runnerOs',
      'sourceDigest',
      'sourceRef',
      'workflowFile',
    ],
    'stage execution',
  );
  const expectedRepository = REPOSITORIES[partition];
  const local = execution.runnerEnvironment === 'local-test';
  if (
    execution.job !== expectedJob ||
    execution.repository !== expectedRepository ||
    execution.workflowFile !== SPLIT_RUN_WORKFLOW_FILE ||
    !GIT_SHA.test(execution.sourceDigest ?? '') ||
    execution.sourceRef !== SPLIT_RUN_SOURCE_REF ||
    execution.eventName !== 'workflow_dispatch' ||
    typeof execution.runId !== 'string' ||
    execution.runId === '' ||
    typeof execution.runAttempt !== 'string' ||
    execution.runAttempt === '' ||
    (!local &&
      (execution.runnerEnvironment !== 'github-hosted' ||
        execution.runnerOs !== 'Linux' ||
        execution.runnerArch !== 'X64'))
  ) {
    throw new Error('stage execution identity is invalid');
  }
}

function assertAgentBindings(bindings) {
  assertExactKeys(
    bindings,
    [
      'agentImageDigest',
      'authorizationSha256',
      'baseCommit',
      'baseTree',
      'candidateManifestSha256',
      'candidateTarballSetSha256',
      'deliverySha256',
      'environmentSha256',
      'environmentSpecSha256',
      'environmentSubstanceSha256',
      'informationEntitlementSha256',
      'preparedEnvironmentAttestationSha256',
      'requestFileSha256',
      'requestSha256',
      'runPlanSha256',
      'runtimeMatrixSha256',
      'taskManifestSha256',
    ],
    'agent stage bindings',
  );
  for (const [key, item] of Object.entries(bindings)) {
    if (key === 'baseCommit' || key === 'baseTree') {
      if (!GIT_SHA.test(item ?? '')) throw new Error(`agent stage ${key} is invalid`);
    } else if (key === 'agentImageDigest') {
      if (!IMAGE_DIGEST.test(item ?? '')) throw new Error('agent stage image digest is invalid');
    } else {
      assertHash(item, `agent stage ${key}`);
    }
  }
}

function assertImage(image, label) {
  assertExactKeys(image, ['digest', 'reference', 'runtimeProfileId'], label);
  if (
    typeof image.reference !== 'string' ||
    !/@sha256:[a-f0-9]{64}$/u.test(image.reference) ||
    !IMAGE_DIGEST.test(image.digest ?? '') ||
    typeof image.runtimeProfileId !== 'string' ||
    image.runtimeProfileId === ''
  ) {
    throw new Error(`${label} is invalid`);
  }
}

function assertProductionEligibility(value) {
  const githubHosted = value.execution.runnerEnvironment === 'github-hosted';
  if (value.productionEligible === true && !githubHosted) {
    throw new Error(`${value.stage} stage production eligibility differs from execution identity`);
  }
}

function assertFileBinding(binding, label) {
  assertExactKeys(binding, ['bytes', 'path', 'sha256'], label);
  if (
    typeof binding.path !== 'string' ||
    binding.path === '' ||
    binding.path !== basename(binding.path) ||
    !SHA256.test(binding.sha256 ?? '') ||
    !Number.isInteger(binding.bytes) ||
    binding.bytes < 1
  ) {
    throw new Error(`${label} file binding is invalid`);
  }
}

function assertNullableFileBinding(binding, label) {
  if (binding === null) return;
  assertFileBinding(binding, label);
}

function assertHash(value, label) {
  if (!SHA256.test(value ?? '')) throw new Error(`${label} is invalid`);
}

function assertExactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new Error(`${label} fields are invalid`);
  }
}

function canonical(value) {
  return JSON.stringify(value);
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--subject') options.subjectPath = resolve(argv[++index]);
    else if (argument === '--bundle') options.bundlePath = resolve(argv[++index]);
    else if (argument === '--verification') options.verificationPath = resolve(argv[++index]);
    else if (argument === '--partition') options.partition = argv[++index];
    else if (argument === '--source-digest') options.sourceDigest = argv[++index];
    else if (argument === '--cosign') options.cosignPath = resolve(argv[++index]);
    else if (argument === '--out') options.outputPath = resolve(argv[++index]);
    else throw new Error(`unknown option: ${argument}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const verification = await verifyStageProvenance(options);
    if (options.outputPath) await writeCanonicalFile(options.outputPath, verification);
    process.stdout.write(`${prettyCanonicalJson({ ok: true, ...verification })}`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
