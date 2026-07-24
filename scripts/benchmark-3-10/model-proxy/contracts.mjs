import { readFile } from 'node:fs/promises';
import { sha256Canonical } from '../runner/canonical.mjs';

const PROVIDERS = new Set(['openai', 'anthropic']);
const RESPONSE_STATUSES = new Set(['completed', 'unsupported', 'failed']);

export function assertAdapterRequest(request, expectedProvider) {
  if (request?.schemaVersion !== 'decantr-benchmark-adapter-request.v1') {
    throw new Error('unsupported adapter request schema');
  }
  for (const field of [
    'runId',
    'taskId',
    'modelId',
    'provider',
    'requestedModel',
    'arm',
    'prompt',
    'context',
    'workspace',
    'projectPath',
  ]) {
    if (typeof request[field] !== 'string' || request[field] === '') {
      throw new Error(`adapter request is missing ${field}`);
    }
  }
  if (!PROVIDERS.has(request.provider)) throw new Error(`unsupported provider: ${request.provider}`);
  if (expectedProvider && request.provider !== expectedProvider) {
    throw new Error(`adapter provider mismatch: expected ${expectedProvider}, received ${request.provider}`);
  }
  if (!['control', 'treatment'].includes(request.arm)) throw new Error('adapter request arm is invalid');
  if (!request.informationEntitlement || typeof request.informationEntitlement !== 'object') {
    throw new Error('adapter request is missing information entitlement');
  }
  if (!request.limits || typeof request.limits !== 'object') {
    throw new Error('adapter request is missing limits');
  }
  for (const field of ['timeoutMs', 'maxRequests', 'maxInputTokens', 'maxOutputTokens']) {
    if (!Number.isInteger(request.limits[field]) || request.limits[field] <= 0) {
      throw new Error(`adapter request limit ${field} is invalid`);
    }
  }
  if (!request.bindings || typeof request.bindings !== 'object') {
    throw new Error('adapter request is missing bindings');
  }
  return request;
}

export function assertProxyReceipt(receipt, request) {
  if (receipt?.schemaVersion !== 'decantr-benchmark-provider-receipt.v1') {
    throw new Error('provider receipt schemaVersion is invalid');
  }
  if (receipt.runId !== request.runId) throw new Error('provider receipt runId mismatch');
  if (receipt.provider !== request.provider) throw new Error('provider receipt provider mismatch');
  if (receipt.requestedModel !== request.requestedModel) {
    throw new Error('provider receipt requested model mismatch');
  }
  if (!RESPONSE_STATUSES.has(receipt.status)) throw new Error('provider receipt status is invalid');
  if (typeof receipt.returnedModel !== 'string' || receipt.returnedModel === '') {
    throw new Error('provider receipt returnedModel is invalid');
  }
  if (!Array.isArray(receipt.requests) || receipt.requests.length === 0) {
    throw new Error('provider receipt has no requests');
  }
  if (!receipt.usage || typeof receipt.usage !== 'object') {
    throw new Error('provider receipt usage is missing');
  }
  for (const field of [
    'inputTokens',
    'outputTokens',
    'cachedInputTokens',
    'cacheWriteInputTokens',
    'cacheWrite5mInputTokens',
    'cacheWrite1hInputTokens',
    'requests',
  ]) {
    if (!Number.isInteger(receipt.usage[field]) || receipt.usage[field] < 0) {
      throw new Error(`provider receipt usage ${field} is invalid`);
    }
  }
  if (!Number.isFinite(receipt.usage.costUsd) || receipt.usage.costUsd < 0) {
    throw new Error('provider receipt usage costUsd is invalid');
  }
  if (receipt.usage.requests !== receipt.requests.length) {
    throw new Error('provider receipt request count mismatch');
  }
  const { receiptSha256, ...unsignedReceipt } = receipt;
  const expectedDigest = sha256Canonical(unsignedReceipt);
  if (receiptSha256 !== expectedDigest) {
    throw new Error('provider receipt self digest mismatch');
  }
  return receipt;
}

export async function readAndAssertProxyReceipt(path, request) {
  if (typeof path !== 'string' || path === '') {
    throw new Error('DECANTR_MODEL_PROXY_RECEIPT is required');
  }
  const receipt = JSON.parse(await readFile(path, 'utf8'));
  return assertProxyReceipt(receipt, request);
}

