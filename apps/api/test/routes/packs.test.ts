import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';
import { createApp } from '../../src/app.js';
import { assertMatchesSchema } from '../helpers/schema-assert.js';

const { mockCreateAdminClient } = vi.hoisted(() => ({
  mockCreateAdminClient: vi.fn(),
}));

vi.mock('../../src/db/client.js', () => ({
  createAdminClient: mockCreateAdminClient,
  createUserClient: vi.fn(),
}));

const { packRoutes } = await import('../../src/routes/packs.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', packRoutes);
  return app;
}

function createResolverClient(rowsByKey: Record<string, Array<Record<string, unknown>>>) {
  return {
    from: vi.fn(() => {
      const filters: Record<string, unknown> = {};
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn((field: string, value: unknown) => {
          filters[field] = value;
          return chain;
        }),
        limit: vi.fn(async () => {
          const key = `${String(filters.type)}:${String(filters.slug)}`;
          return {
            data: rowsByKey[key] ?? [],
            error: null,
          };
        }),
      };
      return chain;
    }),
  };
}

const validEssence = {
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
      shell: 'sidebar-main',
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
  target: 'react',
} as const;

describe('POST /v1/packs/compile', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
    mockCreateAdminClient.mockReset();
    mockCreateAdminClient.mockReturnValue(createResolverClient({
      'theme:clean': [
        {
          namespace: '@official',
          slug: 'clean',
          data: {
            id: 'clean',
            name: 'Clean',
            modes: ['light', 'dark'],
          },
        },
      ],
      'pattern:hero': [
        {
          namespace: '@official',
          slug: 'hero',
          data: {
            id: 'hero',
            version: '1.0.0',
            name: 'Hero',
            description: 'Hero section',
            tags: ['marketing'],
            components: ['Hero'],
            default_preset: 'landing',
            presets: {
              landing: {
                description: 'Landing hero',
                layout: {
                  layout: 'stack',
                  atoms: '_stack-md',
                },
              },
            },
          },
        },
      ],
    }));
  });

  it('returns a schema-backed execution pack bundle for a valid essence document', async () => {
    const res = await app.request('/v1/packs/compile?namespace=%40official', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validEssence),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('execution-pack-bundle.v1.json', json);
    expect(json.$schema).toBe('https://decantr.ai/schemas/execution-pack-bundle.v1.json');
    expect(json.manifest.scaffold?.markdown).toBe('scaffold-pack.md');
    expect(json.scaffold.target.adapter).toBe('react-vite');
    expect(json.pages).toHaveLength(1);
    expect(json.pages[0]?.data.pageId).toBe('home');
  });

  it('rejects invalid essence documents', async () => {
    const res = await app.request('/v1/packs/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: '2.0.0' }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Essence failed validation');
    expect(Array.isArray(json.validationErrors)).toBe(true);
  });

  it('remains callable through the full app middleware stack', async () => {
    const fullApp = createApp();
    const res = await fullApp.request('/v1/packs/compile?namespace=%40official', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validEssence),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('execution-pack-bundle.v1.json', json);
  });
});
