#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from '../runner/canonical.mjs';
import { runFixed, sanitizedEnvironment } from '../runner/process.mjs';

const environmentRoot = dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = resolve(environmentRoot, '..', '..', '..');
const sha256Pattern = /^[a-f0-9]{64}$/u;
const gitCommitPattern = /^[a-f0-9]{40}$/u;
const imageDigestPattern = /^sha256:[a-f0-9]{64}$/u;
const versionPattern = /^[0-9]+\.[0-9]+\.[0-9]+$/u;
const profileIdPattern = /^(?:node|bun)-[0-9]+\.[0-9]+\.[0-9]+-(?:npm|pnpm|yarn|bun)-[0-9]+\.[0-9]+\.[0-9]+$/u;
const positiveIntegerPattern = /^[1-9][0-9]*$/u;

export const RUNTIME_ATTESTATION_SCHEMA_VERSION =
  'decantr-benchmark-runtime-profile-attestation.v2';
export const RUNTIME_BUILD_SUBJECT_SCHEMA_VERSION =
  'decantr-benchmark-runtime-profile-build-subject.v1';
export const RUNTIME_SOURCE_CLOSURE_SCHEMA_VERSION =
  'decantr-benchmark-runtime-source-closure.v1';
export const RUNTIME_REPOSITORY = 'decantr-ai/decantr';
export const RUNTIME_SIGNER_WORKFLOW =
  'decantr-ai/decantr/.github/workflows/benchmark-3-10-runtime-profiles.yml';
export const RUNTIME_SOURCE_REF = 'refs/heads/main';
export const RUNTIME_PREDICATE_TYPE = 'https://slsa.dev/provenance/v1';
export const RUNTIME_BENCHMARK_IMAGE_REPOSITORY =
  'ghcr.io/decantr-ai/decantr-benchmark-3-10';
export const RUNTIME_BUILD_CONTEXT_ROOTS = Object.freeze([
  '.dockerignore',
  'scripts/benchmark-3-10',
]);
export const RUNTIME_CONTROLLER_ROOTS = Object.freeze([
  '.dockerignore',
  '.github/workflows/benchmark-3-10-runtime-profiles.yml',
  'scripts/benchmark-3-10',
]);
export const CONTROLLER_IMAGE_REFERENCE = 'node:22.17.0-bookworm-slim';
export const CONTROLLER_NODE_VERSION = '22.17.0';
export const CONTROLLER_CODEX_VERSION = '0.145.0-alpha.27';
export const CONTROLLER_CLAUDE_CODE_VERSION = '2.1.153';

export function runtimeBaseImageReference(profile) {
  if (typeof profile?.nodeVersion === 'string') {
    const major = Number(profile.nodeVersion.split('.')[0]);
    if (!Number.isInteger(major) || major < 1) throw new Error('runtime Node version is invalid');
    const distribution = major < 12 ? 'stretch' : major < 18 ? 'buster' : 'bookworm';
    return `node:${profile.nodeVersion}-${distribution}-slim`;
  }
  if (typeof profile?.bunVersion === 'string') {
    return `oven/bun:${profile.bunVersion}-debian`;
  }
  throw new Error('runtime profile version is invalid');
}

export function runtimeBenchmarkImageReference(profileId, manifestDigest = null) {
  if (!profileIdPattern.test(profileId ?? '')) throw new Error('runtime profile ID is invalid');
  const tag = `${RUNTIME_BENCHMARK_IMAGE_REPOSITORY}:${profileId}`;
  if (manifestDigest === null) return tag;
  if (!imageDigestPattern.test(manifestDigest)) {
    throw new Error('runtime benchmark image manifest digest is invalid');
  }
  return `${tag}@${manifestDigest}`;
}

export function runtimeBenchmarkImageTagReference(reference) {
  if (typeof reference !== 'string' || reference.length === 0) {
    throw new Error('runtime benchmark image reference is invalid');
  }
  const parts = reference.split('@');
  if (parts.length > 2 || (parts.length === 2 && !imageDigestPattern.test(parts[1]))) {
    throw new Error('runtime benchmark image reference is invalid');
  }
  return parts[0];
}

