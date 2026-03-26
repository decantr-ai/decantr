import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveDependencies } from '../../src/services/resolver.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Create a fresh in-memory test database with schema applied.
 */
function createTestDb() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  const schema = readFileSync(join(__dirname, '../../src/db/schema.sql'), 'utf-8');
  db.exec(schema);
  // Seed test user
  db.prepare("INSERT INTO users (github_id, login, role) VALUES ('1', 'testuser', 'publisher')").run();
  return db;
}

/**
 * Seed an item (and a version row) into the database.
 * Calling with a new version on an existing id adds another version row.
 */
function seedItem(db, type, id, version, deps = {}, decantrCompat = '>=0.9.0') {
  const artifact = JSON.stringify({ id, version, decantr_compat: decantrCompat, dependencies: deps });
  let row = db.prepare('SELECT id FROM content WHERE type = ? AND content_id = ?').get(type, id);
  if (!row) {
    const result = db.prepare(
      "INSERT INTO content (type, content_id, name, latest_version, author_id, status) VALUES (?, ?, ?, ?, 1, 'active')"
    ).run(type, id, id, version);
    row = { id: result.lastInsertRowid };
  } else {
    db.prepare('UPDATE content SET latest_version = ? WHERE id = ?').run(version, row.id);
  }
  db.prepare(
    "INSERT INTO content_versions (content_id, version, artifact, checksum, size, published_by) VALUES (?, ?, ?, 'sha256:test', ?, 1)"
  ).run(row.id, version, artifact, artifact.length);
}

