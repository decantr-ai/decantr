import assert from 'node:assert/strict';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  publicRegistryOptions,
  readPublicRegistryChecks,
  retryVerification,
  verificationStatus,
} from './release-verification-lib.mjs';

const name = '@test/package',
  version = '1.0.1';
const ready = (args) =>
  args.includes('versions')
    ? ['1.0.0', version]
    : args.includes('dist-tags')
      ? { latest: version }
      : { name, version, dependencies: { safe: '^1.0.0' } };
const query = (response = ready) =>
  readPublicRegistryChecks(name, version, 'latest', {
    run(command, args, options) {
      assert.equal(command, 'npm');
      assert.ok(args.includes('--registry=https://registry.npmjs.org/'));
      assert.ok(args.includes('--prefer-online=true'));
      assert.ok(options.timeout <= 15_000);
      return JSON.stringify(response(args));
    },
  });
function npmError(code) {
  const error = new Error('npm query');
  error.stdout = JSON.stringify({ error: { code } });
  return error;
}

test('accepts only consistent version, tag, and manifest evidence', () => {
  assert.equal(verificationStatus(query()), 'pass');
  assert.equal(
    verificationStatus(query((args) => (args.includes('versions') ? ['1.0.0'] : ready(args)))),
    'pending',
  );
  assert.equal(
    verificationStatus(
      query((args) => (args.includes('dist-tags') ? { latest: '1.0.0' } : ready(args))),
    ),
    'pending',
  );
});