export function calculateRuntimeBuildSubjectDigest(subject) {
  const { subjectSha256: _ignored, ...body } = subject;
  return sha256Canonical(body);
}

export function calculateRuntimeAttestationDigest(attestation) {
  const { attestationSha256: _ignored, ...body } = attestation;
  return sha256Canonical(body);
}

export function runtimeAttestationFileBinding(attestation) {
  const bytes = Buffer.from(prettyCanonicalJson(attestation), 'utf8');
  return { sha256: sha256(bytes), bytes: bytes.byteLength };
}

export function runtimeArtifactNames(profileId) {
  if (!profileIdPattern.test(profileId ?? '')) throw new Error('runtime profile ID is invalid');
  return {
    subject: `${profileId}.subject.json`,
    bundle: `${profileId}.provenance.jsonl`,
    verification: `${profileId}.provenance-verification.json`,
    attestation: `${profileId}.attestation.json`,
  };
}

export async function calculateRuntimeSourceClosure(options = {}) {
  const repositoryRoot = resolve(options.repositoryRoot ?? defaultRepositoryRoot);
  const sourceCommit = options.sourceCommit ?? gitText(repositoryRoot, ['rev-parse', 'HEAD']).trim();
  if (!gitCommitPattern.test(sourceCommit)) throw new Error('runtime source commit is invalid');
  const resolvedCommit = gitText(repositoryRoot, ['rev-parse', '--verify', `${sourceCommit}^{commit}`]).trim();
  const headCommit = gitText(repositoryRoot, ['rev-parse', 'HEAD']).trim();
  if (resolvedCommit !== sourceCommit || headCommit !== sourceCommit) {
    throw new Error('runtime source closure must be calculated from the exact checked-out commit');
  }

  const buildContext = await calculateGitClosure(repositoryRoot, sourceCommit, RUNTIME_BUILD_CONTEXT_ROOTS);
  const controller = await calculateGitClosure(repositoryRoot, sourceCommit, RUNTIME_CONTROLLER_ROOTS);
  const closure = {
    schemaVersion: RUNTIME_SOURCE_CLOSURE_SCHEMA_VERSION,
    repositoryCommit: sourceCommit,
    policy: 'exact-clean-git-files-v1',
    buildContext,
    controller,
  };
  closure.sourceClosureSha256 = sha256Canonical(closure);
  return assertRuntimeSourceClosure(closure);
}

export function assertRuntimeSourceClosure(closure) {
  assertExactKeys(
    closure,
    ['buildContext', 'controller', 'policy', 'repositoryCommit', 'schemaVersion', 'sourceClosureSha256'],
    'runtime source closure',
  );
  assertSourceClosurePart(closure.buildContext, RUNTIME_BUILD_CONTEXT_ROOTS, 'runtime build-context closure');
  assertSourceClosurePart(closure.controller, RUNTIME_CONTROLLER_ROOTS, 'runtime controller closure');
  if (
    closure.schemaVersion !== RUNTIME_SOURCE_CLOSURE_SCHEMA_VERSION ||
    !gitCommitPattern.test(closure.repositoryCommit ?? '') ||
    closure.policy !== 'exact-clean-git-files-v1' ||
    closure.sourceClosureSha256 !== sha256Canonical(withoutKey(closure, 'sourceClosureSha256'))
  ) {
    throw new Error('runtime source closure is invalid');
  }
  return closure;
}

