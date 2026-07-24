import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  listReviewedGitlinks,
  reviewedSubmoduleBindings,
} from './submodules.mjs';

test('binds exact GitHub HTTPS submodule paths and rejects transport rewrites', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-submodule-contract-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  git(root, ['init', '--quiet']);
  git(root, ['config', 'user.email', 'benchmark@decantr.ai']);
  git(root, ['config', 'user.name', 'Decantr Benchmark']);
  await writeFile(join(root, 'README.md'), 'fixture\n');
  git(root, ['add', 'README.md']);
  git(root, ['commit', '--quiet', '-m', 'base']);

  await writeFile(
    join(root, '.gitmodules'),
    [
      '[submodule "assets"]',
      '\tpath = src/assets',
      '\turl = https://github.com/example/assets.git',
      '',
    ].join('\n'),
  );
  git(root, [
    'update-index',
    '--add',
    '--cacheinfo',
    `160000,${'a'.repeat(40)},src/assets`,
  ]);
  git(root, ['add', '.gitmodules']);
  git(root, ['commit', '--quiet', '-m', 'add reviewed submodule']);

  assert.deepEqual(listReviewedGitlinks(root), [
    {
      path: 'src/assets',
      commit: 'a'.repeat(40),
      name: 'assets',
      url: 'https://github.com/example/assets.git',
    },
  ]);
  assert.deepEqual(
    reviewedSubmoduleBindings([
      {
        path: 'src/assets',
        commit: 'a'.repeat(40),
        tree: 'b'.repeat(40),
        url: 'https://github.com/example/assets.git',
        repository: '/private/materialized/path',
      },
    ]),
    [
      {
        path: 'src/assets',
        commit: 'a'.repeat(40),
        tree: 'b'.repeat(40),
        url: 'https://github.com/example/assets.git',
      },
    ],
  );

  await writeFile(
    join(root, '.gitmodules'),
    [
      '[submodule "assets"]',
      '\tpath = src/assets',
      '\turl = file:///tmp/unreviewed-assets',
      '',
    ].join('\n'),
  );
  git(root, ['add', '.gitmodules']);
  git(root, ['commit', '--quiet', '-m', 'attempt transport rewrite']);
  assert.throws(
    () => listReviewedGitlinks(root),
    /outside the reviewed GitHub HTTPS policy/u,
  );
});

function git(cwd, args) {
  execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8',
    env: {
      HOME: cwd,
      LANG: 'C.UTF-8',
      LC_ALL: 'C.UTF-8',
      PATH: process.env.PATH,
      TZ: 'UTC',
    },
  });
}
