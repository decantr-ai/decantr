import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';

const { mockCreateAdminClient, mockAuthState } = vi.hoisted(() => ({
  mockCreateAdminClient: vi.fn(),
  mockAuthState: {
    current: {
      user: {
        id: 'user-1',
        email: 'member@example.com',
        username: 'member-user',
        display_name: 'Member User',
        tier: 'free',
        trusted: false,
        reputation_score: 0,
      },
      isAuthenticated: true,
      isAdmin: false,
    },
  },
}));

vi.mock('../../src/db/client.js', () => ({
  createAdminClient: mockCreateAdminClient,
  createUserClient: vi.fn(),
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

type AdminClientOptions = {
  orgResult?: { data: any; error: any };
  membershipResult?: { data: any; error: any };
  targetMembershipResult?: { data: any; error: any };
  memberCount?: number;
  membersListResult?: { data: any[]; error: any };
  contentListResult?: { data: any[]; error: any; count: number | null };
  userLookupResult?: { data: any; error: any };
  deleteMemberResult?: { error: any };
};

function createOrgAdminClient(options: AdminClientOptions = {}) {
  return {
    from: vi.fn((table: string) => {
      const state: {
        filters: Record<string, unknown>;
        selectArgs: unknown[];
        insertPayload: Record<string, unknown> | null;
        deleteMode: boolean;
      } = {
        filters: {},
        selectArgs: [],
        insertPayload: null,
        deleteMode: false,
      };

      const chain: any = {
        select: vi.fn((...args: unknown[]) => {
          state.selectArgs = args;
          return chain;
        }),
        eq: vi.fn((field: string, value: unknown) => {
          state.filters[field] = value;
          const isHeadCount = Boolean((state.selectArgs[1] as { head?: boolean } | undefined)?.head);

          if (table === 'org_members' && isHeadCount) {
            return Promise.resolve({ count: options.memberCount ?? 0, error: null });
          }

          if (table === 'org_members' && state.deleteMode && 'org_id' in state.filters && 'user_id' in state.filters) {
            return Promise.resolve(options.deleteMemberResult ?? { error: null });
          }

          return chain;
        }),
        single: vi.fn(async () => {
          if (table === 'organizations') {
            return options.orgResult ?? { data: null, error: { message: 'not found' } };
          }

          if (table === 'org_members') {
            const actingUserId = mockAuthState.current.user?.id;
            return state.filters.user_id === actingUserId
              ? (options.membershipResult ?? { data: null, error: null })
              : (options.targetMembershipResult ?? { data: null, error: null });
          }

          if (table === 'users') {
            return options.userLookupResult ?? { data: null, error: null };
          }

          if (table === 'content' && state.insertPayload) {
            return {
              data: {
                id: 'content-1',
                ...state.insertPayload,
              },
              error: null,
            };
          }

          return { data: null, error: null };
        }),
        order: vi.fn(() => {
          if (table === 'org_members' && options.membersListResult) {
            return Promise.resolve(options.membersListResult);
          }
          return chain;
        }),
        range: vi.fn(async () => options.contentListResult ?? { data: [], error: null, count: 0 }),
        insert: vi.fn((payload: Record<string, unknown>) => {
          state.insertPayload = payload;
          return chain;
        }),
        update: vi.fn(() => chain),
        delete: vi.fn(() => {
          state.deleteMode = true;
          return chain;
        }),
      };

      return chain;
    }),
  };
}

const { orgRoutes } = await import('../../src/routes/orgs.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', orgRoutes);
  return app;
}

describe('Org routes', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createTestApp();
    mockAuthState.current = {
      user: {
        id: 'user-1',
        email: 'member@example.com',
        username: 'member-user',
        display_name: 'Member User',
        tier: 'free',
        trusted: false,
        reputation_score: 0,
      },
      isAuthenticated: true,
      isAdmin: false,
    };
  });

  it('returns 404 when an organization is missing', async () => {
    mockCreateAdminClient.mockReturnValue(createOrgAdminClient());

    const res = await app.request('/v1/orgs/acme');

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('Organization not found');
  });

  it('returns organization membership details for members', async () => {
    mockCreateAdminClient.mockReturnValue(createOrgAdminClient({
      orgResult: {
        data: {
          id: 'org-1',
          name: 'Acme',
          slug: 'acme',
          tier: 'team',
          created_at: '2026-04-01T00:00:00.000Z',
        },
        error: null,
      },
      membershipResult: {
        data: { role: 'admin' },
        error: null,
      },
      memberCount: 3,
    }));

    const res = await app.request('/v1/orgs/acme');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      id: 'org-1',
      name: 'Acme',
      slug: 'acme',
      tier: 'team',
      member_count: 3,
      your_role: 'admin',
      created_at: '2026-04-01T00:00:00.000Z',
    });
  });

  it('lists organization content for members', async () => {
    mockCreateAdminClient.mockReturnValue(createOrgAdminClient({
      orgResult: {
        data: { id: 'org-1' },
        error: null,
      },
      membershipResult: {
        data: { role: 'member' },
        error: null,
      },
      contentListResult: {
        data: [
          {
            id: 'content-1',
            type: 'theme',
            slug: 'clean',
            namespace: '@org:acme',
            visibility: 'private',
            status: 'published',
            version: '1.0.0',
            data: {
              name: 'Clean',
              description: 'Minimal org theme',
            },
          },
        ],
        error: null,
        count: 1,
      },
    }));

    const res = await app.request('/v1/orgs/acme/content?limit=10&offset=0');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.items[0]).toEqual({
      id: 'content-1',
      type: 'theme',
      slug: 'clean',
      namespace: '@org:acme',
      visibility: 'private',
      status: 'published',
      version: '1.0.0',
      name: 'Clean',
      description: 'Minimal org theme',
    });
  });

  it('lists organization members for authorized users', async () => {
    mockCreateAdminClient.mockReturnValue(createOrgAdminClient({
      orgResult: {
        data: {
          id: 'org-1',
          name: 'Acme',
          slug: 'acme',
          tier: 'team',
          seat_limit: 5,
        },
        error: null,
      },
      membershipResult: {
        data: { role: 'owner' },
        error: null,
      },
      membersListResult: {
        data: [
          {
            user_id: 'user-1',
            role: 'owner',
            created_at: '2026-04-01T00:00:00.000Z',
            users: {
              email: 'owner@example.com',
              display_name: 'Owner',
              username: 'owner',
            },
          },
          {
            user_id: 'user-2',
            role: 'member',
            created_at: '2026-04-02T00:00:00.000Z',
            users: {
              email: 'member@example.com',
              display_name: 'Member',
              username: 'member',
            },
          },
        ],
        error: null,
      },
    }));

    const res = await app.request('/v1/orgs/acme/members');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.organization).toEqual({
      id: 'org-1',
      name: 'Acme',
      slug: 'acme',
      tier: 'team',
      seat_limit: 5,
    });
    expect(json.your_role).toBe('owner');
    expect(json.members).toHaveLength(2);
    expect(json.members[1]).toEqual({
      user_id: 'user-2',
      email: 'member@example.com',
      display_name: 'Member',
      username: 'member',
      role: 'member',
      created_at: '2026-04-02T00:00:00.000Z',
    });
  });

  it('rejects invalid organization content payloads with schema validation errors', async () => {
    mockCreateAdminClient.mockReturnValue(createOrgAdminClient({
      orgResult: {
        data: {
          id: 'org-1',
          slug: 'acme',
        },
        error: null,
      },
      membershipResult: {
        data: { role: 'admin' },
        error: null,
      },
    }));

    const res = await app.request('/v1/orgs/acme/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'theme',
        slug: 'broken-theme',
        version: '1.0.0',
        data: {
          name: 'Broken Theme',
        },
      }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Content data failed registry schema validation');
    expect(Array.isArray(json.validationErrors)).toBe(true);
    expect(json.validationErrors[0]).toContain('$schema must be');
  });

  it('publishes valid organization content for admins', async () => {
    mockCreateAdminClient.mockReturnValue(createOrgAdminClient({
      orgResult: {
        data: {
          id: 'org-1',
          slug: 'acme',
        },
        error: null,
      },
      membershipResult: {
        data: { role: 'admin' },
        error: null,
      },
    }));

    const res = await app.request('/v1/orgs/acme/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'theme',
        slug: 'clean-theme',
        version: '1.0.0',
        visibility: 'public',
        data: {
          $schema: 'https://decantr.ai/schemas/theme.v1.json',
          id: 'clean-theme',
          name: 'Clean Theme',
          description: 'Valid organization theme',
        },
      }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.type).toBe('theme');
    expect(json.slug).toBe('clean-theme');
    expect(json.namespace).toBe('@org:acme');
    expect(json.visibility).toBe('public');
    expect(json.org_id).toBe('org-1');
  });
});
