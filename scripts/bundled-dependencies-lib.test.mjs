import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import {
  addBundledComponents,
  createBundledDependencyInventory,
  readBundledDependencyInventory,
  verifyPackedBundleOutputs,
} from './bundled-dependencies-lib.mjs';

function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'decantr-bundle-test-'));
  const packageDir = join(root, 'packages/mcp');
  const put = (path, value) => {
    const file = join(root, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value));
  };
  put('pnpm-lock.yaml', 'lock-v1');
  put('packages/mcp/package.json', { name: '@test/mcp', version: '1.0.0' });
  put('packages/mcp/src/index.js', 'own code');
  put('packages/mcp/dist/index.js', 'bundled code');
  put('node_modules/@test/sdk/package.json', { name: '@test/sdk', version: '2.0.0' });
  put('node_modules/@test/sdk/nested/package.json', { type: 'module' });
  put('node_modules/@test/sdk/nested/index.js', 'dependency');
  const metadata = {
    outputs: {
      'dist/index.js': {
        inputs: {
          'src/index.js': { bytesInOutput: 2 },
          '../../node_modules/@test/sdk/nested/index.js': { bytesInOutput: 10 },
          '../../node_modules/unresolved-unused.js': { bytesInOutput: 0 },
        },
      },
    },
  };
  const entry = { name: '@test/mcp', path: 'packages/mcp' };
  const inventories = { '@test/mcp': '.decantr-build/bundled-dependencies.json' };
  const create = () =>
    createBundledDependencyInventory({ packageDir, repoRoot: root, metafile: metadata });
  const save = (inventory) =>
    put('packages/mcp/.decantr-build/bundled-dependencies.json', inventory);
  try {
    run({ root, packageDir, put, metadata, entry, inventories, create, save });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('inventories included code across nested package boundaries without host paths or unused inputs', () =>
  fixture(({ root, create, save, entry, inventories }) => {
    const inventory = create();
    assert.deepEqual(inventory.components, [
      { name: '@test/sdk', version: '2.0.0', inputFiles: ['nested/index.js'], attributedBytes: 10 },
    ]);
    assert.ok(!JSON.stringify(inventory).includes(root));
    save(inventory);
    assert.deepEqual(readBundledDependencyInventory(root, entry, inventories), inventory);
  }));

for (const [label, path, content] of [
  ['lockfile', 'pnpm-lock.yaml', 'lock-v2'],
  ['manifest', 'packages/mcp/package.json', { name: '@test/mcp', version: '1.0.1' }],
  ['runtime bytes', 'packages/mcp/dist/index.js', 'changed code'],
  ['extra output', 'packages/mcp/dist/extra.js', 'extra code'],
])
  test(`rejects stale inventory after ${label} changes`, () =>
    fixture(({ root, create, save, put, entry, inventories }) => {
      save(create());
      put(path, content);
      assert.throws(
        () => readBundledDependencyInventory(root, entry, inventories),
        /stale|changed|hash mismatch/u,
      );
    }));

test('configured inventories fail closed when missing, but unconfigured packages remain explicitly unknown', () =>
  fixture(({ root, entry, inventories }) => {
    assert.throws(
      () => readBundledDependencyInventory(root, entry, inventories),
      /Missing bundled inventory/u,
    );
    assert.equal(readBundledDependencyInventory(root, entry, {}), null);
  }));

test('deduplicates a declared and bundled dependency while keeping the bundled evidence', () => {
  const sbom = {
    components: [
      { name: '@test/sdk', version: '2.0.0', bomRef: 'pkg:@test/sdk@2.0.0', properties: [] },
    ],
    dependencies: [{ ref: 'root', dependsOn: ['pkg:@test/sdk@2.0.0'] }],
    properties: [],
  };
  addBundledComponents(
    sbom,
    {
      components: [
        { name: '@test/sdk', version: '2.0.0', inputFiles: ['index.js'] },
        { name: 'transitive', version: '3.0.0', inputFiles: ['index.js'] },
      ],
    },
    (n, v) => `${n}@${v}`,
  );
  assert.equal(sbom.components.length, 2);
  assert.equal(sbom.dependencies[0].dependsOn.length, 2);
  assert.ok(
    sbom.components[0].properties.some((p) => p.name === 'decantr:bundled' && p.value === 'true'),
  );
});

test('verifies the actual packed JavaScript and rejects bytes changed after build', () =>
  fixture(({ root, create, put }) => {
    const inventory = create();
    put('package/dist/index.js', 'bundled code');
    const tarball = join(root, 'bundle.tgz');
    execFileSync('tar', ['-czf', tarball, '-C', root, 'package']);
    verifyPackedBundleOutputs(tarball, inventory);
    put('package/dist/index.js', 'different packed bytes');
    execFileSync('tar', ['-czf', tarball, '-C', root, 'package']);
    assert.throws(() => verifyPackedBundleOutputs(tarball, inventory), /differs/u);
  }));
