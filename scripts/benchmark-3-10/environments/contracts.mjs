import { sha256Canonical } from '../runner/canonical.mjs';

const sha256Pattern = /^[a-f0-9]{64}$/u;
const gitShaPattern = /^[a-f0-9]{40}$/u;
const versionPattern = /^[0-9]+\.[0-9]+\.[0-9]+$/u;
const taskIdPattern = /^[a-z0-9][a-z0-9._-]{2,95}$/u;
const commandIdPattern = /^[a-z0-9][a-z0-9-]+$/u;
const unsafeCommandPattern = /(?:^|\/)(?:ba|z|c|fi)?sh$/iu;
const allowedEvidenceKinds = new Set([
  'package-manifest',
  'runtime-hint',
  'lockfile',
  'candidate-contract',
  'reviewer-override',
]);

export function assertTaskEnvironmentSpec(spec, candidate, options = {}) {
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
    throw new Error('task environment spec must be an object');
  }
  if (
    spec.schemaVersion !== 'decantr-benchmark-task-environment.v1' ||
    !taskIdPattern.test(spec.taskId ?? '') ||
    !['development', 'qualification'].includes(spec.partition) ||
    !gitShaPattern.test(spec.base?.commit ?? '') ||
    !gitShaPattern.test(spec.base?.tree ?? '') ||
    typeof spec.projectPath !== 'string' ||
    spec.projectPath.length === 0
  ) {
    throw new Error(`${spec.taskId ?? 'unknown task'}: environment identity is invalid`);
  }
  if (candidate) {
    if (
      spec.taskId !== candidate.taskId ||
      spec.partition !== candidate.partition ||
      spec.base.commit !== candidate.base?.commit ||
      spec.base.tree !== candidate.base?.tree ||
      spec.projectPath !== candidate.repository?.projectPath
    ) {
      throw new Error(`${spec.taskId}: environment base or project binding drifted`);
    }
  }
  assertProfile(spec.taskId, spec.profile);
  if (!Array.isArray(spec.lockfiles) || spec.lockfiles.length === 0) {
    throw new Error(`${spec.taskId}: lockfile binding is missing`);
  }
  const lockPaths = new Set();
  for (const lockfile of spec.lockfiles) {
    assertRelativePath(spec.taskId, lockfile?.path);
    if (lockPaths.has(lockfile.path) || !sha256Pattern.test(lockfile.sha256 ?? '')) {
      throw new Error(`${spec.taskId}: lockfile binding is duplicate or invalid`);
    }
    lockPaths.add(lockfile.path);
  }
  if (!Array.isArray(spec.sourceEvidence) || spec.sourceEvidence.length < 2) {
    throw new Error(`${spec.taskId}: source evidence is incomplete`);
  }
  for (const evidence of spec.sourceEvidence) {
    if (
      !allowedEvidenceKinds.has(evidence?.kind) ||
      typeof evidence.path !== 'string' ||
      evidence.path.length === 0 ||
      !sha256Pattern.test(evidence.sha256 ?? '') ||
      String(evidence.statement ?? '').length < 12
    ) {
      throw new Error(`${spec.taskId}: source evidence is invalid`);
    }
  }
  assertCommands(spec.taskId, spec.preparation);
  if (spec.cleanAfterPreparation !== true) {
    throw new Error(`${spec.taskId}: clean-after-preparation gate is required`);
  }
  assertReview(spec.taskId, spec.review, options.reviewStatus);
  return spec;
}

export function taskEnvironmentSubstance(spec) {
  const copy = structuredClone(spec);
  delete copy.review;
  return copy;
}

export function taskEnvironmentSubstanceSha256(spec) {
  return sha256Canonical(taskEnvironmentSubstance(spec));
}

