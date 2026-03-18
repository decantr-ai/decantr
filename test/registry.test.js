import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, rm, access } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

// ── Module imports ───────────────────────────────────────────────

import {
  createEmptyManifest, readManifest, writeManifest,
  getEntry, setEntry, removeEntry, listEntries, isEmpty,
} from '../tools/registry-manifest.js';

import {
  computeChecksum, verifyChecksum, validateId, validateVersion,
  validateArtifact, validateForPublish, compareSemver,
} from '../tools/registry-validator.js';

import { ContentRegistryClient } from '../src/registry/content-registry.js';

// ── Test helpers ─────────────────────────────────────────────────

let testDir;

async function createTestDir() {
  testDir = join(tmpdir(), `decantr-test-${randomUUID()}`);
  await mkdir(testDir, { recursive: true });
  return testDir;
}

async function cleanTestDir() {
  if (testDir) {
    await rm(testDir, { recursive: true, force: true });
  }
}

// ═════════════════════════════════════════════════════════════════
// Manifest CRUD
// ═════════════════════════════════════════════════════════════════

describe('registry-manifest', () => {
  beforeEach(createTestDir);
  afterEach(cleanTestDir);

  it('createEmptyManifest returns valid structure', () => {
    const manifest = createEmptyManifest();
    assert.equal(manifest.version, '1.0.0');
    assert.ok(manifest.installed);
    assert.deepEqual(manifest.installed.styles, {});
    assert.deepEqual(manifest.installed.recipes, {});
    assert.deepEqual(manifest.installed.patterns, {});
    assert.deepEqual(manifest.installed.archetypes, {});
    assert.deepEqual(manifest.installed.plugins, {});
    assert.deepEqual(manifest.installed.templates, {});
  });

  it('readManifest returns empty manifest when file is missing', async () => {
    const manifest = await readManifest(testDir);
    assert.equal(manifest.version, '1.0.0');
    assert.ok(isEmpty(manifest));
  });

  it('writeManifest + readManifest round-trips', async () => {
    const manifest = createEmptyManifest();
    setEntry(manifest, 'styles', 'neon', {
      version: '1.2.0',
      source: 'registry',
      checksum: 'sha256:abc123',
      file: 'src/css/styles/community/neon.js',
    });

    await writeManifest(testDir, manifest);
    const read = await readManifest(testDir);
    assert.equal(read.installed.styles.neon.version, '1.2.0');
    assert.equal(read.installed.styles.neon.checksum, 'sha256:abc123');
  });

  it('setEntry / getEntry / removeEntry work correctly', () => {
    const manifest = createEmptyManifest();

    // Set
    setEntry(manifest, 'patterns', 'kanban', {
      version: '1.0.0',
      checksum: 'sha256:def456',
      file: 'src/registry/patterns/kanban.json',
    });

    // Get
    const entry = getEntry(manifest, 'patterns', 'kanban');
    assert.ok(entry);
    assert.equal(entry.version, '1.0.0');
    assert.equal(entry.source, 'registry');
    assert.ok(entry.installedAt);

    // Get missing
    assert.equal(getEntry(manifest, 'patterns', 'missing'), null);

    // Remove
    assert.equal(removeEntry(manifest, 'patterns', 'kanban'), true);
    assert.equal(getEntry(manifest, 'patterns', 'kanban'), null);

    // Remove again
    assert.equal(removeEntry(manifest, 'patterns', 'kanban'), false);
  });

  it('listEntries returns all entries', () => {
    const manifest = createEmptyManifest();
    setEntry(manifest, 'styles', 'neon', { version: '1.0.0', checksum: 'a', file: 'a.js' });
    setEntry(manifest, 'recipes', 'cyber', { version: '2.0.0', checksum: 'b', file: 'b.json' });

    const all = listEntries(manifest);
    assert.equal(all.length, 2);

    const stylesOnly = listEntries(manifest, 'styles');
    assert.equal(stylesOnly.length, 1);
    assert.equal(stylesOnly[0].name, 'neon');
  });

  it('isEmpty returns true for empty manifest', () => {
    const manifest = createEmptyManifest();
    assert.ok(isEmpty(manifest));

    setEntry(manifest, 'styles', 'neon', { version: '1.0.0', checksum: 'a', file: 'a.js' });
    assert.ok(!isEmpty(manifest));
  });
});

