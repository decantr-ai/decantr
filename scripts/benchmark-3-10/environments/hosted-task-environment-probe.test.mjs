import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  buildProbeDockerArgs,
  listProbeTasks,
} from './hosted-task-environment-probe.mjs';

test('lists only draft task environment specs in stable order', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-environment-probe-list-'));
  await mkdir(root, { recursive: true });
  await writeFile(
    join(root, 'b.json'),
    JSON.stringify({ taskId: 'task-b', review: { status: 'approved' } }),
  );
  await writeFile(
    join(root, 'a.json'),
    JSON.stringify({ taskId: 'task-a', review: { status: 'draft' } }),
  );
  await writeFile(
    join(root, 'c.json'),
    JSON.stringify({ taskId: 'task-c', review: { status: 'draft' } }),
  );

  assert.deepEqual(await listProbeTasks(root), ['task-a', 'task-c']);
  assert.deepEqual(await listProbeTasks(root, 'task-b'), ['task-b']);
  await assert.rejects(() => listProbeTasks(root, 'missing'), /absent/u);
});

test('uses valid Docker mount syntax for writable and read-only probe inputs', () => {
  const args = buildProbeDockerArgs({
    workspace: '/workspace',
    specPath: '/spec.json',
    benchmarkRoot: '/benchmark',
    evidenceRoot: '/evidence',
    resolvedImage: 'ghcr.io/decantr-ai/benchmark@sha256:abc',
    containerResultPath: '/evidence/result.json',
  });
  const mounts = args.flatMap((argument, index) =>
    argument === '--mount' ? [args[index + 1]] : [],
  );

  assert.deepEqual(mounts, [
    'type=bind,src=/workspace,dst=/work/task',
    'type=bind,src=/spec.json,dst=/input/spec.json,readonly',
    'type=bind,src=/benchmark,dst=/input/benchmark,readonly',
    'type=bind,src=/evidence,dst=/evidence',
  ]);
  assert.ok(mounts.every((mount) => !mount.split(',').includes('rw')));
});
