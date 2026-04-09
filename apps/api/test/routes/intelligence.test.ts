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

const { intelligenceRoutes } = await import('../../src/routes/intelligence.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', intelligenceRoutes);
  return app;
}

function createSummaryClient(rows: Record<string, unknown>[]) {
  const result = Promise.resolve({
    data: rows,
    error: null,
  });

  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    then: result.then.bind(result),
  };

  return {
    from: vi.fn(() => chain),
  };
}

describe('GET /v1/intelligence/summary', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
    mockCreateAdminClient.mockReset();
  });

  it('serves a schema-backed intelligence summary for public content', async () => {
    mockCreateAdminClient.mockReturnValue(createSummaryClient([
      {
        type: 'blueprint',
        slug: 'portfolio',
        namespace: '@official',
        data: {
          name: 'Portfolio',
          description: 'Creator portfolio',
          theme: { id: 'clean' },
          compose: ['portfolio-home'],
          routes: { home: { shell: 'shell-main' } },
        },
      },
      {
        type: 'pattern',
        slug: 'hero',
        namespace: '@official',
        data: {
          name: 'Hero',
          description: 'A hero section',
          tags: ['marketing'],
          components: ['Hero'],
          presets: {
            default: {
              description: 'Default hero',
              layout: {
                layout: 'stack',
                atoms: '_flex _col',
              },
              code: {
                example: 'Hero()',
              },
            },
          },
        },
      },
    ]));

    const res = await app.request('/v1/intelligence/summary?namespace=%40official');

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('registry-intelligence-summary.v1.json', json);
    expect(json.namespace).toBe('@official');
    expect(json.totals.total_public_items).toBe(2);
    expect(json.totals.with_intelligence).toBe(2);
    expect(json.totals.authored).toBe(1);
    expect(json.totals.hybrid).toBe(1);
    expect(json.by_type.blueprint.hybrid).toBe(1);
    expect(json.by_type.pattern.authored).toBe(1);
  });

  it('remains publicly readable through the full app middleware stack', async () => {
    mockCreateAdminClient.mockReturnValue(createSummaryClient([
      {
        type: 'blueprint',
        slug: 'portfolio',
        namespace: '@official',
        data: {
          name: 'Portfolio',
          description: 'Creator portfolio',
          theme: { id: 'clean' },
          compose: ['portfolio-home'],
          routes: { home: { shell: 'shell-main' } },
        },
      },
    ]));

    const app = createApp();
    const res = await app.request('/v1/intelligence/summary?namespace=%40official');

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('registry-intelligence-summary.v1.json', json);
    expect(json.namespace).toBe('@official');
    expect(json.totals.total_public_items).toBe(1);
  });
});
