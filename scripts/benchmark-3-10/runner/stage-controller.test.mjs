import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  calculateStageControllerClosure,
  stageControllerFiles,
} from './stage-controller.mjs';

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
);

test('stage controller closures bind the exact committed executors in each image', async () => {
  const [agent, evaluator, dockerfile] = await Promise.all([
    calculateStageControllerClosure('agent', { root: repositoryRoot }),
    calculateStageControllerClosure('evaluator', { root: repositoryRoot }),
    readFile(
      resolve(
        repositoryRoot,
        'scripts/benchmark-3-10/container/Dockerfile.agent',
      ),
      'utf8',
    ),
  ]);
  assert.match(agent.controllerSha256, /^[a-f0-9]{64}$/u);
  assert.match(evaluator.controllerSha256, /^[a-f0-9]{64}$/u);
  assert.notEqual(agent.controllerSha256, evaluator.controllerSha256);
  for (const path of stageControllerFiles('agent')) {
    assert.match(dockerfile, new RegExp(escapeRegex(path), 'u'), path);
  }
  assert.equal(
    evaluator.entries.some((entry) =>
      entry.path.endsWith('/evaluator-stage.mjs'),
    ),
    true,
  );
  assert.equal(
    evaluator.entries.some((entry) =>
      entry.path.endsWith('/finalize-split-run.mjs'),
    ),
    true,
  );
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}