export function assertRuntimeBuildSubject(subject) {
  if (!subject || typeof subject !== 'object' || Array.isArray(subject)) {
    throw new Error('runtime build subject must be an object');
  }
  assertExactKeys(
    subject,
    [
      'baseImage',
      'benchmarkImage',
      'browserSmokePassed',
      'controller',
      'execution',
      'host',
      'matrix',
      'packageManagerName',
      'packageManagerVersion',
      'profileId',
      'profileSha256',
      'runtimeKind',
      'runtimeVersion',
      'schemaVersion',
      'source',
      'subjectSha256',
      'verifiedAt',
    ],
    'runtime build subject',
  );
  assertExactKeys(subject.matrix, ['draftSha256', 'sourceSpecSetSha256'], 'runtime build subject matrix binding');
  assertImage(subject.baseImage, 'runtime build subject base image');
  assertImmutableBenchmarkImage(subject.benchmarkImage, subject.profileId);
  assertController(subject.controller);
  assertExactKeys(subject.host, ['arch', 'os'], 'runtime build subject host');
  assertRuntimeSourceClosure(subject.source);
  assertRuntimeExecutionIdentity(subject.execution);

  const profile = profileFromSubject(subject);
  if (
    subject.schemaVersion !== RUNTIME_BUILD_SUBJECT_SCHEMA_VERSION ||
    !profileIdPattern.test(subject.profileId ?? '') ||
    !sha256Pattern.test(subject.profileSha256 ?? '') ||
    !sha256Pattern.test(subject.matrix?.draftSha256 ?? '') ||
    !sha256Pattern.test(subject.matrix?.sourceSpecSetSha256 ?? '') ||
    !['node', 'bun'].includes(subject.runtimeKind) ||
    !versionPattern.test(subject.runtimeVersion ?? '') ||
    !['npm', 'pnpm', 'yarn', 'bun'].includes(subject.packageManagerName) ||
    !versionPattern.test(subject.packageManagerVersion ?? '') ||
    subject.profileId !== expectedProfileId(subject) ||
    subject.profileSha256 !== sha256Canonical(profile) ||
    subject.baseImage.reference !== runtimeBaseImageReference(profile) ||
    subject.browserSmokePassed !== true ||
    subject.host?.os !== 'linux' ||
    subject.host?.arch !== 'x64' ||
    subject.source.repositoryCommit !== subject.execution.sourceCommit ||
    !Number.isFinite(Date.parse(subject.verifiedAt ?? '')) ||
    subject.subjectSha256 !== calculateRuntimeBuildSubjectDigest(subject)
  ) {
    throw new Error(`${subject.profileId ?? 'unknown profile'}: runtime build subject is invalid`);
  }
  return subject;
}

export function parseRuntimeBuildSubjectFile(input) {
  const bytes = Buffer.isBuffer(input) ? input : Buffer.from(input);
  let subject;
  try {
    subject = JSON.parse(bytes.toString('utf8'));
  } catch {
    throw new Error('runtime build subject file is not valid JSON');
  }
  assertRuntimeBuildSubject(subject);
  const canonicalBytes = Buffer.from(prettyCanonicalJson(subject), 'utf8');
  if (!bytes.equals(canonicalBytes)) {
    throw new Error(`${subject.profileId}: runtime build subject file is not canonical`);
  }
  return { subject, bytes, file: artifactFileBinding(runtimeArtifactNames(subject.profileId).subject, bytes) };
}

export function parseRuntimeAttestationFile(input) {
  const bytes = Buffer.isBuffer(input) ? input : Buffer.from(input);
  let attestation;
  try {
    attestation = JSON.parse(bytes.toString('utf8'));
  } catch {
    throw new Error('runtime attestation file is not valid JSON');
  }
  assertRuntimeAttestation(attestation);
  const canonicalBytes = Buffer.from(prettyCanonicalJson(attestation), 'utf8');
  if (!bytes.equals(canonicalBytes)) {
    throw new Error(`${attestation.subject.profileId}: runtime attestation file is not canonical`);
  }
  return { attestation, file: runtimeAttestationFileBinding(attestation) };
}

export function assertRuntimeAttestationFileBinding(attestation, binding) {
  assertExactKeys(binding, ['bytes', 'sha256'], 'runtime attestation file binding');
  const expected = runtimeAttestationFileBinding(attestation);
  if (
    !sha256Pattern.test(binding?.sha256 ?? '') ||
    !Number.isInteger(binding?.bytes) ||
    binding.bytes < 1 ||
    binding.sha256 !== expected.sha256 ||
    binding.bytes !== expected.bytes
  ) {
    throw new Error(`${attestation?.subject?.profileId ?? 'unknown profile'}: runtime attestation file binding is invalid`);
  }
  return binding;
}

