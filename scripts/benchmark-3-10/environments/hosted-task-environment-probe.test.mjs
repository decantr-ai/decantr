import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { listProbeTasks } from './hosted-task-environment-probe.mjs';

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
