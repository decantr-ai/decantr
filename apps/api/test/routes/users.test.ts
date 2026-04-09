import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';
import { assertMatchesSchema } from '../helpers/schema-assert.js';

const mockCreateAdminClient = vi.fn();

vi.mock('../../src/db/client.js', () => ({
  createAdminClient: mockCreateAdminClient,
  createUserClient: vi.fn(),
}));

const { userRoutes } = await import('../../src/routes/users.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', userRoutes);
  return app;
}

function createUserContentClient(rows: Record<string, unknown>[], count: number) {
  const contentResult = Promise.resolve({
    data: rows,
    error: null,
    count,
  });

  const userLookupChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { id: 'user-1' },
      error: null,
    }),
  };

  const contentChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: contentResult.then.bind(contentResult),
  };

  return {
    from: vi.fn((table: string) => {
      if (table === 'users') {
        return userLookupChain;
      }
      if (table === 'content') {
        return contentChain;
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
}

describe('GET /v1/users/:username/content', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
    mockCreateAdminClient.mockReset();
  });

  it('applies shared ordering before paginating public user content', async () => {
    mockCreateAdminClient.mockReturnValue(createUserContentClient([
      {
        id: 'content-2',
        type: 'blueprint',
        slug: 'zeta',
        namespace: '@community',
        version: '1.0.0',
        data: {
          name: 'Zeta',
          description: 'Second item',
        },
        published_at: '2026-04-09T00:00:00.000Z',
      },
      {
        id: 'content-1',
        type: 'blueprint',
        slug: 'alpha',
        namespace: '@community',
        version: '1.0.0',
        data: {
          name: 'Alpha',
          description: 'First item',
        },
        published_at: '2026-04-08T00:00:00.000Z',
      },
    ], 2));

    const res = await app.request('/v1/users/alice/content?sort=name&limit=1&offset=1');

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('public-content-list.v1.json', json);
    expect(json.items.map((item: { slug: string }) => item.slug)).toEqual(['zeta']);
  });
});
