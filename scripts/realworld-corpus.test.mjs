import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeVerify, validateJsonSchema } from './run-realworld-corpus.mjs';

const changeAssurance = {
  $schema: 'https://decantr.ai/schemas/change-assurance-report.v1.json',
  version: '1.0.0',
  status: 'attention',
  project: {},
  comparisonScope: {},
  changeBase: {},
  authority: {},
  surfaces: {},
  findings: [{ occurrence: { code: 'COMP010' } }],
  limitations: [],
  summary: { changedFileCount: 1, impactedSurfaceCount: 1 },
};

test('real-world corpus accepts the 3.11 bare verify contract', () => {
  assert.deepEqual(validateJsonSchema('verify-json', changeAssurance), []);
  assert.deepEqual(summarizeVerify(changeAssurance), {
    schema: changeAssurance.$schema,
    status: 'attention',
    score: null,
    loopState: null,
    graphReady: null,
    changedFileCount: 1,
    impactedSurfaceCount: 1,
    findingCount: 1,
    ruleCounts: [{ rule: 'COMP010', count: 1 }],
  });
});

test('real-world corpus keeps explicit full verify on Project Health', () => {
  const projectHealth = {
    $schema: 'https://decantr.ai/schemas/project-health.v2.json',
    status: 'healthy',
    score: 100,
    summary: {},
    findings: [],
    loop: { state: 'verified' },
  };

  assert.deepEqual(validateJsonSchema('verify-full-json', projectHealth), []);
  assert.deepEqual(summarizeVerify(projectHealth), {
    schema: projectHealth.$schema,
    status: 'healthy',
    score: 100,
    loopState: 'verified',
    graphReady: null,
    changedFileCount: null,
    impactedSurfaceCount: null,
    findingCount: 0,
    ruleCounts: [],
  });
});
