#!/usr/bin/env node

import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(__dirname, '..');
const DEFAULT_BLUEPRINT = 'two-sided-marketplace';
const DOGFOOD_SLUG = 'dogfood-promote-smoke';

function parseArgs(argv) {
  const out = { blueprint: DEFAULT_BLUEPRINT };
  for (const arg of argv) {
    if (arg.startsWith('--blueprint=')) {
      out.blueprint = arg.slice('--blueprint='.length);
    }
  }
  return out;
}

function run(command, args, options = {}) {
  console.log(`$ ${[command, ...args].join(' ')}`);
  execFileSync(command, args, {
    cwd: MONOREPO_ROOT,
    stdio: 'inherit',
    env: options.env ?? process.env,
  });
}

function resolveContentDir() {
  if (process.env.DECANTR_CONTENT_DIR && existsSync(process.env.DECANTR_CONTENT_DIR)) {
    return process.env.DECANTR_CONTENT_DIR;
  }

  const candidates = [
    resolve(MONOREPO_ROOT, 'decantr-content'),
    resolve(MONOREPO_ROOT, '..', 'decantr-content'),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

const { blueprint } = parseArgs(process.argv.slice(2));
const tempRoot = mkdtempSync(join(tmpdir(), `decantr-showcase-promote-${blueprint}-`));
const workspace = join(tempRoot, 'workspace');
const target = join(MONOREPO_ROOT, 'apps/showcase-host/src/capsules', DOGFOOD_SLUG);
const contentDir = resolveContentDir();
const env = {
  ...process.env,
  ...(contentDir ? { DECANTR_CONTENT_DIR: contentDir } : {}),
};

try {
  console.log(`Dogfooding showcase promotion with blueprint "${blueprint}".`);
  if (contentDir) {
    console.log(`Using local content source: ${contentDir}`);
  } else {
    console.log('No local decantr-content source detected; prep will use hosted registry resolution.');
  }

  rmSync(target, { recursive: true, force: true });

  run('pnpm', ['--filter', '@decantr/cli', 'build'], { env });
  run('node', ['scripts/blueprint-harness/harness.mjs', 'prep', blueprint, `--workspace=${workspace}`], {
    env,
  });
  run(
    'node',
    [
      'scripts/blueprint-harness/harness.mjs',
      'promote',
      workspace,
      `--slug=${DOGFOOD_SLUG}`,
      '--force',
    ],
    { env },
  );
  run('pnpm', ['--filter', './apps/showcase-host', 'build'], { env });

  console.log(`✓ Dogfood promotion passed: ${blueprint} -> ${DOGFOOD_SLUG} -> showcase-host build.`);
} finally {
  rmSync(target, { recursive: true, force: true });
  rmSync(tempRoot, { recursive: true, force: true });
}
