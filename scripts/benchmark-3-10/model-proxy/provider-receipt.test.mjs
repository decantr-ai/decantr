import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProxyReceipt } from './contracts.mjs';
import {
  calculateCostUsd,
  createProviderReceipt,
  createRequestReceipt,
  parseProviderResponse,
} from './provider-receipt.mjs';

const openAiPricing = {
  inputPerMillionTokensUsd: 5,
  cachedInputPerMillionTokensUsd: 0.5,
  cacheWriteInputPerMillionTokensUsd: 6.25,
  outputPerMillionTokensUsd: 30,
};
const anthropicPricing = {
  inputPerMillionTokensUsd: 10,
  cachedInputPerMillionTokensUsd: 1,
  cacheWrite5mInputPerMillionTokensUsd: 12.5,
  cacheWrite1hInputPerMillionTokensUsd: 20,
  outputPerMillionTokensUsd: 50,
};

test('OpenAI receipts preserve returned model and account for cache reads and writes', () => {
  const body = [
    'event: response.completed',
    'data: {"type":"response.completed","response":{"model":"gpt-5.6-sol","status":"completed","usage":{"input_tokens":1000,"input_tokens_details":{"cached_tokens":200,"cache_write_tokens":100},"output_tokens":300}}}',
    '',
    'data: [DONE]',
    '',
  ].join('\n');
  const request = createRequestReceipt({
    provider: 'openai',
    requestedModel: 'gpt-5.6-sol',
    requestBody: Buffer.from('{"model":"gpt-5.6-sol"}'),
    responseBody: Buffer.from(body),
    statusCode: 200,
    contentType: 'text/event-stream',
  });
  assert.deepEqual(request.usage, {
    inputTokens: 1000,
    outputTokens: 300,
    cachedInputTokens: 200,
    cacheWriteInputTokens: 100,
    cacheWrite5mInputTokens: 0,
    cacheWrite1hInputTokens: 0,
  });
  const receipt = createProviderReceipt({
    runId: 'run-openai',
    provider: 'openai',
    requestedModel: 'gpt-5.6-sol',
    requests: [request],
    pricing: openAiPricing,
  });
  assert.equal(receipt.returnedModel, 'gpt-5.6-sol');
  assert.equal(receipt.usage.costUsd, 0.013225);
  assertProxyReceipt(receipt, adapterRequest('run-openai', 'openai', 'gpt-5.6-sol'));
});

test('Anthropic receipts record refusal and both cache write durations', () => {
  const body = [
    'event: message_start',
    'data: {"type":"message_start","message":{"model":"claude-fable-5","usage":{"input_tokens":100,"cache_read_input_tokens":20,"cache_creation":{"ephemeral_5m_input_tokens":30,"ephemeral_1h_input_tokens":40},"output_tokens":0}}}',
    '',
    'event: message_delta',
    'data: {"type":"message_delta","delta":{"stop_reason":"refusal"},"usage":{"output_tokens":50}}',
    '',
  ].join('\n');
  const parsed = parseProviderResponse('anthropic', body, 'text/event-stream');
  assert.equal(parsed.returnedModel, 'claude-fable-5');
  assert.equal(parsed.refusal, true);
  assert.deepEqual(parsed.usage, {
    inputTokens: 190,
    outputTokens: 50,
    cachedInputTokens: 20,
    cacheWriteInputTokens: 0,
    cacheWrite5mInputTokens: 30,
    cacheWrite1hInputTokens: 40,
    requests: 0,
    costUsd: 0,
  });
  assert.equal(calculateCostUsd('anthropic', parsed.usage, anthropicPricing), 0.004695);
});

test('multiple returned model identities fail closed as a visible mismatch', () => {
  const requests = ['gpt-5.6-sol', 'gpt-5.6-terra'].map((returnedModel, sequence) => ({
    sequence,
    requestedModel: 'gpt-5.6-sol',
    returnedModel,
    statusCode: 200,
    status: 'completed',
    refusal: false,
    requestSha256: 'a'.repeat(64),
    responseSha256: 'b'.repeat(64),
    usage: {
      inputTokens: 1,
      outputTokens: 1,
      cachedInputTokens: 0,
      cacheWriteInputTokens: 0,
      cacheWrite5mInputTokens: 0,
      cacheWrite1hInputTokens: 0,
    },
  }));
  const receipt = createProviderReceipt({
    runId: 'run-mismatch',
    provider: 'openai',
    requestedModel: 'gpt-5.6-sol',
    requests,
    pricing: openAiPricing,
  });
  assert.equal(receipt.returnedModel, 'model-identity-mismatch');
});

function adapterRequest(runId, provider, requestedModel) {
  return { runId, provider, requestedModel };
}

