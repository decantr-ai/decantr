import { prettyCanonicalJson, sha256, sha256Canonical } from '../runner/canonical.mjs';
import { assertRuntimeMatrix, calculateRuntimeMatrixDigest } from './runtime-matrix.mjs';
import {
  CONTROLLER_CLAUDE_CODE_VERSION,
  CONTROLLER_CODEX_VERSION,
  CONTROLLER_IMAGE_REFERENCE,
  RUNTIME_ATTESTATION_SCHEMA_VERSION,
  RUNTIME_BUILD_CONTEXT_ROOTS,
  RUNTIME_BUILD_SUBJECT_SCHEMA_VERSION,
  RUNTIME_CONTROLLER_ROOTS,
  RUNTIME_PREDICATE_TYPE,
  RUNTIME_REPOSITORY,
  RUNTIME_SIGNER_WORKFLOW,
  RUNTIME_SOURCE_CLOSURE_SCHEMA_VERSION,
  RUNTIME_SOURCE_REF,
  calculateRuntimeAttestationDigest,
  calculateRuntimeBuildSubjectDigest,
  runtimeArtifactNames,
  runtimeAttestationFileBinding,
  runtimeBaseImageReference,
  runtimeBenchmarkImageReference,
  runtimeProvenancePolicy,
} from './runtime-profile-attestation.mjs';

const defaultProfile = {
  id: 'node-22.19.0-pnpm-10.33.0',
  os: 'linux',
  arch: 'x64',
  nodeVersion: '22.19.0',
  bunVersion: null,
  packageManager: { name: 'pnpm', version: '10.33.0' },
};

export function makeFixtureRuntimeSourceClosure(options = {}) {
  const source = {
    schemaVersion: RUNTIME_SOURCE_CLOSURE_SCHEMA_VERSION,
    repositoryCommit: options.sourceCommit ?? 'a'.repeat(40),
    policy: 'exact-clean-git-files-v1',
    buildContext: {
      roots: [...RUNTIME_BUILD_CONTEXT_ROOTS],
      fileCount: options.buildContextFileCount ?? 200,
      filesSha256: options.buildContextSha256 ?? '8'.repeat(64),
    },
    controller: {
      roots: [...RUNTIME_CONTROLLER_ROOTS],
      fileCount: options.controllerFileCount ?? 201,
      filesSha256: options.controllerSha256 ?? '9'.repeat(64),
    },
  };
  source.sourceClosureSha256 = sha256Canonical(source);
  return source;
}

