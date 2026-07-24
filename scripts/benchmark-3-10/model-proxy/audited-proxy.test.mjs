import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { startAuditedProxy, validateProviderRequest } from './audited-proxy.mjs';
import { assertProxyReceipt } from './contracts.mjs';

test('audited proxy strips agent credentials, binds exact model, caps output, and records usage', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-audited-proxy-'));
  const observed = [];
  const upstream = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    observed.push({
      url: request.url,
      authorization: request.headers.authorization,
      body: JSON.parse(Buffer.concat(chunks).toString('utf8')),
    });
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(
      JSON.stringify({
        model: 'gpt-5.6-sol',
        status: 'completed',
        usage: {
          input_tokens: 100,
          input_tokens_details: { cached_tokens: 20, cache_write_tokens: 10 },
          output_tokens: 50,
        },
      }),
    );
  });
  await listen(upstream);
  const upstreamAddress = upstream.address();
  const receiptPath = join(root, 'receipt.json');
  const proxy = await startAuditedProxy({
    schemaVersion: 'decantr-benchmark-model-proxy-config.v1',
    runId: 'run-proxy',
    provider: 'openai',
    requestedModel: 'gpt-5.6-sol',
    receiptPath,
    upstreamBaseUrl: `http://127.0.0.1:${upstreamAddress.port}`,
    secrets: { OPENAI_API_KEY: 'real-provider-key' },
    limits: {
      maxRequests: 2,
      maxInputTokens: 1000,
      maxOutputTokens: 100,
      timeoutMs: 10_000,
      maxCostUsd: 1,
    },
    pricing: {
      inputPerMillionTokensUsd: 5,
      cachedInputPerMillionTokensUsd: 0.5,
      cacheWriteInputPerMillionTokensUsd: 6.25,
      outputPerMillionTokensUsd: 30,
    },
  });
  try {
    const response = await fetch(`${proxy.url}/openai/v1/responses`, {
      method: 'POST',
      headers: {
        authorization: 'Bearer decantr-run-local-proxy',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.6-sol',
        max_output_tokens: 500,
        store: true,
        tools: [{ type: 'function', name: 'local_shell' }],
        input: 'fixture',
      }),
    });
    assert.equal(response.status, 200);
    assert.equal(observed.length, 1);
    assert.equal(observed[0].url, '/responses');
    assert.equal(observed[0].authorization, 'Bearer real-provider-key');
    assert.equal(observed[0].body.max_output_tokens, 100);
    assert.equal(observed[0].body.store, false);
    const second = await fetch(
      `${proxy.url}/openai/v1/responses`,
      {
        method: 'POST',
        headers: {
          authorization: 'Bearer decantr-run-local-proxy',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5.6-sol',
          max_output_tokens: 500,
          input: 'second fixture',
        }),
      },
    );
    assert.equal(second.status, 200);
    assert.equal(observed[1].body.max_output_tokens, 50);
    const exhausted = await fetch(
      `${proxy.url}/openai/v1/responses`,
      {
        method: 'POST',
        headers: {
          authorization: 'Bearer decantr-run-local-proxy',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5.6-sol',
          max_output_tokens: 1,
          input: 'third fixture',
        }),
      },
    );
    assert.equal(exhausted.status, 429);
    assert.equal(observed.length, 2);
    const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
    assert.equal(receipt.returnedModel, 'gpt-5.6-sol');
    assert.equal(receipt.usage.requests, 2);
    assert.equal(receipt.usage.outputTokens, 100);
    assertProxyReceipt(receipt, {
      runId: 'run-proxy',
      provider: 'openai',
      requestedModel: 'gpt-5.6-sol',
    });
  } finally {
    await proxy.close();
    await close(upstream);
    await rm(root, { recursive: true, force: true });
  }
});

test('audited proxy rejects token limits whose worst case exceeds the run reservation', async () => {
  await assert.rejects(
    startAuditedProxy({
      schemaVersion:
        'decantr-benchmark-model-proxy-config.v1',
      runId: 'run-over-budget',
      provider: 'openai',
      requestedModel: 'gpt-5.6-sol',
      receiptPath: '/tmp/unused-provider-receipt.json',
      limits: {
        maxRequests: 1,
        maxInputTokens: 1_000_000,
        maxOutputTokens: 1_000_000,
        timeoutMs: 10_000,
        maxCostUsd: 1,
      },
      pricing: {
        inputPerMillionTokensUsd: 5,
        cachedInputPerMillionTokensUsd: 0.5,
        cacheWriteInputPerMillionTokensUsd: 6.25,
        outputPerMillionTokensUsd: 30,
      },
    }),
    /token limits exceed the reserved run cost/u,
  );
});

test('audited proxy rejects substitutions and provider-hosted network tools before egress', () => {
  const limits = { maxOutputTokens: 100 };
  assert.throws(
    () =>
      validateProviderRequest(
        'openai',
        JSON.stringify({ model: 'gpt-5.6-terra', input: 'fixture' }),
        'gpt-5.6-sol',
        limits,
      ),
    /model mismatch/u,
  );
  assert.throws(
    () =>
      validateProviderRequest(
        'openai',
        JSON.stringify({
          model: 'gpt-5.6-sol',
          tools: [{ type: 'web_search' }],
          input: 'fixture',
        }),
        'gpt-5.6-sol',
        limits,
      ),
    /hosted OpenAI tools are forbidden/u,
  );
  assert.throws(
    () =>
      validateProviderRequest(
        'anthropic',
        JSON.stringify({
          model: 'claude-fable-5',
          max_tokens: 100,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [],
        }),
        'claude-fable-5',
        limits,
      ),
    /hosted Anthropic tools are forbidden/u,
  );
});

async function listen(server) {
  await new Promise((resolvePromise, rejectPromise) => {
    server.once('error', rejectPromise);
    server.listen(0, '127.0.0.1', resolvePromise);
  });
}

async function close(server) {
  await new Promise((resolvePromise, rejectPromise) => {
    server.close((error) => (error ? rejectPromise(error) : resolvePromise()));
  });
}
