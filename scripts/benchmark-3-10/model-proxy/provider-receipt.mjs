import { sha256, sha256Canonical } from '../runner/canonical.mjs';

export function createProviderReceipt({ runId, provider, requestedModel, requests, pricing }) {
  if (!Array.isArray(requests) || requests.length === 0) {
    throw new Error('provider receipt requires at least one request');
  }
  const returnedModels = [...new Set(requests.map((request) => request.returnedModel).filter(Boolean))];
  const returnedModel = returnedModels.length === 1 ? returnedModels[0] : 'model-identity-mismatch';
  const usage = aggregateUsage(requests.map((request) => request.usage));
  usage.requests = requests.length;
  usage.costUsd = calculateCostUsd(provider, usage, pricing);
  const refusal = requests.some((request) => request.refusal === true);
  const failed = requests.some((request) => request.status === 'failed');
  const unsupported = requests.some((request) => request.status === 'unsupported' || request.refusal === true);
  const receipt = {
    schemaVersion: 'decantr-benchmark-provider-receipt.v1',
    runId,
    provider,
    requestedModel,
    returnedModel,
    status: failed ? 'failed' : unsupported ? 'unsupported' : 'completed',
    refusal,
    usage,
    requests,
    receiptSha256: null,
  };
  const { receiptSha256: _receiptSha256, ...unsignedReceipt } = receipt;
  receipt.receiptSha256 = sha256Canonical(unsignedReceipt);
  return receipt;
}

export function createRequestReceipt({
  provider,
  requestedModel,
  requestBody,
  responseBody,
  statusCode,
  contentType,
}) {
  const parsed = parseProviderResponse(provider, responseBody, contentType);
  return {
    sequence: 0,
    requestedModel,
    returnedModel: parsed.returnedModel ?? 'unknown',
    statusCode,
    status:
      statusCode >= 200 && statusCode < 300
        ? parsed.refusal
          ? 'unsupported'
          : 'completed'
        : 'failed',
    refusal: parsed.refusal,
    requestSha256: sha256(requestBody),
    responseSha256: sha256(responseBody),
    usage: parsed.usage,
  };
}

export function parseProviderResponse(provider, body, contentType = '') {
  const text = Buffer.isBuffer(body) ? body.toString('utf8') : String(body);
  const payloads = isEventStream(contentType, text) ? parseServerSentEvents(text) : [parseJson(text)];
  if (provider === 'openai') return parseOpenAiPayloads(payloads);
  if (provider === 'anthropic') return parseAnthropicPayloads(payloads);
  throw new Error(`unsupported provider response: ${provider}`);
}

export function calculateCostUsd(provider, usage, pricing) {
  const million = 1_000_000;
  let amount;
  if (provider === 'openai') {
    const regularInput = Math.max(
      0,
      usage.inputTokens - usage.cachedInputTokens - usage.cacheWriteInputTokens,
    );
    amount =
      (regularInput * pricing.inputPerMillionTokensUsd +
        usage.cachedInputTokens * pricing.cachedInputPerMillionTokensUsd +
        usage.cacheWriteInputTokens * pricing.cacheWriteInputPerMillionTokensUsd +
        usage.outputTokens * pricing.outputPerMillionTokensUsd) /
      million;
  } else if (provider === 'anthropic') {
    const regularInput = Math.max(
      0,
      usage.inputTokens -
        usage.cachedInputTokens -
        usage.cacheWrite5mInputTokens -
        usage.cacheWrite1hInputTokens,
    );
    amount =
      (regularInput * pricing.inputPerMillionTokensUsd +
        usage.cachedInputTokens * pricing.cachedInputPerMillionTokensUsd +
        usage.cacheWrite5mInputTokens * pricing.cacheWrite5mInputPerMillionTokensUsd +
        usage.cacheWrite1hInputTokens * pricing.cacheWrite1hInputPerMillionTokensUsd +
        usage.outputTokens * pricing.outputPerMillionTokensUsd) /
      million;
  } else {
    throw new Error(`unsupported pricing provider: ${provider}`);
  }
  return Number(amount.toFixed(8));
}

export function aggregateUsage(items) {
  const usage = emptyUsage();
  for (const item of items) {
    for (const field of [
      'inputTokens',
      'outputTokens',
      'cachedInputTokens',
      'cacheWriteInputTokens',
      'cacheWrite5mInputTokens',
      'cacheWrite1hInputTokens',
    ]) {
      usage[field] += nonnegativeInteger(item?.[field]);
    }
  }
  return usage;
}

