import { describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';

const mockCreateAdminClient = vi.fn();

vi.mock('../../src/middleware/auth.js', () => ({
  requireAuth: () => async (c: any, next: any) => {
    c.set('auth', {
      user: {
        id: 'user-1',
        tier: 'pro',
        trusted: false,
      },
      isAuthenticated: true,
      isAdmin: false,
    });
    await next();
  },
}));

vi.mock('../../src/db/client.js', () => ({
  createAdminClient: mockCreateAdminClient,
}));

const { publishRoutes } = await import('../../src/routes/publish.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', publishRoutes);
  return app;
}

describe('POST /v1/content schema validation', () => {
  it('rejects invalid registry content before touching the database', async () => {
    const app = createTestApp();

    const res = await app.request('/v1/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'theme',
        slug: 'broken-theme',
        version: '1.0.0',
        data: {
          id: 'broken-theme',
          name: 'Broken Theme',
        },
      }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Content data failed registry schema validation');
    expect(json.validationErrors).toEqual(
      expect.arrayContaining([
        'schema / must have required property \'description\'',
      ]),
    );
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
  });
});
