import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getRecommendations } from '../../src/services/recommend.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function createTestDb() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  const schema = readFileSync(join(__dirname, '../../src/db/schema.sql'), 'utf-8');
  db.exec(schema);

  // Insert test user
  db.prepare("INSERT INTO users (github_id, login, role) VALUES ('1', 'test', 'publisher')").run();

  return db;
}

function insertContent(db, overrides = {}) {
  const defaults = {
    type: 'style',
    content_id: 'test-style',
    name: 'Test Style',
    description: 'A test style',
    tags: '[]',
    latest_version: '1.0.0',
    author_id: 1,
    downloads: 0,
    metadata: '{}',
  };
  const data = { ...defaults, ...overrides };
  db.prepare(`
    INSERT INTO content (type, content_id, name, description, tags, latest_version, author_id, downloads, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(data.type, data.content_id, data.name, data.description, data.tags, data.latest_version, data.author_id, data.downloads, data.metadata);
}

describe('getRecommendations', () => {
  let db;

  beforeEach(() => {
    db = createTestDb();
  });

  it('returns empty for no content', () => {
    const result = getRecommendations(db, {});
    assert.equal(result.recommendations.length, 0);
  });

  it('scores terroir affinity', () => {
    insertContent(db, {
      content_id: 'dash-style',
      metadata: JSON.stringify({ terroir_affinity: ['saas-dashboard'] }),
    });
    const result = getRecommendations(db, { terroir: 'saas-dashboard' });
    assert.ok(result.recommendations.length > 0);
    assert.ok(result.recommendations[0].score >= 30);
  });

  it('scores character matches', () => {
    insertContent(db, {
      content_id: 'bold-style',
      metadata: JSON.stringify({ character: ['bold', 'minimal'] }),
    });
    const result = getRecommendations(db, { character: 'bold,minimal' });
    assert.ok(result.recommendations.length > 0);
    assert.ok(result.recommendations[0].score >= 40); // 20 per match
  });

  it('excludes already-installed content', () => {
    insertContent(db, { content_id: 'installed-one' });
    insertContent(db, {
      content_id: 'not-installed',
      metadata: JSON.stringify({ terroir_affinity: ['portfolio'] }),
    });
    const result = getRecommendations(db, { terroir: 'portfolio', existing: 'installed-one' });
    assert.ok(result.recommendations.every(r => r.id !== 'installed-one'));
  });

  it('sorts by score descending', () => {
    insertContent(db, {
      content_id: 'low-score',
      metadata: JSON.stringify({ terroir_affinity: ['portfolio'] }),
    });
    insertContent(db, {
      content_id: 'high-score',
      metadata: JSON.stringify({ terroir_affinity: ['portfolio'], character: ['bold'] }),
    });
    const result = getRecommendations(db, { terroir: 'portfolio', character: 'bold' });
    assert.ok(result.recommendations[0].score >= result.recommendations[1].score);
  });
});