export function assertRuntimeAttestation(attestation) {
  if (!attestation || typeof attestation !== 'object' || Array.isArray(attestation)) {
    throw new Error('runtime attestation must be an object');
  }
  assertExactKeys(
    attestation,
    ['attestationSha256', 'provenance', 'schemaVersion', 'subject'],
    'runtime attestation',
  );
  const subject = assertRuntimeBuildSubject(attestation.subject);
  const names = runtimeArtifactNames(subject.profileId);
  assertRuntimeProvenance(attestation.provenance, subject, names);
  if (
    attestation.schemaVersion !== RUNTIME_ATTESTATION_SCHEMA_VERSION ||
    attestation.attestationSha256 !== calculateRuntimeAttestationDigest(attestation)
  ) {
    throw new Error(`${subject.profileId}: runtime attestation is invalid`);
  }
  return attestation;
}

export async function finalizeRuntimeProfileAttestation(options) {
  const artifactRoot = resolveRequiredPath(options.artifactRoot, 'artifactRoot');
  const names = runtimeArtifactNames(options.profileId);
  const subjectPath = join(artifactRoot, names.subject);
  const bundlePath = join(artifactRoot, names.bundle);
  await assertRegularRetainedFile(subjectPath, `${options.profileId}: runtime build subject`);
  await assertRegularRetainedFile(bundlePath, `${options.profileId}: provenance bundle`);
  const subjectItem = parseRuntimeBuildSubjectFile(await readFile(subjectPath));
  if (subjectItem.subject.profileId !== options.profileId) {
    throw new Error('runtime build subject profile differs from the requested profile');
  }
  const bundleBytes = await readFile(bundlePath);
  if (bundleBytes.byteLength === 0) throw new Error(`${options.profileId}: provenance bundle is empty`);
  const verification = await runRuntimeProvenanceVerification({
    subjectPath,
    bundlePath,
    subject: subjectItem.subject,
    commandRunner: options.commandRunner,
  });
  const verificationPath = join(artifactRoot, names.verification);
  await writeCanonicalFile(verificationPath, verification);
  const verificationBytes = await readFile(verificationPath);
  const attestation = {
    schemaVersion: RUNTIME_ATTESTATION_SCHEMA_VERSION,
    subject: subjectItem.subject,
    provenance: {
      policy: runtimeProvenancePolicy(subjectItem.subject),
      subjectFile: artifactFileBinding(names.subject, subjectItem.bytes),
      bundleFile: artifactFileBinding(names.bundle, bundleBytes),
      verificationFile: artifactFileBinding(names.verification, verificationBytes),
      verificationSha256: sha256Canonical(verification),
    },
  };
  attestation.attestationSha256 = calculateRuntimeAttestationDigest(attestation);
  assertRuntimeAttestation(attestation);
  const attestationPath = join(artifactRoot, names.attestation);
  await writeCanonicalFile(attestationPath, attestation);
  return { profileId: options.profileId, attestationPath, verificationPath };
}

