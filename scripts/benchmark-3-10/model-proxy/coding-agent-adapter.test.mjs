import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  buildClaudeInvocation,
  buildCodexInvocation,
  parseClaudeJsonl,
  parseCodexJsonl,
  readRepositoryInstructions,
} from './coding-agent-adapter.mjs';
import { buildAgentPrompt } from './contracts.mjs';

test('Codex invocation binds exact model and audited Responses proxy without personal context', () => {
  const request = fixtureRequest('openai', 'gpt-5.6-sol');
  const invocation = buildCodexInvocation(request, 'http://proxy:8787/', {
    HOME: '/host/home',
    PATH: '/usr/bin:/bin',
  });
  assert.equal(invocation.command, 'codex');
  assert.deepEqual(argumentValue(invocation.args, '--model'), 'gpt-5.6-sol');
  assert.equal(invocation.args.includes('--ignore-user-config'), true);
  assert.equal(invocation.args.includes('--ephemeral'), true);
  assert.equal(invocation.args.includes('mcp_servers={}'), true);
  assert.equal(invocation.args.includes('project_doc_max_bytes=0'), true);
  assert.equal(
    invocation.args.includes(
      'model_providers.decantr_proxy.base_url="http://proxy:8787/openai/v1"',
    ),
    true,
  );
  assert.equal(invocation.env.HOME, '/run/home');
  assert.equal(invocation.env.OPENAI_API_KEY, undefined);
});

test('Claude invocation is bare, exact-model, no-fallback, no-MCP, and proxy-only', () => {
  const request = fixtureRequest('anthropic', 'claude-fable-5');
  const invocation = buildClaudeInvocation(request, 'http://proxy:8787', {
    HOME: '/host/home',
    PATH: '/usr/bin:/bin',
  });
  assert.equal(invocation.command, 'claude');
  assert.deepEqual(argumentValue(invocation.args, '--model'), 'claude-fable-5');
  assert.equal(invocation.args.includes('--bare'), true);
  assert.equal(invocation.args.includes('--disable-slash-commands'), true);
  assert.equal(invocation.args.includes('--strict-mcp-config'), true);
  assert.equal(invocation.args.includes('--fallback-model'), false);
  assert.equal(invocation.env.ANTHROPIC_BASE_URL, 'http://proxy:8787/anthropic');
  assert.equal(invocation.env.HOME, '/run/home');
  assert.equal(invocation.env.ANTHROPIC_API_KEY, undefined);
});

test('provider JSONL parsers retain only the final agent message', () => {
  const codex = parseCodexJsonl(
    [
      '{"type":"thread.started","thread_id":"one"}',
      '{"type":"item.completed","item":{"type":"agent_message","text":"first"}}',
      '{"type":"item.completed","item":{"type":"agent_message","text":"done"}}',
    ].join('\n'),
  );
  const claude = parseClaudeJsonl(
    [
      '{"type":"system","subtype":"init"}',
      '{"type":"result","subtype":"success","result":"done"}',
    ].join('\n'),
  );
  assert.equal(codex.finalMessage, 'done');
  assert.equal(codex.eventCount, 3);
  assert.equal(claude.finalMessage, 'done');
  assert.equal(claude.eventCount, 2);
});

test('repository-native instructions are bounded, app-scoped, and provider-neutral', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-agent-instructions-'));
  try {
    await mkdir(join(root, 'apps', 'web'), { recursive: true });
    await writeFile(join(root, 'AGENTS.md'), 'Run root checks.\n');
    await writeFile(join(root, 'apps', 'web', 'CLAUDE.md'), 'Use app conventions.\n');
    const instructions = await readRepositoryInstructions(root, 'apps/web');
    assert.deepEqual(
      instructions.map((item) => item.path),
      ['AGENTS.md', 'apps/web/CLAUDE.md'],
    );
    const prompt = buildAgentPrompt(fixtureRequest('openai', 'gpt-5.6-sol'), instructions);
    assert.match(prompt, /Run root checks\./u);
    assert.match(prompt, /Use app conventions\./u);
    assert.doesNotMatch(prompt, /decantr-engineering/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

function fixtureRequest(provider, requestedModel) {
  return {
    schemaVersion: 'decantr-benchmark-adapter-request.v1',
    runId: 'run-fixture',
    taskId: 'task-fixture',
    modelId: `${provider}-fixture`,
    provider,
    requestedModel,
    reasoningEffort: 'high',
    arm: 'control',
    prompt: 'Implement the fixture.',
    context: 'Use the local component.',
    informationEntitlement: { rule: 'same-in-both-arms' },
    workspace: '/workspace',
    projectPath: 'apps/web',
    scope: { allowedPaths: ['apps/web/**'], forbiddenPaths: [] },
    limits: {
      timeoutMs: 60_000,
      maxRequests: 40,
      maxInputTokens: 100_000,
      maxOutputTokens: 20_000,
      maxCostUsd: 16,
    },
    maxRunCostUsd: 16,
    isolation: { home: '/run/home' },
    bindings: { planSha256: 'a'.repeat(64) },
  };
}

function argumentValue(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

