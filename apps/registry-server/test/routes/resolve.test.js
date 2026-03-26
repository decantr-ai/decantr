import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestApp, seedContent, seedVersion } from '../helpers.js';

/**
 * Seed content + version row together, returning the content row id.
 */
function seedItem(db, type, id, version, deps = {}) {
  const artifact = JSON.stringify({ id, version, dependencies: deps });
  // Ensure test user exists (seedContent handles this)
  seedContent(db, [{ type, content_id: id, name: id, latest_version: version }]);
  const row = db.prepare('SELECT id FROM content WHERE type = ? AND content_id = ?').get(type, id);
  seedVersion(db, row.id, version, artifact);
  return row.id;
}

describe('POST /v1/resolve', () => {
  let app, db, cleanup;

  before(() => {
    ({ app, db, cleanup } = createTestApp());
  });

  after(() => cleanup());

  it('resolves a single item and returns 200 with flat array', async () => {
    seedItem(db, 'pattern', 'hero-banner', '1.0.0');

    const res = await app.request('/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: ['pattern/hero-banner@^1.0.0'] }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.flat), 'flat should be an array');
    assert.equal(body.flat.length, 1);
    assert.equal(body.flat[0].type, 'pattern');
    assert.equal(body.flat[0].id, 'hero-banner');
    assert.equal(body.flat[0].action, 'install');
    assert.ok('tree' in body, 'response should have tree');
    assert.ok('stats' in body, 'response should have stats');
    assert.ok('warnings' in body, 'response should have warnings');
  });

  it('returns 400 for empty items array', async () => {
    const res = await app.request('/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes('items'));
  });

  it('returns 400 when items is missing', async () => {
    const res = await app.request('/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes('items'));
  });

  it('returns 422 for nonexistent content', async () => {
    const res = await app.request('/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: ['pattern/does-not-exist@^1.0.0'] }),
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.error, 'unresolvable');
  });

  it('correctly marks installed items as skip', async () => {
    seedItem(db, 'style', 'glassmorphism', '1.0.0');

    const res = await app.request('/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: ['style/glassmorphism@^1.0.0'],
        installed: { 'style/glassmorphism': '1.0.0' },
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.flat.length, 1);
    assert.equal(body.flat[0].action, 'skip');
    assert.equal(body.flat[0].reason, 'already-installed');
    assert.equal(body.stats.toSkip, 1);
    assert.equal(body.stats.toInstall, 0);
  });

  it('resolves specifier without explicit version range', async () => {
    seedItem(db, 'recipe', 'dark-minimal', '2.1.0');

    const res = await app.request('/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: ['recipe/dark-minimal'] }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.flat[0].version, '2.1.0');
    assert.equal(body.flat[0].action, 'install');
  });

  it('returns 400 for invalid specifier format', async () => {
    const res = await app.request('/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: ['not-a-valid-spec!!!'] }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes('Invalid specifier'));
  });

  it('returns 422 when no version satisfies the requested range', async () => {
    seedItem(db, 'pattern', 'old-pattern', '1.0.0');

    const res = await app.request('/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: ['pattern/old-pattern@^9.0.0'] }),
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.error, 'unresolvable');
  });
});
