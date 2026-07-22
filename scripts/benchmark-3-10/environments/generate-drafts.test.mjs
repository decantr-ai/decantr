import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildEvidence,
  normalizeExactVersion,
  normalizeRemote,
  parsePackageManager,
  preparationCommands,
  selectPackageManager,
  selectProfile,
  selectLockfile,
  validateEnvironmentConfig,
} from './generate-drafts.mjs';

const PRIVATE_CONFIG_SCHEMA_VERSION =
  'decantr-benchmark-qualification-private-generator-config.v1';

test('source evidence contains only frozen workspace files', () => {
  const evidence = buildEvidence(
    {
      manifests: [{ path: 'package.json', bytes: Buffer.from('{"packageManager":"pnpm@10.33.0"}') }],
      hints: [{ path: '.node-version', bytes: Buffer.from('22.19.0\n'), value: '22.19.0' }],
    },
    'pnpm-lock.yaml',
    Buffer.from('lockfileVersion: 9.0\n'),
    { name: 'pnpm', version: '10.33.0' },
  );

  assert.deepEqual(evidence.map((item) => item.path), [
    '.node-version',
    'package.json',
    'pnpm-lock.yaml',
  ]);
  assert.equal(evidence.some((item) => item.path.startsWith('candidate:')), false);
});

test('environment draft helpers normalize exact toolchain metadata', () => {
  assert.deepEqual(parsePackageManager('pnpm@10.33.0+sha512.deadbeef'), {
    name: 'pnpm',
    version: '10.33.0',
  });
  assert.equal(normalizeExactVersion('v22.19'), '22.19.0');
  assert.equal(normalizeExactVersion('>=22.19'), null);
  assert.equal(
    normalizeRemote('git@github.com:Example/Fixture.git'),
    'https://github.com/example/fixture',
  );
});

test('lockfile selection prefers the task project and then repository root', () => {
  const nested = candidate('fixture.task-one', 'apps/web');
  assert.equal(
    selectLockfile(nested, ['pnpm-lock.yaml', 'apps/web/pnpm-lock.yaml'], 'pnpm'),
    'apps/web/pnpm-lock.yaml',
  );
  const monorepo = candidate('fixture.task-two', 'packages/ui');
  assert.equal(
    selectLockfile(monorepo, ['pnpm-lock.yaml', 'examples/demo/pnpm-lock.yaml'], 'pnpm'),
    'pnpm-lock.yaml',
  );
  assert.throws(
    () =>
      selectLockfile(
        candidate('fixture.task-three', 'packages/ui'),
        ['a/pnpm-lock.yaml', 'b/pnpm-lock.yaml'],
        'pnpm',
      ),
    /ambiguous/u,
  );
});

test('preparation commands apply caller-supplied install and environment overrides', () => {
  const configured = preparationCommands(
    candidate('fixture.configured-install', '.'),
    { name: 'npm', version: '10.2.4' },
    'package-lock.json',
    {
      install: {
        args: ['ci', '--fixture-peer-mode'],
        environment: { CI: '1' },
      },
      preparation: {
        beforeInstall: [
          command('copy-fixture-environment', '/bin/cp', ['--', '.env.example', '.env']),
        ],
        afterInstall: [
          command('initialize-fixture', 'npm', ['run', 'setup']),
        ],
      },
    },
  );
  assert.equal(configured[0].id, 'copy-fixture-environment');
  assert.deepEqual(configured[1].args, ['ci', '--fixture-peer-mode']);
  assert.deepEqual(configured[1].environment, { CI: '1' });
  assert.equal(configured[1].network, 'dependency-registry');
  assert.equal(configured[2].id, 'initialize-fixture');

  const defaults = preparationCommands(
    candidate('fixture.default-install', 'apps/dashboard'),
    { name: 'pnpm', version: '11.2.1' },
    'pnpm-lock.yaml',
  );
  assert.deepEqual(defaults[0].args, ['install', '--frozen-lockfile']);
  assert.equal(
    configured.some((item) => item.args.some((argument) => argument.includes('&&'))),
    false,
  );
});

test('runtime selection uses caller-supplied exact fallbacks only when repository evidence is absent', () => {
  const fixtureCandidate = candidate('fixture.runtime-fallback', '.');
  fixtureCandidate.environment = { install: 'pnpm install', environment: 'Linux' };
  const metadata = { manifests: [{ path: 'package.json', value: {} }], hints: [] };
  const taskOverride = { runtimeFallback: { node: '22.4.1', pnpm: '9.7.0' } };

  const manager = selectPackageManager(fixtureCandidate, metadata, taskOverride);
  assert.deepEqual(manager, { name: 'pnpm', version: '9.7.0', evidencePath: null });
  assert.deepEqual(selectProfile(fixtureCandidate, manager, metadata, taskOverride), {
    id: 'node-22.4.1-pnpm-9.7.0',
    os: 'linux',
    arch: 'x64',
    nodeVersion: '22.4.1',
    bunVersion: null,
    packageManager: { name: 'pnpm', version: '9.7.0' },
  });
});

test('private environment config rejects duplicate or malformed synthetic task overrides', () => {
  const taskOverride = {
    taskId: 'fixture.private-task',
    runtimeFallback: { node: '22.4.1', npm: '10.8.0' },
    install: { args: ['ci'], environment: { CI: '1' } },
  };
  const config = {
    schemaVersion: PRIVATE_CONFIG_SCHEMA_VERSION,
    environments: { taskOverrides: [taskOverride] },
  };
  assert.deepEqual([...validateEnvironmentConfig(config).keys()], ['fixture.private-task']);
  assert.throws(
    () =>
      validateEnvironmentConfig({
        ...config,
        environments: { taskOverrides: [taskOverride, structuredClone(taskOverride)] },
      }),
    /invalid environment task override/u,
  );
});

function candidate(taskId, projectPath) {
  return { taskId, repository: { projectPath } };
}

function command(id, executable, args) {
  return {
    id,
    executable,
    args,
    cwd: '.',
    timeoutMs: 10_000,
    network: 'none',
    required: true,
  };
}
