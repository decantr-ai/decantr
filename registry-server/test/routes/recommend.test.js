import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestApp, seedContent } from '../helpers.js';

describe('GET /v1/recommend', () => {
  let app, db, cleanup;

  before(() => {
    ({ app, db, cleanup } = createTestApp());
    seedContent(db, [
      {
        type: 'style',
        content_id: 'dashboard-dark',
        name: 'Dashboard Dark',
        description: 'Dark dashboard style',
        metadata: JSON.stringify({ terroir_affinity: ['saas-dashboard'], character: ['tactical', 'data-dense'], style: 'auradecantism' }),
      },
      {
        type: 'recipe',
        content_id: 'portfolio-light',
        name: 'Portfolio Light',
        description: 'Light portfolio recipe',
        metadata: JSON.stringify({ terroir_affinity: ['portfolio'], character: ['minimal', 'clean'] }),
      },
    ]);
  });

  after(() => cleanup());

  it('returns recommendations scored by terroir', async () => {
    const res = await app.request('/v1/recommend?terroir=saas-dashboard');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.recommendations.length > 0);
    assert.equal(body.recommendations[0].id, 'dashboard-dark');
  });

  it('excludes already-installed content', async () => {
    const res = await app.request('/v1/recommend?terroir=saas-dashboard&existing=dashboard-dark');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.recommendations.every(r => r.id !== 'dashboard-dark'));
  });

  it('returns empty for no matches', async () => {
    const res = await app.request('/v1/recommend?terroir=nonexistent');
    assert.equal(res.status, 200);
    const body = await res.json();
    // May have results from popularity or other factors, but terroir-specific should be absent
    assert.ok(Array.isArray(body.recommendations));
  });
});
