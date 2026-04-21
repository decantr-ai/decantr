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
  orgContentCount?: number;
  publicContentCount?: number;
  privateContentCount?: number;
  approvalCount?: number;
  usageRows?: any[];
  auditLogRows?: any[];
  policyResult?: { data: any; error: any };
  contentRows?: any[];
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
        upsertPayload: Record<string, unknown> | null;
        deleteMode: boolean;
      } = {
        filters: {},
        selectArgs: [],
        insertPayload: null,
        upsertPayload: null,
        deleteMode: false,
      };

      const resolveChainResult = async () => {
        const isHeadCount = Boolean((state.selectArgs[1] as { head?: boolean } | undefined)?.head);

        if (table === 'org_members' && isHeadCount) {
          return { count: options.memberCount ?? 0, error: null };
        }

        if (table === 'content' && isHeadCount) {
          if (state.filters.status === 'pending') {
            return { count: options.approvalCount ?? 0, error: null };
          }
          if (state.filters.visibility === 'public') {
            return { count: options.publicContentCount ?? 0, error: null };
          }
          if (state.filters.visibility === 'private') {
            return { count: options.privateContentCount ?? 0, error: null };
          }
          return { count: options.orgContentCount ?? 0, error: null };
        }

        if (table === 'usage_events') {
          return { data: options.usageRows ?? [], error: null };
        }

        if (table === 'org_members' && options.membersListResult) {
          return options.membersListResult;
        }

        if (table === 'content' && options.contentRows) {
          return { data: options.contentRows, error: null };
        }

        if (table === 'audit_logs') {
          const rows = (options.auditLogRows ?? []).filter((row) => {
            if (state.filters.org_id && row.org_id !== state.filters.org_id) {
              return false;
            }
            if (state.filters.scope && row.scope !== state.filters.scope) {
              return false;
            }
            if (state.filters.action && row.action !== state.filters.action) {
              return false;
            }
            return true;
          });
          return {
            data: rows,
            error: null,
            count: rows.length,
          };
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

          if (table === 'organization_policies') {
            if (state.upsertPayload) {
              return {
                data: state.upsertPayload,
                error: null,
              };
            }
            return options.policyResult ?? { data: null, error: null };
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
        gte: vi.fn((field: string, value: unknown) => {
          state.filters[field] = value;
          return chain;
        }),
        order: vi.fn(() => {
          return chain;
        }),
        range: vi.fn(async () => {
          if (table === 'audit_logs') {
            const rows = (options.auditLogRows ?? []).filter((row) => {
              if (state.filters.org_id && row.org_id !== state.filters.org_id) {
                return false;
              }
              if (state.filters.scope && row.scope !== state.filters.scope) {
                return false;
              }
              if (state.filters.action && row.action !== state.filters.action) {
                return false;
              }
              return true;
            });
            return { data: rows, error: null, count: rows.length };
          }

          return options.contentListResult ?? { data: [], error: null, count: 0 };
        }),
        insert: vi.fn((payload: Record<string, unknown>) => {
          state.insertPayload = payload;
          return chain;
        }),
        upsert: vi.fn((payload: Record<string, unknown>) => {
          state.upsertPayload = payload;
          return chain;
        }),
        update: vi.fn(() => chain),
        delete: vi.fn(() => {
          state.deleteMode = true;
          return chain;
        }),
        then: (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) =>
          resolveChainResult().then(resolve, reject),
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
      contentRows: [
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
      owner_name: null,
      owner_username: null,
      thumbnail_url: null,
    });
  });

  it('filters organization content for internal registry browsing', async () => {
    mockCreateAdminClient.mockReturnValue(createOrgAdminClient({
      orgResult: {
        data: { id: 'org-1' },
        error: null,
      },
      membershipResult: {
        data: { role: 'member' },
        error: null,
      },
      contentRows: [
        {
          id: 'content-1',
          type: 'theme',
          slug: 'clean-theme',
          namespace: '@org:acme',
          visibility: 'private',
          status: 'published',
          version: '1.0.0',
          data: {
            name: 'Clean Theme',
            description: 'Minimal internal theme',
          },
        },
        {
          id: 'content-2',
          type: 'pattern',
          slug: 'public-card',
          namespace: '@org:acme',
          visibility: 'public',
          status: 'published',
          version: '1.0.0',
          data: {
            name: 'Public Card',
            description: 'Customer-facing card pattern',
          },
        },
      ],
    }));

    const res = await app.request('/v1/orgs/acme/content?visibility=private&type=theme&q=clean');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.items).toHaveLength(1);
    expect(json.items[0]).toMatchObject({
      id: 'content-1',
      type: 'theme',
      visibility: 'private',
      slug: 'clean-theme',
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

  it('returns organization usage summaries for members', async () => {
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
        data: { role: 'admin' },
        error: null,
      },
      memberCount: 3,
      orgContentCount: 10,
      publicContentCount: 4,
      privateContentCount: 6,
      approvalCount: 2,
      usageRows: [
        { metric: 'api_request', quantity: 100 },
        { metric: 'org_package_publish', quantity: 3 },
        { metric: 'approval_action', quantity: 2 },
      ],
    }));

    const res = await app.request('/v1/orgs/acme/usage');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.organization).toEqual({
      id: 'org-1',
      slug: 'acme',
      name: 'Acme',
      tier: 'team',
      seat_limit: 5,
    });
    expect(json.usage).toEqual({
      members: 3,
      seat_limit: 5,
      content_items: 10,
      public_packages: 4,
      private_packages: 6,
      pending_approvals: 2,
      api_requests_30d: 100,
      org_package_publishes_30d: 3,
      approval_actions_30d: 2,
    });
  });

  it('returns advanced enterprise policy fields', async () => {
    mockCreateAdminClient.mockReturnValue(createOrgAdminClient({
      orgResult: {
        data: {
          id: 'org-1',
          slug: 'acme',
          name: 'Acme',
          tier: 'enterprise',
          seat_limit: 10,
        },
        error: null,
      },
      membershipResult: {
        data: { role: 'admin' },
        error: null,
      },
      policyResult: {
        data: {
          org_id: 'org-1',
          require_public_content_approval: true,
          allow_member_submissions: true,
          require_private_content_approval: true,
        },
        error: null,
      },
    }));

    const res = await app.request('/v1/orgs/acme/policy');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      org_id: 'org-1',
      require_public_content_approval: true,
      allow_member_submissions: true,
      require_private_content_approval: true,
    });
  });

  it('updates advanced policy controls for enterprise orgs', async () => {
    mockCreateAdminClient.mockReturnValue(createOrgAdminClient({
      orgResult: {
        data: {
          id: 'org-1',
          slug: 'acme',
          name: 'Acme',
          tier: 'enterprise',
          seat_limit: 10,
        },
        error: null,
      },
      membershipResult: {
        data: { role: 'owner' },
        error: null,
      },
    }));

    const res = await app.request('/v1/orgs/acme/policy', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        require_public_content_approval: true,
        allow_member_submissions: true,
        require_private_content_approval: true,
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({
      org_id: 'org-1',
      require_public_content_approval: true,
      allow_member_submissions: true,
      require_private_content_approval: true,
    });
  });

  it('filters organization audit logs by scope and action', async () => {
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
        data: { role: 'admin' },
        error: null,
      },
      auditLogRows: [
        {
          id: 'audit-1',
          actor_user_id: 'user-1',
          org_id: 'org-1',
          scope: 'content',
          action: 'org_content.approved',
          target_type: 'pattern',
          target_id: 'content-1',
          details: {},
          created_at: '2026-04-13T10:00:00.000Z',
        },
        {
          id: 'audit-2',
          actor_user_id: 'user-1',
          org_id: 'org-1',
          scope: 'membership',
          action: 'member.invited',
          target_type: 'org_member',
          target_id: 'user-2',
          details: {},
          created_at: '2026-04-13T09:00:00.000Z',
        },
      ],
    }));

    const res = await app.request('/v1/orgs/acme/audit?scope=content&action=org_content.approved');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.items).toHaveLength(1);
    expect(json.items[0]).toMatchObject({
      id: 'audit-1',
      scope: 'content',
      action: 'org_content.approved',
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

  it('lets enterprise members submit private content when member submissions are enabled', async () => {
    mockCreateAdminClient.mockReturnValue(createOrgAdminClient({
      orgResult: {
        data: {
          id: 'org-1',
          slug: 'acme',
          tier: 'enterprise',
        },
        error: null,
      },
      membershipResult: {
        data: { role: 'member' },
        error: null,
      },
      policyResult: {
        data: {
          require_public_content_approval: false,
          allow_member_submissions: true,
          require_private_content_approval: true,
        },
        error: null,
      },
    }));

    const res = await app.request('/v1/orgs/acme/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'theme',
        slug: 'member-theme',
        version: '1.0.0',
        visibility: 'private',
        data: {
          $schema: 'https://decantr.ai/schemas/theme.v1.json',
          id: 'member-theme',
          name: 'Member Theme',
          description: 'Submitted by a member',
        },
      }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.status).toBe('pending');
    expect(json.visibility).toBe('private');
    expect(json.org_id).toBe('org-1');
  });
});
