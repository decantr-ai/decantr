#!/usr/bin/env node
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTreatmentDelivery } from '../runner/arm-delivery.mjs';
import { readJsonFile, sha256Canonical } from '../runner/canonical.mjs';
import { assertCandidateManifest } from '../runner/contracts.mjs';
import { sanitizedEnvironment } from '../runner/process.mjs';

export async function smokeCandidateContext(options) {
  const manifest = await readJsonFile(options.manifestPath);
  const candidate = await assertCandidateManifest(manifest, options.manifestPath, {
    runtimeRoot: options.runtimeRoot,
  });
  const home = await mkdtemp(`${tmpdir()}/decantr-3-10-context-smoke-`);
  try {
    const task = {
      prompt: options.prompt,
      projectPath: options.projectPath,
      limits: { timeoutMs: 300_000 },
      informationEntitlement: {
        taskInput: {
          target: { selector: options.target },
          policyCard: {
            statements: [
              {
                id: 'repository-authority',
                text: 'Preserve repository-owned implementation and styling conventions.',
                sources: ['base-checkout'],
              },
            ],
          },
        },
      },
    };
    const delivery = buildTreatmentDelivery({
      task,
      candidate,
      candidateRuntimeRoot: options.runtimeRoot,
      workspace: options.workspace,
      environment: sanitizedEnvironment(home),
    });
    return {
      deliverySha256: sha256Canonical(delivery.document),
      status: delivery.document.productContext.status,
      surfaceId: delivery.document.productContext.surface?.id ?? null,
      read: delivery.document.productContext.read,
      durationMs: delivery.generation.durationMs,
    };
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

function parseArgs(argv) {
  const options = { projectPath: '.' };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--manifest') options.manifestPath = resolve(argv[++index]);
    else if (argument === '--runtime') options.runtimeRoot = resolve(argv[++index]);
    else if (argument === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argument === '--project-path') options.projectPath = argv[++index];
    else if (argument === '--target') options.target = argv[++index];
    else if (argument === '--prompt') options.prompt = argv[++index];
    else throw new Error(`Unknown option: ${argument}`);
  }
  for (const name of ['manifestPath', 'runtimeRoot', 'workspace', 'target', 'prompt']) {
    if (!options[name]) throw new Error(`Missing required option: ${name}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await smokeCandidateContext(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
