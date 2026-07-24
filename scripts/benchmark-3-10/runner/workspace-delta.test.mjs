import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  applyWorkspaceDelta,
  assertWorkspaceDelta,
  captureWorkspaceDelta,
} from './workspace-delta.mjs';

test('workspace delta round-trips tracked binary, rename, deletion, and untracked executable changes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-workspace-delta-'));
  const source = join(root, 'source');
  const target = join(root, 'target');
  const artifacts = join(root, 'artifacts');
  try {
    await createRepository(source);
    git(root, ['clone', '-q', source, target]);
    await writeFile(join(source, 'tracked.txt'), 'changed\n');
    await writeFile(join(source, 'binary.bin'), Buffer.from([0, 1, 2, 255]));
    git(source, ['mv', 'rename-me.txt', 'renamed.txt']);
    await rm(join(source, 'delete-me.txt'));
    await mkdir(join(source, 'scripts'));
    await writeFile(join(source, 'scripts', 'new-tool'), '#!/bin/sh\nexit 0\n');
    await chmod(join(source, 'scripts', 'new-tool'), 0o755);

    const captured = await captureWorkspaceDelta({ workspace: source, outputRoot: artifacts });
    assert.equal(captured.manifest.changedPaths.includes('tracked.txt'), true);
    assert.equal(captured.manifest.changedPaths.includes('scripts/new-tool'), true);
    assertWorkspaceDelta(captured.manifest);
    await applyWorkspaceDelta({
      workspace: target,
      artifactRoot: artifacts,
      manifestPath: captured.manifestPath,
      verificationRoot: join(root, 'verification'),
    });
    assert.equal(await readFile(join(target, 'tracked.txt'), 'utf8'), 'changed\n');
    assert.deepEqual(await readFile(join(target, 'binary.bin')), Buffer.from([0, 1, 2, 255]));
    assert.equal(await readFile(join(target, 'renamed.txt'), 'utf8'), 'rename\n');
    assert.equal(await readFile(join(target, 'scripts', 'new-tool'), 'utf8'), '#!/bin/sh\nexit 0\n');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('workspace delta rejects untracked symlinks', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-workspace-delta-link-'));
  try {
    await createRepository(root);
    await import('node:fs/promises').then(({ symlink }) =>
      symlink('tracked.txt', join(root, 'linked.txt')),
    );
    await assert.rejects(
      captureWorkspaceDelta({ workspace: root, outputRoot: join(root, '..', 'artifacts') }),
      /not a regular file/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function createRepository(root) {
  await mkdir(root, { recursive: true });
  git(root, ['init', '-q']);
  await Promise.all([
    writeFile(join(root, 'tracked.txt'), 'base\n'),
    writeFile(join(root, 'rename-me.txt'), 'rename\n'),
    writeFile(join(root, 'delete-me.txt'), 'delete\n'),
  ]);
  git(root, ['add', '.']);
  git(root, [
    '-c',
    'user.name=Delta Fixture',
    '-c',
    'user.email=delta@example.test',
    'commit',
    '-qm',
    'base',
  ]);
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

