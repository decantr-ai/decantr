import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readFile, stat, lstat, realpath, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  discoverBottles,
  checkBottle,
  checkPortCollisions,
  fixBottle,
  linkBottle,
  getDecantrDep,
} from '../tools/cellar-utils.js';

const ROOT_VERSION = '0.9.6';

async function makeTmpDir() {
  return mkdtemp(join(tmpdir(), 'cellar-test-'));
}

async function writeJSON(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2) + '\n');
}

async function makeBottle(root, relPath, opts = {}) {
  const dir = join(root, relPath);
  await mkdir(dir, { recursive: true });

  if (opts.config !== false) {
    const config = opts.config || { name: relPath, dev: { port: opts.port || 3000 } };
    await writeJSON(join(dir, 'decantr.config.json'), config);
  }

  if (opts.manifest !== false) {
    await mkdir(join(dir, '.decantr'), { recursive: true });
    const manifest = opts.manifest || { version: opts.manifestVersion || ROOT_VERSION, name: relPath };
    await writeJSON(join(dir, '.decantr', 'manifest.json'), manifest);
  }

  if (opts.packageJson !== false) {
    const pkg = opts.packageJson || {
      name: relPath.replace(/\//g, '-'),
      version: '0.1.0',
      type: 'module',
      dependencies: { decantr: opts.dep || `^${ROOT_VERSION}` },
    };
    await writeJSON(join(dir, 'package.json'), pkg);
  }

  if (opts.essence !== false) {
    const essence = opts.essence || { version: '1.0.0', terroir: 'test' };
    await writeJSON(join(dir, 'decantr.essence.json'), essence);
  }

  if (opts.symlink) {
    const nmDir = join(dir, 'node_modules');
    await mkdir(nmDir, { recursive: true });
    const { relative } = await import('node:path');
    const relTarget = relative(nmDir, root);
    await symlink(relTarget, join(nmDir, 'decantr'));
  }

  return dir;
}

// ── Discovery ──────────────────────────────────────────────────────

describe('discoverBottles', () => {
  let root;
  beforeEach(async () => { root = await makeTmpDir(); });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  it('finds projects by decantr.config.json marker', async () => {
    await makeBottle(root, 'project-a', { manifest: false });
    const bottles = await discoverBottles(root);
    assert.equal(bottles.length, 1);
    assert.equal(bottles[0].relativePath, 'project-a');
  });

  it('finds projects by .decantr/manifest.json marker', async () => {
    await makeBottle(root, 'project-b', { config: false });
    const bottles = await discoverBottles(root);
    assert.equal(bottles.length, 1);
    assert.equal(bottles[0].relativePath, 'project-b');
  });

  it('skips root directory even if it has markers', async () => {
    // Root itself has a config
    await writeJSON(join(root, 'decantr.config.json'), { name: 'root' });
    await makeBottle(root, 'sub');
    const bottles = await discoverBottles(root);
    assert.equal(bottles.length, 1);
    assert.equal(bottles[0].relativePath, 'sub');
  });

  it('skips node_modules directories', async () => {
    await mkdir(join(root, 'node_modules', 'some-project'), { recursive: true });
    await writeJSON(join(root, 'node_modules', 'some-project', 'decantr.config.json'), {});
    const bottles = await discoverBottles(root);
    assert.equal(bottles.length, 0);
  });

  it('handles nested projects (e.g., showcase/saas-dashboard)', async () => {
    await makeBottle(root, 'showcase/saas', { port: 4200 });
    await makeBottle(root, 'showcase/portfolio', { port: 4300 });
    const bottles = await discoverBottles(root);
    assert.equal(bottles.length, 2);
    assert.equal(bottles[0].relativePath, 'showcase/portfolio');
    assert.equal(bottles[1].relativePath, 'showcase/saas');
  });

  it('respects max depth of 3', async () => {
    // Depth 3 should be found
    await makeBottle(root, 'a/b/c', { manifest: false });
    // Depth 4 should not
    await mkdir(join(root, 'a/b/c/d'), { recursive: true });
    await writeJSON(join(root, 'a/b/c/d', 'decantr.config.json'), {});

    const bottles = await discoverBottles(root);
    const paths = bottles.map(b => b.relativePath);
    assert.ok(paths.includes('a/b/c'));
    assert.ok(!paths.includes('a/b/c/d'));
  });

  it('returns bottles sorted by relativePath', async () => {
    await makeBottle(root, 'zebra');
    await makeBottle(root, 'alpha');
    await makeBottle(root, 'mid');
    const bottles = await discoverBottles(root);
    assert.deepEqual(bottles.map(b => b.relativePath), ['alpha', 'mid', 'zebra']);
  });

  it('reads package.json, config, manifest, and essence', async () => {
    await makeBottle(root, 'full', {
      port: 3001,
      manifestVersion: '0.9.6',
      dep: '^0.9.6',
    });
    const [b] = await discoverBottles(root);
    assert.ok(b.packageJson);
    assert.ok(b.config);
    assert.ok(b.manifest);
    assert.ok(b.essence);
    assert.equal(b.config.dev.port, 3001);
  });
});

// ── getDecantrDep ──────────────────────────────────────────────────

describe('getDecantrDep', () => {
  it('returns from dependencies', () => {
    assert.equal(getDecantrDep({ dependencies: { decantr: '^0.9.6' } }), '^0.9.6');
  });

  it('returns from devDependencies', () => {
    assert.equal(getDecantrDep({ devDependencies: { decantr: '^0.8.0' } }), '^0.8.0');
  });

  it('prefers dependencies over devDependencies', () => {
    assert.equal(getDecantrDep({
      dependencies: { decantr: '^0.9.6' },
      devDependencies: { decantr: '^0.8.0' },
    }), '^0.9.6');
  });

  it('returns null if not present', () => {
    assert.equal(getDecantrDep({ dependencies: { other: '1.0.0' } }), null);
  });

  it('returns null for null input', () => {
    assert.equal(getDecantrDep(null), null);
  });
});

// ── Label Check ────────────────────────────────────────────────────

describe('checkBottle — label', () => {
  let root;
  beforeEach(async () => { root = await makeTmpDir(); });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  it('passes when package.json + config exist', async () => {
    await makeBottle(root, 'ok');
    const [b] = await discoverBottles(root);
    const results = await checkBottle(b, root, ROOT_VERSION);
    const label = results.find(r => r.check === 'label');
    assert.equal(label.status, 'pass');
  });

  it('warns when no manifest and no config', async () => {
    await makeBottle(root, 'bare', { manifest: false, config: false });
    // Need a marker for discovery — add just a config file
    await writeJSON(join(root, 'bare', 'decantr.config.json'), { name: 'bare' });
    const [b] = await discoverBottles(root);
    // Simulate both markers missing from object
    b.manifest = null;
    b.config = null;
    const results = await checkBottle(b, root, ROOT_VERSION);
    const label = results.find(r => r.check === 'label');
    assert.equal(label.status, 'warn');
  });

  it('fails when no package.json', async () => {
    await makeBottle(root, 'nopkg', { packageJson: false });
    const [b] = await discoverBottles(root);
    const results = await checkBottle(b, root, ROOT_VERSION);
    const label = results.find(r => r.check === 'label');
    assert.equal(label.status, 'fail');
  });
});

// ── Cork Check ─────────────────────────────────────────────────────

describe('checkBottle — cork (symlink)', () => {
  let root;
  beforeEach(async () => { root = await makeTmpDir(); });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  it('passes when correctly symlinked to root', async () => {
    await makeBottle(root, 'linked', { symlink: true });
    const [b] = await discoverBottles(root);
    const results = await checkBottle(b, root, ROOT_VERSION);
    const cork = results.find(r => r.check === 'cork');
    assert.equal(cork.status, 'pass');
  });

  it('warns when npm-installed (directory, not symlink)', async () => {
    await makeBottle(root, 'npm-installed');
    // Create a real directory instead of symlink
    await mkdir(join(root, 'npm-installed', 'node_modules', 'decantr'), { recursive: true });
    await writeJSON(join(root, 'npm-installed', 'node_modules', 'decantr', 'package.json'), { name: 'decantr', version: '0.9.6' });
    const [b] = await discoverBottles(root);
    const results = await checkBottle(b, root, ROOT_VERSION);
    const cork = results.find(r => r.check === 'cork');
    assert.equal(cork.status, 'warn');
    assert.ok(cork.fixable);
  });

  it('fails when node_modules/decantr is missing', async () => {
    await makeBottle(root, 'missing');
    const [b] = await discoverBottles(root);
    const results = await checkBottle(b, root, ROOT_VERSION);
    const cork = results.find(r => r.check === 'cork');
    assert.equal(cork.status, 'fail');
    assert.ok(cork.fixable);
  });
});

// ── Vintage Check ──────────────────────────────────────────────────

describe('checkBottle — vintage (version)', () => {
  let root;
  beforeEach(async () => { root = await makeTmpDir(); });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  it('passes when dep matches root version', async () => {
    await makeBottle(root, 'current', { dep: '^0.9.6' });
    const [b] = await discoverBottles(root);
    const results = await checkBottle(b, root, ROOT_VERSION);
    const vintage = results.find(r => r.check === 'vintage');
    assert.equal(vintage.status, 'pass');
  });

  it('passes for file: deps', async () => {
    await makeBottle(root, 'file-dep', { dep: 'file:..' });
    const [b] = await discoverBottles(root);
    const results = await checkBottle(b, root, ROOT_VERSION);
    const vintage = results.find(r => r.check === 'vintage');
    assert.equal(vintage.status, 'pass');
  });

  it('fails when dep is behind root', async () => {
    await makeBottle(root, 'stale', { dep: '^0.4.0' });
    const [b] = await discoverBottles(root);
    const results = await checkBottle(b, root, ROOT_VERSION);
    const vintage = results.find(r => r.check === 'vintage');
    assert.equal(vintage.status, 'fail');
    assert.ok(vintage.fixable);
  });

  it('warns when manifest version mismatches', async () => {
    await makeBottle(root, 'old-manifest', { manifestVersion: '0.8.0' });
    const [b] = await discoverBottles(root);
    const results = await checkBottle(b, root, ROOT_VERSION);
    const vintageResults = results.filter(r => r.check === 'vintage');
    const manifestWarn = vintageResults.find(r => r.message.includes('Manifest'));
    assert.ok(manifestWarn);
    assert.equal(manifestWarn.status, 'warn');
  });
});

// ── Port Check ─────────────────────────────────────────────────────

describe('checkPortCollisions', () => {
  let root;
  beforeEach(async () => { root = await makeTmpDir(); });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  it('returns empty for unique ports', async () => {
    await makeBottle(root, 'a', { port: 3001 });
    await makeBottle(root, 'b', { port: 3002 });
    const bottles = await discoverBottles(root);
    const collisions = checkPortCollisions(bottles);
    assert.equal(collisions.length, 0);
  });

  it('detects port collisions', async () => {
    await makeBottle(root, 'a', { port: 4200 });
    await makeBottle(root, 'b', { port: 4200 });
    await makeBottle(root, 'c', { port: 3000 });
    const bottles = await discoverBottles(root);
    const collisions = checkPortCollisions(bottles);
    assert.equal(collisions.length, 1);
    assert.equal(collisions[0].port, 4200);
    assert.equal(collisions[0].bottles.length, 2);
  });
});

// ── Essence Check ──────────────────────────────────────────────────

describe('checkBottle — essence', () => {
  let root;
  beforeEach(async () => { root = await makeTmpDir(); });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  it('passes when essence has version', async () => {
    await makeBottle(root, 'ok', { essence: { version: '1.0.0' } });
    const [b] = await discoverBottles(root);
    const results = await checkBottle(b, root, ROOT_VERSION);
    const ess = results.find(r => r.check === 'essence');
    assert.equal(ess.status, 'pass');
  });

  it('warns when essence missing version', async () => {
    await makeBottle(root, 'noversion', { essence: { terroir: 'test' } });
    const [b] = await discoverBottles(root);
    const results = await checkBottle(b, root, ROOT_VERSION);
    const ess = results.find(r => r.check === 'essence');
    assert.equal(ess.status, 'warn');
  });
});

// ── Link ───────────────────────────────────────────────────────────

describe('linkBottle', () => {
  let root;
  beforeEach(async () => { root = await makeTmpDir(); });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  it('creates symlink when node_modules does not exist', async () => {
    await makeBottle(root, 'nomod');
    const [b] = await discoverBottles(root);
    await linkBottle(b, root);

    const nmDecantr = join(b.path, 'node_modules', 'decantr');
    const lstats = await lstat(nmDecantr);
    assert.ok(lstats.isSymbolicLink());
    // Verify it resolves to a directory
    const targetStat = await stat(nmDecantr);
    assert.ok(targetStat.isDirectory());
  });

  it('replaces npm-installed directory with symlink', async () => {
    await makeBottle(root, 'npmdir');
    await mkdir(join(root, 'npmdir', 'node_modules', 'decantr'), { recursive: true });
    await writeJSON(join(root, 'npmdir', 'node_modules', 'decantr', 'package.json'), { name: 'decantr' });

    const [b] = await discoverBottles(root);
    await linkBottle(b, root);

    const lstats = await lstat(join(b.path, 'node_modules', 'decantr'));
    assert.ok(lstats.isSymbolicLink());
  });

  it('is idempotent — calling twice does not error', async () => {
    await makeBottle(root, 'idem');
    const [b] = await discoverBottles(root);
    await linkBottle(b, root);
    await linkBottle(b, root); // Should not throw
    const lstats = await lstat(join(b.path, 'node_modules', 'decantr'));
    assert.ok(lstats.isSymbolicLink());
  });
});

// ── Fix ────────────────────────────────────────────────────────────

describe('fixBottle', () => {
  let root;
  beforeEach(async () => { root = await makeTmpDir(); });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  it('updates stale dep version and manifest', async () => {
    await makeBottle(root, 'stale', { dep: '^0.4.0', manifestVersion: '0.4.0' });
    const [b] = await discoverBottles(root);
    const actions = await fixBottle(b, root, ROOT_VERSION);

    assert.ok(actions.includes('dep version'));
    assert.ok(actions.includes('manifest version'));

    // Verify package.json updated
    const pkg = JSON.parse(await readFile(join(b.path, 'package.json'), 'utf-8'));
    assert.equal(pkg.dependencies.decantr, '^0.9.6');

    // Verify manifest updated
    const manifest = JSON.parse(await readFile(join(b.path, '.decantr', 'manifest.json'), 'utf-8'));
    assert.equal(manifest.version, '0.9.6');
  });

  it('creates symlink as part of fix', async () => {
    await makeBottle(root, 'nolink');
    const [b] = await discoverBottles(root);
    await fixBottle(b, root, ROOT_VERSION);

    const lstats = await lstat(join(b.path, 'node_modules', 'decantr'));
    assert.ok(lstats.isSymbolicLink());
  });

  it('does not touch file: deps', async () => {
    await makeBottle(root, 'file-linked', { dep: 'file:..' });
    const [b] = await discoverBottles(root);
    const actions = await fixBottle(b, root, ROOT_VERSION);

    assert.ok(!actions.includes('dep version'));
    const pkg = JSON.parse(await readFile(join(b.path, 'package.json'), 'utf-8'));
    assert.equal(pkg.dependencies.decantr, 'file:..');
  });
});

// ── Integration ────────────────────────────────────────────────────

describe('integration: stale → fix → healthy', () => {
  let root;
  beforeEach(async () => { root = await makeTmpDir(); });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  it('fixes a stale project and makes it healthy', async () => {
    await makeBottle(root, 'playground', {
      dep: '^0.4.0',
      manifestVersion: '0.4.0',
      port: 4200,
    });

    // Before fix: should have failures
    let bottles = await discoverBottles(root);
    let results = await checkBottle(bottles[0], root, ROOT_VERSION);
    let vintage = results.find(r => r.check === 'vintage' && r.status === 'fail');
    assert.ok(vintage, 'should have vintage failure before fix');

    // Fix
    await fixBottle(bottles[0], root, ROOT_VERSION);

    // After fix: re-discover (fresh data) and re-check
    bottles = await discoverBottles(root);
    results = await checkBottle(bottles[0], root, ROOT_VERSION);
    vintage = results.find(r => r.check === 'vintage' && r.status === 'fail');
    assert.ok(!vintage, 'should have no vintage failure after fix');

    const cork = results.find(r => r.check === 'cork');
    assert.equal(cork.status, 'pass', 'should be linked after fix');
  });
});
