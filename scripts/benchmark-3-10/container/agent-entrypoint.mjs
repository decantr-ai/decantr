#!/usr/bin/env node
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CONTROLLER_PATH = '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin';
const PROVIDER_SECRET_KEYS = new Set(['ANTHROPIC_API_KEY', 'OPENAI_API_KEY']);
const FORBIDDEN_AGENT_ROOTS = [
  '/opt/decantr-agent/evaluator',
  '/opt/decantr-agent/evaluators',
  '/opt/decantr-agent/evaluator-runtime',
  '/opt/decantr-agent/tasks',
  '/opt/decantr-agent/review',
];

export function assertAgentEnvironment(input = {}) {
  const environment = input.environment ?? process.env;
  const uid = input.uid ?? (typeof process.getuid === 'function' ? process.getuid() : null);
  const homeEntries = input.homeEntries ?? readdirSync(environment.HOME);
  if (uid === 0) throw new Error('agent container must not run as root');
  if (environment.HOME !== '/home/benchmark-empty') {
    throw new Error('agent HOME must be /home/benchmark-empty');
  }
  if (homeEntries.length > 0) throw new Error(`agent HOME is not empty: ${homeEntries.join(', ')}`);
  const secrets = Object.keys(environment).filter((key) => PROVIDER_SECRET_KEYS.has(key));
  if (secrets.length > 0) {
    throw new Error(`provider credentials are forbidden in the agent process: ${secrets.join(', ')}`);
  }
  return true;
}

export function agentChildEnvironment(environment = process.env) {
  const allowed = [
    'CI',
    'DECANTR_CLAUDE_CODE_VERSION',
    'DECANTR_CODEX_VERSION',
    'DECANTR_MODEL_PROXY_RECEIPT',
    'DECANTR_MODEL_PROXY_URL',
    'DECANTR_TASK_PACKAGE_MANAGER',
    'DECANTR_TASK_PACKAGE_MANAGER_VERSION',
    'DECANTR_TASK_RUNTIME_KIND',
    'DECANTR_TASK_RUNTIME_VERSION',
    'GITHUB_EVENT_NAME',
    'GITHUB_REF',
    'GITHUB_RUN_ATTEMPT',
    'GITHUB_RUN_ID',
    'GITHUB_SHA',
    'HOME',
    'LANG',
    'LC_ALL',
    'NO_COLOR',
    'PATH',
    'RUNNER_ARCH',
    'RUNNER_ENVIRONMENT',
    'RUNNER_OS',
    'TZ',
    'XDG_CACHE_HOME',
    'XDG_CONFIG_HOME',
    'XDG_DATA_HOME',
  ];
  return Object.fromEntries(
    allowed
      .filter((key) => typeof environment[key] === 'string')
      .map((key) => [key, environment[key]]),
  );
}

export function assertAgentImageContents(exists = (path) => {
  try {
    readdirSync(path);
    return true;
  } catch {
    return false;
  }
}) {
  const present = FORBIDDEN_AGENT_ROOTS.filter((path) => exists(path));
  if (present.length > 0) throw new Error(`forbidden evaluator material is present: ${present.join(', ')}`);
  return true;
}

function selfCheck() {
  assertAgentEnvironment();
  assertAgentImageContents();
  const codex = version('codex', ['--version'], controllerEnvironment());
  const claude = version('claude', ['--version'], controllerEnvironment());
  const runtimeKind = process.env.DECANTR_TASK_RUNTIME_KIND;
  const runtime = version(runtimeKind === 'bun' ? 'bun' : 'node', ['--version']);
  const packageManagerName = process.env.DECANTR_TASK_PACKAGE_MANAGER;
  const packageManager = version(packageManagerName, ['--version']);
  assertVersion(codex, process.env.DECANTR_CODEX_VERSION, 'Codex');
  assertVersion(claude, process.env.DECANTR_CLAUDE_CODE_VERSION, 'Claude Code');
  assertVersion(runtime, process.env.DECANTR_TASK_RUNTIME_VERSION, 'task runtime');
  assertVersion(packageManager, process.env.DECANTR_TASK_PACKAGE_MANAGER_VERSION, 'task package manager');
  process.stdout.write(
    `${JSON.stringify({
      ok: true,
      evaluatorMaterialAbsent: true,
      providerCredentialsAbsent: true,
      controllerNode: process.version,
      codex,
      claude,
      taskRuntime: { kind: runtimeKind, version: runtime },
      taskPackageManager: { name: packageManagerName, version: packageManager },
    })}\n`,
  );
}

function runAdapter(argv) {
  assertAgentEnvironment();
  const provider = argv[1];
  if (!['openai', 'anthropic'].includes(provider)) throw new Error('adapter provider is invalid');
  const entrypoint =
    provider === 'openai'
      ? '/opt/decantr-agent/model-proxy/openai-codex-adapter.mjs'
      : '/opt/decantr-agent/model-proxy/anthropic-claude-adapter.mjs';
  execute(process.execPath, [entrypoint, ...argv.slice(2)], agentChildEnvironment());
}

function runProxy(argv) {
  const providerSecrets = Object.keys(process.env).filter((key) => PROVIDER_SECRET_KEYS.has(key));
  if (providerSecrets.length !== 1) {
    throw new Error('proxy process requires exactly one provider credential');
  }
  execute(
    process.execPath,
    ['/opt/decantr-agent/model-proxy/audited-proxy.mjs', ...argv.slice(1)],
    process.env,
  );
}

function runStage(argv) {
  assertAgentEnvironment();
  execute(
    process.execPath,
    ['/opt/decantr-agent/runner/agent-stage.mjs', ...argv.slice(1)],
    agentChildEnvironment(),
  );
}

function execute(command, args, environment) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: environment,
    shell: false,
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

function version(command, args, environment = agentChildEnvironment()) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    env: environment,
    shell: false,
    timeout: 10_000,
  });
  if (result.status !== 0) {
    throw new Error(`${command} version check failed: ${(result.stderr ?? '').trim()}`);
  }
  return (result.stdout || result.stderr || '').trim();
}

function controllerEnvironment() {
  return { ...agentChildEnvironment(), PATH: CONTROLLER_PATH };
}

function assertVersion(actual, expected, label) {
  if (typeof expected !== 'string' || !actual.includes(expected.replace(/^v/u, ''))) {
    throw new Error(`unexpected ${label} version: expected ${expected}, received ${actual}`);
  }
}

function main(argv) {
  if (argv.length === 1 && argv[0] === '--self-check') return selfCheck();
  if (argv[0] === '--adapter') return runAdapter(argv);
  if (argv[0] === '--proxy') return runProxy(argv);
  if (argv[0] === '--stage') return runStage(argv);
  throw new Error('agent entrypoint accepts --self-check, --adapter, --proxy, or --stage only');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
