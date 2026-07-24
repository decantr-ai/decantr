import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { sha256, sha256Canonical } from './canonical.mjs';

const PREFIX = 'scripts/benchmark-3-10/';
const STAGE_FILES = Object.freeze({
  agent: Object.freeze([
    'container/agent-entrypoint.mjs',
    'environments/prepared-environment.mjs',
    'model-proxy/anthropic-claude-adapter.mjs',
    'model-proxy/audited-proxy.mjs',
    'model-proxy/coding-agent-adapter.mjs',
    'model-proxy/contracts.mjs',
    'model-proxy/fake-adapter.mjs',
    'model-proxy/openai-codex-adapter.mjs',
    'model-proxy/provider-receipt.mjs',
    'provenance/sigstore-keyless.mjs',
    'runner/agent-stage.mjs',
    'runner/canonical.mjs',
    'runner/process.mjs',
    'runner/stage-controller.mjs',
    'runner/stage-provenance.mjs',
    'runner/workspace-delta.mjs',
  ]),
  evaluator: Object.freeze([
    'container/entrypoint.mjs',
    'environments/prepared-environment.mjs',
    'evaluator/run-evaluator.mjs',
    'model-proxy/contracts.mjs',
    'provenance/sigstore-keyless.mjs',
    'runner/agent-stage.mjs',
    'runner/canonical.mjs',
    'runner/contracts.mjs',
    'runner/evaluator-stage.mjs',
    'runner/finalize-split-run.mjs',
    'runner/process.mjs',
    'runner/run-record.mjs',
    'runner/stage-controller.mjs',
    'runner/stage-provenance.mjs',
    'runner/workspace-delta.mjs',
  ]),
});

export async function calculateStageControllerClosure(stage, options = {}) {
  const files = STAGE_FILES[stage];
  if (!files) throw new Error('stage controller must be agent or evaluator');
  const layout = options.layout ?? 'repository';
  if (!['agent-image', 'evaluator-image', 'repository'].includes(layout)) {
    throw new Error('stage controller layout is invalid');
  }
  const root = resolve(options.root);
  const entries = [];
  for (const path of files) {
    const absolute =
      layout === 'repository'
        ? join(root, PREFIX, path)
        : join(root, path);
    const bytes = await readFile(absolute);
    entries.push({
      path: `${PREFIX}${path}`,
      sha256: sha256(bytes),
      bytes: bytes.byteLength,
    });
  }
  const closure = {
    schemaVersion: 'decantr-benchmark-stage-controller-closure.v1',
    stage,
    entries,
  };
  closure.controllerSha256 = sha256Canonical(closure);
  return closure;
}

export function stageControllerFiles(stage) {
  const files = STAGE_FILES[stage];
  if (!files) throw new Error('stage controller must be agent or evaluator');
  return files.map((path) => `${PREFIX}${path}`);
}