function assertProfile(taskId, profile) {
  const manager = profile?.packageManager;
  if (
    profile?.os !== 'linux' ||
    profile?.arch !== 'x64' ||
    !['npm', 'pnpm', 'yarn', 'bun'].includes(manager?.name) ||
    !versionPattern.test(manager?.version ?? '') ||
    (profile.nodeVersion === null) === (profile.bunVersion === null) ||
    (profile.nodeVersion !== null && !versionPattern.test(profile.nodeVersion ?? '')) ||
    (profile.bunVersion !== null && !versionPattern.test(profile.bunVersion ?? ''))
  ) {
    throw new Error(`${taskId}: exact Linux x64 runtime profile is invalid`);
  }
  const expectedId = profile.nodeVersion
    ? `node-${profile.nodeVersion}-${manager.name}-${manager.version}`
    : `bun-${profile.bunVersion}-${manager.name}-${manager.version}`;
  if (profile.id !== expectedId) throw new Error(`${taskId}: runtime profile ID drifted`);
}

function assertCommands(taskId, commands) {
  if (!Array.isArray(commands) || commands.length === 0) {
    throw new Error(`${taskId}: preparation commands are missing`);
  }
  const ids = new Set();
  let registryCommands = 0;
  for (const command of commands) {
    if (
      typeof command?.id !== 'string' ||
      !commandIdPattern.test(command.id) ||
      ids.has(command.id) ||
      typeof command.executable !== 'string' ||
      command.executable.length === 0 ||
      unsafeCommandPattern.test(command.executable) ||
      !Array.isArray(command.args) ||
      command.args.some((argument) => typeof argument !== 'string') ||
      !Number.isInteger(command.timeoutMs) ||
      command.timeoutMs < 100 ||
      command.timeoutMs > 7_200_000 ||
      !['none', 'dependency-registry'].includes(command.network) ||
      command.required !== true
    ) {
      throw new Error(`${taskId}: unsafe or malformed preparation command`);
    }
    ids.add(command.id);
    assertRelativePath(taskId, command.cwd);
    if (command.args.some((argument) => /(?:&&|\|\||[;`])/u.test(argument))) {
      throw new Error(`${taskId}: shell syntax is forbidden in fixed command arguments`);
    }
    if (command.network === 'dependency-registry') registryCommands += 1;
    if (command.environment !== undefined) {
      if (!command.environment || typeof command.environment !== 'object' || Array.isArray(command.environment)) {
        throw new Error(`${taskId}: command environment is invalid`);
      }
      for (const [key, value] of Object.entries(command.environment)) {
        if (!/^[A-Z_][A-Z0-9_]*$/u.test(key) || typeof value !== 'string') {
          throw new Error(`${taskId}: command environment is invalid`);
        }
      }
    }
  }
  if (registryCommands !== 1) {
    throw new Error(`${taskId}: exactly one dependency-registry preparation command is required`);
  }
}

function assertReview(taskId, review, expectedStatus) {
  if (!review || typeof review !== 'object' || String(review.notes ?? '').length < 20) {
    throw new Error(`${taskId}: environment review is incomplete`);
  }
  if (expectedStatus && review.status !== expectedStatus) {
    throw new Error(`${taskId}: environment review must be ${expectedStatus}`);
  }
  if (review.status === 'draft') {
    if (review.reviewedBy !== null || review.reviewedAt !== null) {
      throw new Error(`${taskId}: draft environment cannot claim a reviewer`);
    }
    return;
  }
  if (
    review.status !== 'approved' ||
    typeof review.reviewedBy !== 'string' ||
    review.reviewedBy.trim() === '' ||
    typeof review.reviewedAt !== 'string' ||
    !Number.isFinite(Date.parse(review.reviewedAt))
  ) {
    throw new Error(`${taskId}: approved environment requires substantive independent review`);
  }
}

function assertRelativePath(taskId, value) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.startsWith('/') ||
    value.split('/').some((part) => part === '..')
  ) {
    throw new Error(`${taskId}: environment path escapes the workspace`);
  }
}
