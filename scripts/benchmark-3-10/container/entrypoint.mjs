#!/usr/bin/env node
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXPECTED_CODEX_VERSION = '0.145.0-alpha.27';
const EXPECTED_CLAUDE_VERSION = '2.1.153';
const CONTROLLER_PATH = '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin';
const FORBIDDEN_ENVIRONMENT = /^(?:ANTHROPIC_API_KEY|CLAUDE_CONFIG_DIR|CODEX_HOME|MCP_|OPENAI_API_KEY|NPM_CONFIG_USERCONFIG|XDG_CONFIG_DIRS)/u;

export function assertIsolatedEnvironment(input = {}) {
  const environment = input.environment ?? process.env;
  const uid = input.uid ?? (typeof process.getuid === 'function' ? process.getuid() : null);
  const home = environment.HOME;
  if (uid === 0) throw new Error('benchmark container must not run as root');
  if (home !== '/home/benchmark-empty') throw new Error('benchmark HOME must be /home/benchmark-empty');
  const entries = input.homeEntries ?? readdirSync(home);
  if (entries.length > 0) throw new Error(`benchmark HOME is not empty: ${entries.join(', ')}`);
  const forbidden = Object.keys(environment).filter((key) => FORBIDDEN_ENVIRONMENT.test(key));
  if (forbidden.length > 0) throw new Error(`forbidden host or provider configuration: ${forbidden.join(', ')}`);
  return true;
}

export function isolatedChildEnvironment(environment = process.env) {
  const allowed = [
    'HOME',
    'PATH',
    'LANG',
    'LC_ALL',
    'TZ',
    'CI',
    'NO_COLOR',
    'XDG_CACHE_HOME',
    'XDG_CONFIG_HOME',
    'XDG_DATA_HOME',
    'DECANTR_TASK_RUNTIME_KIND',
    'DECANTR_TASK_RUNTIME_VERSION',
    'DECANTR_TASK_PACKAGE_MANAGER',
    'DECANTR_TASK_PACKAGE_MANAGER_VERSION',
    'DECANTR_BENCHMARK_IMAGE_DIGEST',
    'DECANTR_BENCHMARK_NETWORK_MODE',
  ];
  const output = Object.fromEntries(
    allowed.filter((key) => typeof environment[key] === 'string').map((key) => [key, environment[key]]),
  );
  if (typeof environment.BENCHMARK_MODEL_PROXY_URL === 'string') {
    output.BENCHMARK_MODEL_PROXY_URL = environment.BENCHMARK_MODEL_PROXY_URL;
  }
  return output;
}

function selfCheck() {
  assertIsolatedEnvironment();
  const codex = version('codex', ['--version'], controllerChildEnvironment());
  const claude = version('claude', ['--version'], controllerChildEnvironment());
  const runtimeKind = process.env.DECANTR_TASK_RUNTIME_KIND;
  const runtimeCommand = runtimeKind === 'bun' ? 'bun' : 'node';
  const runtime = version(runtimeCommand, ['--version']);
  const packageManagerName = process.env.DECANTR_TASK_PACKAGE_MANAGER;
  const packageManager = version(packageManagerName, ['--version']);
  assertVersion(runtime, process.env.DECANTR_TASK_RUNTIME_VERSION, 'task runtime');
  assertVersion(packageManager, process.env.DECANTR_TASK_PACKAGE_MANAGER_VERSION, 'task package manager');
  const evaluatorRuntime = version(process.execPath, [
    '/opt/decantr-benchmark/evaluator-runtime/smoke.mjs',
    '--browsers-path',
    '/opt/decantr-benchmark/evaluator-runtime/browsers',
  ]);
  if (!codex.includes(EXPECTED_CODEX_VERSION)) {
    throw new Error(`unexpected Codex version: ${codex}`);
  }
  if (!claude.includes(EXPECTED_CLAUDE_VERSION)) {
    throw new Error(`unexpected Claude Code version: ${claude}`);
  }
  console.log(
    JSON.stringify({
      ok: true,
      uid: typeof process.getuid === 'function' ? process.getuid() : null,
      home: process.env.HOME,
      codex,
      claude,
      controllerNode: process.version,
      taskRuntime: { kind: runtimeKind, version: runtime },
      taskPackageManager: { name: packageManagerName, version: packageManager },
      evaluatorRuntime: JSON.parse(evaluatorRuntime),
      benchmarkImageDigest: process.env.DECANTR_BENCHMARK_IMAGE_DIGEST,
    }),
  );
}

function version(command, args, environment = isolatedChildEnvironment()) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    env: environment,
    shell: false,
    timeout: 10_000,
  });
  if (result.status !== 0) {
    const details = [
      `status=${result.status ?? 'none'}`,
      `signal=${result.signal ?? 'none'}`,
      result.error?.message,
      result.stdout?.trim(),
      result.stderr?.trim(),
    ].filter(Boolean);
    throw new Error(`${command} version check failed: ${details.join(' | ')}`);
  }
  return (result.stdout ?? result.stderr ?? '').trim();
}

function controllerChildEnvironment() {
  return { ...isolatedChildEnvironment(), PATH: CONTROLLER_PATH };
}

function assertVersion(actual, expected, label) {
  if (typeof expected !== 'string' || actual.replace(/^v/u, '') !== expected.replace(/^v/u, '')) {
    throw new Error(`unexpected ${label} version: expected ${expected}, received ${actual}`);
  }
}

function main(argv) {
  if (argv.length === 1 && argv[0] === '--self-check') return selfCheck();
  assertIsolatedEnvironment();
  if (argv.length === 0) throw new Error('a fixed executable and argv are required');
  const executable = basename(argv[0]).toLowerCase();
  if (['bash', 'dash', 'fish', 'sh', 'zsh'].includes(executable)) {
    throw new Error(`shell entrypoints are forbidden: ${executable}`);
  }
  const result = spawnSync(argv[0], argv.slice(1), {
    stdio: 'inherit',
    env: isolatedChildEnvironment(),
    shell: false,
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
