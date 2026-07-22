import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { sha256 } from './canonical.mjs';
import { assertProvider, hashRuntimeTree, verifyCandidateRuntime } from './candidate-runtime.mjs';

test('candidate runtime binds its lockfile, product package tree, and entrypoint', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-candidate-runtime-'));
  try {
    const packageRoot = join(root, 'node_modules', '@decantr', 'cli');
    await mkdir(join(packageRoot, 'dist'), { recursive: true });
    await writeFile(join(root, 'package-lock.json'), '{"lockfileVersion":3}\n');
    await writeFile(join(packageRoot, 'package.json'), '{"name":"@decantr/cli"}\n');
    await writeFile(join(packageRoot, 'dist', 'bin.js'), 'console.log("ok");\n');
    const runtimeFiles = ['package-lock.json', 'node_modules/@decantr'];
    const provider = {
      type: 'decantr-cli-task-v1',
      package: '@decantr/cli',
      entrypoint: 'node_modules/@decantr/cli/dist/bin.js',
      outputSchemaVersion: 'ui-surface-task-context.v1',
      runtimeLock: {
        path: 'package-lock.json',
        sha256: sha256(await readFile(join(root, 'package-lock.json'))),
      },
      runtimeFiles,
      runtimeTreeSha256: await hashRuntimeTree(root, runtimeFiles),
    };
    assert.equal(assertProvider(provider), provider);
    const verified = await verifyCandidateRuntime(provider, root);
    assert.equal(verified.runtimeTreeSha256, provider.runtimeTreeSha256);

    await writeFile(join(packageRoot, 'dist', 'bin.js'), 'console.log("tampered");\n');
    await assert.rejects(verifyCandidateRuntime(provider, root), /runtime tree digest mismatch/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('candidate runtime rejects traversal and incomplete bindings', () => {
  const base = {
    type: 'decantr-cli-task-v1',
    package: '@decantr/cli',
    entrypoint: 'node_modules/@decantr/cli/dist/bin.js',
    outputSchemaVersion: 'ui-surface-task-context.v1',
    runtimeLock: { path: 'package-lock.json', sha256: 'a'.repeat(64) },
    runtimeFiles: ['package-lock.json', 'node_modules/@decantr'],
    runtimeTreeSha256: 'b'.repeat(64),
  };
  assert.throws(() => assertProvider({ ...base, entrypoint: '../cli.js' }), /identity is invalid|runtime path/u);
  assert.throws(
    () => assertProvider({ ...base, runtimeFiles: ['package-lock.json'] }),
    /runtime file set is invalid/u,
  );
});
