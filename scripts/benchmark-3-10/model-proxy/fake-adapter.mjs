#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prettyCanonicalJson, sha256 } from '../runner/canonical.mjs';

export function createFakeResponse(request) {
  assertRequest(request);
  const unsupported = request.prompt.includes('FAKE_UNSUPPORTED');
  const failed = request.prompt.includes('FAKE_FAILURE');
  const status = unsupported ? 'unsupported' : failed ? 'failed' : 'completed';
  const inputText = JSON.stringify({
    prompt: request.prompt,
    context: request.context,
    informationEntitlement: request.informationEntitlement,
  });
  const output = status === 'completed' ? `Deterministic fake completion for ${request.runId}.` : '';
  return {
    schemaVersion: 'decantr-benchmark-adapter-response.v1',
    provider: request.provider,
    requestedModel: request.requestedModel,
    returnedModel: request.requestedModel,
    status,
    usage: {
      inputTokens: Math.ceil(inputText.length / 4),
      outputTokens: Math.ceil(output.length / 4),
      cachedInputTokens: 0,
      requests: 1,
      costUsd: 0,
    },
    finalMessage: output,
    trajectory: [
      { type: 'request.accepted', payload: { requestSha256: sha256(inputText) } },
      { type: `request.${status}`, payload: { noPaidCall: true } },
    ],
  };
}

function assertRequest(request) {
  if (request?.schemaVersion !== 'decantr-benchmark-adapter-request.v1') {
    throw new Error('unsupported adapter request schema');
  }
  for (const field of ['runId', 'taskId', 'modelId', 'provider', 'requestedModel', 'arm', 'prompt', 'context']) {
    if (typeof request[field] !== 'string') throw new Error(`adapter request is missing ${field}`);
  }
  if (!['control', 'treatment'].includes(request.arm)) throw new Error('adapter request arm is invalid');
  if (!request.informationEntitlement || typeof request.informationEntitlement !== 'object') {
    throw new Error('adapter request is missing information entitlement');
  }
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--request') options.requestPath = resolve(argv[++index]);
    else if (argv[index] === '--response') options.responsePath = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argv[index]}`);
  }
  if (!options.requestPath || !options.responsePath) throw new Error('--request and --response are required');
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const request = JSON.parse(await readFile(options.requestPath, 'utf8'));
    const response = createFakeResponse(request);
    await writeFile(options.responsePath, prettyCanonicalJson(response), { mode: 0o600 });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
