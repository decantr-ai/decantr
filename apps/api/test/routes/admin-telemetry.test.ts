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

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

function createAdminTelemetryClient() {
  const aliases = [
    {
      id: 'alias-1',
      identity_type: 'install',
      identity_id: 'install_founder',
      actor_type: 'internal',
      user_id: 'user-1',
      org_id: 'org-1',
      label: 'Founder laptop',
      created_at: '2026-05-06T00:00:00.000Z',
      updated_at: '2026-05-06T00:00:00.000Z',
      users: {
        email: 'founder@decantr.ai',
        display_name: 'Founder',
        username: 'founder',
        is_internal: true,
        is_test: false,
      },
      organizations: {
        name: 'Decantr',
        slug: 'decantr',
        is_internal: true,
        is_test: false,
      },
    },
    {
      id: 'alias-2',
      identity_type: 'project',
      identity_id: 'project_customer',
      actor_type: 'customer',
      user_id: null,
      org_id: null,
      label: 'Customer project',
      created_at: '2026-05-06T00:00:00.000Z',
      updated_at: '2026-05-06T00:00:00.000Z',
      users: null,
      organizations: null,
    },
  ];

  return {
    from: vi.fn((table: string) => {
      const state: {
        deleteRequested?: boolean;
        filters: Record<string, unknown>;
        updateBody?: Record<string, unknown>;
        upsertBody?: Record<string, unknown>;
      } = {
        filters: {},
      };

      const chain: any = {
        select: vi.fn(() => chain),
        order: vi.fn(() => chain),
        eq: vi.fn((field: string, value: unknown) => {
          state.filters[field] = value;
          return chain;
        }),
        ilike: vi.fn((field: string, value: unknown) => {
          state.filters[field] = value;
          return chain;
        }),
        insert: vi.fn(async () => ({ data: null, error: null })),
        update: vi.fn((body: Record<string, unknown>) => {
          state.updateBody = body;
          return chain;
        }),
        upsert: vi.fn((body: Record<string, unknown>) => {
          state.upsertBody = body;
          return chain;
        }),
        delete: vi.fn(() => {
          state.deleteRequested = true;
          return chain;
        }),
        single: vi.fn(async () => {
          if (table !== 'telemetry_identity_aliases') {
            return { data: null, error: null };
          }

          if (state.upsertBody) {
            const existing = aliases.find((alias) =>
              alias.identity_type === state.upsertBody?.identity_type &&
              alias.identity_id === state.upsertBody?.identity_id
            );
            if (existing) {
              Object.assign(existing, state.upsertBody, {
                updated_at: '2026-05-06T01:00:00.000Z',
              });
              return { data: existing, error: null };
            }

            const alias = {
              id: `alias-${aliases.length + 1}`,
              created_at: '2026-05-06T01:00:00.000Z',
              updated_at: '2026-05-06T01:00:00.000Z',
              users: null,
              organizations: null,
              ...state.upsertBody,
            } as any;
            aliases.push(alias);
            return { data: alias, error: null };
          }

          const alias = aliases.find((row) => row.id === state.filters.id);
          if (!alias) {
            return { data: null, error: { message: 'not found' } };
          }

          if (state.updateBody) {
            Object.assign(alias, state.updateBody, {
              updated_at: '2026-05-06T02:00:00.000Z',
            });
          }

          return { data: alias, error: null };
        }),
        maybeSingle: vi.fn(async () => {
          if (table === 'users' && state.filters.email === 'founder@decantr.ai') {
            return { data: { id: 'user-1' }, error: null };
          }

          if (table === 'organizations' && state.filters.slug === 'decantr') {
            return { data: { id: 'org-1' }, error: null };
          }

          return { data: null, error: { message: 'not found' } };
        }),
        then: (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) => {
          if (table === 'telemetry_identity_aliases' && state.deleteRequested) {
            const index = aliases.findIndex((row) => row.id === state.filters.id);
            if (index >= 0) aliases.splice(index, 1);
            return Promise.resolve({ data: null, error: null }).then(resolve, reject);
          }

          if (table === 'telemetry_identity_aliases') {
            return Promise.resolve({ data: aliases, error: null }).then(resolve, reject);
          }

          return Promise.resolve({ data: [], error: null }).then(resolve, reject);
        },
      };

      return chain;
    }),
  };
}

