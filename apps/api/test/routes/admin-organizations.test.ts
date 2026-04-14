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

function createAdminOrganizationsClient() {
  const organizations = [
    {
      id: 'org-1',
      name: 'Acme',
      slug: 'acme',
      tier: 'team',
      seat_limit: 5,
      stripe_subscription_id: 'sub_team',
      created_at: '2026-04-01T00:00:00.000Z',
    },
    {
      id: 'org-2',
      name: 'Bright Future',
      slug: 'bright-future',
      tier: 'enterprise',
      seat_limit: 20,
      stripe_subscription_id: 'sub_ent',
      created_at: '2026-04-02T00:00:00.000Z',
    },
  ];

  const membersByOrg: Record<string, any[]> = {
    'org-1': [
      {
        user_id: 'user-1',
        role: 'owner',
        created_at: '2026-04-01T00:00:00.000Z',
        users: { email: 'owner@acme.com', display_name: 'Owner', username: 'owner' },
      },
      {
        user_id: 'user-2',
        role: 'member',
        created_at: '2026-04-02T00:00:00.000Z',
        users: { email: 'member@acme.com', display_name: 'Member', username: 'member' },
      },
    ],
    'org-2': [
      {
        user_id: 'user-3',
        role: 'owner',
        created_at: '2026-04-02T00:00:00.000Z',
        users: { email: 'owner@bright.com', display_name: 'Bright Owner', username: 'bright-owner' },
      },
    ],
  };

  const contentByOrg: Record<string, any[]> = {
    'org-1': [
      {
        id: 'content-1',
        type: 'theme',
        slug: 'clean-theme',
        namespace: '@org:acme',
        visibility: 'private',
        status: 'published',
        version: '1.0.0',
        data: { name: 'Clean Theme', description: 'Internal theme' },
        published_at: '2026-04-03T00:00:00.000Z',
      },
      {
        id: 'content-2',
        type: 'pattern',
        slug: 'hero',
        namespace: '@org:acme',
        visibility: 'public',
        status: 'pending',
        version: '1.0.0',
        data: { name: 'Hero', description: 'Awaiting review' },
        published_at: null,
      },
    ],
    'org-2': [
      {
        id: 'content-3',
        type: 'blueprint',
        slug: 'enterprise-console',
        namespace: '@org:bright-future',
        visibility: 'private',
        status: 'published',
        version: '1.2.0',
        data: { name: 'Enterprise Console', description: 'Private platform blueprint' },
        published_at: '2026-04-04T00:00:00.000Z',
      },
    ],
  };

  const policiesByOrg: Record<string, any> = {
    'org-1': { require_public_content_approval: true },
    'org-2': { require_public_content_approval: false },
  };

  const usageRowsByOrg: Record<string, any[]> = {
    'org-1': [
      { metric: 'api_request', quantity: 250 },
      { metric: 'org_package_publish', quantity: 3 },
      { metric: 'approval_action', quantity: 2 },
    ],
    'org-2': [
      { metric: 'api_request', quantity: 800 },
      { metric: 'org_package_publish', quantity: 5 },
      { metric: 'approval_action', quantity: 1 },
    ],
  };

  const auditRowsByOrg: Record<string, any[]> = {
    'org-1': [
      {
        id: 'audit-1',
        actor_user_id: 'admin-1',
        org_id: 'org-1',
        scope: 'content',
        action: 'org_content.approved',
        target_type: 'pattern',
        target_id: 'content-2',
        details: {},
        created_at: '2026-04-05T00:00:00.000Z',
      },
    ],
    'org-2': [],
  };

  return {
    from: vi.fn((table: string) => {
      const state: {
        filters: Record<string, unknown>;
        selectArgs: unknown[];
      } = {
        filters: {},
        selectArgs: [],
      };

      const isHeadCount = () => Boolean((state.selectArgs[1] as { head?: boolean } | undefined)?.head);

      const chain: any = {
        select: vi.fn((...args: unknown[]) => {
          state.selectArgs = args;
          return chain;
        }),
        eq: vi.fn((field: string, value: unknown) => {
          state.filters[field] = value;
          return chain;
        }),
        gte: vi.fn(() => chain),
        order: vi.fn(() => chain),
        range: vi.fn(async () => {
          if (table === 'audit_logs') {
            return { data: auditRowsByOrg[String(state.filters.org_id)] ?? [], error: null };
          }
          if (table === 'content') {
            return { data: contentByOrg[String(state.filters.org_id)] ?? [], error: null };
          }
          return { data: [], error: null };
        }),
        single: vi.fn(async () => {
          if (table === 'organizations') {
            const org = organizations.find((row) => row.slug === state.filters.slug);
            return org ? { data: org, error: null } : { data: null, error: { message: 'not found' } };
          }
          if (table === 'organization_policies') {
            return {
              data: policiesByOrg[String(state.filters.org_id)] ?? null,
              error: null,
            };
          }
          return { data: null, error: null };
        }),
        then: (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) => {
          if (table === 'organizations') {
            return Promise.resolve({ data: organizations, error: null }).then(resolve, reject);
          }
          if (table === 'org_members') {
            if (isHeadCount()) {
              return Promise.resolve({
                count: membersByOrg[String(state.filters.org_id)]?.length ?? 0,
                error: null,
              }).then(resolve, reject);
            }
            return Promise.resolve({
              data: membersByOrg[String(state.filters.org_id)] ?? [],
              error: null,
            }).then(resolve, reject);
          }
          if (table === 'content' && isHeadCount()) {
            const rows = contentByOrg[String(state.filters.org_id)] ?? [];
            const filtered = rows.filter((row) => {
              if (state.filters.visibility && row.visibility !== state.filters.visibility) return false;
              if (state.filters.status && row.status !== state.filters.status) return false;
              return true;
            });
            return Promise.resolve({
              count: filtered.length,
              error: null,
            }).then(resolve, reject);
          }
          if (table === 'usage_events') {
            return Promise.resolve({
              data: usageRowsByOrg[String(state.filters.org_id)] ?? [],
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

describe('Admin organization routes', () => {
  const originalAdminKey = process.env.DECANTR_ADMIN_KEY;

  beforeEach(() => {
    process.env.DECANTR_ADMIN_KEY = 'test-admin-key';
    mockCreateAdminClient.mockReset();
    mockCreateAdminClient.mockReturnValue(createAdminOrganizationsClient());
  });

  afterEach(() => {
    process.env.DECANTR_ADMIN_KEY = originalAdminKey;
  });

  it('lists organizations for admin operations', async () => {
    const app = createTestApp();

    const res = await app.request('/v1/admin/organizations?tier=team&q=acme', {
      headers: {
        Authorization: 'Bearer test-token',
        'X-Admin-Key': 'test-admin-key',
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.items[0]).toMatchObject({
      slug: 'acme',
      tier: 'team',
      member_count: 2,
      private_packages: 1,
      public_packages: 1,
      pending_approvals: 1,
      require_public_content_approval: true,
      api_requests_30d: 250,
    });
  });

  it('returns detailed organization operations data', async () => {
    const app = createTestApp();

    const res = await app.request('/v1/admin/organizations/acme', {
      headers: {
        Authorization: 'Bearer test-token',
        'X-Admin-Key': 'test-admin-key',
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.organization).toMatchObject({
      slug: 'acme',
      tier: 'team',
      seat_limit: 5,
    });
    expect(json.usage).toMatchObject({
      member_count: 2,
      private_packages: 1,
      public_packages: 1,
      pending_approvals: 1,
      api_requests_30d: 250,
    });
    expect(json.policy).toEqual({
      require_public_content_approval: true,
    });
    expect(json.members).toHaveLength(2);
    expect(json.recent_audit).toHaveLength(1);
    expect(json.recent_content).toHaveLength(2);
  });
});
