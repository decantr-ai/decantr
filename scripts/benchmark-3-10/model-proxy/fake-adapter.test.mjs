import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createFakeResponse } from './fake-adapter.mjs';

test('fake adapter is deterministic, preserves requested identity, and always costs zero', () => {
  const request = {
    schemaVersion: 'decantr-benchmark-adapter-request.v1',
    runId: 'run-fixture',
    taskId: 'task-fixture',
    modelId: 'model-fixture',
    provider: 'fixture-provider',
    requestedModel: 'model-v1',
    arm: 'control',
    prompt: 'Implement a deterministic fixture task.',
    context: 'Repository policy.',
    informationEntitlement: { rule: 'same-in-both-arms' },
  };
  const first = createFakeResponse(request);
  const second = createFakeResponse(request);
  assert.deepEqual(first, second);
  assert.equal(first.status, 'completed');
  assert.equal(first.returnedModel, request.requestedModel);
  assert.equal(first.provider, request.provider);
  assert.equal(first.usage.costUsd, 0);
});

test('reviewed pricing keeps the bundled adapter deterministic and zero cost', async () => {
  const pricing = JSON.parse(
    await readFile(join(dirname(fileURLToPath(import.meta.url)), 'pricing.json'), 'utf8'),
  );
  assert.equal(pricing.paidPricingLocked, true);
  assert.equal(
    pricing.models.every((model) =>
      ['inputPerMillionTokensUsd', 'cachedInputPerMillionTokensUsd', 'outputPerMillionTokensUsd']
        .every((field) => Number.isFinite(model[field]) && model[field] >= 0),
    ),
    true,
  );
  assert.equal(pricing.fake.costUsd, 0);
});
