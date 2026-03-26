// registry-server/test/scripts/import-from.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { seedFromDirectory } from '../../scripts/seed-from-dir.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TMP = join(__dirname, '__fixtures_import');

describe('seedFromDirectory', () => {
  let db;

  before(() => {
    mkdirSync(join(TMP, 'src/patterns'), { recursive: true });
    mkdirSync(join(TMP, 'src/registry-content/styles'), { recursive: true });
    mkdirSync(join(TMP, 'src/registry-content/recipes'), { recursive: true });
    mkdirSync(join(TMP, 'src/registry-content/archetypes'), { recursive: true });

    writeFileSync(join(TMP, 'src/patterns/test-pattern.json'), JSON.stringify({
      id: 'test-pattern', name: 'Test Pattern', description: 'A test',
      version: '1.0.0', tags: ['test'], decantr_compat: '>=0.9.0',
    }));

    writeFileSync(join(TMP, 'src/registry-content/recipes/recipe-test.json'), JSON.stringify({
      id: 'test', name: 'Test Recipe', description: 'A test recipe',
      version: '1.0.0', tags: ['test'], style: 'test',
    }));

    writeFileSync(join(TMP, 'src/registry-content/archetypes/test-arch.json'), JSON.stringify({
      id: 'test-arch', name: 'Test Archetype', description: 'A test archetype',
      version: '1.0.0', tags: ['test'],
    }));

    writeFileSync(join(TMP, 'src/registry-content/styles/test-style.js'),
      `export const testStyle = { id: 'test-style', name: 'Test Style', seed: { primary: '#000' }, personality: {} };\n`
    );

    // Create isolated in-memory DB (matches test/helpers.js pattern — no module state)
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    const schema = readFileSync(join(__dirname, '../../src/db/schema.sql'), 'utf-8');
    db.exec(schema);

    db.prepare("INSERT INTO users (github_id, login, email, role) VALUES ('0', 'decantr', 'team@decantr.dev', 'admin')").run();
  });

  after(() => {
    db.close();
    rmSync(TMP, { recursive: true, force: true });
  });

  it('seeds patterns from src/patterns/', () => {
    seedFromDirectory(db, TMP, 1);
    const row = db.prepare('SELECT * FROM content WHERE type = ? AND content_id = ?').get('pattern', 'test-pattern');
    assert.ok(row, 'pattern should be inserted');
    assert.equal(row.name, 'Test Pattern');
    assert.equal(row.status, 'active');
  });

  it('seeds recipes from src/registry-content/recipes/', () => {
    const row = db.prepare('SELECT * FROM content WHERE type = ? AND content_id = ?').get('recipe', 'test');
    assert.ok(row, 'recipe should be inserted');
    assert.equal(row.name, 'Test Recipe');
  });

  it('seeds archetypes from src/registry-content/archetypes/', () => {
    const row = db.prepare('SELECT * FROM content WHERE type = ? AND content_id = ?').get('archetype', 'test-arch');
    assert.ok(row, 'archetype should be inserted');
    assert.equal(row.name, 'Test Archetype');
  });

  it('seeds styles from src/registry-content/styles/', () => {
    const row = db.prepare('SELECT * FROM content WHERE type = ? AND content_id = ?').get('style', 'test-style');
    assert.ok(row, 'style should be inserted');
    assert.equal(row.name, 'Test Style');
  });

  it('stores artifact in content_versions', () => {
    const content = db.prepare('SELECT id FROM content WHERE type = ? AND content_id = ?').get('pattern', 'test-pattern');
    const version = db.prepare('SELECT * FROM content_versions WHERE content_id = ?').get(content.id);
    assert.ok(version, 'version row should exist');
    assert.ok(version.artifact, 'artifact should be stored');
    const parsed = JSON.parse(version.artifact);
    assert.equal(parsed.id, 'test-pattern');
  });

  it('is idempotent — re-running does not duplicate', () => {
    seedFromDirectory(db, TMP, 1);
    const rows = db.prepare('SELECT * FROM content WHERE type = ? AND content_id = ?').all('pattern', 'test-pattern');
    assert.equal(rows.length, 1, 'should not duplicate');
  });
});
