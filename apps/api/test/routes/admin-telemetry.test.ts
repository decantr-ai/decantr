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
  const organizations = [
    {
      id: 'org-1',
      name: 'Decantr',
      slug: 'decantr',
      tier: 'enterprise',
      is_internal: true,
      is_test: false,
    },
    {
      id: 'org-2',
      name: 'Customer Co',
      slug: 'customer-co',
      tier: 'team',
      is_internal: false,
      is_test: false,
    },
  ];
  const usageSnapshots: any[] = [
    {
      id: 'snapshot-existing',
      snapshot_date: '2026-05-06',
      captured_at: '2026-05-06T02:00:00.000Z',
      range_days: 30,
      actor_type: 'customer',
      source: 'all',
      total_events: 12,
      customer_events: 12,
      internal_events: 0,
      official_pipeline_events: 0,
      anonymous_events: 0,
      service_events: 0,
      unclassified_events: 0,
      failure_events: 1,
      active_identities: 3,
      active_anonymous_ids: 0,
      active_installs: 2,
      active_projects: 2,
      active_orgs: 1,
      candidate_aliases: 1,
      summary: { total_events: 12, customer_events: 12 },
      previous_summary: { total_events: 8, customer_events: 8 },
      trends: { total_events: { current: 12, previous: 8, delta: 4, change_rate: 0.5 } },
      source_mix: [],
      actor_mix: [],
      event_counts: [],
      failure_counts: [],
      data_quality: { classification_coverage: 1 },
      created_at: '2026-05-06T02:00:00.000Z',
      updated_at: '2026-05-06T02:00:00.000Z',
    },
  ];
  const attributionSnapshots: any[] = [
    {
      id: 'attribution-existing',
      snapshot_date: '2026-05-06',
      captured_at: '2026-05-06T02:00:00.000Z',
      range_days: 30,
      actor_type: 'customer',
      source: 'all',
      row_rank: 1,
      row_actor_type: 'customer',
      row_source: 'cli',
      org_id: 'org-2',
      org_name: 'Customer Co',
      org_slug: 'customer-co',
      org_tier: 'team',
      org_is_internal: false,
      org_is_test: false,
      project_id: 'project_customer',
      events: 9,
      last_seen: '2026-05-06T01:00:00.000Z',
      summary: {
        active_orgs: 1,
        active_projects: 1,
        total_events: 9,
      },
      created_at: '2026-05-06T02:00:00.000Z',
      updated_at: '2026-05-06T02:00:00.000Z',
    },
  ];
  const signalBucketSnapshots: any[] = [
    {
      id: 'bucket-existing',
      usage_snapshot_id: 'snapshot-existing',
      snapshot_date: '2026-05-06',
      range_days: 30,
      actor_type: 'customer',
      source: 'all',
      bucket_key: 'cli_adoption',
      label: 'CLI adoption',
      current_events: 8,
      previous_events: 4,
      delta: 4,
      change_rate: 1,
      created_at: '2026-05-06T02:00:00.000Z',
    },
  ];
  const operatingAlertSnapshots: any[] = [
    {
      id: 'alert-existing',
      usage_snapshot_id: 'snapshot-existing',
      snapshot_date: '2026-05-06',
      range_days: 30,
      actor_type: 'customer',
      source: 'all',
      level: 'info',
      title: 'Unaliased identities found',
      detail: '1 active identities need customer/internal classification review.',
      created_at: '2026-05-06T02:00:00.000Z',
    },
  ];

  return {
    from: vi.fn((table: string) => {
      const state: {
        deleteRequested?: boolean;
        filters: Record<string, unknown>;
        inFilters: Record<string, unknown[]>;
        limitValue?: number;
        updateBody?: Record<string, unknown>;
        upsertBody?: Record<string, unknown>;
      } = {
        filters: {},
        inFilters: {},
      };

      const chain: any = {
        select: vi.fn(() => chain),
        order: vi.fn(() => chain),
        limit: vi.fn((value: number) => {
          state.limitValue = value;
          return chain;
        }),
        eq: vi.fn((field: string, value: unknown) => {
          state.filters[field] = value;
          return chain;
        }),
        in: vi.fn((field: string, values: unknown[]) => {
          state.inFilters[field] = values;
          return chain;
        }),
        ilike: vi.fn((field: string, value: unknown) => {
          state.filters[field] = value;
          return chain;
        }),
        insert: vi.fn(async (body: Record<string, unknown> | Array<Record<string, unknown>>) => {
          const rows = Array.isArray(body) ? body : [body];
          if (table === 'telemetry_signal_bucket_snapshots') {
            for (const row of rows) {
              signalBucketSnapshots.push({
                id: `bucket-${signalBucketSnapshots.length + 1}`,
                created_at: '2026-05-06T03:00:00.000Z',
                ...row,
              });
            }
          }
          if (table === 'telemetry_operating_alert_snapshots') {
            for (const row of rows) {
              operatingAlertSnapshots.push({
                id: `alert-${operatingAlertSnapshots.length + 1}`,
                created_at: '2026-05-06T03:00:00.000Z',
                ...row,
              });
            }
          }
          if (table === 'telemetry_attribution_snapshots') {
            for (const row of rows) {
              attributionSnapshots.push({
                id: `attribution-${attributionSnapshots.length + 1}`,
                created_at: '2026-05-06T03:00:00.000Z',
                updated_at: '2026-05-06T03:00:00.000Z',
                ...row,
              });
            }
          }
          return { data: rows, error: null };
        }),
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
          if (table === 'telemetry_usage_snapshots' && state.upsertBody) {
            const existing = usageSnapshots.find((snapshot) =>
              snapshot.snapshot_date === state.upsertBody?.snapshot_date &&
              snapshot.range_days === state.upsertBody?.range_days &&
              snapshot.actor_type === state.upsertBody?.actor_type &&
              snapshot.source === state.upsertBody?.source
            );
            if (existing) {
              Object.assign(existing, state.upsertBody, {
                updated_at: '2026-05-06T03:00:00.000Z',
              });
              return { data: existing, error: null };
            }

            const snapshot = {
              id: `snapshot-${usageSnapshots.length + 1}`,
              created_at: '2026-05-06T03:00:00.000Z',
              updated_at: '2026-05-06T03:00:00.000Z',
              ...state.upsertBody,
            };
            usageSnapshots.push(snapshot);
            return { data: snapshot, error: null };
          }

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

          if (table === 'telemetry_signal_bucket_snapshots' && state.deleteRequested) {
            removeMatching(signalBucketSnapshots, state.filters);
            return Promise.resolve({ data: null, error: null }).then(resolve, reject);
          }

          if (table === 'telemetry_operating_alert_snapshots' && state.deleteRequested) {
            removeMatching(operatingAlertSnapshots, state.filters);
            return Promise.resolve({ data: null, error: null }).then(resolve, reject);
          }

          if (table === 'telemetry_attribution_snapshots' && state.deleteRequested) {
            removeMatching(attributionSnapshots, state.filters);
            return Promise.resolve({ data: null, error: null }).then(resolve, reject);
          }

          if (table === 'telemetry_identity_aliases') {
            return Promise.resolve({ data: aliases, error: null }).then(resolve, reject);
          }

          if (table === 'telemetry_usage_snapshots') {
            return Promise.resolve({
              data: applyQueryState(usageSnapshots, state),
              error: null,
            }).then(resolve, reject);
          }

          if (table === 'telemetry_signal_bucket_snapshots') {
            return Promise.resolve({
              data: applyQueryState(signalBucketSnapshots, state),
              error: null,
            }).then(resolve, reject);
          }

          if (table === 'telemetry_operating_alert_snapshots') {
            return Promise.resolve({
              data: applyQueryState(operatingAlertSnapshots, state),
              error: null,
            }).then(resolve, reject);
          }

          if (table === 'telemetry_attribution_snapshots') {
            return Promise.resolve({
              data: applyQueryState(attributionSnapshots, state),
              error: null,
            }).then(resolve, reject);
          }

          if (table === 'organizations') {
            return Promise.resolve({
              data: applyQueryState(organizations, state),
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

function applyQueryState(
  rows: any[],
  state: {
    filters: Record<string, unknown>;
    inFilters: Record<string, unknown[]>;
    limitValue?: number;
  },
) {
  let filtered = rows.filter((row) => {
    for (const [field, value] of Object.entries(state.filters)) {
      if (row[field] !== value) return false;
    }
    for (const [field, values] of Object.entries(state.inFilters)) {
      if (!values.includes(row[field])) return false;
    }
    return true;
  });
  if (state.limitValue !== undefined) {
    filtered = filtered.slice(0, state.limitValue);
  }
  return filtered;
}

function removeMatching(rows: any[], filters: Record<string, unknown>) {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index];
    const matches = Object.entries(filters).every(([field, value]) => row[field] === value);
    if (matches) rows.splice(index, 1);
  }
}

describe('Admin telemetry routes', () => {
  const originalAdminKey = process.env.DECANTR_ADMIN_KEY;
  const originalTelemetrySnapshotToken = process.env.DECANTR_TELEMETRY_SNAPSHOT_TOKEN;
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
    restoreEnv('DECANTR_TELEMETRY_SNAPSHOT_TOKEN', originalTelemetrySnapshotToken);
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
      const previousPeriod = query.includes('timestamp < now() - interval 7 day');
      let results: unknown[] = [];

      if (query.includes('group by event, actor_type')) {
        results = previousPeriod
          ? [
              ['cli.command.completed', 'customer', 1],
              ['registry.item.resolved', 'internal', 2],
            ]
          : [
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
        results = previousPeriod ? [] : [['audit.completed', 1]];
      } else if (query.includes('group by distinct_id, actor_type, source')) {
        results = previousPeriod
          ? [
              [
                'install_founder',
                'internal',
                'cli',
                'install_founder',
                null,
                null,
                'org-1',
                2,
                '2026-04-30T00:00:00Z',
              ],
            ]
          : [
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
    expect(fetchMock).toHaveBeenCalledTimes(8);
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
    expect(json.previous_summary).toMatchObject({
      total_events: 3,
      customer_events: 1,
      internal_events: 2,
      failure_events: 0,
      active_identities: 1,
      active_installs: 1,
      active_projects: 0,
      active_orgs: 1,
      candidate_aliases: 0,
    });
    expect(json.trends).toMatchObject({
      total_events: { current: 5, previous: 3, delta: 2 },
      customer_events: { current: 3, previous: 1, delta: 2 },
      failure_events: { current: 1, previous: 0, delta: 1 },
    });
    expect(json.signal_buckets).toEqual(expect.arrayContaining([
      expect.objectContaining({
        key: 'cli_adoption',
        current_events: 3,
        previous_events: 1,
        delta: 2,
      }),
    ]));
    expect(json.operating_alerts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        title: 'Failure signals elevated',
      }),
      expect.objectContaining({
        title: 'Unaliased identities found',
      }),
    ]));
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

  it('returns protected PostHog telemetry attribution enriched with organizations', async () => {
    process.env.POSTHOG_QUERY_HOST = 'https://us.posthog.com';
    process.env.POSTHOG_ENVIRONMENT_ID = '411435';
    process.env.POSTHOG_PERSONAL_API_KEY = 'test-personal-key';
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? '{}'));
      const query = String(body.query?.query ?? '');
      let results: unknown[] = [];

      if (query.includes('group by org_id, project_id, source, actor_type')) {
        results = [
          ['org-2', 'project_customer', 'cli', 'customer', 7, '2026-05-06T00:00:00Z'],
          [null, 'project_unowned', 'mcp', 'customer', 2, '2026-05-05T00:00:00Z'],
          [null, null, 'api', 'customer', 1, '2026-05-04T00:00:00Z'],
        ];
      }

      return new Response(JSON.stringify({ results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const app = createTestApp();
    const res = await app.request('/v1/admin/telemetry/attribution?days=30&actor_type=customer&limit=2', {
      headers: {
        Authorization: 'Bearer test-token',
        'X-Admin-Key': 'test-admin-key',
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(json.summary).toMatchObject({
      active_orgs: 1,
      active_projects: 2,
      attributed_events: 9,
      returned_events: 9,
      returned_rows: 2,
      scanned_rows: 3,
      total_events: 10,
      unattributed_events: 1,
    });
    expect(json.rows).toHaveLength(2);
    expect(json.rows[0]).toMatchObject({
      actor_type: 'customer',
      events: 7,
      org_id: 'org-2',
      organization: {
        name: 'Customer Co',
        slug: 'customer-co',
      },
      project_id: 'project_customer',
      source: 'cli',
    });
    expect(json.rows[1]).toMatchObject({
      org_id: null,
      organization: null,
      project_id: 'project_unowned',
      source: 'mcp',
    });
  });

  it('persists service-token telemetry usage snapshots', async () => {
    process.env.POSTHOG_QUERY_HOST = 'https://us.posthog.com';
    process.env.POSTHOG_ENVIRONMENT_ID = '411435';
    process.env.POSTHOG_PERSONAL_API_KEY = 'test-personal-key';
    process.env.DECANTR_TELEMETRY_SNAPSHOT_TOKEN = 'snapshot-token';
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? '{}'));
      const query = String(body.query?.query ?? '');
      const previousPeriod = query.includes('timestamp < now() - interval 7 day');
      let results: unknown[] = [];

      if (query.includes('group by event, actor_type')) {
        results = previousPeriod
          ? [['cli.command.completed', 'customer', 1]]
          : [['cli.command.completed', 'customer', 3]];
      } else if (query.includes('group by org_id, project_id, source, actor_type')) {
        results = [
          ['org-2', 'project_customer', 'cli', 'customer', 3, '2026-05-06T00:00:00Z'],
        ];
      } else if (query.includes('group by source')) {
        results = [['cli', 3]];
      } else if (query.includes('group by actor_type, source')) {
        results = [['customer', 'cli', 3]];
      } else if (query.includes('and (properties.success = false or properties.valid = false)')) {
        results = [];
      } else if (query.includes('group by distinct_id, actor_type, source')) {
        results = previousPeriod
          ? []
          : [
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
            ];
      }

      return new Response(JSON.stringify({ results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const app = createTestApp();
    const res = await app.request('/v1/admin/telemetry-snapshots/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telemetry-Snapshot-Token': 'snapshot-token',
      },
      body: JSON.stringify({
        actor_type: 'customer',
        days: 7,
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(fetchMock).toHaveBeenCalledTimes(9);
    expect(json.snapshots).toHaveLength(1);
    expect(json.attribution_snapshots).toEqual([
      expect.objectContaining({
        actor_type: 'customer',
        range_days: 7,
        rows: 1,
        source: 'all',
        total_events: 3,
      }),
    ]);
    expect(json.snapshots[0]).toMatchObject({
      actor_type: 'customer',
      range_days: 7,
      source: 'all',
      total_events: 3,
      customer_events: 3,
    });
    expect(json.snapshots[0].signal_buckets).toEqual(expect.arrayContaining([
      expect.objectContaining({
        bucket_key: 'cli_adoption',
        current_events: 3,
        previous_events: 1,
      }),
    ]));
    expect(json.snapshots[0].data_quality).toMatchObject({
      candidate_aliases: 1,
      unclassified_events: 0,
    });
  });

  it('persists the default service-token telemetry snapshot batch for empty bodies', async () => {
    process.env.POSTHOG_QUERY_HOST = 'https://us.posthog.com';
    process.env.POSTHOG_ENVIRONMENT_ID = '411435';
    process.env.POSTHOG_PERSONAL_API_KEY = 'test-personal-key';
    process.env.DECANTR_TELEMETRY_SNAPSHOT_TOKEN = 'snapshot-token';
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? '{}'));
      const query = String(body.query?.query ?? '');
      const previousPeriod = /timestamp < now\(\) - interval (7|30) day/.test(query);
      let results: unknown[] = [];

      if (query.includes('group by event, actor_type')) {
        results = previousPeriod
          ? [['cli.command.completed', 'customer', 1]]
          : [['cli.command.completed', 'customer', 3]];
      } else if (query.includes('group by org_id, project_id, source, actor_type')) {
        results = [
          ['org-2', 'project_customer', 'cli', 'customer', 3, '2026-05-06T00:00:00Z'],
        ];
      } else if (query.includes('group by source')) {
        results = [['cli', 3]];
      } else if (query.includes('group by actor_type, source')) {
        results = [['customer', 'cli', 3]];
      } else if (query.includes('and (properties.success = false or properties.valid = false)')) {
        results = [];
      } else if (query.includes('group by distinct_id, actor_type, source')) {
        results = previousPeriod
          ? []
          : [
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
            ];
      }

      return new Response(JSON.stringify({ results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const app = createTestApp();
    const res = await app.request('/v1/admin/telemetry-snapshots/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telemetry-Snapshot-Token': 'snapshot-token',
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(fetchMock).toHaveBeenCalledTimes(27);
    expect(json.snapshots).toHaveLength(3);
    expect(json.attribution_snapshots).toHaveLength(3);
    expect(json.snapshots.map((snapshot: { actor_type: string; range_days: number; source: string }) => ({
      actor_type: snapshot.actor_type,
      range_days: snapshot.range_days,
      source: snapshot.source,
    }))).toEqual([
      { actor_type: 'all', range_days: 7, source: 'all' },
      { actor_type: 'all', range_days: 30, source: 'all' },
      { actor_type: 'customer', range_days: 30, source: 'all' },
    ]);
  });

  it('lists stored telemetry usage snapshots', async () => {
    const app = createTestApp();

    const res = await app.request('/v1/admin/telemetry/snapshots?actor_type=customer&days=30', {
      headers: {
        Authorization: 'Bearer test-token',
        'X-Admin-Key': 'test-admin-key',
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.items[0]).toMatchObject({
      actor_type: 'customer',
      range_days: 30,
      total_events: 12,
    });
    expect(json.items[0].signal_buckets[0]).toMatchObject({
      bucket_key: 'cli_adoption',
      current_events: 8,
    });
    expect(json.items[0].operating_alerts[0]).toMatchObject({
      title: 'Unaliased identities found',
    });
  });

  it('lists stored telemetry attribution snapshots', async () => {
    const app = createTestApp();

    const res = await app.request('/v1/admin/telemetry/attribution/snapshots?actor_type=customer&days=30', {
      headers: {
        Authorization: 'Bearer test-token',
        'X-Admin-Key': 'test-admin-key',
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.items[0]).toMatchObject({
      actor_type: 'customer',
      events: 9,
      org_id: 'org-2',
      org_slug: 'customer-co',
      project_id: 'project_customer',
      range_days: 30,
      row_actor_type: 'customer',
      row_source: 'cli',
    });
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
