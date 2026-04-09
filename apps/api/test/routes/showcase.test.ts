import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';
import { showcaseRoutes } from '../../src/routes/showcase.js';

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', showcaseRoutes);
  return app;
}

describe('GET /v1/showcase/*', () => {
  it('serves the active showcase manifest with verification metadata', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/showcase/manifest');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBeGreaterThan(0);
    expect(Array.isArray(json.apps)).toBe(true);
    expect(json.apps.some((entry: { slug: string }) => entry.slug === 'portfolio')).toBe(true);
    const shortlistEntry = json.apps.find((entry: { slug: string }) => entry.slug === 'portfolio');
    expect(shortlistEntry?.verification?.verificationStatus).toBe('build-green');
  });

  it('serves the shortlisted showcase set with verification summary', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/showcase/shortlist');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.apps)).toBe(true);
    expect(json.summary?.passedBuilds).toBeGreaterThan(0);
    expect(json.apps.every((entry: { goldenCandidate?: string | boolean }) => Boolean(entry.goldenCandidate))).toBe(true);
  });

  it('serves the full shortlist verification report', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/showcase/shortlist-verification');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$schema).toBe('https://decantr.ai/schemas/showcase-shortlist-report.v1.json');
    expect(Array.isArray(json.results)).toBe(true);
    expect(json.results.length).toBeGreaterThan(0);
  });
});
