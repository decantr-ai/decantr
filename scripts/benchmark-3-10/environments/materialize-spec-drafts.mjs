#!/usr/bin/env node
import { access, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  readJsonFile,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from '../runner/canonical.mjs';

const benchmarkRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(benchmarkRoot, '..', '..');
const sha256Pattern = /^[a-f0-9]{64}$/u;
const versionPattern = /^[0-9]+\.[0-9]+\.[0-9]+$/u;
const unsafeCommandPattern = /(?:^|\/)(?:ba|z|c|fi)?sh$/iu;

export async function materializeTaskEnvironmentSpecDrafts(options) {
  const [developmentBundle, qualificationBundle, developmentCandidates, qualificationCandidates] =
    await Promise.all([
      readJsonFile(options.developmentBundlePath),
      readJsonFile(options.qualificationBundlePath),
      readJsonFile(options.developmentCandidatesPath),
      readJsonFile(options.qualificationCandidatesPath),
    ]);
  const development = assertBundle(developmentBundle, {
    partition: 'development',
    count: 24,
    privateBundle: false,
    candidates: developmentCandidates,
  });
  const qualification = assertBundle(qualificationBundle, {
    partition: 'qualification',
    count: 16,
    privateBundle: true,
    candidates: qualificationCandidates,
  });
  const developmentManifest = await writePartition(development, options.developmentOutputRoot, options);
  const qualificationManifest = await writePartition(qualification, options.qualificationOutputRoot, options);
  return {
    development: developmentManifest.length,
    qualification: qualificationManifest.length,
    total: developmentManifest.length + qualificationManifest.length,
    developmentSpecSetSha256: sha256Canonical(developmentManifest),
    qualificationSpecSetSha256: sha256Canonical(qualificationManifest),
  };
}

function assertBundle(bundle, expected) {
  if (
    bundle?.schemaVersion !== 'decantr-benchmark-task-environment-draft-bundle.v1' ||
    bundle?.program !== 'decantr-3.10-ui-change-control-proof' ||
    bundle?.partition !== expected.partition ||
    !Array.isArray(bundle.records) ||
    bundle.count !== expected.count ||
    bundle.records.length !== expected.count ||
    bundle.bundleSha256 !== sha256Canonical(bundle.records)
  ) {
    throw new Error(`${expected.partition}: task environment draft bundle is invalid`);
  }
  const confidentiality = String(bundle.confidentiality ?? '');
  if (expected.privateBundle ? !confidentiality.startsWith('PRIVATE:') : confidentiality.startsWith('PRIVATE:')) {
    throw new Error(`${expected.partition}: task environment confidentiality is invalid`);
  }
  const candidateById = new Map(
    (expected.candidates?.records ?? []).map((record) => [record.taskId, record]),
  );
  if (candidateById.size !== expected.count) {
    throw new Error(`${expected.partition}: candidate set is incomplete`);
  }
  const seen = new Set();
  for (const record of bundle.records) {
    const candidate = candidateById.get(record?.taskId);
    if (!candidate || seen.has(record.taskId)) {
      throw new Error(`${expected.partition}: unknown or duplicate environment task`);
    }
    seen.add(record.taskId);
    assertRecord(record, candidate, expected.partition);
  }
  return bundle.records;
}

function assertRecord(record, candidate, partition) {
  if (
    record.schemaVersion !== 'decantr-benchmark-task-environment.v1' ||
    record.partition !== partition ||
    record.base?.commit !== candidate.base?.commit ||
    record.base?.tree !== candidate.base?.tree ||
    record.projectPath !== candidate.repository?.projectPath
  ) {
    throw new Error(`${record.taskId}: environment base or project binding drifted`);
  }
  const profile = record.profile;
  const packageManager = profile?.packageManager;
  if (
    profile?.os !== 'linux' ||
    profile?.arch !== 'x64' ||
    !['npm', 'pnpm', 'yarn', 'bun'].includes(packageManager?.name) ||
    !versionPattern.test(packageManager?.version ?? '') ||
    (profile.nodeVersion === null) === (profile.bunVersion === null) ||
    (profile.nodeVersion !== null && !versionPattern.test(profile.nodeVersion ?? '')) ||
    (profile.bunVersion !== null && !versionPattern.test(profile.bunVersion ?? ''))
  ) {
    throw new Error(`${record.taskId}: exact Linux x64 runtime profile is invalid`);
  }
  const expectedProfileId = profile.nodeVersion
    ? `node-${profile.nodeVersion}-${packageManager.name}-${packageManager.version}`
    : `bun-${profile.bunVersion}-${packageManager.name}-${packageManager.version}`;
  if (profile.id !== expectedProfileId) throw new Error(`${record.taskId}: runtime profile ID drifted`);
  if (!Array.isArray(record.lockfiles) || record.lockfiles.length === 0) {
    throw new Error(`${record.taskId}: lockfile binding is missing`);
  }
  for (const lockfile of record.lockfiles) {
    assertRelativePath(record.taskId, lockfile.path);
    if (!sha256Pattern.test(lockfile.sha256 ?? '')) throw new Error(`${record.taskId}: lockfile digest is invalid`);
  }
  if (!Array.isArray(record.sourceEvidence) || record.sourceEvidence.length < 2) {
    throw new Error(`${record.taskId}: source evidence is incomplete`);
  }
  for (const evidence of record.sourceEvidence) {
    if (!sha256Pattern.test(evidence?.sha256 ?? '') || String(evidence?.statement ?? '').length < 12) {
      throw new Error(`${record.taskId}: source evidence is invalid`);
    }
  }
  if (!Array.isArray(record.preparation) || record.preparation.length === 0) {
    throw new Error(`${record.taskId}: preparation commands are missing`);
  }
  const commandIds = new Set();
  for (const command of record.preparation) {
    if (
      typeof command?.id !== 'string' ||
      commandIds.has(command.id) ||
      typeof command.executable !== 'string' ||
      unsafeCommandPattern.test(command.executable) ||
      !Array.isArray(command.args) ||
      !Number.isInteger(command.timeoutMs) ||
      command.timeoutMs < 100 ||
      command.timeoutMs > 7_200_000 ||
      !['none', 'dependency-registry'].includes(command.network) ||
      command.required !== true
    ) {
      throw new Error(`${record.taskId}: unsafe or malformed preparation command`);
    }
    commandIds.add(command.id);
    assertRelativePath(record.taskId, command.cwd);
    if (command.args.some((argument) => /(?:&&|\|\||[;`])/u.test(argument))) {
      throw new Error(`${record.taskId}: shell syntax is forbidden in fixed command arguments`);
    }
  }
  if (record.cleanAfterPreparation !== true) {
    throw new Error(`${record.taskId}: clean-after-preparation gate is required`);
  }
  if (
    record.review?.status !== 'draft' ||
    record.review.reviewedBy !== null ||
    record.review.reviewedAt !== null ||
    String(record.review.notes ?? '').length < 20
  ) {
    throw new Error(`${record.taskId}: generated environment must enter review as draft`);
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

async function writePartition(records, outputRoot, options) {
  const manifest = [];
  for (const record of records) {
    const path = join(outputRoot, 'specs', `${record.taskId}.json`);
    const existing = await readExisting(path);
    if (existing?.review?.status === 'approved') {
      const sameSubstance =
        existing.schemaVersion === record.schemaVersion &&
        existing.taskId === record.taskId &&
        sha256Canonical(withoutReview(existing)) === sha256Canonical(withoutReview(record));
      if (options.preserveApproved && sameSubstance) {
        manifest.push({ taskId: record.taskId, specSha256: sha256(await readFile(path)) });
        continue;
      }
      throw new Error(
        `${record.taskId}: refusing to overwrite an approved environment spec${sameSubstance ? '' : ' whose reviewed substance drifted'}`,
      );
    }
    if (existing && !options.forceDrafts) {
      throw new Error(`${record.taskId}: draft environment spec exists; pass --force-drafts to regenerate`);
    }
    await writeCanonicalFile(path, record);
    manifest.push({ taskId: record.taskId, specSha256: sha256(await readFile(path)) });
  }
  return manifest.sort((left, right) => left.taskId.localeCompare(right.taskId));
}

function withoutReview(record) {
  const copy = structuredClone(record);
  delete copy.review;
  return copy;
}

async function readExisting(path) {
  try {
    await access(path);
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return null;
    throw error;
  }
}

function parseArgs(argv) {
  const options = {
    developmentBundlePath: join(benchmarkRoot, 'environments', 'development-drafts.json'),
    qualificationBundlePath: join(repositoryRoot, '.private', 'benchmark-3-10', 'environments', 'qualification-drafts.json'),
    developmentCandidatesPath: join(benchmarkRoot, 'tasks', 'development-candidates.json'),
    qualificationCandidatesPath: join(repositoryRoot, '.private', 'benchmark-3-10', 'task-freeze', 'qualification-private.json'),
    developmentOutputRoot: join(benchmarkRoot, 'environments', 'development'),
    qualificationOutputRoot: join(repositoryRoot, '.private', 'benchmark-3-10', 'environments', 'qualification'),
    forceDrafts: false,
    preserveApproved: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--development-bundle') options.developmentBundlePath = resolve(argv[++index]);
    else if (argument === '--qualification-bundle') options.qualificationBundlePath = resolve(argv[++index]);
    else if (argument === '--development-candidates') options.developmentCandidatesPath = resolve(argv[++index]);
    else if (argument === '--qualification-candidates') options.qualificationCandidatesPath = resolve(argv[++index]);
    else if (argument === '--development-out') options.developmentOutputRoot = resolve(argv[++index]);
    else if (argument === '--qualification-out') options.qualificationOutputRoot = resolve(argv[++index]);
    else if (argument === '--force-drafts') options.forceDrafts = true;
    else if (argument === '--preserve-approved') options.preserveApproved = true;
    else throw new Error(`Unknown option: ${argument}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await materializeTaskEnvironmentSpecDrafts(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
