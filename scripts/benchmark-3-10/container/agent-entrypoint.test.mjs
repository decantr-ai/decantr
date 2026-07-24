import assert from 'node:assert/strict';
import test from 'node:test';
import {
  agentChildEnvironment,
  assertAgentEnvironment,
  assertAgentImageContents,
} from './agent-entrypoint.mjs';

test('agent environment excludes provider credentials and unrelated host configuration', () => {
  const environment = {
    HOME: '/home/benchmark-empty',
    PATH: '/usr/bin',
    CI: '1',
    DECANTR_MODEL_PROXY_URL: 'http://model-proxy:8787',
    DECANTR_MODEL_PROXY_RECEIPT: '/evidence/provider-receipt.json',
    UNRELATED_HOST_VALUE: 'drop-me',
  };
  assert.equal(assertAgentEnvironment({ environment, uid: 10001, homeEntries: [] }), true);
  const child = agentChildEnvironment(environment);
  assert.equal(child.DECANTR_MODEL_PROXY_URL, environment.DECANTR_MODEL_PROXY_URL);
  assert.equal(child.UNRELATED_HOST_VALUE, undefined);
});

test('agent environment rejects root, provider credentials, and reused personal home', () => {
  const base = { HOME: '/home/benchmark-empty', PATH: '/usr/bin' };
  assert.throws(
    () => assertAgentEnvironment({ environment: base, uid: 0, homeEntries: [] }),
    /must not run as root/u,
  );
  assert.throws(
    () =>
      assertAgentEnvironment({
        environment: { ...base, OPENAI_API_KEY: 'secret' },
        uid: 10001,
        homeEntries: [],
      }),
    /provider credentials are forbidden/u,
  );
  assert.throws(
    () => assertAgentEnvironment({ environment: base, uid: 10001, homeEntries: ['.codex'] }),
    /HOME is not empty/u,
  );
});

test('agent image rejects every evaluator-bearing root', () => {
  assert.equal(assertAgentImageContents(() => false), true);
  assert.throws(
    () => assertAgentImageContents((path) => path.endsWith('/evaluator')),
    /forbidden evaluator material/u,
  );
});

