import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';
import { assertMatchesSchema } from '../helpers/schema-assert.js';

const { mockCreateAdminClient, mockAuthState } = vi.hoisted(() => ({
  mockCreateAdminClient: vi.fn(),
  mockAuthState: {
    current: {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      apiKeyOrgId: null,
      authSource: null,
    },
  },
}));

// Mock the db client before importing routes
vi.mock('../../src/db/client.js', () => ({
  createAdminClient: mockCreateAdminClient,
  createUserClient: vi.fn(),
}));

// Import after mocks are set up
const { contentRoutes } = await import('../../src/routes/content.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.use('/v1/*', async (c, next) => {
    c.set('auth', mockAuthState.current);
    await next();
  });
  app.route('/v1', contentRoutes);
  return app;
}

function createSingleContentClient(
  row: Record<string, unknown> | null,
  membership: Record<string, unknown> | null = null,
  storageFile: { body: string; type: string } | null = null,
) {
  const chain = {
    filters: {} as Record<string, unknown>,
    table: '',
    select: vi.fn().mockReturnThis(),
    eq: vi.fn(function (field: string, value: unknown) {
      this.filters[field] = value;
      return this;
    }),
    single: vi.fn(async function () {
      if (this.table === 'org_members') {
        return { data: membership, error: membership ? null : { message: 'not found' } };
      }
      return {
        data: row,
        error: row ? null : { message: 'not found' },
      };
    }),
  };

  return {
    from: vi.fn((table: string) => ({
      ...chain,
      table,
      filters: {},
    })),
    storage: {
      from: vi.fn(() => ({
        download: vi.fn(async () => {
          if (!storageFile) {
            return { data: null, error: { message: 'not found' } };
          }

          return {
            data: new Blob([storageFile.body], { type: storageFile.type }),
            error: null,
          };
        }),
      })),
    },
  };
}

function createListContentClient(rows: Record<string, unknown>[], count: number) {
  const result = Promise.resolve({
    data: rows,
    error: null,
    count,
  });
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: result.then.bind(result),
  };

  return {
    from: vi.fn(() => chain),
  };
}

describe('POST /v1/validate', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
    mockCreateAdminClient.mockReset();
    mockAuthState.current = {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      apiKeyOrgId: null,
      authSource: null,
    };
  });

  it('should return error for invalid JSON body', async () => {
    const res = await app.request('/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid JSON body');
  });

  it('should validate a minimal v2 essence document and report errors', async () => {
    const res = await app.request('/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: '2.0.0',
        // Missing required fields
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.valid).toBe(false);
    expect(json.errors.length).toBeGreaterThan(0);
    expect(json.schemaVersion).toBe('v2');
    expect(json.version).toBe('2.0.0');
  });

  it('should validate a valid v2 SimpleEssence document', async () => {
    const res = await app.request('/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: '2.0.0',
        archetype: 'dashboard',
        theme: {
          id: 'clean',
          mode: 'light',
        },
        personality: ['professional'],
        platform: {
          type: 'spa',
          routing: 'history',
        },
        structure: [
          {
            id: 'home',
            shell: 'sidebar',
            layout: ['hero'],
          },
        ],
        features: ['auth'],
        density: {
          level: 'comfortable',
          content_gap: '1.5rem',
        },
        guard: {
          mode: 'guided',
        },
        target: 'next',
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.valid).toBe(true);
    expect(json.errors).toEqual([]);
    expect(json.schemaVersion).toBe('v2');
  });

  it('should detect v3 documents by version field', async () => {
    const res = await app.request('/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: '3.0.0',
        // Incomplete v3 doc -- should fail validation
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    // An incomplete v3 doc should fail validation
    expect(json.valid).toBe(false);
    expect(json.version).toBe('3.0.0');
  });

  it('should return schemaVersion v2 for non-v3 documents', async () => {
    const res = await app.request('/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: '2.0.0',
        platform: { type: 'spa' },
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.schemaVersion).toBe('v2');
  });

  it('should handle empty object', async () => {
    const res = await app.request('/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.valid).toBe(false);
    expect(json.errors.length).toBeGreaterThan(0);
    expect(json.version).toBeNull();
  });

  it('serves public content detail responses that match the published schema', async () => {
    mockCreateAdminClient.mockReturnValue(createSingleContentClient({
      id: 'content-1',
      type: 'blueprint',
      slug: 'portfolio',
      namespace: '@official',
      version: '1.0.0',
      visibility: 'public',
      status: 'published',
      data: {
        name: 'Portfolio',
        description: 'Creator portfolio',
        registry_presentation: {
          thumbnail: {
            path: 'thumbs/portfolio.png',
          },
        },
      },
      created_at: '2026-04-09T00:00:00.000Z',
      updated_at: '2026-04-09T00:00:00.000Z',
      published_at: '2026-04-09T00:00:00.000Z',
      owner: {
        display_name: 'Decantr',
        username: 'decantr',
      },
    }));

    const res = await app.request('/v1/blueprints/%40official/portfolio');

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('public-content-record.v1.json', json);
    expect(json.slug).toBe('portfolio');
    expect(json.intelligence?.source).toBe('hybrid');
    expect(json.thumbnail_url).toBe('http://localhost/v1/blueprints/%40official/portfolio/thumbnail');
  });

  it('serves public thumbnail assets through the API thumbnail route', async () => {
    mockCreateAdminClient.mockReturnValue(createSingleContentClient(
      {
        id: 'content-1',
        type: 'blueprint',
        slug: 'portfolio',
        namespace: '@official',
        version: '1.0.0',
        visibility: 'public',
        status: 'published',
        data: {
          name: 'Portfolio',
          description: 'Creator portfolio',
          registry_presentation: {
            thumbnail: {
              path: 'thumbs/portfolio.png',
            },
          },
        },
        created_at: '2026-04-09T00:00:00.000Z',
        updated_at: '2026-04-09T00:00:00.000Z',
        published_at: '2026-04-09T00:00:00.000Z',
      },
      null,
      { body: 'png-bytes', type: 'image/png' },
    ));

    const res = await app.request('/v1/blueprints/%40official/portfolio/thumbnail');

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=300, stale-while-revalidate=3600');
    expect(await res.text()).toBe('png-bytes');
  });

  it('allows the owner to fetch a private content record', async () => {
    mockAuthState.current = {
      user: {
        id: 'user-1',
        email: 'owner@example.com',
        username: 'owner',
        display_name: 'Owner',
        tier: 'pro',
        trusted: false,
        reputation_score: 0,
      },
      isAuthenticated: true,
      isAdmin: false,
      apiKeyOrgId: null,
      authSource: 'jwt',
    };

    mockCreateAdminClient.mockReturnValue(createSingleContentClient({
      id: 'content-1',
      owner_id: 'user-1',
      org_id: null,
      type: 'theme',
      slug: 'private-theme',
      namespace: '@owner',
      version: '1.0.0',
      visibility: 'private',
      status: 'published',
      data: {
        name: 'Private Theme',
        description: 'Personal private package',
      },
      created_at: '2026-04-09T00:00:00.000Z',
      updated_at: '2026-04-09T00:00:00.000Z',
      published_at: '2026-04-09T00:00:00.000Z',
      owner: {
        display_name: 'Owner',
        username: 'owner',
      },
    }));

    const res = await app.request('/v1/themes/%40owner/private-theme');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.visibility).toBe('private');
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('allows org members to fetch org-private content records', async () => {
    mockAuthState.current = {
      user: {
        id: 'user-2',
        email: 'member@example.com',
        username: 'member',
        display_name: 'Member',
        tier: 'team',
        trusted: false,
        reputation_score: 0,
      },
      isAuthenticated: true,
      isAdmin: false,
      apiKeyOrgId: null,
      authSource: 'jwt',
    };

    mockCreateAdminClient.mockReturnValue(createSingleContentClient({
      id: 'content-1',
      owner_id: 'user-1',
      org_id: 'org-1',
      type: 'theme',
      slug: 'org-theme',
      namespace: '@org:acme',
      version: '1.0.0',
      visibility: 'private',
      status: 'published',
      data: {
        name: 'Org Theme',
        description: 'Org private package',
      },
      created_at: '2026-04-09T00:00:00.000Z',
      updated_at: '2026-04-09T00:00:00.000Z',
      published_at: '2026-04-09T00:00:00.000Z',
      owner: {
        display_name: 'Owner',
        username: 'owner',
      },
    }, { role: 'member' }));

    const res = await app.request('/v1/themes/%40org%3Aacme/org-theme');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.namespace).toBe('@org:acme');
    expect(json.visibility).toBe('private');
  });

  it('returns 404 for unauthorized private content reads', async () => {
    mockCreateAdminClient.mockReturnValue(createSingleContentClient({
      id: 'content-1',
      owner_id: 'user-1',
      org_id: null,
      type: 'theme',
      slug: 'private-theme',
      namespace: '@owner',
      version: '1.0.0',
      visibility: 'private',
      status: 'published',
      data: {
        name: 'Private Theme',
        description: 'Personal private package',
      },
      created_at: '2026-04-09T00:00:00.000Z',
      updated_at: '2026-04-09T00:00:00.000Z',
      published_at: '2026-04-09T00:00:00.000Z',
      owner: {
        display_name: 'Owner',
        username: 'owner',
      },
    }));

    const res = await app.request('/v1/themes/%40owner/private-theme');

    expect(res.status).toBe(404);
  });

  it('allows org-scoped API keys to fetch org-private content records', async () => {
    mockAuthState.current = {
      user: {
        id: 'user-2',
        email: 'member@example.com',
        username: 'member',
        display_name: 'Member',
        tier: 'team',
        trusted: false,
        reputation_score: 0,
      },
      isAuthenticated: true,
      isAdmin: false,
      apiKeyOrgId: 'org-1',
      authSource: 'api_key',
    };

    mockCreateAdminClient.mockReturnValue(createSingleContentClient({
      id: 'content-1',
      owner_id: 'user-1',
      org_id: 'org-1',
      type: 'theme',
      slug: 'org-theme',
      namespace: '@org:acme',
      version: '1.0.0',
      visibility: 'private',
      status: 'published',
      data: {
        name: 'Org Theme',
        description: 'Org private package',
      },
      created_at: '2026-04-09T00:00:00.000Z',
      updated_at: '2026-04-09T00:00:00.000Z',
      published_at: '2026-04-09T00:00:00.000Z',
      owner: {
        display_name: 'Owner',
        username: 'owner',
      },
    }));

    const res = await app.request('/v1/themes/%40org%3Aacme/org-theme');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.namespace).toBe('@org:acme');
    expect(json.visibility).toBe('private');
  });

  it('serves public content list responses that match the published schema', async () => {
    mockCreateAdminClient.mockReturnValue(createListContentClient([
      {
        id: 'content-1',
        type: 'blueprint',
        slug: 'portfolio',
        namespace: '@official',
        version: '1.0.0',
        data: {
          name: 'Portfolio',
          description: 'Creator portfolio',
          registry_presentation: {
            thumbnail: {
              path: 'thumbs/portfolio.png',
            },
          },
        },
        published_at: '2026-04-09T00:00:00.000Z',
        owner: {
          display_name: 'Decantr',
          username: 'decantr',
        },
      },
    ], 1));

    const res = await app.request('/v1/blueprints');

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('public-content-list.v1.json', json);
    expect(json.total).toBe(1);
    expect(json.items[0]?.slug).toBe('portfolio');
    expect(json.items[0]?.intelligence?.source).toBe('hybrid');
    expect(json.items[0]?.thumbnail_url).toBe('http://localhost/v1/blueprints/%40official/portfolio/thumbnail');
  });

  it('applies shared name sorting to public content lists before pagination', async () => {
    mockCreateAdminClient.mockReturnValue(createListContentClient([
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
        owner: {
          display_name: 'Alice',
          username: 'alice',
        },
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
        owner: {
          display_name: 'Alice',
          username: 'alice',
        },
      },
    ], 2));

    const res = await app.request('/v1/blueprints?sort=name');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.items.map((item: { slug: string }) => item.slug)).toEqual(['alpha', 'zeta']);
  });

  it('filters public content lists down to recommended items when requested', async () => {
    mockCreateAdminClient.mockReturnValue(createListContentClient([
      {
        id: 'content-1',
        type: 'blueprint',
        slug: 'portfolio',
        namespace: '@official',
        version: '1.0.0',
        data: {
          name: 'Portfolio',
          description: 'Creator portfolio',
        },
        published_at: '2026-04-09T00:00:00.000Z',
        owner: {
          display_name: 'Decantr',
          username: 'decantr',
        },
      },
      {
        id: 'content-2',
        type: 'blueprint',
        slug: 'zeta',
        namespace: '@community',
        version: '1.0.0',
        data: {
          name: 'Zeta',
          description: 'Community blueprint',
        },
        published_at: '2026-04-08T00:00:00.000Z',
        owner: {
          display_name: 'Alice',
          username: 'alice',
        },
      },
    ], 2));

    const res = await app.request('/v1/blueprints?recommended=true');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.items.map((item: { slug: string }) => item.slug)).toEqual(['portfolio']);
  });

  it('filters public content lists by source when requested', async () => {
    mockCreateAdminClient.mockReturnValue(createListContentClient([
      {
        id: 'content-1',
        type: 'blueprint',
        slug: 'portfolio',
        namespace: '@official',
        version: '1.0.0',
        data: {
          name: 'Portfolio',
          description: 'Creator portfolio',
        },
        published_at: '2026-04-09T00:00:00.000Z',
        owner: {
          display_name: 'Decantr',
          username: 'decantr',
        },
      },
      {
        id: 'content-2',
        type: 'blueprint',
        slug: 'zeta',
        namespace: '@community',
        version: '1.0.0',
        data: {
          name: 'Zeta',
          description: 'Community blueprint',
        },
        published_at: '2026-04-08T00:00:00.000Z',
        owner: {
          display_name: 'Alice',
          username: 'alice',
        },
      },
    ], 2));

    const res = await app.request('/v1/blueprints?source=official');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.items.map((item: { slug: string }) => item.slug)).toEqual(['portfolio']);
  });

  it('filters public content lists down to a requested intelligence source', async () => {
    mockCreateAdminClient.mockReturnValue(createListContentClient([
      {
        id: 'content-1',
        type: 'blueprint',
        slug: 'portfolio',
        namespace: '@official',
        version: '1.0.0',
        data: {
          name: 'Portfolio',
          description: 'Creator portfolio',
        },
        published_at: '2026-04-09T00:00:00.000Z',
        owner: {
          display_name: 'Decantr',
          username: 'decantr',
        },
      },
      {
        id: 'content-2',
        type: 'blueprint',
        slug: 'zeta',
        namespace: '@community',
        version: '1.0.0',
        data: {
          name: 'Zeta',
          description: 'Community blueprint',
        },
        published_at: '2026-04-08T00:00:00.000Z',
        owner: {
          display_name: 'Alice',
          username: 'alice',
        },
      },
    ], 2));

    const res = await app.request('/v1/blueprints?intelligence_source=hybrid');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.items.map((item: { slug: string }) => item.slug)).toEqual(['portfolio']);
  });
});
