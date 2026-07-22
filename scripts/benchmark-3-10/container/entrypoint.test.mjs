import assert from 'node:assert/strict';
import test from 'node:test';
import { assertIsolatedEnvironment, isolatedChildEnvironment } from './entrypoint.mjs';

test('container isolation accepts a non-root empty home and exposes only allowlisted environment', () => {
  const environment = {
    HOME: '/home/benchmark-empty',
    PATH: '/usr/bin',
    LANG: 'C.UTF-8',
    CI: '1',
    BENCHMARK_MODEL_PROXY_URL: 'http://proxy:8080',
    DECANTR_TASK_RUNTIME_KIND: 'node',
    DECANTR_TASK_RUNTIME_VERSION: '22.19.0',
    DECANTR_TASK_PACKAGE_MANAGER: 'pnpm',
    DECANTR_TASK_PACKAGE_MANAGER_VERSION: '10.33.0',
    DECANTR_BENCHMARK_IMAGE_DIGEST: `sha256:${'1'.repeat(64)}`,
    DECANTR_BENCHMARK_NETWORK_MODE: 'none',
    UNRELATED_HOST_VALUE: 'must-not-pass',
  };
  assert.equal(assertIsolatedEnvironment({ environment, uid: 10001, homeEntries: [] }), true);
  const child = isolatedChildEnvironment(environment);
  assert.equal(child.UNRELATED_HOST_VALUE, undefined);
  assert.equal(child.BENCHMARK_MODEL_PROXY_URL, 'http://proxy:8080');
  assert.equal(child.DECANTR_TASK_RUNTIME_VERSION, '22.19.0');
  assert.equal(child.DECANTR_BENCHMARK_IMAGE_DIGEST, environment.DECANTR_BENCHMARK_IMAGE_DIGEST);
  assert.equal(child.DECANTR_BENCHMARK_NETWORK_MODE, 'none');
});

test('container isolation rejects root, personal config, provider keys, and a reused home', () => {
  const base = { HOME: '/home/benchmark-empty', PATH: '/usr/bin' };
  assert.throws(() => assertIsolatedEnvironment({ environment: base, uid: 0, homeEntries: [] }), /must not run as root/u);
  assert.throws(
    () => assertIsolatedEnvironment({ environment: { ...base, CODEX_HOME: '/host' }, uid: 10001, homeEntries: [] }),
    /forbidden host/u,
  );
  assert.throws(
    () => assertIsolatedEnvironment({ environment: { ...base, OPENAI_API_KEY: 'secret' }, uid: 10001, homeEntries: [] }),
    /forbidden host/u,
  );
  assert.throws(
    () => assertIsolatedEnvironment({ environment: base, uid: 10001, homeEntries: ['.config'] }),
    /HOME is not empty/u,
  );
});
