import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertPreparedWorkspaceSourceIndex,
  calculatePreparedWorkspaceSourceIndexDigest,
} from './prepared-workspace-source-index.mjs';

test('prepared workspace source index binds all 40 verified artifacts', () => {
  const index = fixtureIndex();
  assert.equal(
    assertPreparedWorkspaceSourceIndex(index).tasks.length,
    40,
  );
});

test('prepared workspace source index rejects artifact substitution', () => {
  const index = fixtureIndex();
  index.tasks[0].artifact = 'benchmark-3-10-prepared-workspace-other';
  index.indexSha256 =
    calculatePreparedWorkspaceSourceIndexDigest(index);
  assert.throws(
    () => assertPreparedWorkspaceSourceIndex(index),
    /prepared workspace source is invalid/u,
  );
});

test('prepared workspace source index rejects a task-set mismatch', () => {
  const index = fixtureIndex();
  assert.throws(
    () =>
      assertPreparedWorkspaceSourceIndex(index, {
        expectedTasks: [
          ...index.tasks.slice(0, -1),
          'different.task',
        ],
      }),
    /differs from the frozen task set/u,
  );
});

function fixtureIndex() {
  const tasks = Array.from({ length: 40 }, (_, index) => {
    const taskId = `fixture-${String(index).padStart(2, '0')}.task`;
    const partition =
      index < 24 ? 'development' : 'qualification';
    const runId = 30_000_000_000 + index;
    return {
      artifact: `benchmark-3-10-prepared-workspace-${runId}-1`,
      executionAttestationFileSha256: 'a'.repeat(64),
      partition,
      preparedEnvironmentFileSha256: 'b'.repeat(64),
      repository:
        partition === 'development'
          ? 'decantr-ai/decantr'
          : 'decantr-ai/decantr-qualification-private',
      runAttempt: 1,
      runId,
      runnerRepositoryCommit: 'c'.repeat(40),
      sourceRef: 'refs/heads/main',
      taskId,
      verificationSha256: 'd'.repeat(64),
      workflow: 'benchmark-3-10-evaluator-qualification.yml',
      workspacePreparedSha256: 'e'.repeat(64),
    };
  });
  const value = {
    schemaVersion:
      'decantr-benchmark-prepared-workspace-source-index.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    generatedAt: '2026-07-24T00:00:00.000Z',
    tasks,
  };
  value.indexSha256 =
    calculatePreparedWorkspaceSourceIndexDigest(value);
  return value;
}
