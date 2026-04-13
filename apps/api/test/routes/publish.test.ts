import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';

const { mockCreateAdminClient } = vi.hoisted(() => ({
  mockCreateAdminClient: vi.fn(),
}));

vi.mock('../../src/middleware/auth.js', () => ({
  requireAuth: () => async (c: any, next: any) => {
    c.set('auth', {
      user: {
        id: 'user-1',
        email: 'pro@example.com',
        username: 'pro-user',
        display_name: 'Pro User',
        tier: 'pro',
        trusted: true,
        reputation_score: 10,
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

vi.mock('../../src/lib/audit-log.js', () => ({
  recordAuditEvent: vi.fn(async () => undefined),
}));

function createPublishAdminClient() {
  return {
    from: vi.fn((table: string) => {
      const state: {
        filters: Record<string, unknown>;
        selectArgs: unknown[];
        insertPayload: Record<string, unknown> | null;
      } = {
        filters: {},
        selectArgs: [],
        insertPayload: null,
      };

      const resolveChainResult = async () => {
        const headCount = Boolean((state.selectArgs[1] as { head?: boolean } | undefined)?.head);
        if (table === 'content' && headCount) {
          if (state.filters.status === 'pending') {
            return { count: 0, error: null };
          }
          if (state.filters.visibility === 'private') {
            return { count: 0, error: null };
          }
          return { count: 0, error: null };
        }
        return { data: [], error: null };
      };

      const chain: any = {
        select: vi.fn((...args: unknown[]) => {
          state.selectArgs = args;
          return chain;
        }),
        eq: vi.fn((field: string, value: unknown) => {
          state.filters[field] = value;
          return chain;
        }),
        is: vi.fn((field: string, value: unknown) => {
          state.filters[field] = value;
          return chain;
        }),
        insert: vi.fn((payload: Record<string, unknown>) => {
          state.insertPayload = payload;
          return {
            select: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: {
                  id: 'content-1',
                  ...payload,
                },
                error: null,
              })),
            })),
          };
        }),
        single: vi.fn(async () => ({ data: null, error: null })),
        then: (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) =>
          resolveChainResult().then(resolve, reject),
      };

      return chain;
    }),
  };
}

const { publishRoutes } = await import('../../src/routes/publish.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', publishRoutes);
  return app;
}

const validThemeData = {
  $schema: 'https://decantr.ai/schemas/theme.v1.json',
  id: 'clean-theme',
  name: 'Clean Theme',
  description: 'Valid theme payload',
};

describe('Publish routes', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateAdminClient.mockReturnValue(createPublishAdminClient());
    app = createTestApp();
  });

  it('rejects private community packages', async () => {
    const res = await app.request('/v1/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'theme',
        namespace: '@community',
        slug: 'community-private',
        version: '1.0.0',
        visibility: 'private',
        data: validThemeData,
      }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Community content cannot be private. Use your personal package namespace instead.');
  });

  it('rejects org namespaces on the personal publish route', async () => {
    const res = await app.request('/v1/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'theme',
        namespace: '@org:acme',
        slug: 'team-theme',
        version: '1.0.0',
        visibility: 'private',
        data: validThemeData,
      }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Organization content must be published through the organization route.');
  });

  it('publishes personal private packages into the user namespace by default', async () => {
    const res = await app.request('/v1/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'theme',
        slug: 'personal-theme',
        version: '1.0.0',
        visibility: 'private',
        data: validThemeData,
      }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.namespace).toBe('@pro-user');
    expect(json.visibility).toBe('private');
  });
});
