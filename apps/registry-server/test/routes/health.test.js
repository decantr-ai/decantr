import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestApp } from '../helpers.js';

describe('GET /health', () => {
  let app, cleanup;

  before(() => {
    ({ app, cleanup } = createTestApp());
  });

  after(() => cleanup());

  it('returns ok status', async () => {
    const res = await app.request('/health');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.ok(body.version);
  });
});