describe('Admin telemetry routes', () => {
  const originalAdminKey = process.env.DECANTR_ADMIN_KEY;
  const originalPostHogQueryHost = process.env.POSTHOG_QUERY_HOST;
  const originalPostHogAppHost = process.env.POSTHOG_APP_HOST;
  const originalPostHogHost = process.env.POSTHOG_HOST;
  const originalPostHogEnvironmentId = process.env.POSTHOG_ENVIRONMENT_ID;
  const originalPostHogProjectId = process.env.POSTHOG_PROJECT_ID;
  const originalPostHogPersonalApiKey = process.env.POSTHOG_PERSONAL_API_KEY;

  beforeEach(() => {
    process.env.DECANTR_ADMIN_KEY = 'test-admin-key';
    mockCreateAdminClient.mockReset();
    mockCreateAdminClient.mockReturnValue(createAdminTelemetryClient());
  });

  afterEach(() => {
    process.env.DECANTR_ADMIN_KEY = originalAdminKey;
    restoreEnv('POSTHOG_QUERY_HOST', originalPostHogQueryHost);
    restoreEnv('POSTHOG_APP_HOST', originalPostHogAppHost);
    restoreEnv('POSTHOG_HOST', originalPostHogHost);
    restoreEnv('POSTHOG_ENVIRONMENT_ID', originalPostHogEnvironmentId);
    restoreEnv('POSTHOG_PROJECT_ID', originalPostHogProjectId);
    restoreEnv('POSTHOG_PERSONAL_API_KEY', originalPostHogPersonalApiKey);
    vi.unstubAllGlobals();
  });

  it('lists telemetry aliases with filters and summaries', async () => {
    const app = createTestApp();

    const res = await app.request('/v1/admin/telemetry/aliases?q=founder', {
      headers: {
        Authorization: 'Bearer test-token',
        'X-Admin-Key': 'test-admin-key',
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.summary.by_actor_type.internal).toBe(1);
    expect(json.summary.by_identity_type.install).toBe(1);
    expect(json.items[0]).toMatchObject({
      identity_type: 'install',
      identity_id: 'install_founder',
      actor_type: 'internal',
      user: { email: 'founder@decantr.ai' },
      organization: { slug: 'decantr' },
    });
  });

  it('returns protected PostHog telemetry usage with candidate aliases', async () => {
    process.env.POSTHOG_QUERY_HOST = 'https://us.posthog.com';
    process.env.POSTHOG_ENVIRONMENT_ID = '411435';
    process.env.POSTHOG_PERSONAL_API_KEY = 'test-personal-key';
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? '{}'));
      const query = String(body.query?.query ?? '');
      let results: unknown[] = [];

      if (query.includes('group by event, actor_type')) {
        results = [
          ['cli.command.completed', 'customer', 3],
          ['registry.item.resolved', 'internal', 2],
        ];
      } else if (query.includes('group by source')) {
        results = [
          ['cli', 3],
          ['api', 2],
        ];
      } else if (query.includes('group by actor_type, source')) {
        results = [
          ['customer', 'cli', 3],
          ['internal', 'api', 2],
        ];
      } else if (query.includes('and (properties.success = false or properties.valid = false)')) {
        results = [['audit.completed', 1]];
      } else if (query.includes('group by distinct_id, actor_type, source')) {
        results = [
          [
            'install_unknown',
            'customer',
            'cli',
            'install_unknown',
            'project_customer',
            null,
            'org-2',
            3,
            '2026-05-06T00:00:00Z',
          ],
          [
            'install_founder',
            'internal',
            'cli',
            'install_founder',
            null,
            null,
            'org-1',
            2,
            '2026-05-06T01:00:00Z',
          ],
        ];
      }

      return new Response(JSON.stringify({ results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const app = createTestApp();
    const res = await app.request('/v1/admin/telemetry/usage?days=7&actor_type=customer', {
      headers: {
        Authorization: 'Bearer test-token',
        'X-Admin-Key': 'test-admin-key',
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(json.summary).toMatchObject({
      total_events: 5,
      customer_events: 3,
      internal_events: 2,
      failure_events: 1,
      active_identities: 2,
      active_installs: 2,
      active_projects: 1,
      active_orgs: 2,
      candidate_aliases: 1,
    });
    expect(json.event_counts[0]).toMatchObject({
      event: 'cli.command.completed',
      actor_type: 'customer',
      count: 3,
    });
    expect(json.candidate_aliases).toEqual([
      expect.objectContaining({
        identity_type: 'install',
        identity_id: 'install_unknown',
        actor_type: 'customer',
        events: 3,
      }),
    ]);
  });

  it('reports missing PostHog query configuration for telemetry usage', async () => {
    delete process.env.POSTHOG_QUERY_HOST;
    delete process.env.POSTHOG_APP_HOST;
    delete process.env.POSTHOG_HOST;
    delete process.env.POSTHOG_ENVIRONMENT_ID;
    delete process.env.POSTHOG_PROJECT_ID;
    delete process.env.POSTHOG_PERSONAL_API_KEY;
    const app = createTestApp();

    const res = await app.request('/v1/admin/telemetry/usage', {
      headers: {
        Authorization: 'Bearer test-token',
        'X-Admin-Key': 'test-admin-key',
      },
    });

    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json).toMatchObject({
      error: 'PostHog query environment is not configured',
      missing: ['POSTHOG_ENVIRONMENT_ID', 'POSTHOG_PERSONAL_API_KEY'],
    });
  });

  it('upserts telemetry aliases', async () => {
    const app = createTestApp();

    const res = await app.request('/v1/admin/telemetry/aliases', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
        'X-Admin-Key': 'test-admin-key',
      },
      body: JSON.stringify({
        identity_type: 'install',
        identity_id: 'install_new',
        actor_type: 'internal',
        label: 'New internal install',
        user_ref: 'founder@decantr.ai',
        org_ref: 'decantr',
      }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.alias).toMatchObject({
      identity_type: 'install',
      identity_id: 'install_new',
      actor_type: 'internal',
      label: 'New internal install',
      user_id: 'user-1',
      org_id: 'org-1',
    });
  });

  it('rejects invalid telemetry alias payloads', async () => {
    const app = createTestApp();

    const res = await app.request('/v1/admin/telemetry/aliases', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
        'X-Admin-Key': 'test-admin-key',
      },
      body: JSON.stringify({
        identity_type: 'install',
        identity_id: 'install_new',
        actor_type: 'teammate',
      }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('actor_type');
  });

  it('updates telemetry aliases', async () => {
    const app = createTestApp();

    const res = await app.request('/v1/admin/telemetry/aliases/alias-2', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
        'X-Admin-Key': 'test-admin-key',
      },
      body: JSON.stringify({
        actor_type: 'internal',
        label: 'Customer install used in demos',
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.alias).toMatchObject({
      id: 'alias-2',
      actor_type: 'internal',
      label: 'Customer install used in demos',
    });
  });

  it('deletes telemetry aliases', async () => {
    const app = createTestApp();

    const res = await app.request('/v1/admin/telemetry/aliases/alias-2', {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer test-token',
        'X-Admin-Key': 'test-admin-key',
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.alias).toMatchObject({
      id: 'alias-2',
      identity_id: 'project_customer',
    });
  });
});
