#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createProviderReceipt,
  createRequestReceipt,
} from './provider-receipt.mjs';
import { prettyCanonicalJson, sha256, writeCanonicalFile } from '../runner/canonical.mjs';

const MAX_REQUEST_BODY_BYTES = 16 * 1024 * 1024;
const MAX_RESPONSE_BODY_BYTES = 64 * 1024 * 1024;
const FORBIDDEN_OPENAI_TOOLS = new Set([
  'code_interpreter',
  'computer',
  'container',
  'file_search',
  'image_generation',
  'mcp',
  'shell',
  'tool_search',
  'web_search',
  'web_search_preview',
]);
const FORBIDDEN_ANTHROPIC_TOOL_PREFIXES = [
  'bash_code_execution_',
  'code_execution_',
  'computer_',
  'text_editor_',
  'web_fetch_',
  'web_search_',
];

export async function startAuditedProxy(config, dependencies = {}) {
  const normalized = assertProxyConfig(config);
  const fetchImplementation = dependencies.fetch ?? globalThis.fetch;
  if (typeof fetchImplementation !== 'function') throw new Error('fetch implementation is unavailable');
  const requests = [];
  let requestInFlight = false;
  const server = createServer(async (incoming, outgoing) => {
    try {
      if (requestInFlight) {
        throw requestError(
          429,
          'concurrent provider requests are forbidden by the audited proxy',
        );
      }
      requestInFlight = true;
      if (requests.length >= normalized.limits.maxRequests) {
        throw requestError(429, 'provider request count exceeded the audited proxy limit');
      }
      const route = validateIncomingRequest(incoming, normalized);
      const requestBody = await readLimitedBody(incoming, MAX_REQUEST_BODY_BYTES);
      const remaining = remainingTokenBudget(
        requests,
        normalized.limits,
      );
      const payload = validateProviderRequest(
        normalized.provider,
        requestBody,
        normalized.requestedModel,
        remaining,
      );
      const serializedPayload = Buffer.from(JSON.stringify(payload));
      if (serializedPayload.byteLength > remaining.maxInputTokens) {
        throw requestError(
          429,
          'provider request exhausts the remaining conservative input-token budget',
        );
      }
      const upstream = upstreamUrl(normalized, route);
      const upstreamResponse = await fetchImplementation(upstream, {
        method: 'POST',
        headers: upstreamHeaders(incoming.headers, normalized),
        body: serializedPayload,
        signal: AbortSignal.timeout(normalized.limits.timeoutMs),
      });
      const responseBody = Buffer.from(await upstreamResponse.arrayBuffer());
      if (responseBody.byteLength > MAX_RESPONSE_BODY_BYTES) {
        throw new Error('provider response exceeded the audited proxy limit');
      }
      const contentType = upstreamResponse.headers.get('content-type') ?? 'application/json';
      const requestReceipt = safeRequestReceipt({
        provider: normalized.provider,
        requestedModel: normalized.requestedModel,
        requestBody: serializedPayload,
        responseBody,
        statusCode: upstreamResponse.status,
        contentType,
      });
      requestReceipt.sequence = requests.length;
      requests.push(requestReceipt);
      const receipt = createProviderReceipt({
        runId: normalized.runId,
        provider: normalized.provider,
        requestedModel: normalized.requestedModel,
        requests,
        pricing: normalized.pricing,
      });
      await writeCanonicalFile(normalized.receiptPath, receipt);
      assertAggregateReceipt(receipt, normalized.limits);
      outgoing.writeHead(upstreamResponse.status, responseHeaders(upstreamResponse.headers));
      outgoing.end(responseBody);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      outgoing.writeHead(error?.statusCode ?? 502, { 'content-type': 'application/json' });
      outgoing.end(JSON.stringify({ error: { type: 'decantr_proxy_error', message } }));
    } finally {
      requestInFlight = false;
    }
  });
  await new Promise((resolvePromise, rejectPromise) => {
    server.once('error', rejectPromise);
    server.listen(normalized.port, normalized.host, resolvePromise);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('audited proxy did not bind a TCP address');
  return {
    server,
    url: `http://${address.address === '::' ? '127.0.0.1' : address.address}:${address.port}`,
    close: () =>
      new Promise((resolvePromise, rejectPromise) => {
        server.close((error) => (error ? rejectPromise(error) : resolvePromise()));
      }),
  };
}

export function assertProxyConfig(config) {
  if (config?.schemaVersion !== 'decantr-benchmark-model-proxy-config.v1') {
    throw new Error('unsupported model proxy config schema');
  }
  for (const field of ['runId', 'provider', 'requestedModel', 'receiptPath']) {
    if (typeof config[field] !== 'string' || config[field] === '') {
      throw new Error(`model proxy config is missing ${field}`);
    }
  }
  if (!['openai', 'anthropic'].includes(config.provider)) {
    throw new Error(`unsupported model proxy provider: ${config.provider}`);
  }
  for (const field of ['maxRequests', 'maxInputTokens', 'maxOutputTokens', 'timeoutMs']) {
    if (!Number.isInteger(config.limits?.[field]) || config.limits[field] <= 0) {
      throw new Error(`model proxy limit ${field} is invalid`);
    }
  }
  if (!Number.isFinite(config.limits.maxCostUsd) || config.limits.maxCostUsd <= 0) {
    throw new Error('model proxy limit maxCostUsd is invalid');
  }
  if (!config.pricing || typeof config.pricing !== 'object') {
    throw new Error('model proxy pricing is missing');
  }
  assertWorstCaseReservation(config);
  return {
    ...config,
    host: config.host ?? '127.0.0.1',
    port: config.port ?? 0,
    receiptPath: resolve(config.receiptPath),
    upstreamBaseUrl:
      config.upstreamBaseUrl ??
      (config.provider === 'openai' ? 'https://api.openai.com/v1' : 'https://api.anthropic.com'),
    internalBearer: config.internalBearer ?? 'decantr-run-local-proxy',
  };
}

export function validateProviderRequest(provider, bytes, requestedModel, limits) {
  let payload;
  try {
    payload = JSON.parse(Buffer.isBuffer(bytes) ? bytes.toString('utf8') : String(bytes));
  } catch {
    throw requestError(400, 'provider request body is not valid JSON');
  }
  if (payload?.model !== requestedModel) {
    throw requestError(
      409,
      `provider model mismatch: expected ${requestedModel}, received ${payload?.model ?? 'missing'}`,
    );
  }
  if (provider === 'openai') {
    rejectOpenAiHostedTools(payload.tools);
    enforceOutputLimit(payload, 'max_output_tokens', limits.maxOutputTokens);
    payload.store = false;
  } else if (provider === 'anthropic') {
    rejectAnthropicHostedTools(payload.tools);
    enforceOutputLimit(payload, 'max_tokens', limits.maxOutputTokens);
  } else {
    throw requestError(400, `unsupported provider: ${provider}`);
  }
  return payload;
}

function validateIncomingRequest(request, config) {
  if (request.method !== 'POST') throw requestError(405, 'audited proxy accepts POST only');
  const expectedPath =
    config.provider === 'openai' ? '/openai/v1/responses' : '/anthropic/v1/messages';
  if (request.url !== expectedPath) {
    throw requestError(404, `provider path is not allowlisted: ${request.url}`);
  }
  const authorization = request.headers.authorization;
  const apiKey = request.headers['x-api-key'];
  if (
    authorization !== `Bearer ${config.internalBearer}` &&
    apiKey !== config.internalBearer
  ) {
    throw requestError(401, 'invalid run-local proxy credential');
  }
  return expectedPath;
}

function upstreamUrl(config) {
  const suffix = config.provider === 'openai' ? '/responses' : '/v1/messages';
  return `${config.upstreamBaseUrl.replace(/\/+$/u, '')}${suffix}`;
}

function upstreamHeaders(incomingHeaders, config) {
  const headers = {
    accept: incomingHeaders.accept ?? 'application/json',
    'content-type': 'application/json',
    'user-agent': 'decantr-benchmark-audited-proxy/1',
  };
  if (config.provider === 'openai') {
    headers.authorization = `Bearer ${requireSecret(config, 'OPENAI_API_KEY')}`;
    copyHeader(incomingHeaders, headers, 'openai-beta');
  } else {
    headers['x-api-key'] = requireSecret(config, 'ANTHROPIC_API_KEY');
    headers['anthropic-version'] = incomingHeaders['anthropic-version'] ?? '2023-06-01';
    copyHeader(incomingHeaders, headers, 'anthropic-beta');
  }
  return headers;
}

function requireSecret(config, key) {
  const value = config.secrets?.[key] ?? process.env[key];
  if (typeof value !== 'string' || value === '') {
    throw requestError(500, `${key} is not configured in the proxy process`);
  }
  return value;
}

function responseHeaders(headers) {
  const output = { 'content-type': headers.get('content-type') ?? 'application/json' };
  for (const name of [
    'anthropic-organization-id',
    'openai-organization',
    'request-id',
    'x-request-id',
  ]) {
    const value = headers.get(name);
    if (value) output[name] = value;
  }
  return output;
}

function copyHeader(source, destination, name) {
  const value = source[name];
  if (typeof value === 'string' && value !== '') destination[name] = value;
}

function enforceOutputLimit(payload, field, maximum) {
  if (payload[field] === undefined) {
    payload[field] = maximum;
    return;
  }
  if (!Number.isInteger(payload[field]) || payload[field] <= 0) {
    throw requestError(400, `${field} is invalid`);
  }
  if (payload[field] > maximum) payload[field] = maximum;
}

function remainingTokenBudget(requests, limits) {
  const used = requests.reduce(
    (total, request) => ({
      inputTokens:
        total.inputTokens +
        nonnegativeInteger(request.usage?.inputTokens),
      outputTokens:
        total.outputTokens +
        nonnegativeInteger(request.usage?.outputTokens),
    }),
    { inputTokens: 0, outputTokens: 0 },
  );
  const remaining = {
    ...limits,
    maxInputTokens: limits.maxInputTokens - used.inputTokens,
    maxOutputTokens:
      limits.maxOutputTokens - used.outputTokens,
  };
  if (
    remaining.maxInputTokens <= 0 ||
    remaining.maxOutputTokens <= 0
  ) {
    throw requestError(
      429,
      'provider token budget is exhausted',
    );
  }
  return remaining;
}

function assertWorstCaseReservation(config) {
  const inputRates = Object.entries(config.pricing)
    .filter(
      ([key, value]) =>
        key !== 'outputPerMillionTokensUsd' &&
        key.endsWith('PerMillionTokensUsd') &&
        Number.isFinite(value) &&
        value >= 0,
    )
    .map(([, value]) => value);
  const outputRate =
    config.pricing.outputPerMillionTokensUsd;
  if (
    inputRates.length === 0 ||
    !Number.isFinite(outputRate) ||
    outputRate < 0
  ) {
    throw new Error('model proxy pricing rates are invalid');
  }
  const worstCaseUsd =
    (config.limits.maxInputTokens * Math.max(...inputRates) +
      config.limits.maxOutputTokens * outputRate) /
    1_000_000;
  if (
    worstCaseUsd >
    config.limits.maxCostUsd + Number.EPSILON
  ) {
    throw new Error(
      'model proxy token limits exceed the reserved run cost',
    );
  }
}

function assertAggregateReceipt(receipt, limits) {
  if (
    receipt.usage.requests > limits.maxRequests ||
    receipt.usage.inputTokens > limits.maxInputTokens ||
    receipt.usage.outputTokens > limits.maxOutputTokens ||
    receipt.usage.costUsd >
      limits.maxCostUsd + Number.EPSILON
  ) {
    throw requestError(
      502,
      'provider reported usage beyond the audited aggregate run limit',
    );
  }
}

function rejectOpenAiHostedTools(tools) {
  if (!Array.isArray(tools)) return;
  const forbidden = tools
    .map((tool) => tool?.type)
    .filter((type) => FORBIDDEN_OPENAI_TOOLS.has(type));
  if (forbidden.length > 0) {
    throw requestError(400, `hosted OpenAI tools are forbidden: ${[...new Set(forbidden)].join(', ')}`);
  }
}

function rejectAnthropicHostedTools(tools) {
  if (!Array.isArray(tools)) return;
  const forbidden = tools
    .map((tool) => tool?.type)
    .filter(
      (type) =>
        typeof type === 'string' &&
        FORBIDDEN_ANTHROPIC_TOOL_PREFIXES.some((prefix) => type.startsWith(prefix)),
    );
  if (forbidden.length > 0) {
    throw requestError(
      400,
      `hosted Anthropic tools are forbidden: ${[...new Set(forbidden)].join(', ')}`,
    );
  }
}

function safeRequestReceipt(input) {
  try {
    return createRequestReceipt(input);
  } catch {
    return {
      sequence: 0,
      requestedModel: input.requestedModel,
      returnedModel: 'unknown',
      statusCode: input.statusCode,
      status: 'failed',
      refusal: false,
      requestSha256: sha256Buffer(input.requestBody),
      responseSha256: sha256Buffer(input.responseBody),
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cachedInputTokens: 0,
        cacheWriteInputTokens: 0,
        cacheWrite5mInputTokens: 0,
        cacheWrite1hInputTokens: 0,
      },
    };
  }
}

async function readLimitedBody(stream, maximumBytes) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of stream) {
    bytes += chunk.byteLength;
    if (bytes > maximumBytes) throw requestError(413, 'provider request exceeded the audited proxy limit');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function requestError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function nonnegativeInteger(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

function sha256Buffer(value) {
  return sha256(value);
}

async function main(argv) {
  const configIndex = argv.indexOf('--config');
  if (configIndex === -1 || !argv[configIndex + 1] || argv.length !== 2) {
    throw new Error('Usage: audited-proxy.mjs --config <path>');
  }
  const config = JSON.parse(await readFile(resolve(argv[configIndex + 1]), 'utf8'));
  const proxy = await startAuditedProxy(config);
  process.stdout.write(
    prettyCanonicalJson({
      schemaVersion: 'decantr-benchmark-model-proxy-ready.v1',
      url: proxy.url,
      runId: config.runId,
      provider: config.provider,
      requestedModel: config.requestedModel,
    }),
  );
  const stop = async () => {
    await proxy.close();
    process.exit(0);
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