function parseOpenAiPayloads(payloads) {
  const completed =
    [...payloads].reverse().find((payload) => payload?.type === 'response.completed')?.response ??
    [...payloads].reverse().find((payload) => payload?.usage)?.response ??
    [...payloads].reverse().find((payload) => payload?.usage) ??
    payloads.at(-1) ??
    {};
  const usage = completed.usage ?? {};
  const inputDetails = usage.input_tokens_details ?? {};
  const outputDetails = usage.output_tokens_details ?? {};
  const cached = nonnegativeInteger(inputDetails.cached_tokens);
  const cacheWrite = nonnegativeInteger(
    inputDetails.cache_write_tokens ?? usage.cache_write_input_tokens,
  );
  return {
    returnedModel: completed.model ?? null,
    refusal:
      completed.status === 'incomplete' ||
      completed.incomplete_details?.reason === 'content_filter' ||
      payloads.some((payload) => payload?.type === 'response.refusal.delta'),
    usage: {
      inputTokens: Math.max(nonnegativeInteger(usage.input_tokens), cached + cacheWrite),
      outputTokens: Math.max(
        nonnegativeInteger(usage.output_tokens),
        nonnegativeInteger(outputDetails.reasoning_tokens),
      ),
      cachedInputTokens: cached,
      cacheWriteInputTokens: cacheWrite,
      cacheWrite5mInputTokens: 0,
      cacheWrite1hInputTokens: 0,
    },
  };
}

function parseAnthropicPayloads(payloads) {
  let returnedModel = null;
  let refusal = false;
  const maximum = emptyUsage();
  for (const payload of payloads) {
    const message = payload?.message ?? payload;
    if (typeof message?.model === 'string') returnedModel = message.model;
    if (message?.stop_reason === 'refusal' || payload?.delta?.stop_reason === 'refusal') {
      refusal = true;
    }
    const usage = message?.usage ?? payload?.usage;
    if (!usage) continue;
    const fiveMinute = nonnegativeInteger(
      usage.cache_creation?.ephemeral_5m_input_tokens ??
        usage.cache_creation_5m_input_tokens ??
        usage.cache_creation_input_tokens,
    );
    const oneHour = nonnegativeInteger(
      usage.cache_creation?.ephemeral_1h_input_tokens ??
        usage.cache_creation_1h_input_tokens,
    );
    maximum.inputTokens = Math.max(
      maximum.inputTokens,
      nonnegativeInteger(usage.input_tokens) +
        nonnegativeInteger(usage.cache_read_input_tokens) +
        fiveMinute +
        oneHour,
    );
    maximum.outputTokens = Math.max(maximum.outputTokens, nonnegativeInteger(usage.output_tokens));
    maximum.cachedInputTokens = Math.max(
      maximum.cachedInputTokens,
      nonnegativeInteger(usage.cache_read_input_tokens),
    );
    maximum.cacheWrite5mInputTokens = Math.max(maximum.cacheWrite5mInputTokens, fiveMinute);
    maximum.cacheWrite1hInputTokens = Math.max(maximum.cacheWrite1hInputTokens, oneHour);
  }
  return { returnedModel, refusal, usage: maximum };
}

function parseServerSentEvents(text) {
  const payloads = [];
  for (const block of text.split(/\r?\n\r?\n/gu)) {
    const data = block
      .split(/\r?\n/gu)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('\n');
    if (!data || data === '[DONE]') continue;
    try {
      payloads.push(JSON.parse(data));
    } catch {
      // Non-JSON keepalive data is not authoritative provider evidence.
    }
  }
  if (payloads.length === 0) throw new Error('provider event stream contained no JSON payloads');
  return payloads;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('provider response was not valid JSON');
  }
}

function isEventStream(contentType, text) {
  return contentType.toLowerCase().includes('text/event-stream') || /^event:/mu.test(text);
}

function emptyUsage() {
  return {
    inputTokens: 0,
    outputTokens: 0,
    cachedInputTokens: 0,
    cacheWriteInputTokens: 0,
    cacheWrite5mInputTokens: 0,
    cacheWrite1hInputTokens: 0,
    requests: 0,
    costUsd: 0,
  };
}

function nonnegativeInteger(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}
