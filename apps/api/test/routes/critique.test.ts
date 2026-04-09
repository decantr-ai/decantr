import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';
import { createApp } from '../../src/app.js';
import { critiqueRoutes } from '../../src/routes/critique.js';
import { assertMatchesSchema } from '../helpers/schema-assert.js';

const { mockCreateAdminClient } = vi.hoisted(() => ({
  mockCreateAdminClient: vi.fn(),
}));

vi.mock('../../src/db/client.js', () => ({
  createAdminClient: mockCreateAdminClient,
  createUserClient: vi.fn(),
}));

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', critiqueRoutes);
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

describe('POST /v1/critique/file', () => {
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

  it('returns a schema-backed hosted critique report for inline source', async () => {
    const res = await app.request('/v1/critique/file?namespace=%40official', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        essence: validEssence,
        filePath: 'src/pages/Home.tsx',
        code: '<button className="plain" style={{ color: "#ff00ff" }}>Click me</button>',
        treatmentsCss: '.brand-accent { color: var(--d-primary); }',
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('file-critique-report.v1.json', json);
    expect(json.$schema).toBe('https://decantr.ai/schemas/file-critique-report.v1.json');
    expect(json.file).toBe('src/pages/Home.tsx');
    expect(json.reviewPack?.packType).toBe('review');
    expect(json.findings.some((finding: { id: string }) => finding.id === 'anti-pattern-inline-styles')).toBe(true);
  });

  it('rejects invalid request payloads', async () => {
    const res = await app.request('/v1/critique/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        essence: validEssence,
        code: '',
      }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Code must be a non-empty string on `code`.');
  });

  it('remains callable through the full app middleware stack', async () => {
    const fullApp = createApp();
    const res = await fullApp.request('/v1/critique/file?namespace=%40official', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        essence: validEssence,
        filePath: 'src/pages/Home.tsx',
        code: '<button className="plain" style={{ color: "#ff00ff" }}>Click me</button>',
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('file-critique-report.v1.json', json);
  });
});