export function buildAgentPrompt(request, repositoryInstructions = []) {
  const scope = JSON.stringify(request.scope ?? {}, null, 2);
  const entitlement = JSON.stringify(request.informationEntitlement, null, 2);
  const instructionSection =
    repositoryInstructions.length === 0
      ? ['REPOSITORY-NATIVE INSTRUCTIONS', '(none found)']
      : [
          'REPOSITORY-NATIVE INSTRUCTIONS',
          ...repositoryInstructions.flatMap((instruction) => [
            `--- ${instruction.path} ---`,
            instruction.content,
          ]),
        ];
  return [
    'Complete the requested code change in the current repository.',
    'Work directly in the provided workspace. Do not merely describe a patch.',
    'Respect repository-native instructions and the exact task scope.',
    'Do not commit, push, publish, deploy, or contact unrelated network services.',
    '',
    'TASK',
    request.prompt,
    '',
    'AUTHORIZED CONTEXT',
    request.context,
    '',
    ...instructionSection,
    '',
    'INFORMATION ENTITLEMENT',
    entitlement,
    '',
    'CHANGE SCOPE',
    scope,
    '',
    `Project path: ${request.projectPath}`,
  ].join('\n');
}

export function createAdapterResponse({ request, receipt, agentResult, finalMessage, trajectory = [] }) {
  const completed = agentResult.exitCode === 0 && receipt.status === 'completed';
  return {
    schemaVersion: 'decantr-benchmark-adapter-response.v1',
    provider: request.provider,
    requestedModel: request.requestedModel,
    returnedModel: receipt.returnedModel,
    status: completed ? 'completed' : receipt.status === 'unsupported' ? 'unsupported' : 'failed',
    usage: { ...receipt.usage },
    finalMessage: finalMessage ?? '',
    providerReceiptSha256: receipt.receiptSha256,
    trajectory: [
      {
        type: 'agent.process.finished',
        payload: {
          exitCode: agentResult.exitCode,
          signal: agentResult.signal,
          durationMs: agentResult.durationMs,
        },
      },
      {
        type: 'provider.receipt.verified',
        payload: {
          receiptSha256: receipt.receiptSha256,
          requestCount: receipt.usage.requests,
          status: receipt.status,
          refusal: receipt.refusal,
        },
      },
      ...trajectory,
    ],
  };
}

export function assertAdapterResponse(response) {
  if (response?.schemaVersion !== 'decantr-benchmark-adapter-response.v1') {
    throw new Error('adapter response schemaVersion is invalid');
  }
  if (!RESPONSE_STATUSES.has(response.status)) throw new Error('adapter response status is invalid');
  for (const field of ['provider', 'requestedModel', 'returnedModel']) {
    if (typeof response[field] !== 'string' || response[field] === '') {
      throw new Error(`adapter response is missing ${field}`);
    }
  }
  if (!response.usage || typeof response.usage !== 'object') {
    throw new Error('adapter response usage is missing');
  }
  for (const field of ['inputTokens', 'outputTokens', 'cachedInputTokens', 'requests']) {
    if (!Number.isInteger(response.usage[field]) || response.usage[field] < 0) {
      throw new Error(`adapter response usage ${field} is invalid`);
    }
  }
  for (const field of [
    'cacheWriteInputTokens',
    'cacheWrite5mInputTokens',
    'cacheWrite1hInputTokens',
  ]) {
    if (
      response.usage[field] !== undefined &&
      (!Number.isInteger(response.usage[field]) || response.usage[field] < 0)
    ) {
      throw new Error(`adapter response usage ${field} is invalid`);
    }
  }
  if (!Number.isFinite(response.usage.costUsd) || response.usage.costUsd < 0) {
    throw new Error('adapter response usage costUsd is invalid');
  }
  if (!Array.isArray(response.trajectory)) throw new Error('adapter response trajectory is invalid');
  if (
    response.providerReceiptSha256 !== undefined &&
    !/^[a-f0-9]{64}$/u.test(response.providerReceiptSha256)
  ) {
    throw new Error('adapter response provider receipt digest is invalid');
  }
  return response;
}

export function quoteToml(value) {
  return JSON.stringify(String(value));
}