export async function verifyRuntimeAttestationProvenance(options) {
  const attestation = assertRuntimeAttestation(options.attestation);
  const artifactRoot = resolveRequiredPath(options.artifactRoot, 'artifactRoot');
  const names = runtimeArtifactNames(attestation.subject.profileId);
  const subjectPath = join(artifactRoot, names.subject);
  const bundlePath = join(artifactRoot, names.bundle);
  const verificationPath = join(artifactRoot, names.verification);
  await Promise.all([
    assertRegularRetainedFile(subjectPath, `${attestation.subject.profileId}: runtime build subject`),
    assertRegularRetainedFile(bundlePath, `${attestation.subject.profileId}: provenance bundle`),
    assertRegularRetainedFile(
      verificationPath,
      `${attestation.subject.profileId}: provenance verification`,
    ),
  ]);
  const subjectBytes = await readFile(subjectPath);
  const bundleBytes = await readFile(bundlePath);
  const verificationBytes = await readFile(verificationPath);

  assertArtifactFile(attestation.provenance.subjectFile, names.subject, subjectBytes, 'runtime provenance subject');
  assertArtifactFile(attestation.provenance.bundleFile, names.bundle, bundleBytes, 'runtime provenance bundle');
  assertArtifactFile(
    attestation.provenance.verificationFile,
    names.verification,
    verificationBytes,
    'runtime provenance verification',
  );
  const retainedSubject = parseRuntimeBuildSubjectFile(subjectBytes).subject;
  if (sha256Canonical(retainedSubject) !== sha256Canonical(attestation.subject)) {
    throw new Error(`${attestation.subject.profileId}: retained provenance subject differs from the attestation`);
  }
  const retainedVerification = parseCanonicalJsonFile(
    verificationBytes,
    `${attestation.subject.profileId}: provenance verification`,
  );
  assertRuntimeProvenanceVerification(retainedVerification, attestation.subject);
  const liveVerification = await runRuntimeProvenanceVerification({
    subjectPath,
    bundlePath,
    subject: attestation.subject,
    commandRunner: options.commandRunner,
  });
  if (
    sha256Canonical(retainedVerification) !== attestation.provenance.verificationSha256 ||
    sha256Canonical(liveVerification) !== attestation.provenance.verificationSha256
  ) {
    throw new Error(`${attestation.subject.profileId}: offline provenance verification differs from retained evidence`);
  }
  return {
    profileId: attestation.subject.profileId,
    policy: structuredClone(attestation.provenance.policy),
    subjectFileSha256: attestation.provenance.subjectFile.sha256,
    bundleFileSha256: attestation.provenance.bundleFile.sha256,
    verificationFileSha256: attestation.provenance.verificationFile.sha256,
    verificationSha256: attestation.provenance.verificationSha256,
  };
}

export function runtimeProvenancePolicy(subject) {
  assertRuntimeBuildSubject(subject);
  return {
    repository: RUNTIME_REPOSITORY,
    signerWorkflow: RUNTIME_SIGNER_WORKFLOW,
    signerDigest: subject.execution.sourceCommit,
    sourceDigest: subject.execution.sourceCommit,
    sourceRef: RUNTIME_SOURCE_REF,
    predicateType: RUNTIME_PREDICATE_TYPE,
    denySelfHostedRunners: true,
  };
}

export function assertRuntimeProvenancePolicy(policy, subject) {
  assertExactKeys(
    policy,
    [
      'denySelfHostedRunners',
      'predicateType',
      'repository',
      'signerDigest',
      'signerWorkflow',
      'sourceDigest',
      'sourceRef',
    ],
    'runtime provenance policy',
  );
  const expected = runtimeProvenancePolicy(subject);
  if (sha256Canonical(policy) !== sha256Canonical(expected)) {
    throw new Error(`${subject.profileId}: runtime provenance policy is not trusted`);
  }
  return policy;
}

function assertRuntimeProvenance(provenance, subject, names) {
  assertExactKeys(
    provenance,
    ['bundleFile', 'policy', 'subjectFile', 'verificationFile', 'verificationSha256'],
    'runtime provenance binding',
  );
  assertRuntimeProvenancePolicy(provenance.policy, subject);
  assertArtifactBinding(provenance.subjectFile, names.subject, 'runtime provenance subject binding');
  assertArtifactBinding(provenance.bundleFile, names.bundle, 'runtime provenance bundle binding');
  assertArtifactBinding(provenance.verificationFile, names.verification, 'runtime provenance verification binding');
  const expectedSubject = artifactFileBinding(
    names.subject,
    Buffer.from(prettyCanonicalJson(subject), 'utf8'),
  );
  if (
    sha256Canonical(provenance.subjectFile) !== sha256Canonical(expectedSubject) ||
    !sha256Pattern.test(provenance.verificationSha256 ?? '')
  ) {
    throw new Error(`${subject.profileId}: runtime provenance binding is invalid`);
  }
}

