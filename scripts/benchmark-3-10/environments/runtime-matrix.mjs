import { sha256Canonical } from '../runner/canonical.mjs';
import {
  RUNTIME_PREDICATE_TYPE,
  RUNTIME_REPOSITORY,
  RUNTIME_SIGNER_WORKFLOW,
  RUNTIME_SOURCE_REF,
  assertRuntimeAttestation,
  assertRuntimeAttestationFileBinding,
  assertRuntimeSourceClosure,
  runtimeBenchmarkImageReference,
  runtimeBenchmarkImageTagReference,
} from './runtime-profile-attestation.mjs';

const sha256Pattern = /^[a-f0-9]{64}$/u;
const imageDigestPattern = /^sha256:[a-f0-9]{64}$/u;
const versionPattern = /^[0-9]+\.[0-9]+\.[0-9]+$/u;

export function calculateRuntimeMatrixDigest(matrix) {
  const { matrixSha256: _ignored, ...body } = matrix;
  return sha256Canonical(body);
}

export function assertRuntimeMatrix(matrix, options = {}) {
  if (
    matrix?.schemaVersion !== 'decantr-benchmark-runtime-matrix.v1' ||
    matrix?.program !== 'decantr-3.10-ui-change-control-proof' ||
    !Number.isFinite(Date.parse(matrix?.frozenAt ?? '')) ||
    !['draft', 'locked'].includes(matrix?.status) ||
    matrix.paidExecutionAuthorized !== false ||
    !sha256Pattern.test(matrix.sourceSpecSetSha256 ?? '') ||
    matrix.taskCounts?.development !== 24 ||
    matrix.taskCounts?.qualification !== 16 ||
    matrix.taskCounts?.total !== 40 ||
    !Array.isArray(matrix.profiles) ||
    matrix.profiles.length === 0 ||
    matrix.matrixSha256 !== calculateRuntimeMatrixDigest(matrix)
  ) {
    throw new Error('runtime matrix identity or self-binding is invalid');
  }
  const provenance = matrix.status === 'locked' ? assertLockedProvenance(matrix) : null;
  if (matrix.status === 'draft' && matrix.provenance != null) {
    throw new Error('draft runtime matrix cannot claim locked provenance');
  }
  const ids = new Set();
  let taskCount = 0;
  for (const profile of matrix.profiles) {
    const manager = profile.packageManager;
    const expectedId = profile.nodeVersion
      ? `node-${profile.nodeVersion}-${manager?.name}-${manager?.version}`
      : `bun-${profile.bunVersion}-${manager?.name}-${manager?.version}`;
    if (
      ids.has(profile.id) ||
      profile.os !== 'linux' ||
      profile.arch !== 'x64' ||
      (profile.nodeVersion === null) === (profile.bunVersion === null) ||
      (profile.nodeVersion !== null && !versionPattern.test(profile.nodeVersion ?? '')) ||
      (profile.bunVersion !== null && !versionPattern.test(profile.bunVersion ?? '')) ||
      !['npm', 'pnpm', 'yarn', 'bun'].includes(manager?.name) ||
      !versionPattern.test(manager?.version ?? '') ||
      profile.id !== expectedId ||
      typeof profile.baseImage?.reference !== 'string' ||
      profile.baseImage.reference.length === 0 ||
      typeof profile.benchmarkImage?.reference !== 'string' ||
      profile.benchmarkImage.reference.length === 0 ||
      runtimeBenchmarkImageTagReference(profile.benchmarkImage.reference) !==
        runtimeBenchmarkImageReference(profile.id) ||
      !sha256Pattern.test(profile.profileSha256 ?? '') ||
      profile.profileSha256 !== sha256Canonical({
        id: profile.id,
        os: profile.os,
        arch: profile.arch,
        nodeVersion: profile.nodeVersion,
        bunVersion: profile.bunVersion,
        packageManager: profile.packageManager,
      }) ||
      !Number.isInteger(profile.taskCount) ||
      profile.taskCount < 1
    ) {
      throw new Error(`${profile.id ?? 'unknown profile'}: runtime matrix profile is invalid`);
    }
    ids.add(profile.id);
    taskCount += profile.taskCount;
    if (
      matrix.status === 'draft' &&
      (profile.baseImage.digest !== null ||
        profile.benchmarkImage.digest !== null ||
        profile.benchmarkImage.reference.includes('@') ||
        profile.verification !== null)
    ) {
      throw new Error(`${profile.id}: draft profile contains unverified image claims`);
    }
    if (matrix.status === 'locked') {
      const verification = profile.verification;
      assertExactKeys(verification, ['attestation', 'attestationFile'], `${profile.id} verification`);
      const attestation = assertRuntimeAttestation(verification.attestation);
      const subject = attestation.subject;
      assertRuntimeAttestationFileBinding(attestation, verification.attestationFile);
      if (
        !imageDigestPattern.test(profile.baseImage?.digest ?? '') ||
        !imageDigestPattern.test(profile.benchmarkImage?.digest ?? '') ||
        subject.profileId !== profile.id ||
        subject.profileSha256 !== profile.profileSha256 ||
        subject.host.os !== profile.os ||
        subject.host.arch !== profile.arch ||
        subject.runtimeKind !== (profile.nodeVersion === null ? 'bun' : 'node') ||
        normalizeVersion(subject.runtimeVersion) !== expectedRuntimeVersion(profile) ||
        subject.packageManagerName !== profile.packageManager.name ||
        normalizeVersion(subject.packageManagerVersion) !== profile.packageManager.version ||
        subject.baseImage.reference !== profile.baseImage.reference ||
        subject.baseImage.digest !== profile.baseImage.digest ||
        subject.benchmarkImage.reference !== profile.benchmarkImage.reference ||
        subject.benchmarkImage.digest !== profile.benchmarkImage.digest ||
        subject.matrix.draftSha256 !== provenance.draftMatrix.sha256 ||
        subject.matrix.sourceSpecSetSha256 !== matrix.sourceSpecSetSha256 ||
        sha256Canonical(subject.source) !== sha256Canonical(provenance.source) ||
        sha256Canonical(subject.controller) !== sha256Canonical(provenance.controller) ||
        sha256Canonical(attestation.provenance.policy) !== sha256Canonical(provenance.executionPolicy) ||
        Date.parse(subject.verifiedAt) < Date.parse(provenance.draftMatrix.frozenAt) ||
        Date.parse(subject.verifiedAt) > Date.parse(matrix.frozenAt)
      ) {
        throw new Error(`${profile.id}: locked profile differs from its runtime attestation or source provenance`);
      }
    }
  }
  if (taskCount !== 40) throw new Error(`runtime matrix profile task count must equal 40, found ${taskCount}`);
  if (
    matrix.taskCounts.approved + matrix.blockers.unapprovedTaskSpecs !== 40 ||
    (matrix.status === 'draft' &&
      (matrix.blockers.unbuiltProfiles !== matrix.profiles.length ||
        matrix.blockers.unverifiedProfiles !== matrix.profiles.length))
  ) {
    throw new Error('runtime matrix blocker arithmetic is invalid');
  }
  if (options.requireLocked && matrix.status !== 'locked') throw new Error('runtime matrix must be locked');
  if (matrix.status === 'locked') {
    if (
      matrix.taskCounts.approved !== 40 ||
      matrix.blockers?.unapprovedTaskSpecs !== 0 ||
      matrix.blockers?.unbuiltProfiles !== 0 ||
      matrix.blockers?.unverifiedProfiles !== 0
    ) {
      throw new Error('locked runtime matrix still reports blockers');
    }
    if (provenance.draftMatrix.sha256 !== calculateReconstructedDraftDigest(matrix)) {
      throw new Error('locked runtime matrix differs from its attested draft matrix');
    }
  }
  return matrix;
}