// ═════════════════════════════════════════════════════════════════
// Validator
// ═════════════════════════════════════════════════════════════════

describe('registry-validator', () => {
  describe('computeChecksum', () => {
    it('returns sha256-prefixed checksum', () => {
      const checksum = computeChecksum('hello world');
      assert.ok(checksum.startsWith('sha256:'));
      assert.equal(checksum.length, 7 + 64); // prefix + hex
    });

    it('is deterministic', () => {
      assert.equal(computeChecksum('test'), computeChecksum('test'));
    });

    it('different content produces different checksums', () => {
      assert.notEqual(computeChecksum('a'), computeChecksum('b'));
    });
  });

  describe('verifyChecksum', () => {
    let dir;
    beforeEach(async () => {
      dir = join(tmpdir(), `decantr-test-${randomUUID()}`);
      await mkdir(dir, { recursive: true });
    });
    afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

    it('returns true for matching checksum', async () => {
      const content = 'hello world';
      const filePath = join(dir, 'test.txt');
      await writeFile(filePath, content);
      const checksum = computeChecksum(content);
      assert.ok(await verifyChecksum(filePath, checksum));
    });

    it('returns false for mismatched checksum', async () => {
      const filePath = join(dir, 'test.txt');
      await writeFile(filePath, 'hello world');
      assert.ok(!await verifyChecksum(filePath, 'sha256:wrong'));
    });

    it('returns false for missing file', async () => {
      assert.ok(!await verifyChecksum(join(dir, 'missing.txt'), 'sha256:abc'));
    });
  });

  describe('validateId', () => {
    it('accepts valid kebab-case IDs', () => {
      assert.ok(validateId('neon', 'style').valid);
      assert.ok(validateId('brutalist-dashboard', 'style').valid);
      assert.ok(validateId('my-pattern-v2', 'pattern').valid);
    });

    it('rejects invalid IDs', () => {
      assert.ok(!validateId('', 'style').valid);
      assert.ok(!validateId('A', 'style').valid); // uppercase
      assert.ok(!validateId('-bad', 'style').valid); // starts with dash
      assert.ok(!validateId('a', 'style').valid); // too short
    });

    it('rejects built-in IDs', () => {
      const result = validateId('clean', 'style');
      assert.ok(!result.valid);
      assert.ok(result.errors[0].includes('built-in'));
    });
  });

  describe('validateVersion', () => {
    it('accepts valid semver', () => {
      assert.ok(validateVersion('1.0.0').valid);
      assert.ok(validateVersion('0.1.0').valid);
      assert.ok(validateVersion('10.20.30').valid);
    });

    it('rejects invalid versions', () => {
      assert.ok(!validateVersion('').valid);
      assert.ok(!validateVersion('1.0').valid);
      assert.ok(!validateVersion('v1.0.0').valid);
      assert.ok(!validateVersion('1.0.0-beta').valid);
    });
  });

  describe('compareSemver', () => {
    it('compares versions correctly', () => {
      assert.equal(compareSemver('1.0.0', '1.0.0'), 0);
      assert.equal(compareSemver('2.0.0', '1.0.0'), 1);
      assert.equal(compareSemver('1.0.0', '2.0.0'), -1);
      assert.equal(compareSemver('1.1.0', '1.0.0'), 1);
      assert.equal(compareSemver('1.0.1', '1.0.0'), 1);
    });
  });

  describe('validateArtifact', () => {
    it('validates style artifacts', () => {
      const valid = `export const neon = { id: 'neon', name: 'Neon', seed: {} };`;
      assert.ok(validateArtifact('style', valid).valid);

      const noExport = `const neon = { id: 'neon', name: 'Neon', seed: {} };`;
      assert.ok(!validateArtifact('style', noExport).valid);
    });

    it('validates recipe artifacts', () => {
      const valid = JSON.stringify({ id: 'cyber', name: 'Cyber', style: 'neon', decorators: {} });
      assert.ok(validateArtifact('recipe', valid).valid);

      const noId = JSON.stringify({ name: 'Cyber', style: 'neon' });
      assert.ok(!validateArtifact('recipe', noId).valid);
    });

    it('validates pattern artifacts', () => {
      const valid = JSON.stringify({ id: 'kanban', name: 'Kanban Board' });
      assert.ok(validateArtifact('pattern', valid).valid);
    });

    it('validates archetype artifacts', () => {
      const valid = JSON.stringify({ id: 'hr-tool', name: 'HR Tool', pages: [] });
      assert.ok(validateArtifact('archetype', valid).valid);

      const noPages = JSON.stringify({ id: 'hr-tool', name: 'HR Tool' });
      assert.ok(!validateArtifact('archetype', noPages).valid);
    });

    it('rejects empty content', () => {
      assert.ok(!validateArtifact('style', '').valid);
      assert.ok(!validateArtifact('style', null).valid);
    });

    it('enforces size limits', () => {
      const huge = 'x'.repeat(11 * 1024); // 11KB > 10KB limit for styles
      assert.ok(!validateArtifact('style', huge).valid);
    });
  });

  describe('validateForPublish', () => {
    it('validates full publish payload', () => {
      const content = `export const neon = { id: 'neon', name: 'Neon', seed: {} };`;
      const result = validateForPublish('style', 'neon-glow', '1.0.0', content);
      assert.ok(result.valid);
    });

    it('rejects when version not greater than latest', () => {
      const content = `export const neon = { id: 'neon', name: 'Neon', seed: {} };`;
      const result = validateForPublish('style', 'neon-glow', '1.0.0', content, '2.0.0');
      assert.ok(!result.valid);
      assert.ok(result.errors.some(e => e.includes('greater than')));
    });

    it('rejects invalid type', () => {
      const result = validateForPublish('widget', 'foo', '1.0.0', 'content');
      assert.ok(!result.valid);
    });
  });
});