async function runRuntimeProvenanceVerification(options) {
  const policy = runtimeProvenancePolicy(options.subject);
  const execute = options.commandRunner ?? defaultCommandRunner;
  const result = await execute('gh', [
    'attestation',
    'verify',
    options.subjectPath,
    '--repo',
    policy.repository,
    '--bundle',
    options.bundlePath,
    '--signer-workflow',
    policy.signerWorkflow,
    '--signer-digest',
    policy.signerDigest,
    '--source-digest',
    policy.sourceDigest,
    '--source-ref',
    policy.sourceRef,
    '--predicate-type',
    policy.predicateType,
    '--deny-self-hosted-runners',
    '--format',
    'json',
  ]);
  if (result.exitCode !== 0) {
    throw new Error(
      `GitHub runtime provenance verification failed: ${(result.stderr || result.stdout || '').trim()}`,
    );
  }
  let verification;
  try {
    verification = JSON.parse(result.stdout);
  } catch {
    throw new Error('GitHub runtime provenance verification did not return JSON');
  }
  return assertRuntimeProvenanceVerification(verification, options.subject);
}

function assertRuntimeProvenanceVerification(verification, subject) {
  const subjectFileSha256 = sha256(Buffer.from(prettyCanonicalJson(subject), 'utf8'));
  if (!Array.isArray(verification) || verification.length === 0) {
    throw new Error('GitHub runtime provenance verification returned no verified attestations');
  }
  for (const item of verification) {
    const statement = item?.verificationResult?.statement;
    const matchingSubject = statement?.subject?.some(
      (entry) => entry?.digest?.sha256 === subjectFileSha256,
    );
    if (
      !item?.attestation ||
      statement?.predicateType !== RUNTIME_PREDICATE_TYPE ||
      !matchingSubject
    ) {
      throw new Error('GitHub runtime provenance verification output is incomplete or mismatched');
    }
  }
  return verification;
}

function assertRuntimeExecutionIdentity(execution) {
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
      'runnerImage',
      'runnerImageVersion',
      'runnerOs',
      'sourceCommit',
      'sourceRef',
      'workflow',
      'workflowRef',
      'workflowSha',
    ],
    'runtime GitHub execution identity',
  );
  if (
    execution.repository !== RUNTIME_REPOSITORY ||
    execution.workflow !== RUNTIME_SIGNER_WORKFLOW ||
    execution.workflowRef !== `${RUNTIME_SIGNER_WORKFLOW}@${RUNTIME_SOURCE_REF}` ||
    !gitCommitPattern.test(execution.sourceCommit ?? '') ||
    execution.workflowSha !== execution.sourceCommit ||
    execution.sourceRef !== RUNTIME_SOURCE_REF ||
    !positiveIntegerPattern.test(execution.runId ?? '') ||
    !positiveIntegerPattern.test(execution.runAttempt ?? '') ||
    execution.job !== 'probe' ||
    execution.eventName !== 'workflow_dispatch' ||
    execution.runnerEnvironment !== 'github-hosted' ||
    execution.runnerOs !== 'Linux' ||
    execution.runnerArch !== 'X64' ||
    typeof execution.runnerImage !== 'string' ||
    execution.runnerImage.length === 0 ||
    typeof execution.runnerImageVersion !== 'string' ||
    execution.runnerImageVersion.length === 0
  ) {
    throw new Error('runtime profile requires an exact GitHub-hosted execution identity');
  }
  return execution;
}

function profileFromSubject(subject) {
  return {
    id: subject.profileId,
    os: subject.host?.os,
    arch: subject.host?.arch,
    nodeVersion: subject.runtimeKind === 'node' ? subject.runtimeVersion : null,
    bunVersion: subject.runtimeKind === 'bun' ? subject.runtimeVersion : null,
    packageManager: {
      name: subject.packageManagerName,
      version: subject.packageManagerVersion,
    },
  };
}

function expectedProfileId(subject) {
  return `${subject.runtimeKind}-${subject.runtimeVersion}-${subject.packageManagerName}-${subject.packageManagerVersion}`;
}