function assertLockedProvenance(matrix) {
  const provenance = matrix.provenance;
  assertExactKeys(
    provenance,
    ['controller', 'draftMatrix', 'executionPolicy', 'source'],
    'locked runtime provenance',
  );
  assertExactKeys(
    provenance.draftMatrix,
    ['frozenAt', 'sha256', 'sourceSpecSetSha256'],
    'locked runtime draft binding',
  );
  assertRuntimeSourceClosure(provenance.source);
  assertExactKeys(
    provenance.controller,
    ['claudeCodeVersion', 'codexVersion', 'image', 'nodeVersion'],
    'locked runtime controller binding',
  );
  assertExactKeys(provenance.controller.image, ['digest', 'reference'], 'locked controller image binding');
  assertExactKeys(
    provenance.executionPolicy,
    [
      'denySelfHostedRunners',
      'predicateType',
      'repository',
      'signerDigest',
      'signerWorkflow',
      'sourceDigest',
      'sourceRef',
    ],
    'locked runtime execution policy',
  );
  if (
    !sha256Pattern.test(provenance.draftMatrix?.sha256 ?? '') ||
    !sha256Pattern.test(provenance.draftMatrix?.sourceSpecSetSha256 ?? '') ||
    provenance.draftMatrix.sourceSpecSetSha256 !== matrix.sourceSpecSetSha256 ||
    !Number.isFinite(Date.parse(provenance.draftMatrix.frozenAt ?? '')) ||
    Date.parse(provenance.draftMatrix.frozenAt) > Date.parse(matrix.frozenAt) ||
    typeof provenance.controller?.image?.reference !== 'string' ||
    !imageDigestPattern.test(provenance.controller?.image?.digest ?? '') ||
    provenance.executionPolicy.repository !== RUNTIME_REPOSITORY ||
    provenance.executionPolicy.signerWorkflow !== RUNTIME_SIGNER_WORKFLOW ||
    provenance.executionPolicy.signerDigest !== provenance.source.repositoryCommit ||
    provenance.executionPolicy.sourceDigest !== provenance.source.repositoryCommit ||
    provenance.executionPolicy.sourceRef !== RUNTIME_SOURCE_REF ||
    provenance.executionPolicy.predicateType !== RUNTIME_PREDICATE_TYPE ||
    provenance.executionPolicy.denySelfHostedRunners !== true
  ) {
    throw new Error('locked runtime provenance is invalid');
  }
  return provenance;
}

