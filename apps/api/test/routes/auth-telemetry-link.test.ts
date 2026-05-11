import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Env } from '../../src/types.js';

const {
  mockAuthState,
  mockClearTelemetryActorCache,
  mockCreateAdminClient,
  mockEmitApiTelemetry,
  mockRecordAuditEvent,
} = vi.hoisted(() => ({
  mockAuthState: {
    current: {
      user: {
        id: 'user-1',
        email: 'user@example.com',
        username: 'customer-user',
        display_name: 'Customer User',
        tier: 'team',
        trusted: false,
        reputation_score: 0,
      },
      isAuthenticated: true,
      isAdmin: false,
      apiKeyOrgId: null,
      apiKeyScopes: ['read'],
      authSource: 'api_key',
    },
  },
  mockClearTelemetryActorCache: vi.fn(),
  mockCreateAdminClient: vi.fn(),
  mockEmitApiTelemetry: vi.fn(),
  mockRecordAuditEvent: vi.fn(),
}));

vi.mock('../../src/middleware/auth.js', () => ({
  API_KEY_SCOPES: ['read', 'content:write', 'org:read', 'org:write', 'billing:manage', 'api_keys:manage', 'admin:*'],
  isApiKeyScope: (scope: unknown) => typeof scope === 'string',
  requireAuth: () => async (c: any, next: any) => {
    const auth = mockAuthState.current;
    if (!auth?.isAuthenticated || !auth.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('auth', auth);
    await next();
  },
  requireApiKeyScope: () => async (_c: any, next: any) => {
    await next();
  },
}));

vi.mock('../../src/db/client.js', () => ({
  createAdminClient: mockCreateAdminClient,
}));

vi.mock('../../src/lib/audit-log.js', () => ({
  recordAuditEvent: mockRecordAuditEvent,
}));

vi.mock('../../src/lib/telemetry.js', () => ({
  emitApiTelemetry: mockEmitApiTelemetry,
}));

vi.mock('../../src/lib/telemetry-actor.js', () => ({
  clearTelemetryActorCache: mockClearTelemetryActorCache,
}));

const { authRoutes } = await import('../../src/routes/auth.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', authRoutes);
  return app;
}

function createTelemetryLinkClient() {
  const aliases: any[] = [];
  const organizations = new Map<string, any>([
    ['customer-org', { id: 'org-1', slug: 'customer-org' }],
  ]);
  const memberships = new Map<string, any>([
    ['org-1:user-1', { role: 'owner' }],
  ]);

  return {
    aliases,
    from: vi.fn((table: string) => {
      const state: Record<string, unknown> = {};
      const chain: any = {
        select: vi.fn(() => chain),
        eq: vi.fn((field: string, value: unknown) => {
          state[field] = value;
          return chain;
        }),
        single: vi.fn(async () => {
          if (table === 'organizations') {
            return { data: organizations.get(String(state.slug)) ?? null, error: null };
          }
          if (table === 'org_members') {
            return {
              data: memberships.get(`${String(state.org_id)}:${String(state.user_id)}`) ?? null,
              error: null,
            };
          }
          return { data: null, error: null };
        }),
        upsert: vi.fn((payload: Record<string, unknown>) => {
          const row = {
            id: `alias-${aliases.length + 1}`,
            created_at: '2026-05-11T00:00:00.000Z',
            updated_at: '2026-05-11T00:00:00.000Z',
            ...payload,
          };
          aliases.push(row);
          return {
            select: vi.fn(() => ({
              single: vi.fn(async () => ({ data: row, error: null })),
            })),
          };
        }),
      };
      return chain;
    }),
  };
}

describe('POST /v1/me/telemetry-link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.current.apiKeyOrgId = null;
    mockCreateAdminClient.mockReturnValue(createTelemetryLinkClient());
  });

  it('links install and project aliases to the authenticated user and org', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/me/telemetry-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        install_id: 'install_1234',
        project_id: 'project_5678',
        org_slug: 'customer-org',
        label: 'Customer laptop',
      }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.linked).toBe(true);
    expect(json.org_id).toBe('org-1');
    expect(json.aliases).toHaveLength(2);
    expect(json.aliases[0]).toMatchObject({
      actor_type: 'customer',
      identity_type: 'install',
      identity_id: 'install_1234',
      user_id: 'user-1',
      org_id: 'org-1',
    });
    expect(mockClearTelemetryActorCache).toHaveBeenCalledTimes(1);
    expect(mockRecordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      action: 'telemetry_identity.linked',
      org_id: 'org-1',
      scope: 'user',
    }));
    expect(mockEmitApiTelemetry).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      name: 'registry_web.identity_linked',
      properties: expect.objectContaining({ entrypoint: 'cli_telemetry_link' }),
    }));
  });

  it('requires a telemetry identity', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/me/telemetry-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'no ids' }),
    });

    expect(res.status).toBe(400);
  });

  it('rejects malformed telemetry identity ids', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/me/telemetry-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ install_id: 'project_wrong' }),
    });

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      error: 'install_id must be an opaque install_ identifier.',
    });
  });

  it('rejects org links without membership', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/me/telemetry-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        install_id: 'install_1234',
        org_slug: 'unknown-org',
      }),
    });

    expect(res.status).toBe(404);
  });
});
