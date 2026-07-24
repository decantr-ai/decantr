import { spawnSync } from 'node:child_process';
import { lstat, readFile, realpath, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import {
  assertAdapterRequest,
  buildAgentPrompt,
  createAdapterResponse,
  quoteToml,
  readAndAssertProxyReceipt,
} from './contracts.mjs';
import { prettyCanonicalJson, sha256 } from '../runner/canonical.mjs';

export async function runAdapter(provider, options, environment = process.env) {
  const request = assertAdapterRequest(
    JSON.parse(await readFile(options.requestPath, 'utf8')),
    provider,
  );
  const proxyUrl = requireEnvironment(environment, 'DECANTR_MODEL_PROXY_URL');
  const receiptPath = requireEnvironment(environment, 'DECANTR_MODEL_PROXY_RECEIPT');
  const repositoryInstructions = await readRepositoryInstructions(
    request.workspace,
    request.projectPath,
  );
  const prompt = buildAgentPrompt(request, repositoryInstructions);
  const invocation =
    provider === 'openai'
      ? buildCodexInvocation(request, proxyUrl, environment)
      : buildClaudeInvocation(request, proxyUrl, environment);
  const startedAt = Date.now();
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: request.workspace,
    env: invocation.env,
    input: prompt,
    encoding: 'utf8',
    timeout: request.limits.timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
    shell: false,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const agentResult = {
    exitCode: Number.isInteger(result.status) ? result.status : null,
    signal: result.signal ?? null,
    durationMs: Date.now() - startedAt,
  };
  const receipt = await readAndAssertProxyReceipt(receiptPath, request);
  const parsed =
    provider === 'openai'
      ? parseCodexJsonl(result.stdout ?? '')
      : parseClaudeJsonl(result.stdout ?? '');
  const response = createAdapterResponse({
    request,
    receipt,
    agentResult,
    finalMessage: parsed.finalMessage,
    trajectory: [
      {
        type: `${provider}.cli.observed`,
        payload: {
          executable: basename(invocation.command),
          eventCount: parsed.eventCount,
          stderrSha256: parsed.stderrDigest(result.stderr ?? ''),
          processErrorCode: result.error?.code ?? null,
        },
      },
    ],
  });
  await writeFile(options.responsePath, prettyCanonicalJson(response), { mode: 0o600 });
  return response;
}

export function buildCodexInvocation(request, proxyUrl, environment = process.env) {
  const command = resolveExecutable(environment.DECANTR_CODEX_BIN ?? 'codex');
  const providerBaseUrl = `${stripTrailingSlash(proxyUrl)}/openai/v1`;
  const home = request.isolation?.home ?? environment.HOME;
  const env = agentEnvironment(environment, home, {
    CODEX_HOME: home,
    DECANTR_PROXY_BEARER: 'decantr-run-local-proxy',
  });
  return {
    command,
    args: [
      'exec',
      '--json',
      '--ephemeral',
      '--ignore-user-config',
      '--strict-config',
      '--sandbox',
      'workspace-write',
      '--model',
      request.requestedModel,
      '--cd',
      request.workspace,
      '--color',
      'never',
      '-c',
      'approval_policy="never"',
      '-c',
      `model_reasoning_effort=${quoteToml(request.reasoningEffort ?? 'high')}`,
      '-c',
      'model_provider="decantr_proxy"',
      '-c',
      'mcp_servers={}',
      '-c',
      'web_search="disabled"',
      '-c',
      'project_doc_max_bytes=0',
      '-c',
      'project_doc_fallback_filenames=[]',
      '-c',
      'model_providers.decantr_proxy.name="Decantr audited model proxy"',
      '-c',
      `model_providers.decantr_proxy.base_url=${quoteToml(providerBaseUrl)}`,
      '-c',
      'model_providers.decantr_proxy.env_key="DECANTR_PROXY_BEARER"',
      '-c',
      'model_providers.decantr_proxy.wire_api="responses"',
      '-',
    ],
    env,
  };
}

export function buildClaudeInvocation(request, proxyUrl, environment = process.env) {
  const command = resolveExecutable(environment.DECANTR_CLAUDE_BIN ?? 'claude');
  const providerBaseUrl = `${stripTrailingSlash(proxyUrl)}/anthropic`;
  const home = request.isolation?.home ?? environment.HOME;
  const maximumBudget = Number(request.maxRunCostUsd ?? request.limits.maxCostUsd ?? 0);
  const args = [
    '--print',
    '--bare',
    '--disable-slash-commands',
    '--strict-mcp-config',
    '--mcp-config',
    '{"mcpServers":{}}',
    '--tools',
    'Bash,Edit,Glob,Grep,Read,Write',
    '--dangerously-skip-permissions',
    '--model',
    request.requestedModel,
    '--effort',
    request.reasoningEffort ?? 'high',
    '--max-turns',
    String(request.limits.maxRequests),
    '--no-session-persistence',
    '--output-format',
    'stream-json',
    '--verbose',
  ];
  if (maximumBudget > 0) args.push('--max-budget-usd', String(maximumBudget));
  return {
    command,
    args,
    env: agentEnvironment(environment, home, {
      ANTHROPIC_BASE_URL: providerBaseUrl,
      ANTHROPIC_AUTH_TOKEN: 'decantr-run-local-proxy',
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
      DISABLE_AUTOUPDATER: '1',
      DISABLE_ERROR_REPORTING: '1',
      DISABLE_TELEMETRY: '1',
    }),
  };
}

export function parseCodexJsonl(stdout) {
  const events = parseJsonLines(stdout);
  const messages = events
    .filter((event) => event?.type === 'item.completed' && event.item?.type === 'agent_message')
    .map((event) => event.item.text)
    .filter((value) => typeof value === 'string');
  return {
    eventCount: events.length,
    finalMessage: messages.at(-1) ?? '',
    stderrDigest: digestText,
  };
}

export function parseClaudeJsonl(stdout) {
  const events = parseJsonLines(stdout);
  const result = [...events].reverse().find((event) => event?.type === 'result');
  return {
    eventCount: events.length,
    finalMessage: typeof result?.result === 'string' ? result.result : '',
    stderrDigest: digestText,
  };
}

export function parseAdapterArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--request') options.requestPath = resolve(argv[++index]);
    else if (argv[index] === '--response') options.responsePath = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argv[index]}`);
  }
  if (!options.requestPath || !options.responsePath) {
    throw new Error('--request and --response are required');
  }
  return options;
}

export async function readRepositoryInstructions(workspace, projectPath) {
  const root = await realpath(resolve(workspace));
  const project = resolve(root, projectPath);
  const relation = relative(root, project);
  if (relation === '..' || relation.startsWith(`..${separator()}`) || isAbsolute(relation)) {
    throw new Error('projectPath escapes the adapter workspace');
  }
  const directories = [];
  let current = project;
  while (true) {
    directories.push(current);
    if (current === root) break;
    current = dirname(current);
  }
  directories.reverse();
  const instructions = [];
  let totalBytes = 0;
  for (const directory of directories) {
    for (const name of ['AGENTS.override.md', 'AGENTS.md', 'CLAUDE.md']) {
      const path = join(directory, name);
      let stats;
      try {
        stats = await lstat(path);
      } catch (error) {
        if (error?.code === 'ENOENT') continue;
        throw error;
      }
      if (!stats.isFile() || stats.isSymbolicLink()) {
        throw new Error(`repository instruction path is not a regular file: ${path}`);
      }
      const bytes = await readFile(path);
      totalBytes += bytes.byteLength;
      if (totalBytes > 128 * 1024) {
        throw new Error('repository-native instructions exceed the 128 KiB benchmark limit');
      }
      instructions.push({ path: relative(root, path) || name, content: bytes.toString('utf8') });
    }
  }
  return instructions;
}

function parseJsonLines(value) {
  return value
    .split(/\r?\n/gu)
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new Error('coding agent emitted a non-JSON output line');
      }
    });
}

function agentEnvironment(environment, home, additions) {
  const allowlist = [
    'CI',
    'HOME',
    'LANG',
    'LC_ALL',
    'NO_COLOR',
    'PATH',
    'TZ',
    'XDG_CACHE_HOME',
    'XDG_CONFIG_HOME',
    'XDG_DATA_HOME',
  ];
  return {
    ...Object.fromEntries(
      allowlist
        .filter((key) => typeof environment[key] === 'string')
        .map((key) => [key, environment[key]]),
    ),
    HOME: home,
    ...additions,
  };
}

function requireEnvironment(environment, key) {
  const value = environment[key];
  if (typeof value !== 'string' || value === '') throw new Error(`${key} is required`);
  return value;
}

function resolveExecutable(value) {
  return value.includes('/') ? resolve(value) : value;
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/u, '');
}

function digestText(value) {
  return sha256(value);
}

function separator() {
  return process.platform === 'win32' ? '\\' : '/';
}
