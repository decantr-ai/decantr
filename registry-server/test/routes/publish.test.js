import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestApp, createAuthToken } from '../helpers.js';
import { computeChecksum } from '../../src/services/checksum.js';

describe('POST /v1/publish', () => {
  let app, db, cleanup, token;

  before(() => {
    ({ app, db, cleanup } = createTestApp());
    token = createAuthToken(db);
  });

  after(() => cleanup());

  it('requires authentication', async () => {
    const res = await app.request('/v1/publish', { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' } });
    assert.equal(res.status, 401);
  });

  it('publishes a valid style', async () => {
    const content = `export const neonGlow = { id: 'neon-glow', name: 'Neon Glow', seed: { hue: 280 } };`;
    const checksum = computeChecksum(content);

    const res = await app.request('/v1/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: 'style',
        id: 'neon-glow',
        version: '1.0.0',
        artifact: { content, checksum },
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.success);
    assert.ok(body.url);
  });

  it('rejects invalid artifact', async () => {
    const content = 'const x = 1;'; // Missing export, id, name, seed
    const checksum = computeChecksum(content);

    const res = await app.request('/v1/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: 'style',
        id: 'bad-style',
        version: '1.0.0',
        artifact: { content, checksum },
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.errors.length > 0);
  });

  it('rejects checksum mismatch', async () => {
    const content = `export const x = { id: 'x', name: 'X', seed: { hue: 0 } };`;

    const res = await app.request('/v1/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: 'style',
        id: 'mismatch-style',
        version: '1.0.0',
        artifact: { content, checksum: 'sha256:0000000000000000000000000000000000000000000000000000000000000000' },
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes('Checksum'));
  });

  it('rejects built-in IDs', async () => {
    const content = `export const x = { id: 'x', name: 'X', seed: { hue: 0 } };`;
    const checksum = computeChecksum(content);

    const res = await app.request('/v1/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: 'style',
        id: 'auradecantism',
        version: '1.0.0',
        artifact: { content, checksum },
      }),
    });

    assert.equal(res.status, 400);
  });

  it('rejects version not greater than latest', async () => {
    // First publish
    const content1 = `export const y = { id: 'y', name: 'Y', seed: { hue: 0 } };`;
    await app.request('/v1/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ type: 'style', id: 'ver-test', version: '2.0.0', artifact: { content: content1, checksum: computeChecksum(content1) } }),
    });

    // Try to publish same or lower version
    const content2 = `export const y2 = { id: 'y2', name: 'Y2', seed: { hue: 0 } };`;
    const res = await app.request('/v1/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ type: 'style', id: 'ver-test', version: '1.0.0', artifact: { content: content2, checksum: computeChecksum(content2) } }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.errors.some(e => e.includes('must be greater')));
  });
});
