import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';
import { createApp } from '../../src/app.js';
import { healthRoutes } from '../../src/routes/health.js';

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/', healthRoutes);
  return app;
}

describe('GET /health', () => {
  it('returns service health directly from the route module', async () => {
    const app = createTestApp();
    const res = await app.request('/health');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      status: 'ok',
      version: '2.0.0',
    });
  });

  it('remains reachable through the full app middleware stack', async () => {
    const app = createApp();
    const res = await app.request('/health');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.version).toBe('2.0.0');
  });
});