function assertController(controller) {
  assertExactKeys(
    controller,
    ['claudeCodeVersion', 'codexVersion', 'image', 'nodeVersion'],
    'runtime build subject controller',
  );
  assertImage(controller?.image, 'runtime build subject controller image');
  if (
    controller.image.reference !== CONTROLLER_IMAGE_REFERENCE ||
    normalizeVersion(controller.nodeVersion) !== CONTROLLER_NODE_VERSION ||
    controller.codexVersion !== CONTROLLER_CODEX_VERSION ||
    controller.claudeCodeVersion !== CONTROLLER_CLAUDE_CODE_VERSION
  ) {
    throw new Error('runtime build subject controller is invalid');
  }
}

function assertImage(image, label) {
  assertExactKeys(image, ['digest', 'reference'], label);
  if (
    typeof image?.reference !== 'string' ||
    image.reference.length === 0 ||
    !imageDigestPattern.test(image.digest ?? '')
  ) {
    throw new Error(`${label} is invalid`);
  }
}

function assertImmutableBenchmarkImage(image, profileId) {
  assertImage(image, 'runtime build subject benchmark image');
  const referenceParts = image.reference.split('@');
  if (
    referenceParts.length !== 2 ||
    referenceParts[0] !== runtimeBenchmarkImageReference(profileId) ||
    !imageDigestPattern.test(referenceParts[1])
  ) {
    throw new Error('runtime build subject benchmark image must be an immutable GHCR reference');
  }
}

function assertSourceClosurePart(value, roots, label) {
  assertExactKeys(value, ['fileCount', 'filesSha256', 'roots'], label);
  if (
    !Array.isArray(value.roots) ||
    sha256Canonical(value.roots) !== sha256Canonical(roots) ||
    !Number.isInteger(value.fileCount) ||
    value.fileCount < roots.length ||
    !sha256Pattern.test(value.filesSha256 ?? '')
  ) {
    throw new Error(`${label} is invalid`);
  }
}

async function calculateGitClosure(repositoryRoot, sourceCommit, roots) {
  const output = gitText(repositoryRoot, [
    'ls-tree',
    '-r',
    '-z',
    '--full-tree',
    sourceCommit,
    '--',
    ...roots,
  ]);
  const entries = output
    .split('\0')
    .filter(Boolean)
    .map((line) => {
      const match = /^(?<mode>[0-9]{6}) (?<type>[^ ]+) [a-f0-9]+\t(?<path>.+)$/u.exec(line);
      if (!match) throw new Error('runtime source closure received malformed Git tree output');
      return { mode: match.groups.mode, type: match.groups.type, path: match.groups.path };
    })
    .sort((left, right) => compareStrings(left.path, right.path));
  if (entries.length === 0) throw new Error('runtime source closure is empty');
  if (entries.some((entry) => entry.type !== 'blob' || !['100644', '100755'].includes(entry.mode))) {
    throw new Error('runtime source closure permits only regular committed files');
  }

  const filesystemFiles = await collectFilesystemFiles(repositoryRoot, roots);
  const trackedPaths = entries.map((entry) => entry.path);
  if (sha256Canonical(filesystemFiles) !== sha256Canonical(trackedPaths)) {
    throw new Error('runtime source closure contains changed, missing, ignored, or untracked files');
  }

  const files = [];
  for (const entry of entries) {
    const path = resolveContained(repositoryRoot, entry.path);
    const stats = await lstat(path);
    const mode = stats.mode & 0o111 ? '100755' : '100644';
    if (!stats.isFile() || mode !== entry.mode) {
      throw new Error(`${entry.path}: runtime source file type or mode differs from Git`);
    }
    const bytes = await readFile(path);
    const committedBytes = gitBytes(repositoryRoot, ['show', `${sourceCommit}:${entry.path}`]);
    if (!bytes.equals(committedBytes)) {
      throw new Error(`${entry.path}: runtime source file differs from the committed controller`);
    }
    files.push({ path: entry.path, mode: entry.mode, bytes: bytes.byteLength, sha256: sha256(bytes) });
  }
  return {
    roots: [...roots],
    fileCount: files.length,
    filesSha256: sha256Canonical(files),
  };
}

async function collectFilesystemFiles(repositoryRoot, roots) {
  const files = new Set();
  for (const root of roots) {
    const absolute = resolveContained(repositoryRoot, root);
    await walk(absolute, root.replaceAll('\\', '/'), files);
  }
  return [...files].sort();
}

