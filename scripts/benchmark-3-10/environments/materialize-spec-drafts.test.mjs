import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { sha256Canonical, writeCanonicalFile } from '../runner/canonical.mjs';
import { materializeTaskEnvironmentSpecDrafts } from './materialize-spec-drafts.mjs';

test('environment draft materialization preserves the 24/16 sealed boundary', async () => {
  const fixture = await createFixture();
  try {
    const result = await materializeTaskEnvironmentSpecDrafts(fixture.options);
    assert.deepEqual(
      { development: result.development, qualification: result.qualification, total: result.total },
      { development: 24, qualification: 16, total: 40 },
    );
    const publicSpec = JSON.parse(
      await readFile(join(fixture.developmentOutputRoot, 'specs', 'development-task-01.json'), 'utf8'),
    );
    assert.equal(publicSpec.review.status, 'draft');
    assert.equal(publicSpec.profile.id, 'node-22.19.0-pnpm-10.33.0');
    assert.equal(JSON.stringify(publicSpec).includes('qualification-task'), false);
    const sealedSpec = JSON.parse(
      await readFile(join(fixture.qualificationOutputRoot, 'specs', 'qualification-task-01.json'), 'utf8'),
    );
    assert.equal(sealedSpec.partition, 'qualification');
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('environment draft materialization refuses approved overwrite and preserves unchanged approval', async () => {
  const fixture = await createFixture();
  try {
    await materializeTaskEnvironmentSpecDrafts(fixture.options);
    const path = join(fixture.developmentOutputRoot, 'specs', 'development-task-01.json');
    const spec = JSON.parse(await readFile(path, 'utf8'));
    spec.review = {
      status: 'approved',
      reviewedBy: 'independent-runtime-reviewer',
      reviewedAt: '2026-07-22T18:00:00.000Z',
      notes: 'Verified exact runtime, lockfile, and fixed preparation command evidence.',
    };
    await writeCanonicalFile(path, spec);
    await assert.rejects(
      materializeTaskEnvironmentSpecDrafts({ ...fixture.options, forceDrafts: true }),
      /refusing to overwrite an approved environment spec/u,
    );
    const result = await materializeTaskEnvironmentSpecDrafts({
      ...fixture.options,
      forceDrafts: true,
      preserveApproved: true,
    });
    assert.equal(result.total, 40);
    assert.equal(JSON.parse(await readFile(path, 'utf8')).review.status, 'approved');
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('environment draft materialization rejects shell syntax and bundle drift', async (context) => {
  await context.test('shell syntax', async () => {
    const fixture = await createFixture();
    try {
      const bundle = JSON.parse(await readFile(fixture.options.developmentBundlePath, 'utf8'));
      bundle.records[0].preparation[0].args.push('&&', 'curl', 'example.invalid');
      bundle.bundleSha256 = sha256Canonical(bundle.records);
      await writeCanonicalFile(fixture.options.developmentBundlePath, bundle);
      await assert.rejects(materializeTaskEnvironmentSpecDrafts(fixture.options), /shell syntax is forbidden/u);
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });
  await context.test('bundle digest', async () => {
    const fixture = await createFixture();
    try {
      const bundle = JSON.parse(await readFile(fixture.options.qualificationBundlePath, 'utf8'));
      bundle.bundleSha256 = '0'.repeat(64);
      await writeCanonicalFile(fixture.options.qualificationBundlePath, bundle);
      await assert.rejects(materializeTaskEnvironmentSpecDrafts(fixture.options), /draft bundle is invalid/u);
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'decantr-environment-specs-'));
  const developmentBundlePath = join(root, 'development-drafts.json');
  const qualificationBundlePath = join(root, 'private', 'qualification-drafts.json');
  const developmentCandidatesPath = join(root, 'development-candidates.json');
  const qualificationCandidatesPath = join(root, 'private', 'qualification-candidates.json');
  const developmentOutputRoot = join(root, 'public-specs');
  const qualificationOutputRoot = join(root, 'private', 'qualification-specs');
  const development = Array.from({ length: 24 }, (_, index) =>
    draft(`development-task-${String(index + 1).padStart(2, '0')}`, 'development'),
  );
  const qualification = Array.from({ length: 16 }, (_, index) =>
    draft(`qualification-task-${String(index + 1).padStart(2, '0')}`, 'qualification'),
  );
  await writeCanonicalFile(developmentBundlePath, bundle(development, false));
  await writeCanonicalFile(qualificationBundlePath, bundle(qualification, true));
  await writeCanonicalFile(developmentCandidatesPath, candidates(development));
  await writeCanonicalFile(qualificationCandidatesPath, candidates(qualification));
  return {
    root,
    developmentOutputRoot,
    qualificationOutputRoot,
    options: {
      developmentBundlePath,
      qualificationBundlePath,
      developmentCandidatesPath,
      qualificationCandidatesPath,
      developmentOutputRoot,
      qualificationOutputRoot,
      forceDrafts: false,
      preserveApproved: false,
    },
  };
}

function bundle(records, confidential) {
  return {
    schemaVersion: 'decantr-benchmark-task-environment-draft-bundle.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    partition: records[0].partition,
    confidentiality: confidential ? 'PRIVATE: sealed fixture.' : 'Public development fixture.',
    count: records.length,
    records,
    bundleSha256: sha256Canonical(records),
  };
}

function candidates(records) {
  return {
    count: records.length,
    records: records.map((record) => ({
      taskId: record.taskId,
      partition: record.partition,
      base: record.base,
      repository: { projectPath: record.projectPath },
    })),
  };
}

function draft(taskId, partition) {
  return {
    schemaVersion: 'decantr-benchmark-task-environment.v1',
    taskId,
    partition,
    base: { commit: '1'.repeat(40), tree: '2'.repeat(40) },
    projectPath: '.',
    profile: {
      id: 'node-22.19.0-pnpm-10.33.0',
      os: 'linux',
      arch: 'x64',
      nodeVersion: '22.19.0',
      bunVersion: null,
      packageManager: { name: 'pnpm', version: '10.33.0' },
    },
    lockfiles: [{ path: 'pnpm-lock.yaml', sha256: '3'.repeat(64) }],
    sourceEvidence: [
      { kind: 'package-manifest', path: 'package.json', sha256: '4'.repeat(64), statement: 'Pinned package manifest evidence.' },
      { kind: 'lockfile', path: 'pnpm-lock.yaml', sha256: '3'.repeat(64), statement: 'Pinned dependency lockfile evidence.' },
    ],
    preparation: [{
      id: 'install-dependencies',
      executable: 'pnpm',
      args: ['install', '--frozen-lockfile'],
      cwd: '.',
      timeoutMs: 7_200_000,
      network: 'dependency-registry',
      required: true,
    }],
    cleanAfterPreparation: true,
    review: {
      status: 'draft',
      reviewedBy: null,
      reviewedAt: null,
      notes: 'Independent environment review remains required before execution.',
    },
  };
}
