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

export async function materializeTaskDeliverySpecDrafts(options) {
  const [developmentBundle, qualificationBundle, developmentCandidates, qualificationCandidates] =
    await Promise.all([
      readJsonFile(options.developmentBundlePath),
      readJsonFile(options.qualificationBundlePath),
      readJsonFile(options.developmentCandidatesPath),
      readJsonFile(options.qualificationCandidatesPath),
    ]);

  const development = assertDraftBundle(developmentBundle, {
    partition: 'development',
    count: 24,
    candidateIds: candidateIds(developmentCandidates, 'development'),
    privateBundle: false,
  });
  const qualification = assertDraftBundle(qualificationBundle, {
    partition: 'qualification',
    count: 16,
    candidateIds: candidateIds(qualificationCandidates, 'qualification'),
    privateBundle: true,
  });

  const developmentManifest = await writePartition({
    records: development,
    outputRoot: options.developmentOutputRoot,
    forcePending: options.forcePending,
    preserveApproved: options.preserveApproved,
  });
  const qualificationManifest = await writePartition({
    records: qualification,
    outputRoot: options.qualificationOutputRoot,
    forcePending: options.forcePending,
    preserveApproved: options.preserveApproved,
  });

  return {
    development: developmentManifest.length,
    qualification: qualificationManifest.length,
    total: developmentManifest.length + qualificationManifest.length,
    developmentSpecSetSha256: sha256Canonical(developmentManifest),
    qualificationSpecSetSha256: sha256Canonical(qualificationManifest),
  };
}

function assertDraftBundle(bundle, expected) {
  if (
    bundle?.schemaVersion !== 'decantr-benchmark-task-delivery-draft-bundle.v1' ||
    bundle?.program !== 'decantr-3.10-ui-change-control-proof' ||
    !Array.isArray(bundle.records) ||
    bundle.count !== expected.count ||
    bundle.records.length !== expected.count ||
    bundle.bundleSha256 !== sha256Canonical(bundle.records)
  ) {
    throw new Error(`${expected.partition}: task delivery draft bundle is invalid`);
  }
  const confidentiality = String(bundle.confidentiality ?? '');
  if (expected.privateBundle ? !confidentiality.startsWith('PRIVATE:') : confidentiality.startsWith('PRIVATE:')) {
    throw new Error(`${expected.partition}: task delivery confidentiality is invalid`);
  }
  const seen = new Set();
  for (const record of bundle.records) {
    if (
      record?.schemaVersion !== 'decantr-benchmark-task-delivery-draft.v1' ||
      record.partition !== expected.partition ||
      typeof record.taskId !== 'string' ||
      seen.has(record.taskId) ||
      !expected.candidateIds.has(record.taskId)
    ) {
      throw new Error(`${expected.partition}: task delivery record binding is invalid`);
    }
    seen.add(record.taskId);
    assertDraftRecord(record);
  }
  if (seen.size !== expected.candidateIds.size) {
    throw new Error(`${expected.partition}: task delivery candidate set is incomplete`);
  }
  return bundle.records;
}

function assertDraftRecord(record) {
  if (!record.input?.target?.selector || !Array.isArray(record.input?.policyCard?.statements)) {
    throw new Error(`${record.taskId}: shared task input is incomplete`);
  }
  if (
    record.observation?.status === 'blocked' ||
    record.observation?.status === 'unsupported' ||
    record.observation?.rankOneMatchesOracle !== true
  ) {
    throw new Error(`${record.taskId}: unresolved target draft cannot be materialized`);
  }
  if (
    !Array.isArray(record.oracle?.rankOneFiles) ||
    record.oracle.rankOneFiles.length === 0 ||
    !Array.isArray(record.oracle?.forbiddenRankOnePatterns) ||
    record.oracle.forbiddenRankOnePatterns.length === 0
  ) {
    throw new Error(`${record.taskId}: target oracle is incomplete`);
  }
  if (
    record.review?.status !== 'pending' ||
    record.review.reviewedBy !== null ||
    record.review.reviewedAt !== null
  ) {
    throw new Error(`${record.taskId}: generated draft must enter review as pending`);
  }
}

function candidateIds(bundle, partition) {
  if (!Array.isArray(bundle?.records) || bundle.records.length === 0) {
    throw new Error(`${partition}: candidate records are missing`);
  }
  const ids = new Set();
  for (const record of bundle.records) {
    if (record?.partition !== partition || typeof record.taskId !== 'string' || ids.has(record.taskId)) {
      throw new Error(`${partition}: candidate record is invalid`);
    }
    ids.add(record.taskId);
  }
  return ids;
}

async function writePartition(options) {
  const manifest = [];
  for (const record of options.records) {
    const spec = {
      schemaVersion: 'decantr-benchmark-task-delivery-spec.v1',
      taskId: record.taskId,
      input: structuredClone(record.input),
      oracle: structuredClone(record.oracle),
      review: structuredClone(record.review),
    };
    const path = join(options.outputRoot, 'specs', `${record.taskId}.json`);
    const existing = await readExistingJson(path);
    if (existing) {
      if (existing.review?.status === 'approved') {
        const sameReviewedInput =
          existing.schemaVersion === spec.schemaVersion &&
          existing.taskId === spec.taskId &&
          sha256Canonical(existing.input) === sha256Canonical(spec.input) &&
          sha256Canonical(existing.oracle) === sha256Canonical(spec.oracle);
        if (options.preserveApproved && sameReviewedInput) {
          manifest.push({ taskId: record.taskId, specSha256: sha256(await readFile(path)) });
          continue;
        }
        throw new Error(
          `${record.taskId}: refusing to overwrite an approved task delivery spec${sameReviewedInput ? '' : ' whose reviewed input or oracle drifted'}`,
        );
      }
      if (!options.forcePending) {
        throw new Error(`${record.taskId}: pending task delivery spec already exists; pass --force-pending to regenerate`);
      }
    }
    await writeCanonicalFile(path, spec);
    manifest.push({ taskId: record.taskId, specSha256: sha256(await readFile(path)) });
  }
  return manifest.sort((left, right) => left.taskId.localeCompare(right.taskId));
}

async function readExistingJson(path) {
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
    developmentBundlePath: join(benchmarkRoot, 'tasks', 'development-delivery-drafts.json'),
    qualificationBundlePath: join(
      repositoryRoot,
      '.private',
      'benchmark-3-10',
      'task-context',
      'qualification-delivery-drafts.json',
    ),
    developmentCandidatesPath: join(benchmarkRoot, 'tasks', 'development-candidates.json'),
    qualificationCandidatesPath: join(
      repositoryRoot,
      '.private',
      'benchmark-3-10',
      'task-freeze',
      'qualification-private.json',
    ),
    developmentOutputRoot: join(benchmarkRoot, 'task-context', 'development'),
    qualificationOutputRoot: join(
      repositoryRoot,
      '.private',
      'benchmark-3-10',
      'task-context',
      'qualification',
    ),
    forcePending: false,
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
    else if (argument === '--force-pending') options.forcePending = true;
    else if (argument === '--preserve-approved') options.preserveApproved = true;
    else throw new Error(`Unknown option: ${argument}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await materializeTaskDeliverySpecDrafts(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
