import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestApp, seedContent, seedVersion } from '../helpers.js';

describe('GET /v1/content', () => {
  let app, db, cleanup;

  before(() => {
    ({ app, db, cleanup } = createTestApp());
    seedContent(db, [
      { type: 'style', content_id: 'test-style', name: 'Test Style', description: 'A test', latest_version: '1.2.0' },
    ]);
    // Get the content row ID
    const row = db.prepare("SELECT id FROM content WHERE content_id = 'test-style'").get();
    seedVersion(db, row.id, '1.0.0', 'export const v1 = {}');
    seedVersion(db, row.id, '1.2.0', 'export const v2 = {}');
  });

  after(() => cleanup());

  it('returns latest version by default', async () => {
    const res = await app.request('/v1/content/style/test-style');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.id, 'test-style');
    assert.equal(body.version, '1.2.0');
    assert.ok(body.artifact.content);
    assert.ok(body.artifact.checksum.startsWith('sha256:'));
    assert.ok(body.versions.length >= 2);
  });

  it('returns specific version', async () => {
    const res = await app.request('/v1/content/style/test-style/version/1.0.0');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.version, '1.0.0');
  });

  it('returns 404 for unknown content', async () => {
    const res = await app.request('/v1/content/style/nonexistent');
    assert.equal(res.status, 404);
  });

  it('returns 404 for unknown version', async () => {
    const res = await app.request('/v1/content/style/test-style/version/9.9.9');
    assert.equal(res.status, 404);
  });
});
