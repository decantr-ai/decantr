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

  beforeEach(() => {
    process.env.DECANTR_ADMIN_KEY = 'test-admin-key';
    mockCreateAdminClient.mockReset();
    mockCreateAdminClient.mockReturnValue(createAdminTelemetryClient());
  });

  afterEach(() => {
    process.env.DECANTR_ADMIN_KEY = originalAdminKey;
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
