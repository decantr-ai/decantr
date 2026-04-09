import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';
import { assertMatchesSchema } from '../helpers/schema-assert.js';

const mockCreateAdminClient = vi.fn();

vi.mock('../../src/db/client.js', () => ({
  createAdminClient: mockCreateAdminClient,
  createUserClient: vi.fn(),
}));

const { searchRoutes } = await import('../../src/routes/search.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', searchRoutes);
  return app;
}

describe('GET /v1/search', () => {
  let app: ReturnType<typeof createTestApp>;
  const rpc = vi.fn();

  beforeEach(() => {
    app = createTestApp();
    rpc.mockReset();
    mockCreateAdminClient.mockReset();
    mockCreateAdminClient.mockReturnValue({
      rpc,
    });
  });

  it('applies shared ordering before paginating search results', async () => {
    rpc.mockResolvedValue({
      data: [
        {
          type: 'blueprint',
          slug: 'zeta',
          namespace: '@community',
          version: '1.0.0',
          data: { name: 'Zeta', description: 'Second result' },
          published_at: '2026-04-09T00:00:00.000Z',
          owner_display_name: 'Alice',
          owner_username: 'alice',
          total_count: 2,
        },
        {
          type: 'blueprint',
          slug: 'alpha',
          namespace: '@community',
          version: '1.0.0',
          data: { name: 'Alpha', description: 'First result' },
          published_at: '2026-04-08T00:00:00.000Z',
          owner_display_name: 'Alice',
          owner_username: 'alice',
          total_count: 2,
        },
      ],
      error: null,
    });

    const res = await app.request('/v1/search?q=port&sort=name&limit=1&offset=1');

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('search-response.v1.json', json);
    expect(json.results.map((item: { slug: string }) => item.slug)).toEqual(['zeta']);
    expect(rpc).toHaveBeenCalledWith('search_content', expect.objectContaining({
      search_query: 'port',
      result_limit: 2,
      result_offset: 0,
    }));
  });

  it('filters search results down to recommended items when requested', async () => {
    rpc.mockResolvedValue({
      data: [
        {
          type: 'blueprint',
          slug: 'portfolio',
          namespace: '@official',
          version: '1.0.0',
          data: { name: 'Portfolio', description: 'Creator portfolio' },
          published_at: '2026-04-09T00:00:00.000Z',
          owner_display_name: 'Decantr',
          owner_username: 'decantr',
          total_count: 2,
        },
        {
          type: 'blueprint',
          slug: 'zeta',
          namespace: '@community',
          version: '1.0.0',
          data: { name: 'Zeta', description: 'Community result' },
          published_at: '2026-04-08T00:00:00.000Z',
          owner_display_name: 'Alice',
          owner_username: 'alice',
          total_count: 2,
        },
      ],
      error: null,
    });

    const res = await app.request('/v1/search?q=port&recommended=true');

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('search-response.v1.json', json);
    expect(json.total).toBe(1);
    expect(json.results.map((item: { slug: string }) => item.slug)).toEqual(['portfolio']);
    expect(rpc).toHaveBeenCalledWith('search_content', expect.objectContaining({
      result_limit: 500,
      result_offset: 0,
    }));
  });
});