test('real npm configuration cannot override scoped registry, online mode, or isolated cache', () => {
  const scratch = mkdtempSync(join(tmpdir(), 'decantr-npm-config-'));
  try {
    const config = join(scratch, 'npmrc'),
      cache = join(scratch, 'cache');
    writeFileSync(
      config,
      '@test:registry=https://private.example.invalid/\noffline=true\nprefer-offline=true\n',
    );
    const result = spawnSync(
      'npm',
      [
        'config',
        'list',
        '--json',
        `--userconfig=${config}`,
        ...publicRegistryOptions('@test/pkg', cache),
      ],
      {
        cwd: scratch,
        encoding: 'utf8',
        timeout: 10_000,
        env: { ...process.env, npm_config_offline: 'true', npm_config_prefer_offline: 'true' },
      },
    );
    assert.equal(result.status, 0, result.stderr);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed['@test:registry'], 'https://registry.npmjs.org/');
    assert.equal(parsed.registry, 'https://registry.npmjs.org/');
    assert.equal(parsed.offline, false);
    assert.equal(parsed['prefer-offline'], false);
    assert.equal(parsed['prefer-online'], true);
    assert.equal(parsed.cache, cache);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

test('every public query gets an empty disposable cache, removed on error too', () => {
  const caches = [];
  const checks = readPublicRegistryChecks(name, version, 'latest', {
    run: (_, args) => {
      const cache = args.find((arg) => arg.startsWith('--cache=')).slice('--cache='.length);
      assert.ok(existsSync(cache));
      caches.push(cache);
      throw npmError('E404');
    },
  });
  assert.equal(verificationStatus(checks), 'pending');
  assert.equal(new Set(caches).size, 3);
  assert.ok(caches.every((cache) => !existsSync(cache)));
});
for (const code of ['E404', 'ETIMEDOUT', 'EAI_AGAIN', 'E503'])
  test(`${code} remains unverified`, () => {
    const checks = readPublicRegistryChecks(name, version, 'latest', {
      run: () => {
        throw npmError(code);
      },
    });
    assert.equal(verificationStatus(checks), 'pending');
  });
for (const code of ['E401', 'E403', 'EINTEGRITY', 'UNKNOWN'])
  test(`${code} fails without assuming propagation`, () => {
    let calls = 0;
    const checks = readPublicRegistryChecks(name, version, 'latest', {
      run: () => {
        calls++;
        throw npmError(code);
      },
    });
    assert.equal(verificationStatus(checks), 'fail');
    assert.equal(calls, 1);
  });
test('wrong identities, malformed metadata, and workspace protocol leaks are failures', () => {
  for (const manifest of [
    { name: 'wrong', version },
    { name, version: 'wrong' },
    [],
    { name, version, dependencies: { bad: 'workspace:*' } },
    { name, version, dependencies: [] },
  ]) {
    assert.equal(
      verificationStatus(
        query((args) =>
          args.includes('versions') || args.includes('dist-tags') ? ready(args) : manifest,
        ),
      ),
      'fail',
    );
  }
  assert.equal(verificationStatus(query(() => ({ malformed: true }))), 'fail');
});
test('a delayed release becomes verified without any publish or registry mutation', async () => {
  let time = 0,
    attempts = 0;
  const result = await retryVerification(() => ({ status: ++attempts < 3 ? 'pending' : 'pass' }), {
    attempts: 4,
    delayMs: 10,
    deadline: 100,
    now: () => time,
    sleep: async (ms) => {
      time += ms;
    },
  });
  assert.equal(result.status, 'pass');
  assert.equal(result.attempts, 3);
  assert.equal(time, 20);
});
test('polling stops at the shared time budget and distinguishes the attempt cap', async () => {
  let time = 0;
  const options = {
    attempts: 20,
    delayMs: 10,
    deadline: 15,
    now: () => time,
    sleep: async (ms) => {
      time += ms;
    },
  };
  const result = await retryVerification(() => ({ status: 'pending' }), options);
  assert.equal(result.status, 'pending');
  assert.equal(result.waitExhausted, 'time-limit');
  assert.equal(time, 15);
  const capped = await retryVerification(() => ({ status: 'pending' }), {
    ...options,
    attempts: 1,
    deadline: 100,
  });
  assert.equal(capped.waitExhausted, 'attempt-limit');
});
test('definitive failures stop immediately and exhausted budgets do not query npm', async () => {
  let calls = 0;
  await retryVerification(
    () => {
      calls++;
      return { status: 'fail' };
    },
    { attempts: 3, delayMs: 1, deadline: 100, now: () => 0 },
  );
  assert.equal(calls, 1);
  const checks = readPublicRegistryChecks(name, version, 'latest', {
    remainingMs: () => 0,
    run: () => {
      throw new Error('must not run');
    },
  });
  assert.equal(verificationStatus(checks), 'pending');
});

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const scenario of ['delayed', 'pending', 'unauthorized', 'bad-manifest', 'smoke-failure'])
  test(`real verifier CLI: ${scenario}`, () => {
    const scratch = mkdtempSync(join(tmpdir(), 'decantr-registry-test-'));
    try {
      const bin = join(scratch, 'bin');
      mkdirSync(bin);
      const packagePath =
        scenario === 'smoke-failure'
          ? 'packages/cli/package.json'
          : 'packages/mcp-server/package.json';
      const manifest = JSON.parse(readFileSync(join(root, packagePath), 'utf8'));
      const stub = `#!${process.execPath}
const fs=require('node:fs');const args=process.argv.slice(2);
fs.appendFileSync(process.env.CALLS,JSON.stringify(args)+'\\n');
if(args[0]!=='view')process.exit(90);
const p=${JSON.stringify({ name: manifest.name, version: manifest.version })};
let attempt=Number(fs.existsSync(process.env.COUNT)?fs.readFileSync(process.env.COUNT,'utf8'):0);
if(args.includes('versions'))fs.writeFileSync(process.env.COUNT,String(++attempt));
if(process.env.SCENARIO==='unauthorized'){console.log(JSON.stringify({error:{code:'E401'}}));process.exit(1)}
if(process.env.SCENARIO==='pending'||(process.env.SCENARIO==='delayed'&&attempt===1)){console.log(JSON.stringify({error:{code:'E404'}}));process.exit(1)}
if(args.includes('versions'))console.log(JSON.stringify([p.version]));
else if(args.includes('dist-tags'))console.log(JSON.stringify({latest:p.version}));
else console.log(JSON.stringify(process.env.SCENARIO==='bad-manifest'?{...p,name:'wrong'}:p));
`;
      writeFileSync(join(bin, 'npm'), stub);
      chmodSync(join(bin, 'npm'), 0o755);
      writeFileSync(
        join(bin, 'npx'),
        `#!${process.execPath}\nconsole.log('invalid smoke output');`,
      );
      chmodSync(join(bin, 'npx'), 0o755);
      const report = join(scratch, 'report.json'),
        calls = join(scratch, 'calls');
      const result = spawnSync(
        process.execPath,
        [
          join(root, 'scripts/verify-published-packages.mjs'),
          `--only=${manifest.name}`,
          '--json',
          '--no-webhook',
          '--retries=2',
          '--retry-delay=1',
          '--max-wait=5000',
          `--report-json=${report}`,
        ],
        {
          cwd: scratch,
          encoding: 'utf8',
          timeout: 15_000,
          env: {
            ...process.env,
            PATH: `${bin}:${process.env.PATH}`,
            CALLS: calls,
            COUNT: join(scratch, 'count'),
            SCENARIO: scenario,
          },
        },
      );
      assert.equal(result.error, undefined);
      const expected = scenario === 'delayed' ? 0 : scenario === 'pending' ? 2 : 1;
      assert.equal(result.status, expected, result.stderr);
      const output = JSON.parse(result.stdout);
      assert.deepEqual(JSON.parse(readFileSync(report, 'utf8')), output);
      assert.equal(output.status, expected === 0 ? 'pass' : expected === 2 ? 'pending' : 'fail');
      assert.ok(
        readFileSync(calls, 'utf8')
          .trim()
          .split('\n')
          .every((line) => JSON.parse(line)[0] === 'view'),
      );
      if (expected === 2) {
        assert.equal(output.summary.failed, 0);
        assert.equal(output.summary.pending, 1);
      }
      if (expected === 1) assert.equal(output.results[0].attempts, 1);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });
