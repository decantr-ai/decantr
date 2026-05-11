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
      apiKeyOrgId: null as string | null,
      authSource: 'api_key',
      isAuthenticated: true,
      user: {
        id: 'user-1',
        email: 'customer@example.com',
        username: 'customer-user',
        display_name: 'Customer User',
        tier: 'team',
        trusted: true,
        reputation_score: 10,
      },
    },
  },
  mockClearTelemetryActorCache: vi.fn(),
  mockCreateAdminClient: vi.fn(),
  mockEmitApiTelemetry: vi.fn(),
  mockRecordAuditEvent: vi.fn(),
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
  requireApiKeyScope: () => async (_c: any, next: any) => {
    await next();
  },
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
  const upsertPayloads: unknown[] = [];

  return {
    upsertPayloads,
    from: vi.fn((table: string) => {
      const filters: Record<string, unknown> = {};
      const chain: any = {
        select: vi.fn(() => chain),
        eq: vi.fn((field: string, value: unknown) => {
          filters[field] = value;
          return chain;
        }),
        maybeSingle: vi.fn(async () => {
          if (table === 'organizations' && filters.slug === 'customer-co') {
            return {
              data: { id: 'org-1', slug: 'customer-co', tier: 'enterprise' },
              error: null,
            };
          }
          if (table === 'org_members' && filters.org_id === 'org-1') {
            return { data: { role: 'admin' }, error: null };
          }
          return { data: null, error: null };
        }),
        upsert: vi.fn((payload: unknown) => {
          upsertPayloads.push(payload);
          return {
            select: vi.fn(async () => ({
              data: Array.isArray(payload)
                ? payload.map((row, index) => ({ id: `alias-${index + 1}`, ...row }))
                : [],
              error: null,
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

  it('links opaque CLI identities to the authenticated customer org', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/me/telemetry-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        install_id: 'install_12345678',
        project_id: 'project_12345678',
        org_slug: 'customer-co',
        label: 'CI runner',
      }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ linked: 2 });
    expect(mockRecordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      action: 'telemetry_identity.linked',
      org_id: 'org-1',
    }));
    expect(mockClearTelemetryActorCache).toHaveBeenCalled();
    expect(mockEmitApiTelemetry).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      name: 'telemetry.identity_linked',
      context: { orgId: 'org-1' },
      properties: expect.objectContaining({
        entrypoint: 'cli_telemetry_link',
        linkCount: 2,
        orgScoped: true,
        plan: 'enterprise',
      }),
    }));
  });

  it('requires at least one valid opaque telemetry identity', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/me/telemetry-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: '/Users/example/project' }),
    });

    expect(res.status).toBe(400);
    expect(mockEmitApiTelemetry).not.toHaveBeenCalled();
  });
});
