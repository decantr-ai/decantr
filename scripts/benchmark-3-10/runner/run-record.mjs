import { canonicalJson } from './canonical.mjs';

export const RUN_CORE_SCHEMA_VERSION = 'decantr-benchmark-run-core.v1';
export const RUN_RECORD_SCHEMA_VERSION = 'decantr-benchmark-run-record.v3';

const SHA256 = /^[a-f0-9]{64}$/u;
const GIT_SHA = /^[a-f0-9]{40}$/u;
const IMAGE_DIGEST = /^sha256:[a-f0-9]{64}$/u;
const STATUSES = [
  'completed',
  'unsupported',
  'agent_failure',
  'model_substitution',
  'evaluator_failure',
  'evaluation_failed',
  'build_failure',
  'harness_failure',
  'budget_failure',
];
const BINDING_KEYS = [
  'agentControllerSha256',
  'agentImageDigest',
  'authorizationSha256',
  'benchmarkImageDigest',
  'candidateManifestSha256',
  'candidateTarballSetSha256',
  'deliverySha256',
  'environmentSha256',
  'environmentSpecSha256',
  'environmentSubstanceSha256',
  'evaluatorContractSha256',
  'evaluatorControllerSha256',
  'informationEntitlementSha256',
  'preparedEnvironmentAttestationSha256',
  'qualificationControllerSha256',
  'qualificationExecutionAttestationFileSha256',
  'qualificationExecutionAttestationSha256',
  'qualificationExecutionControllerSha256',
  'qualificationEvaluatorSourceClosureSha256',
  'qualificationInputManifestFileSha256',
  'qualificationInputManifestSha256',
  'qualificationInputRequestFileSha256',
  'qualificationInputRequestSha256',
  'qualificationProvenanceBundleFileSha256',
  'qualificationProvenanceVerificationSha256',
  'qualificationReceiptFileSha256',
  'qualificationReceiptSha256',
  'qualificationRunnerRepositoryCommit',
  'runPlanSha256',
  'runtimeMatrixFileSha256',
  'runtimeMatrixSha256',
  'taskManifestSha256',
];

export function createRunRecordV3(core, provenance) {
  const checkedCore = assertRunCore(core);
  const record = {
    ...structuredClone(checkedCore),
    schemaVersion: RUN_RECORD_SCHEMA_VERSION,
    provenance: structuredClone(provenance),
  };
  return assertRunRecordV3(record);
}

export function assertRunCore(value) {
  assertExactKeys(
    value,
    [
      'arm',
      'bindings',
      'budget',
      'evaluatorResultSha256',
      'execution',
      'failure',
      'framework',
      'model',
      'partition',
      'repetition',
      'repositoryId',
      'runId',
      'schemaVersion',
      'status',
      'taskId',
      'trajectoryManifestSha256',
      'usage',
      'workspace',
    ],
    'run core',
  );
  if (value.schemaVersion !== RUN_CORE_SCHEMA_VERSION) {
    throw new Error('run core schemaVersion is invalid');
  }
  assertRunBody(value);
  return value;
}

export function assertRunRecordV3(value) {
  assertExactKeys(
    value,
    [
      'arm',
      'bindings',
      'budget',
      'evaluatorResultSha256',
      'execution',
      'failure',
      'framework',
      'model',
      'partition',
      'provenance',
      'repetition',
      'repositoryId',
      'runId',
      'schemaVersion',
      'status',
      'taskId',
      'trajectoryManifestSha256',
      'usage',
      'workspace',
    ],
    'run record',
  );
  if (value.schemaVersion !== RUN_RECORD_SCHEMA_VERSION) {
    throw new Error('release run record must use the v3 split-stage schema');
  }
  assertRunBody(value);
  assertExactKeys(value.provenance, ['agentStage', 'evaluatorStage'], 'run provenance');
  assertStageReference(value.provenance.agentStage, 'agent');
  assertStageReference(value.provenance.evaluatorStage, 'evaluator');
  if (
    value.execution.productionEligible !== true ||
    value.execution.assurance !== 'github-host-split-stage-attested' ||
    value.execution.signedExternalProvenance !== true
  ) {
    throw new Error('release run record is not production-eligible split-stage evidence');
  }
  return value;
}

