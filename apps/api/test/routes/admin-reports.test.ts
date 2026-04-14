import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';

const { mockCreateAdminClient, mockAuthState } = vi.hoisted(() => ({
  mockCreateAdminClient: vi.fn(),
  mockAuthState: {
    current: {
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        username: 'admin-user',
        display_name: 'Admin User',
        tier: 'enterprise',
        trusted: true,
        reputation_score: 100,
      },
      isAuthenticated: true,
      isAdmin: false,
    },
  },
}));

vi.mock('../../src/db/client.js', () => ({
  createAdminClient: mockCreateAdminClient,
}));

vi.mock('../../src/middleware/auth.js', () => ({
  requireAuth: () => async (c: any, next: any) => {
    const auth = mockAuthState.current;
    if (!auth?.isAuthenticated || !auth.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('auth', auth);
    await next();
  },
}));

const { adminRoutes } = await import('../../src/routes/admin.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', adminRoutes);
  return app;
}

function createAdminSummaryClient() {
  return {
    from: vi.fn((table: string) => {
      const state: {
        filters: Record<string, unknown>;
        selectArgs: unknown[];
      } = {
        filters: {},
        selectArgs: [],
      };

      const chain: any = {
        select: vi.fn((...args: unknown[]) => {
          state.selectArgs = args;
          return chain;
        }),
        eq: vi.fn((field: string, value: unknown) => {
          state.filters[field] = value;
          const isHeadCount = Boolean((state.selectArgs[1] as { head?: boolean } | undefined)?.head);
          if (isHeadCount) {
            if (table === 'content' && state.filters.visibility === 'public') {
              return Promise.resolve({ count: 25, error: null });
            }
            if (table === 'content' && state.filters.visibility === 'private') {
              return Promise.resolve({ count: 12, error: null });
            }
            if (table === 'content' && state.filters.status === 'pending') {
              return Promise.resolve({ count: 4, error: null });
            }
            if (table === 'audit_logs') {
              return Promise.resolve({ count: 22, error: null });
            }
          }
          return chain;
        }),
        not: vi.fn(() => Promise.resolve({ count: 9, error: null })),
        gte: vi.fn(() => {
          if (table === 'usage_events') {
            return Promise.resolve({
              data: [
                { metric: 'api_request', quantity: 1000 },
                { metric: 'content_publish', quantity: 15 },
                { metric: 'private_package_publish', quantity: 6 },
                { metric: 'org_package_publish', quantity: 9 },
                { metric: 'approval_action', quantity: 4 },
              ],
              error: null,
            });
          }
          if (table === 'audit_logs') {
            return Promise.resolve({ count: 22, error: null });
          }
          return chain;
        }),
        then: (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) => {
          if (table === 'users') {
            return Promise.resolve({
              data: [
                { tier: 'free' },
                { tier: 'free' },
                { tier: 'pro' },
                { tier: 'team' },
                { tier: 'enterprise' },
              ],
              error: null,
            }).then(resolve, reject);
          }

          if (table === 'organizations') {
            return Promise.resolve({
              data: [
                { id: 'org-1', tier: 'team', seat_limit: 5 },
                { id: 'org-2', tier: 'enterprise', seat_limit: 20 },
              ],
              error: null,
            }).then(resolve, reject);
          }

          return Promise.resolve({ data: [], error: null }).then(resolve, reject);
        },
      };

      return chain;
    }),
  };
}

describe('GET /v1/admin/commercial/summary', () => {
  const originalAdminKey = process.env.DECANTR_ADMIN_KEY;

  beforeEach(() => {
    process.env.DECANTR_ADMIN_KEY = 'test-admin-key';
    mockCreateAdminClient.mockReset();
    mockCreateAdminClient.mockReturnValue(createAdminSummaryClient());
  });

  afterEach(() => {
    process.env.DECANTR_ADMIN_KEY = originalAdminKey;
  });

  it('returns aggregate commercial reporting for admins', async () => {
    const app = createTestApp();

    const res = await app.request('/v1/admin/commercial/summary', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer test-token',
        'X-Admin-Key': 'test-admin-key',
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.users_by_tier).toEqual({
      free: 2,
      pro: 1,
      team: 1,
      enterprise: 1,
    });
    expect(json.organizations_by_tier).toEqual({
      team: 1,
      enterprise: 1,
    });
    expect(json.totals).toEqual({
      public_packages: 25,
      private_packages: 12,
      org_packages: 9,
      pending_approvals: 4,
      audit_events_30d: 22,
      seat_limit_total: 25,
      api_requests_30d: 1000,
      content_publishes_30d: 15,
      private_package_publishes_30d: 6,
      org_package_publishes_30d: 9,
      approval_actions_30d: 4,
    });
  });
});
