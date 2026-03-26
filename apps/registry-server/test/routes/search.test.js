import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestApp, seedContent } from '../helpers.js';

describe('GET /v1/search', () => {
  let app, db, cleanup;

  before(() => {
    ({ app, db, cleanup } = createTestApp());
    seedContent(db, [
      { type: 'style', content_id: 'neon-glow', name: 'Neon Glow', description: 'A vibrant neon style', tags: '["neon","vibrant"]' },
      { type: 'recipe', content_id: 'dark-moody', name: 'Dark Moody', description: 'Dark and moody recipe', tags: '["dark"]' },
      { type: 'pattern', content_id: 'hero-banner', name: 'Hero Banner', description: 'Full-width hero', tags: '["hero","landing"]' },
    ]);
  });

  after(() => cleanup());

  it('returns all results for empty query', async () => {
    const res = await app.request('/v1/search?q=');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.total, 3);
    assert.equal(body.results.length, 3);
  });

  it('searches by text query', async () => {
    const res = await app.request('/v1/search?q=neon');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.results.some(r => r.id === 'neon-glow'));
  });

  it('filters by type', async () => {
    const res = await app.request('/v1/search?q=&type=style');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.results.every(r => r.type === 'style'));
  });

  it('paginates results', async () => {
    const res = await app.request('/v1/search?q=&limit=1&page=1');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.results.length, 1);
    assert.equal(body.page, 1);
    assert.equal(body.total, 3);
  });
});