function calculateReconstructedDraftDigest(matrix) {
  const draft = {
    schemaVersion: matrix.schemaVersion,
    program: matrix.program,
    frozenAt: matrix.provenance.draftMatrix.frozenAt,
    status: 'draft',
    paidExecutionAuthorized: false,
    sourceSpecSetSha256: matrix.sourceSpecSetSha256,
    taskCounts: structuredClone(matrix.taskCounts),
    profiles: matrix.profiles.map((profile) => ({
      id: profile.id,
      os: profile.os,
      arch: profile.arch,
      nodeVersion: profile.nodeVersion,
      bunVersion: profile.bunVersion,
      packageManager: structuredClone(profile.packageManager),
      taskCount: profile.taskCount,
      profileSha256: profile.profileSha256,
      baseImage: { reference: profile.baseImage.reference, digest: null },
      benchmarkImage: {
        reference: runtimeBenchmarkImageTagReference(profile.benchmarkImage.reference),
        digest: null,
      },
      verification: null,
    })),
    blockers: {
      unapprovedTaskSpecs: 0,
      unbuiltProfiles: matrix.profiles.length,
      unverifiedProfiles: matrix.profiles.length,
    },
  };
  draft.matrixSha256 = calculateRuntimeMatrixDigest(draft);
  return draft.matrixSha256;
}

function expectedRuntimeVersion(profile) {
  return profile.nodeVersion ?? profile.bunVersion;
}

function normalizeVersion(value) {
  return String(value ?? '').trim().replace(/^v/u, '');
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
