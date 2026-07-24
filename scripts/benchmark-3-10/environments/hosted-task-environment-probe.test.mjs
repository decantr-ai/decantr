import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  buildProbeDockerArgs,
  listProbeTasks,
  redactedDiagnosticTail,
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

test('retains bounded failure context while redacting credential-shaped values', () => {
  const noisy = Array.from({ length: 50 }, (_, index) => `line ${index}`).join('\n');
  const diagnostic = redactedDiagnosticTail(
    `${noisy}\nhttps://user:password@example.com/package.tgz`,
    'Authorization: Bearer secret-value\nNPM_TOKEN=npm_abcdefghijklmnopqrstuvwxyz123456',
  );

  assert.equal(diagnostic.includes('line 0'), false);
  assert.equal(diagnostic.includes('line 49'), true);
  assert.equal(diagnostic.includes('password'), false);
  assert.equal(diagnostic.includes('secret-value'), false);
  assert.equal(diagnostic.includes('npm_abcdefghijklmnopqrstuvwxyz123456'), false);
  assert.match(diagnostic, /\[REDACTED/u);
  assert.ok(diagnostic.length <= 4000);
});
