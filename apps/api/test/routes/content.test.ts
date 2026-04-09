import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';
import { assertMatchesSchema } from '../helpers/schema-assert.js';

const mockCreateAdminClient = vi.fn();

// Mock the db client before importing routes
vi.mock('../../src/db/client.js', () => ({
  createAdminClient: mockCreateAdminClient,
  createUserClient: vi.fn(),
}));

// Import after mocks are set up
const { contentRoutes } = await import('../../src/routes/content.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', contentRoutes);
  return app;
}

function createSingleContentClient(row: Record<string, unknown> | null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: row,
      error: row ? null : { message: 'not found' },
    }),
  };

  return {
    from: vi.fn(() => chain),
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
});
