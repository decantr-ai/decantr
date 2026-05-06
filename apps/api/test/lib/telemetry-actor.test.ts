import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCreateAdminClient } = vi.hoisted(() => ({
  mockCreateAdminClient: vi.fn(),
}));

vi.mock('../../src/db/client.js', () => ({
  createAdminClient: mockCreateAdminClient,
}));

const {
  clearTelemetryActorCache,
  resolveApiTelemetryActorType,
} = await import('../../src/lib/telemetry-actor.js');

function createActorClient() {
  const rows = {
    users: new Map<string, any>([
      ['internal-user', { is_internal: true, is_test: false }],
      ['test-user', { is_internal: false, is_test: true }],
      ['customer-user', { is_internal: false, is_test: false }],
    ]),
    organizations: new Map<string, any>([
      ['internal-org', { is_internal: true, is_test: false }],
      ['test-org', { is_internal: false, is_test: true }],
    ]),
    telemetry_identity_aliases: new Map<string, any>([
      ['project:internal-project', { actor_type: 'internal' }],
      ['install:customer-install', { actor_type: 'customer' }],
    ]),
  };

  return {
    from: vi.fn((table: keyof typeof rows) => {
      const filters: Record<string, unknown> = {};
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn((field: string, value: unknown) => {
          filters[field] = value;
          return chain;
        }),
        maybeSingle: vi.fn(async () => {
          if (table === 'telemetry_identity_aliases') {
            const key = `${filters.identity_type}:${filters.identity_id}`;
            return { data: rows.telemetry_identity_aliases.get(key) ?? null, error: null };
          }

          const id = String(filters.id);
          return { data: rows[table].get(id) ?? null, error: null };
        }),
      };
      return chain;
    }),
  };
}

describe('API telemetry actor resolution', () => {
  beforeEach(() => {
    clearTelemetryActorCache();
    mockCreateAdminClient.mockReset();
    mockCreateAdminClient.mockReturnValue(createActorClient());
  });

  it('classifies content CI as the official pipeline', async () => {
    await expect(resolveApiTelemetryActorType({ source: 'content-ci' })).resolves.toBe('official_pipeline');
  });

  it('classifies flagged users and orgs as internal', async () => {
    await expect(resolveApiTelemetryActorType({ source: 'registry-web', userId: 'internal-user' })).resolves.toBe('internal');
    await expect(resolveApiTelemetryActorType({ source: 'registry-web', orgId: 'test-org' })).resolves.toBe('internal');
  });

  it('classifies opaque project and install aliases', async () => {
    await expect(resolveApiTelemetryActorType({ source: 'cli', projectId: 'internal-project' })).resolves.toBe('internal');
    await expect(resolveApiTelemetryActorType({ source: 'cli', installId: 'customer-install' })).resolves.toBe('customer');
  });

  it('falls back to server-side inference for ordinary customer and anonymous contexts', async () => {
    await expect(resolveApiTelemetryActorType({ source: 'registry-web', userId: 'customer-user' })).resolves.toBe('customer');
    await expect(resolveApiTelemetryActorType({ source: 'registry-web', anonymousId: 'anon-1' })).resolves.toBe('anonymous');
  });

  it('uses environment allowlists as an override fallback', async () => {
    await expect(
      resolveApiTelemetryActorType(
        { source: 'cli', installId: 'env-install' },
        { internalInstallIds: ['env-install'] },
      ),
    ).resolves.toBe('internal');
  });
});