export function makeFixtureLockedRuntimeMatrix(options = {}) {
  const sourceProfile = structuredClone(options.profile ?? defaultProfile);
  const draftFrozenAt = options.draftFrozenAt ?? '2026-07-22T17:00:00.000Z';
  const lockedAt = options.lockedAt ?? '2026-07-22T18:00:00.000Z';
  const verifiedAt = options.verifiedAt ?? draftFrozenAt;
  const sourceSpecSetSha256 = options.sourceSpecSetSha256 ?? '4'.repeat(64);
  const profileSha256 = sha256Canonical(sourceProfile);
  const baseImageReference = options.baseImageReference ?? runtimeBaseImageReference(sourceProfile);
  const benchmarkImageTagReference =
    options.benchmarkImageReference ?? runtimeBenchmarkImageReference(sourceProfile.id);
  const benchmarkImageReference = runtimeBenchmarkImageReference(
    sourceProfile.id,
    options.benchmarkImageManifestDigest ?? `sha256:${'3'.repeat(64)}`,
  );
  const draftProfile = {
    ...sourceProfile,
    taskCount: 40,
    profileSha256,
    baseImage: { reference: baseImageReference, digest: null },
    benchmarkImage: { reference: benchmarkImageTagReference, digest: null },
    verification: null,
  };
  const draft = {
    schemaVersion: 'decantr-benchmark-runtime-matrix.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    frozenAt: draftFrozenAt,
    status: 'draft',
    paidExecutionAuthorized: false,
    sourceSpecSetSha256,
    taskCounts: { development: 24, qualification: 16, total: 40, approved: 40 },
    profiles: [draftProfile],
    blockers: { unapprovedTaskSpecs: 0, unbuiltProfiles: 1, unverifiedProfiles: 1 },
  };
  draft.matrixSha256 = calculateRuntimeMatrixDigest(draft);

  const source = makeFixtureRuntimeSourceClosure(options);
  const controller = {
    image: {
      reference: CONTROLLER_IMAGE_REFERENCE,
      digest: options.controllerImageDigest ?? `sha256:${'7'.repeat(64)}`,
    },
    nodeVersion: 'v22.17.0',
    codexVersion: CONTROLLER_CODEX_VERSION,
    claudeCodeVersion: CONTROLLER_CLAUDE_CODE_VERSION,
  };
  const runtimeKind = sourceProfile.nodeVersion === null ? 'bun' : 'node';
  const runtimeVersion = sourceProfile.nodeVersion ?? sourceProfile.bunVersion;
  const execution = {
    repository: RUNTIME_REPOSITORY,
    workflow: RUNTIME_SIGNER_WORKFLOW,
    workflowRef: `${RUNTIME_SIGNER_WORKFLOW}@${RUNTIME_SOURCE_REF}`,
    workflowSha: source.repositoryCommit,
    sourceCommit: source.repositoryCommit,
    sourceRef: RUNTIME_SOURCE_REF,
    runId: options.runId ?? '10001',
    runAttempt: options.runAttempt ?? '1',
    job: 'probe',
    eventName: 'workflow_dispatch',
    runnerEnvironment: 'github-hosted',
    runnerOs: 'Linux',
    runnerArch: 'X64',
    runnerImage: 'ubuntu24',
    runnerImageVersion: '20260720.1',
  };
  const subject = {
    schemaVersion: RUNTIME_BUILD_SUBJECT_SCHEMA_VERSION,
    profileId: sourceProfile.id,
    profileSha256,
    matrix: { draftSha256: draft.matrixSha256, sourceSpecSetSha256 },
    baseImage: {
      reference: baseImageReference,
      digest: options.baseImageDigest ?? `sha256:${'1'.repeat(64)}`,
    },
    benchmarkImage: {
      reference: benchmarkImageReference,
      digest: options.benchmarkImageDigest ?? `sha256:${'2'.repeat(64)}`,
    },
    runtimeKind,
    runtimeVersion,
    packageManagerName: sourceProfile.packageManager.name,
    packageManagerVersion: sourceProfile.packageManager.version,
    controller,
    browserSmokePassed: true,
    verifiedAt,
    host: { os: 'linux', arch: 'x64' },
    source,
    execution,
  };
  subject.subjectSha256 = calculateRuntimeBuildSubjectDigest(subject);
  const names = runtimeArtifactNames(sourceProfile.id);
  const subjectBytes = Buffer.from(prettyCanonicalJson(subject), 'utf8');
  const bundleBytes = Buffer.from(`{"fixture":"${sourceProfile.id}"}\n`, 'utf8');
  const provenanceVerification = [
    {
      attestation: { fixture: true },
      verificationResult: {
        statement: {
          predicateType: RUNTIME_PREDICATE_TYPE,
          subject: [{ name: names.subject, digest: { sha256: sha256(subjectBytes) } }],
        },
      },
    },
  ];
  const verificationBytes = Buffer.from(prettyCanonicalJson(provenanceVerification), 'utf8');
  const attestation = {
    schemaVersion: RUNTIME_ATTESTATION_SCHEMA_VERSION,
    subject,
    provenance: {
      policy: runtimeProvenancePolicy(subject),
      subjectFile: artifactBinding(names.subject, subjectBytes),
      bundleFile: artifactBinding(names.bundle, bundleBytes),
      verificationFile: artifactBinding(names.verification, verificationBytes),
      verificationSha256: sha256Canonical(provenanceVerification),
    },
  };
  attestation.attestationSha256 = calculateRuntimeAttestationDigest(attestation);
  const profile = {
    ...draftProfile,
    baseImage: structuredClone(subject.baseImage),
    benchmarkImage: structuredClone(subject.benchmarkImage),
    verification: {
      attestation,
      attestationFile: runtimeAttestationFileBinding(attestation),
    },
  };
  const matrix = {
    ...draft,
    frozenAt: lockedAt,
    status: 'locked',
    profiles: [profile],
    provenance: {
      draftMatrix: {
        sha256: draft.matrixSha256,
        frozenAt: draft.frozenAt,
        sourceSpecSetSha256,
      },
      source,
      controller,
      executionPolicy: runtimeProvenancePolicy(subject),
    },
    blockers: { unapprovedTaskSpecs: 0, unbuiltProfiles: 0, unverifiedProfiles: 0 },
  };
  matrix.matrixSha256 = calculateRuntimeMatrixDigest(matrix);
  return assertRuntimeMatrix(matrix, { requireLocked: true });
}

function artifactBinding(path, bytes) {
  return { path, sha256: sha256(bytes), bytes: bytes.byteLength };
}