describe('resolveDependencies', () => {
  describe('single item with no dependencies', () => {
    it('resolves a pattern with no deps', () => {
      const db = createTestDb();
      seedItem(db, 'pattern', 'hero', '1.2.0');

      const result = resolveDependencies(db, [{ type: 'pattern', id: 'hero', range: '^1.0.0' }]);

      assert.equal(result.flat.length, 1);
      assert.equal(result.flat[0].type, 'pattern');
      assert.equal(result.flat[0].id, 'hero');
      assert.equal(result.flat[0].version, '1.2.0');
      assert.equal(result.flat[0].action, 'install');
      assert.equal(result.stats.toInstall, 1);
      assert.equal(result.stats.toSkip, 0);
      assert.deepEqual(result.warnings, []);
    });
  });

  describe('transitive dependencies', () => {
    it('resolves archetype → pattern + recipe → style', () => {
      const db = createTestDb();

      // style has no deps
      seedItem(db, 'style', 'glassmorphism', '1.0.0');
      // recipe depends on style
      seedItem(db, 'recipe', 'gaming-guild', '1.1.0', {
        styles: { glassmorphism: '^1.0.0' },
      });
      // pattern depends on recipe
      seedItem(db, 'pattern', 'leaderboard', '2.0.0', {
        recipes: { 'gaming-guild': '^1.0.0' },
      });
      // archetype depends on pattern
      seedItem(db, 'archetype', 'gaming-platform', '1.0.0', {
        patterns: { leaderboard: '^2.0.0' },
      });

      const result = resolveDependencies(db, [{ type: 'archetype', id: 'gaming-platform', range: '^1.0.0' }]);

      const ids = result.flat.map(f => `${f.type}/${f.id}`);
      assert.ok(ids.includes('archetype/gaming-platform'), 'should include archetype');
      assert.ok(ids.includes('pattern/leaderboard'), 'should include pattern dep');
      assert.ok(ids.includes('recipe/gaming-guild'), 'should include recipe dep');
      assert.ok(ids.includes('style/glassmorphism'), 'should include style dep');
      assert.equal(result.flat.length, 4);
      assert.equal(result.stats.toInstall, 4);
    });

    it('skips requires_core dependencies', () => {
      const db = createTestDb();
      seedItem(db, 'pattern', 'card-grid', '1.0.0', {
        requires_core: { components: ['Avatar', 'Button'] },
      });

      const result = resolveDependencies(db, [{ type: 'pattern', id: 'card-grid', range: '^1.0.0' }]);

      // Only the pattern itself, no core deps resolved
      assert.equal(result.flat.length, 1);
      assert.equal(result.flat[0].id, 'card-grid');
    });
  });

  describe('already-installed items', () => {
    it('marks installed items as skip', () => {
      const db = createTestDb();
      seedItem(db, 'style', 'glassmorphism', '1.0.0');
      seedItem(db, 'pattern', 'hero', '1.0.0', {
        styles: { glassmorphism: '^1.0.0' },
      });

      const installed = { 'style/glassmorphism': '1.0.0' };
      const result = resolveDependencies(db, [{ type: 'pattern', id: 'hero', range: '^1.0.0' }], installed);

      const style = result.flat.find(f => f.id === 'glassmorphism');
      assert.ok(style, 'glassmorphism should still be in flat list');
      assert.equal(style.action, 'skip');
      assert.equal(style.reason, 'already-installed');

      const hero = result.flat.find(f => f.id === 'hero');
      assert.equal(hero.action, 'install');

      assert.equal(result.stats.toInstall, 1);
      assert.equal(result.stats.toSkip, 1);
    });

    it('marks as skip even when range is satisfied by installed version', () => {
      const db = createTestDb();
      seedItem(db, 'pattern', 'hero', '1.5.0');

      const installed = { 'pattern/hero': '1.5.0' };
      const result = resolveDependencies(db, [{ type: 'pattern', id: 'hero', range: '^1.0.0' }], installed);

      assert.equal(result.flat[0].action, 'skip');
      assert.equal(result.stats.toSkip, 1);
      assert.equal(result.stats.toInstall, 0);
    });
  });

  describe('circular dependency detection', () => {
    it('throws an error for direct circular dependency', () => {
      const db = createTestDb();
      // A depends on B, B depends on A
      seedItem(db, 'pattern', 'pattern-a', '1.0.0', {
        patterns: { 'pattern-b': '^1.0.0' },
      });
      seedItem(db, 'pattern', 'pattern-b', '1.0.0', {
        patterns: { 'pattern-a': '^1.0.0' },
      });

      assert.throws(
        () => resolveDependencies(db, [{ type: 'pattern', id: 'pattern-a', range: '^1.0.0' }]),
        /Circular dependency/
      );
    });

    it('throws an error for indirect circular dependency', () => {
      const db = createTestDb();
      // A → B → C → A
      seedItem(db, 'pattern', 'node-a', '1.0.0', { patterns: { 'node-b': '^1.0.0' } });
      seedItem(db, 'pattern', 'node-b', '1.0.0', { patterns: { 'node-c': '^1.0.0' } });
      seedItem(db, 'pattern', 'node-c', '1.0.0', { patterns: { 'node-a': '^1.0.0' } });

      assert.throws(
        () => resolveDependencies(db, [{ type: 'pattern', id: 'node-a', range: '^1.0.0' }]),
        /Circular dependency/
      );
    });
  });

  describe('error cases', () => {
    it('throws when content is not found', () => {
      const db = createTestDb();

      assert.throws(
        () => resolveDependencies(db, [{ type: 'pattern', id: 'nonexistent', range: '^1.0.0' }]),
        /not found/i
      );
    });

    it('throws when no version satisfies the range', () => {
      const db = createTestDb();
      seedItem(db, 'pattern', 'hero', '1.0.0');

      assert.throws(
        () => resolveDependencies(db, [{ type: 'pattern', id: 'hero', range: '^2.0.0' }]),
        /No version/
      );
    });

    it('throws when a transitive dependency has no satisfying version', () => {
      const db = createTestDb();
      seedItem(db, 'style', 'glassmorphism', '1.0.0');
      seedItem(db, 'pattern', 'hero', '1.0.0', {
        styles: { glassmorphism: '^2.0.0' }, // requires v2, only v1 exists
      });

      assert.throws(
        () => resolveDependencies(db, [{ type: 'pattern', id: 'hero', range: '^1.0.0' }]),
        /No version/
      );
    });

    it('throws when a transitive dependency content does not exist', () => {
      const db = createTestDb();
      seedItem(db, 'pattern', 'hero', '1.0.0', {
        styles: { 'missing-style': '^1.0.0' },
      });

      assert.throws(
        () => resolveDependencies(db, [{ type: 'pattern', id: 'hero', range: '^1.0.0' }]),
        /not found/i
      );
    });
  });

  describe('decantr_compat warnings', () => {
    it('adds warning when item is incompatible with decantrVersion', () => {
      const db = createTestDb();
      // Requires decantr >= 2.0.0, but caller is on 0.9.0
      seedItem(db, 'pattern', 'future-pattern', '1.0.0', {}, '>=2.0.0');

      const result = resolveDependencies(
        db,
        [{ type: 'pattern', id: 'future-pattern', range: '^1.0.0' }],
        {},
        '0.9.0'
      );

      assert.equal(result.warnings.length, 1);
      assert.ok(result.warnings[0].includes('future-pattern') || result.warnings[0].includes('decantr'));
    });

    it('does not warn when compat is satisfied', () => {
      const db = createTestDb();
      seedItem(db, 'pattern', 'hero', '1.0.0', {}, '>=0.9.0');

      const result = resolveDependencies(
        db,
        [{ type: 'pattern', id: 'hero', range: '^1.0.0' }],
        {},
        '0.9.0'
      );

      assert.equal(result.warnings.length, 0);
    });

    it('uses default decantrVersion of 0.9.0 when not provided', () => {
      const db = createTestDb();
      seedItem(db, 'pattern', 'hero', '1.0.0', {}, '>=0.9.0');

      const result = resolveDependencies(db, [{ type: 'pattern', id: 'hero', range: '^1.0.0' }]);

      assert.equal(result.warnings.length, 0);
    });
  });

  describe('deduplication', () => {
    it('does not resolve the same node twice when shared as a transitive dep', () => {
      const db = createTestDb();
      // Both pattern-a and pattern-b depend on the same style
      seedItem(db, 'style', 'shared-style', '1.0.0');
      seedItem(db, 'pattern', 'pattern-a', '1.0.0', { styles: { 'shared-style': '^1.0.0' } });
      seedItem(db, 'pattern', 'pattern-b', '1.0.0', { styles: { 'shared-style': '^1.0.0' } });

      const result = resolveDependencies(db, [
        { type: 'pattern', id: 'pattern-a', range: '^1.0.0' },
        { type: 'pattern', id: 'pattern-b', range: '^1.0.0' },
      ]);

      const styleEntries = result.flat.filter(f => f.id === 'shared-style');
      assert.equal(styleEntries.length, 1, 'shared dep should appear only once');
      assert.equal(result.flat.length, 3);
    });
  });

  describe('result shape', () => {
    it('returns tree, flat, stats, and warnings fields', () => {
      const db = createTestDb();
      seedItem(db, 'pattern', 'hero', '1.0.0');

      const result = resolveDependencies(db, [{ type: 'pattern', id: 'hero', range: '^1.0.0' }]);

      assert.ok('tree' in result, 'should have tree');
      assert.ok('flat' in result, 'should have flat');
      assert.ok('stats' in result, 'should have stats');
      assert.ok('warnings' in result, 'should have warnings');
      assert.ok('toInstall' in result.stats);
      assert.ok('toSkip' in result.stats);
    });

    it('each flat entry has type, id, version, action, and dependencies fields', () => {
      const db = createTestDb();
      seedItem(db, 'pattern', 'hero', '1.0.0');

      const result = resolveDependencies(db, [{ type: 'pattern', id: 'hero', range: '^1.0.0' }]);
      const entry = result.flat[0];

      assert.ok('type' in entry);
      assert.ok('id' in entry);
      assert.ok('version' in entry);
      assert.ok('action' in entry);
      assert.ok('dependencies' in entry);
    });
  });
});