async function walk(absolute, logicalPath, files) {
  const stats = await lstat(absolute);
  if (stats.isFile()) {
    files.add(logicalPath);
    return;
  }
  if (!stats.isDirectory()) throw new Error(`${logicalPath}: runtime source closure forbids links and special files`);
  const entries = await readdir(absolute, { withFileTypes: true });
  for (const entry of entries.sort((left, right) => compareStrings(left.name, right.name))) {
    await walk(join(absolute, entry.name), `${logicalPath}/${entry.name}`, files);
  }
}

function artifactFileBinding(path, bytes) {
  return { path, sha256: sha256(bytes), bytes: bytes.byteLength };
}

function assertArtifactBinding(binding, expectedPath, label) {
  assertExactKeys(binding, ['bytes', 'path', 'sha256'], label);
  if (
    binding.path !== expectedPath ||
    !sha256Pattern.test(binding.sha256 ?? '') ||
    !Number.isInteger(binding.bytes) ||
    binding.bytes < 1
  ) {
    throw new Error(`${label} is invalid`);
  }
}

function assertArtifactFile(binding, expectedPath, bytes, label) {
  assertArtifactBinding(binding, expectedPath, `${label} binding`);
  const actual = artifactFileBinding(expectedPath, bytes);
  if (sha256Canonical(binding) !== sha256Canonical(actual)) {
    throw new Error(`${label} file binding is invalid`);
  }
}

function parseCanonicalJsonFile(bytes, label) {
  let value;
  try {
    value = JSON.parse(bytes.toString('utf8'));
  } catch {
    throw new Error(`${label} is not valid JSON`);
  }
  if (!bytes.equals(Buffer.from(prettyCanonicalJson(value), 'utf8'))) {
    throw new Error(`${label} is not canonical`);
  }
  return value;
}

async function assertRegularRetainedFile(path, label) {
  const stats = await lstat(path);
  if (!stats.isFile()) throw new Error(`${label} must be a retained regular file`);
}

function defaultCommandRunner(command, args) {
  if (command !== 'gh') throw new Error('runtime provenance permits only the GitHub CLI verifier');
  const home = mkdtempSync(join(tmpdir(), 'decantr-runtime-provenance-'));
  try {
    return runFixed(resolveGitHubCli(), args, {
      env: sanitizedEnvironment(home),
      timeoutMs: 120_000,
      maxBuffer: 64 * 1024 * 1024,
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}

function resolveGitHubCli() {
  for (const candidate of ['/usr/bin/gh', '/usr/local/bin/gh', '/opt/homebrew/bin/gh']) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error('GitHub CLI is required for offline runtime provenance verification');
}

function gitText(repositoryRoot, args) {
  return execFileSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function gitBytes(repositoryRoot, args) {
  return execFileSync('git', args, {
    cwd: repositoryRoot,
    encoding: null,
    maxBuffer: 128 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function resolveContained(root, candidate) {
  const absolute = resolve(root, candidate);
  const relation = relative(root, absolute);
  if (relation === '..' || relation.startsWith(`..${sep}`) || (relation === '' && candidate === '')) {
    throw new Error('runtime source path escapes the repository');
  }
  return absolute;
}

function resolveRequiredPath(value, label) {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} is required`);
  return resolve(value);
}

function withoutKey(value, key) {
  const clone = { ...value };
  delete clone[key];
  return clone;
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

function normalizeVersion(value) {
  return String(value ?? '').trim().replace(/^v/u, '');
}

function compareStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function parseArgs(argv) {
  const options = { artifactRoot: null, profileId: null };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--artifact-root') options.artifactRoot = resolve(argv[++index]);
    else if (argument === '--profile') options.profileId = argv[++index];
    else throw new Error(`Unknown option: ${argument}`);
  }
  if (!options.artifactRoot) throw new Error('--artifact-root is required');
  if (!options.profileId) throw new Error('--profile is required');
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await finalizeRuntimeProfileAttestation(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
