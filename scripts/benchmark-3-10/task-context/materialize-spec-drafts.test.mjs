import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { sha256Canonical, writeCanonicalFile } from '../runner/canonical.mjs';
import { materializeTaskDeliverySpecDrafts } from './materialize-spec-drafts.mjs';

test('task delivery draft materialization preserves the 24/16 private boundary', async () => {
  const fixture = await createFixture();
  try {
    const result = await materializeTaskDeliverySpecDrafts(fixture.options);
    assert.deepEqual(
      { development: result.development, qualification: result.qualification, total: result.total },
      { development: 24, qualification: 16, total: 40 },
    );
    const publicSpec = JSON.parse(
      await readFile(join(fixture.developmentOutputRoot, 'specs', 'development-task-01.json'), 'utf8'),
    );
    assert.deepEqual(Object.keys(publicSpec).sort(), ['input', 'oracle', 'review', 'schemaVersion', 'taskId']);
    assert.equal(publicSpec.review.status, 'pending');
    assert.equal(JSON.stringify(publicSpec).includes('qualification-task'), false);
    const sealedSpec = JSON.parse(
      await readFile(join(fixture.qualificationOutputRoot, 'specs', 'qualification-task-01.json'), 'utf8'),
    );
    assert.equal(sealedSpec.taskId, 'qualification-task-01');
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('task delivery draft materialization never overwrites an approved spec', async () => {
  const fixture = await createFixture();
  try {
    await materializeTaskDeliverySpecDrafts(fixture.options);
    const path = join(fixture.developmentOutputRoot, 'specs', 'development-task-01.json');
    const spec = JSON.parse(await readFile(path, 'utf8'));
    spec.review = {
      status: 'approved',
      reviewedBy: 'independent-reviewer',
      reviewedAt: '2026-07-22T12:00:00.000Z',
      notes: 'Independently confirmed target and styling authority.',
    };
    await writeCanonicalFile(path, spec);
    await assert.rejects(
      materializeTaskDeliverySpecDrafts({ ...fixture.options, forcePending: true }),
      /refusing to overwrite an approved/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('task delivery draft materialization preserves an unchanged approved spec', async () => {
  const fixture = await createFixture();
  try {
    await materializeTaskDeliverySpecDrafts(fixture.options);
    const path = join(fixture.developmentOutputRoot, 'specs', 'development-task-01.json');
    const spec = JSON.parse(await readFile(path, 'utf8'));
    spec.review = {
      status: 'approved',
      reviewedBy: 'independent-reviewer',
      reviewedAt: '2026-07-22T12:00:00.000Z',
      notes: 'Independently confirmed target and styling authority.',
    };
    await writeCanonicalFile(path, spec);
    const result = await materializeTaskDeliverySpecDrafts({
      ...fixture.options,
      forcePending: true,
      preserveApproved: true,
    });
    assert.equal(result.total, 40);
    assert.equal(JSON.parse(await readFile(path, 'utf8')).review.status, 'approved');
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('task delivery draft materialization rejects unresolved or tampered bundles', async (context) => {
  await context.test('unresolved rank-one authority', async () => {
    const fixture = await createFixture();
    try {
      const bundle = JSON.parse(await readFile(fixture.options.developmentBundlePath, 'utf8'));
      bundle.records[0].observation.rankOneMatchesOracle = false;
      bundle.bundleSha256 = sha256Canonical(bundle.records);
      await writeCanonicalFile(fixture.options.developmentBundlePath, bundle);
      await assert.rejects(materializeTaskDeliverySpecDrafts(fixture.options), /unresolved target draft/u);
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });
  await context.test('bundle digest drift', async () => {
    const fixture = await createFixture();
    try {
      const bundle = JSON.parse(await readFile(fixture.options.qualificationBundlePath, 'utf8'));
      bundle.bundleSha256 = '0'.repeat(64);
      await writeCanonicalFile(fixture.options.qualificationBundlePath, bundle);
      await assert.rejects(materializeTaskDeliverySpecDrafts(fixture.options), /draft bundle is invalid/u);
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'decantr-delivery-specs-'));
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
  await writeCanonicalFile(developmentCandidatesPath, {
    records: development.map((record) => ({ taskId: record.taskId, partition: 'development' })),
  });
  await writeCanonicalFile(qualificationCandidatesPath, {
    records: qualification.map((record) => ({ taskId: record.taskId, partition: 'qualification' })),
  });
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
      forcePending: false,
      preserveApproved: false,
    },
  };
}

function bundle(records, confidential) {
  return {
    schemaVersion: 'decantr-benchmark-task-delivery-draft-bundle.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    confidentiality: confidential ? 'PRIVATE: sealed fixture.' : 'Public development fixture.',
    count: records.length,
    bundleSha256: sha256Canonical(records),
    records,
  };
}

function draft(taskId, partition) {
  return {
    schemaVersion: 'decantr-benchmark-task-delivery-draft.v1',
    taskId,
    ...(partition === 'qualification' ? { opaqueId: `q-${taskId}` } : {}),
    partition,
    input: {
      target: { selector: 'file:src/view.tsx' },
      policyCard: {
        statements: [
          {
            id: 'repository-authority',
            text: 'Preserve repository-owned component and styling conventions.',
            sources: ['base-checkout'],
          },
        ],
      },
    },
    oracle: {
      expectedKind: 'file',
      acceptedStatuses: ['limited'],
      rankOneFiles: ['src/view.tsx'],
      forbiddenRankOnePatterns: ['(?:^|/)tests?(?:/|$)'],
      styleAuthority: { approach: 'css', confidence: 'high', files: ['src/styles.css'] },
    },
    observation: { status: 'limited', rankOneMatchesOracle: true },
    review: {
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      notes: 'Independent target and style authority review is still required.',
    },
  };
}