// ═════════════════════════════════════════════════════════════════
// Content Registry Client
// ═════════════════════════════════════════════════════════════════

describe('ContentRegistryClient', () => {
  it('constructs with defaults', () => {
    const client = new ContentRegistryClient();
    assert.ok(client.registry.includes('registry.decantr.dev'));
  });

  it('constructs with custom registry', () => {
    const client = new ContentRegistryClient({ registry: 'http://localhost:3000/v1' });
    assert.equal(client.registry, 'http://localhost:3000/v1');
  });

  it('builds URLs correctly', () => {
    const client = new ContentRegistryClient({ registry: 'https://example.com/v1' });
    const url = client._url('search', { q: 'neon', type: 'style' });
    assert.ok(url.includes('search'));
    assert.ok(url.includes('q=neon'));
    assert.ok(url.includes('type=style'));
  });

  it('includes auth headers when token is set', () => {
    const client = new ContentRegistryClient({ token: 'test-token' });
    const headers = client._authHeaders();
    assert.equal(headers.Authorization, 'Bearer test-token');
  });

  it('omits auth headers when no token', () => {
    const client = new ContentRegistryClient();
    const headers = client._authHeaders();
    assert.equal(headers.Authorization, undefined);
  });
});

// ═════════════════════════════════════════════════════════════════
// Integration: manifest + validator
// ═════════════════════════════════════════════════════════════════

describe('manifest + validator integration', () => {
  let dir;
  beforeEach(async () => {
    dir = join(tmpdir(), `decantr-test-${randomUUID()}`);
    await mkdir(dir, { recursive: true });
  });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('add → verify checksum → remove cycle', async () => {
    const content = `export const neon = { id: 'neon', name: 'Neon', seed: {} };`;
    const checksum = computeChecksum(content);

    // Write content file
    const filePath = join(dir, 'neon.js');
    await writeFile(filePath, content);

    // Create manifest entry
    const manifest = createEmptyManifest();
    setEntry(manifest, 'styles', 'neon', {
      version: '1.0.0',
      checksum,
      file: 'neon.js',
    });
    await writeManifest(dir, manifest);

    // Verify checksum
    assert.ok(await verifyChecksum(filePath, checksum));

    // Modify file
    await writeFile(filePath, content + '\n// modified');
    assert.ok(!await verifyChecksum(filePath, checksum));

    // Remove entry
    const reread = await readManifest(dir);
    removeEntry(reread, 'styles', 'neon');
    await writeManifest(dir, reread);

    const final = await readManifest(dir);
    assert.ok(isEmpty(final));
  });
});
