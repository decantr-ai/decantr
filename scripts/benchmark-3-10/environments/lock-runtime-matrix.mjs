#!/usr/bin/env node
import { lstat, readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJsonFile, sha256Canonical, writeCanonicalFile } from '../runner/canonical.mjs';
import { assertRuntimeMatrix, calculateRuntimeMatrixDigest } from './runtime-matrix.mjs';
import {
  calculateRuntimeSourceClosure,
  parseRuntimeAttestationFile,
  runtimeAgentImageTagReference,
  runtimeBenchmarkImageTagReference,
  verifyRuntimeAttestationProvenance,
} from './runtime-profile-attestation.mjs';

export {
  assertRuntimeAttestation as assertAttestation,
  calculateRuntimeAttestationDigest,
} from './runtime-profile-attestation.mjs';

const benchmarkRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(benchmarkRoot, '..', '..');

export async function lockRuntimeMatrix(options) {
  const matrix = assertRuntimeMatrix(await readJsonFile(options.matrixPath));
  if (matrix.status !== 'draft') throw new Error('only a draft runtime matrix can be locked');
  if (matrix.taskCounts.approved !== 40 || matrix.blockers.unapprovedTaskSpecs !== 0) {
    throw new Error('all 40 task environment specs require independent approval before runtime lock');
  }
  if (Date.parse(options.lockedAt) < Date.parse(matrix.frozenAt)) {
    throw new Error('matrix lock cannot predate the draft matrix');
  }
  const draftMatrix = {
    sha256: matrix.matrixSha256,
    frozenAt: matrix.frozenAt,
    sourceSpecSetSha256: matrix.sourceSpecSetSha256,
  };
  const files = (await readdir(options.attestationRoot))
    .filter((file) => file.endsWith('.attestation.json'))
    .sort();
  const attestations = new Map();
  for (const file of files) {
    const path = join(options.attestationRoot, file);
    if (!(await lstat(path)).isFile()) throw new Error(`${file}: runtime attestation must be a retained regular file`);
    const bytes = await readFile(path);
    const item = parseRuntimeAttestationFile(bytes);
    const profileId = item.attestation.subject.profileId;
    if (attestations.has(profileId)) throw new Error(`duplicate runtime attestation: ${profileId}`);
    attestations.set(profileId, item);
  }
  if (attestations.size !== matrix.profiles.length) {
    throw new Error(`expected ${matrix.profiles.length} runtime attestations, found ${attestations.size}`);
  }

  const first = attestations.get(matrix.profiles[0].id)?.attestation;
  if (!first) throw new Error('the first reviewed runtime profile attestation is missing');
  const sourceClosureProvider = options.sourceClosureProvider ?? calculateRuntimeSourceClosure;
  const localSource = await sourceClosureProvider({
    repositoryRoot: options.repositoryRoot ?? repositoryRoot,
    sourceCommit: first.subject.execution.sourceCommit,
  });
  if (sha256Canonical(localSource) !== sha256Canonical(first.subject.source)) {
    throw new Error('runtime attestations do not match the exact local reviewed source closure');
  }

  const provenanceVerifier = options.provenanceVerifier ?? verifyRuntimeAttestationProvenance;
  for (const profile of matrix.profiles) {
    const item = attestations.get(profile.id);
    if (!item) throw new Error(`${profile.id}: runtime attestation is missing`);
    const { attestation } = item;
    const subject = attestation.subject;
    if (
      subject.profileSha256 !== profile.profileSha256 ||
      subject.matrix.draftSha256 !== draftMatrix.sha256 ||
      subject.matrix.sourceSpecSetSha256 !== draftMatrix.sourceSpecSetSha256 ||
      subject.host.os !== profile.os ||
      subject.host.arch !== profile.arch ||
      subject.runtimeKind !== (profile.nodeVersion === null ? 'bun' : 'node') ||
      subject.baseImage.reference !== profile.baseImage.reference ||
      runtimeBenchmarkImageTagReference(subject.benchmarkImage.reference) !==
        profile.benchmarkImage.reference ||
      runtimeAgentImageTagReference(subject.agentImage.reference) !==
        profile.agentImage.reference ||
      normalizeVersion(subject.runtimeVersion) !== expectedRuntimeVersion(profile) ||
      subject.packageManagerName !== profile.packageManager.name ||
      normalizeVersion(subject.packageManagerVersion) !== profile.packageManager.version
    ) {
      throw new Error(`${profile.id}: runtime attestation differs from the reviewed profile`);
    }
    if (Date.parse(subject.verifiedAt) < Date.parse(draftMatrix.frozenAt)) {
      throw new Error(`${profile.id}: runtime attestation predates the draft matrix`);
    }
    if (Date.parse(subject.verifiedAt) > Date.parse(options.lockedAt)) {
      throw new Error(`${profile.id}: runtime attestation postdates the matrix lock`);
    }
    if (sha256Canonical(subject.source) !== sha256Canonical(localSource)) {
      throw new Error(`${profile.id}: runtime source closure differs from the reviewed checkout`);
    }
    await provenanceVerifier({
      attestation,
      artifactRoot: options.attestationRoot,
      commandRunner: options.provenanceCommandRunner,
    });
    profile.baseImage.digest = subject.baseImage.digest;
    profile.benchmarkImage = structuredClone(subject.benchmarkImage);
    profile.agentImage = structuredClone(subject.agentImage);
    profile.verification = {
      attestation: structuredClone(attestation),
      attestationFile: structuredClone(item.file),
    };
  }

  for (const { attestation } of attestations.values()) {
    if (
      sha256Canonical(attestation.subject.source) !== sha256Canonical(first.subject.source) ||
      sha256Canonical(attestation.subject.controller) !== sha256Canonical(first.subject.controller) ||
      sha256Canonical(attestation.provenance.policy) !== sha256Canonical(first.provenance.policy)
    ) {
      throw new Error(`${attestation.subject.profileId}: runtime attestation provenance is inconsistent`);
    }
  }
  matrix.status = 'locked';
  matrix.frozenAt = options.lockedAt;
  matrix.provenance = {
    draftMatrix,
    source: structuredClone(first.subject.source),
    controller: structuredClone(first.subject.controller),
    executionPolicy: structuredClone(first.provenance.policy),
  };
  matrix.blockers = { unapprovedTaskSpecs: 0, unbuiltProfiles: 0, unverifiedProfiles: 0 };
  matrix.matrixSha256 = calculateRuntimeMatrixDigest(matrix);
  assertRuntimeMatrix(matrix, { requireLocked: true });
  await writeCanonicalFile(options.outputPath, matrix);
  return { profiles: matrix.profiles.length, matrixSha256: matrix.matrixSha256 };
}

function expectedRuntimeVersion(profile) {
  return profile.nodeVersion ?? profile.bunVersion;
}

function normalizeVersion(value) {
  return String(value ?? '').trim().replace(/^v/u, '');
}

function parseArgs(argv) {
  const options = {
    matrixPath: join(benchmarkRoot, 'environments', 'runtime-matrix.draft.json'),
    attestationRoot: null,
    outputPath: join(benchmarkRoot, 'environments', 'runtime-matrix.locked.json'),
    lockedAt: new Date().toISOString(),
    repositoryRoot,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--matrix') options.matrixPath = resolve(argv[++index]);
    else if (argument === '--attestations') options.attestationRoot = resolve(argv[++index]);
    else if (argument === '--out') options.outputPath = resolve(argv[++index]);
    else if (argument === '--locked-at') options.lockedAt = argv[++index];
    else throw new Error(`Unknown option: ${argument}`);
  }
  if (!options.attestationRoot) throw new Error('--attestations is required');
  if (!Number.isFinite(Date.parse(options.lockedAt))) throw new Error('--locked-at must be a timestamp');
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await lockRuntimeMatrix(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