export function runCoreFromRecord(record) {
  assertRunRecordV3(record);
  const { provenance: _provenance, ...core } = structuredClone(record);
  core.schemaVersion = RUN_CORE_SCHEMA_VERSION;
  return assertRunCore(core);
}

function assertRunBody(value) {
  if (
    typeof value.runId !== 'string' ||
    value.runId === '' ||
    typeof value.taskId !== 'string' ||
    value.taskId === '' ||
    !['development', 'qualification'].includes(value.partition) ||
    typeof value.repositoryId !== 'string' ||
    value.repositoryId === '' ||
    typeof value.framework !== 'string' ||
    value.framework === '' ||
    !['control', 'treatment'].includes(value.arm) ||
    !Number.isInteger(value.repetition) ||
    value.repetition < 1 ||
    !STATUSES.includes(value.status)
  ) {
    throw new Error('run identity or status is invalid');
  }
  assertExecution(value.execution);
  assertBindings(value.bindings);
  assertModel(value.model);
  assertWorkspace(value.workspace);
  assertBudget(value.budget);
  assertUsage(value.usage);
  assertNullableHash(value.trajectoryManifestSha256, 'trajectory manifest digest');
  assertNullableHash(value.evaluatorResultSha256, 'evaluator result digest');
  if (value.failure !== null) {
    assertExactKeys(value.failure, ['code', 'message', 'stage'], 'run failure');
    if (
      !['budget', 'workspace', 'adapter', 'model', 'evaluator', 'build', 'harness'].includes(
        value.failure.stage,
      ) ||
      typeof value.failure.code !== 'string' ||
      value.failure.code === '' ||
      typeof value.failure.message !== 'string' ||
      value.failure.message === ''
    ) {
      throw new Error('run failure is invalid');
    }
  }
  if ((value.status === 'completed') !== (value.failure === null)) {
    throw new Error('run status and failure disagree');
  }
}

function assertExecution(value) {
  assertExactKeys(
    value,
    [
      'agentEvaluatorStageSeparation',
      'assurance',
      'privateOracleAbsentDuringAgentStage',
      'productionEligible',
      'signedExternalProvenance',
    ],
    'run execution',
  );
  if (
    !['local-test-split-stage', 'github-host-split-stage-attested'].includes(value.assurance) ||
    typeof value.productionEligible !== 'boolean' ||
    value.agentEvaluatorStageSeparation !== true ||
    value.privateOracleAbsentDuringAgentStage !== true ||
    typeof value.signedExternalProvenance !== 'boolean'
  ) {
    throw new Error('run execution assurance is invalid');
  }
  if (
    value.productionEligible === true &&
    (value.assurance !== 'github-host-split-stage-attested' ||
      value.signedExternalProvenance !== true)
  ) {
    throw new Error('production eligibility requires signed GitHub-hosted stage separation');
  }
}

function assertBindings(value) {
  assertExactKeys(value, BINDING_KEYS, 'run bindings');
  for (const [key, digest] of Object.entries(value)) {
    if (key === 'qualificationRunnerRepositoryCommit') {
      if (!GIT_SHA.test(digest ?? '')) throw new Error(`${key} is invalid`);
    } else if (key === 'agentImageDigest' || key === 'benchmarkImageDigest') {
      if (!IMAGE_DIGEST.test(digest ?? '')) throw new Error(`${key} is invalid`);
    } else if (!SHA256.test(digest ?? '')) {
      throw new Error(`${key} is invalid`);
    }
  }
}

