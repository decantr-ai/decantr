import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  rewriteKnownPublicTarballs,
  runPublicLockFallback,
} from './npm-ci-public-lock-fallback.mjs';

const entries = {
  'node_modules/@contentful/browserslist-config': {
    version: '4.0.0',
    resolved:
      'https://npm.pkg.github.com/download/@contentful/browserslist-config/4.0.0/b9d59ba05bd53918d3d8023e6729ee19928d127b',
    integrity:
      'sha512-Z4nx1Mpg+8jIsxEeqQ4b8ZPFTqRnm7k7QjBIRpMdrf0s84zCp2cvL8taTZdlPEYWd12Enfbq2WC1ws5BIe49PA==',
  },
  'node_modules/@contentful/rich-text-react-renderer': {
    version: '16.1.6',
    resolved:
      'https://npm.pkg.github.com/download/@contentful/rich-text-react-renderer/16.1.6/3ff14234631461b6a92a97e643a9b6db4be1458b',
    integrity:
      'sha512-Pt0KfEnB7UP53gUKupUZjsUCHR7CiDbVyMdMmuyzYT6lNvjR7+KKYWP9eU2TOfVaXy7PxF1XEpBjSALDOHUNKQ==',
  },
  'node_modules/@contentful/rich-text-types': {
    version: '17.2.5',
    resolved:
      'https://npm.pkg.github.com/download/@contentful/rich-text-types/17.2.5/d8edc86fbbf0760a4533e28369ca07e08809d850',
    integrity:
      'sha512-EA5vTfROZePoPmSlqLVd+luL/ev8CjnI20y6vWFVPlLRxQbv4XytXRzatydPE63CqfsPylF7NCn2z8rTLhnWfg==',
  },
};

function fixtureBytes() {
  return Buffer.from(
    `${JSON.stringify(
      {
        name: 'forma-fixture',
        lockfileVersion: 3,
        requires: true,
        packages: { '': { name: 'forma-fixture' }, ...entries },
      },
      null,
      2,
    )}\n`,
  );
}

test('rewrites only the three reviewed public tarball equivalents', () => {
  const result = rewriteKnownPublicTarballs(fixtureBytes());
  const rewritten = JSON.parse(result.bytes);
  assert.equal(result.rewrites.length, 3);
  for (const [path, entry] of Object.entries(rewritten.packages)) {
    if (path === '') continue;
    assert.match(entry.resolved, /^https:\/\/registry\.npmjs\.org\//u);
    assert.equal(entry.integrity, entries[path].integrity);
  }
});

test('rejects lock entries whose integrity differs from the reviewed contract', () => {
  const fixture = JSON.parse(fixtureBytes());
  fixture.packages['node_modules/@contentful/rich-text-types'].integrity = 'sha512-different';
  assert.throws(
    () => rewriteKnownPublicTarballs(Buffer.from(JSON.stringify(fixture))),
    /differs from the reviewed contract/u,
  );
});

test('restores the original lock bytes after npm failure', () => {
  const directory = mkdtempSync(join(tmpdir(), 'forma-lock-fallback-test-'));
  const lockfilePath = join(directory, 'package-lock.json');
  const original = fixtureBytes();
  writeFileSync(lockfilePath, original);
  try {
    assert.throws(
      () =>
        runPublicLockFallback({
          cwd: directory,
          spawn: () => ({ status: 17, error: null }),
          stdio: 'pipe',
        }),
      /npm ci exited 17/u,
    );
    assert.deepEqual(readFileSync(lockfilePath), original);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
