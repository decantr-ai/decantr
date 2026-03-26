import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestApp, seedContent, seedVersion } from '../helpers.js';

/**
 * Seed content + version row together, returning the content row id.
 */
function seedItem(db, type, id, version, artifactExtra = {}) {
  const artifact = JSON.stringify({ id, version, ...artifactExtra });
  seedContent(db, [{ type, content_id: id, name: id, latest_version: version }]);
  const row = db.prepare('SELECT id FROM content WHERE type = ? AND content_id = ?').get(type, id);
  seedVersion(db, row.id, version, artifact);
  return row.id;
}

describe('GET /v1/compat/:type/:id', () => {
  let app, db, cleanup;

  before(() => {
    ({ app, db, cleanup } = createTestApp());
  });

  after(() => cleanup());

  it('returns version compatibility matrix', async () => {
    // Seed a single content row with two versions
    seedContent(db, [{ type: 'recipe', content_id: 'auradecantism', name: 'auradecantism', latest_version: '2.0.0' }]);
    const row = db.prepare("SELECT id FROM content WHERE type = 'recipe' AND content_id = 'auradecantism'").get();
    seedVersion(db, row.id, '1.0.0', JSON.stringify({ id: 'auradecantism', version: '1.0.0', decantr_compat: '>=0.8.0' }));
    seedVersion(db, row.id, '2.0.0', JSON.stringify({ id: 'auradecantism', version: '2.0.0', decantr_compat: '>=1.0.0' }));

    const res = await app.request('/v1/compat/recipe/auradecantism');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.type, 'recipe');
    assert.equal(body.id, 'auradecantism');
    assert.ok(typeof body.versions === 'object', 'versions should be an object');
    assert.ok('2.0.0' in body.versions, 'versions map should include 2.0.0');
    assert.ok('1.0.0' in body.versions, 'versions map should include 1.0.0');
    assert.equal(body.versions['2.0.0'].decantr_compat, '>=1.0.0');
    assert.equal(body.versions['1.0.0'].decantr_compat, '>=0.8.0');
    assert.ok(Array.isArray(body.versions['2.0.0'].dependents));
    assert.ok('created_at' in body.versions['2.0.0']);
  });

  it('returns 404 for unknown content', async () => {
    const res = await app.request('/v1/compat/pattern/does-not-exist');
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.ok(body.error.includes('does-not-exist'));
  });

  it('includes dependents when other content depends on this', async () => {
    // Seed content B (the dependency target)
    seedItem(db, 'pattern', 'card-base', '1.0.0', { decantr_compat: '>=0.9.0' });

    // Seed content A that depends on content B (card-base)
    seedItem(db, 'pattern', 'fancy-card', '1.2.0', {
      dependencies: {
        patterns: { 'card-base': '^1.0.0' },
      },
    });

    const res = await app.request('/v1/compat/pattern/card-base');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.type, 'pattern');
    assert.equal(body.id, 'card-base');

    // fancy-card depends on card-base, so it should appear in dependents for card-base's version
    const v = body.versions['1.0.0'];
    assert.ok(v, 'version 1.0.0 should exist');
    assert.ok(v.dependents.includes('pattern/fancy-card@1.2.0'), `expected fancy-card in dependents, got: ${JSON.stringify(v.dependents)}`);
  });

  it('returns null decantr_compat when artifact has none', async () => {
    seedItem(db, 'style', 'minimal-dark', '1.0.0');

    const res = await app.request('/v1/compat/style/minimal-dark');
    assert.equal(res.status, 200);
    const body = await res.json();
    const v = body.versions['1.0.0'];
    assert.ok(v, 'version 1.0.0 should exist');
    assert.equal(v.decantr_compat, null);
  });
});