function assertModel(value) {
  assertExactKeys(
    value,
    ['identityMatched', 'modelId', 'provider', 'requestedModel', 'returnedModel'],
    'run model',
  );
  if (
    typeof value.modelId !== 'string' ||
    value.modelId === '' ||
    !['openai', 'anthropic'].includes(value.provider) ||
    typeof value.requestedModel !== 'string' ||
    value.requestedModel === '' ||
    !(value.returnedModel === null || typeof value.returnedModel === 'string') ||
    typeof value.identityMatched !== 'boolean'
  ) {
    throw new Error('run model identity is invalid');
  }
}

function assertWorkspace(value) {
  assertExactKeys(
    value,
    [
      'afterTree',
      'baseCommit',
      'baseTree',
      'beforeClean',
      'dependencyTreeAfterVerified',
      'dependencyTreeBeforeVerified',
      'diffSha256',
    ],
    'run workspace',
  );
  if (
    !GIT_SHA.test(value.baseCommit ?? '') ||
    !GIT_SHA.test(value.baseTree ?? '') ||
    value.beforeClean !== true ||
    typeof value.dependencyTreeBeforeVerified !== 'boolean' ||
    typeof value.dependencyTreeAfterVerified !== 'boolean' ||
    !(value.afterTree === null || GIT_SHA.test(value.afterTree ?? '')) ||
    !SHA256.test(value.diffSha256 ?? '')
  ) {
    throw new Error('run workspace evidence is invalid');
  }
}

function assertBudget(value) {
  assertExactKeys(value, ['actualUsd', 'approvalId', 'paid', 'reservedUsd'], 'run budget');
  if (
    typeof value.paid !== 'boolean' ||
    !Number.isFinite(value.reservedUsd) ||
    value.reservedUsd < 0 ||
    !Number.isFinite(value.actualUsd) ||
    value.actualUsd < 0 ||
    value.actualUsd > value.reservedUsd + Number.EPSILON ||
    !(value.approvalId === null || (typeof value.approvalId === 'string' && value.approvalId !== ''))
  ) {
    throw new Error('run budget evidence is invalid');
  }
  if (value.paid !== (value.approvalId !== null)) {
    throw new Error('paid run and budget approval identity disagree');
  }
}

function assertUsage(value) {
  assertExactKeys(
    value,
    ['cachedInputTokens', 'durationMs', 'inputTokens', 'outputTokens', 'requests'],
    'run usage',
  );
  for (const [key, item] of Object.entries(value)) {
    if (!Number.isInteger(item) || item < 0) throw new Error(`run usage ${key} is invalid`);
  }
}

function assertStageReference(value, stage) {
  assertExactKeys(
    value,
    [
      'attestationFile',
      'attestationSha256',
      'bundleFile',
      'verificationFile',
      'verificationSha256',
    ],
    `${stage} stage provenance`,
  );
  assertFileBinding(value.attestationFile, `${stage} attestation`);
  assertFileBinding(value.bundleFile, `${stage} bundle`);
  assertFileBinding(value.verificationFile, `${stage} verification`);
  if (
    !SHA256.test(value.attestationSha256 ?? '') ||
    !SHA256.test(value.verificationSha256 ?? '')
  ) {
    throw new Error(`${stage} stage provenance digest is invalid`);
  }
}

function assertFileBinding(value, label) {
  assertExactKeys(value, ['bytes', 'path', 'sha256'], label);
  if (
    typeof value.path !== 'string' ||
    value.path === '' ||
    !SHA256.test(value.sha256 ?? '') ||
    !Number.isInteger(value.bytes) ||
    value.bytes < 1
  ) {
    throw new Error(`${label} file binding is invalid`);
  }
}

function assertNullableHash(value, label) {
  if (value !== null && !SHA256.test(value ?? '')) throw new Error(`${label} is invalid`);
}

function assertExactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (
    actual.length !== expected.length ||
    canonicalJson(actual) !== canonicalJson(expected)
  ) {
    throw new Error(`${label} fields are invalid`);
  }
}
