import { Hono } from 'hono';
import { timingSafeEqual } from 'node:crypto';
import {
  DECANTR_TELEMETRY_ACTOR_TYPES,
  isTelemetryActorType,
  type TelemetryActorType,
} from '@decantr/telemetry';
import type { Env } from '../types.js';
import { parsePagination, CONTENT_TYPES } from '../types.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthContext } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';
import { logger } from '../lib/logger.js';
import { validateRegistryContent } from '../lib/content-validation.js';
import { recordAuditEvent } from '../lib/audit-log.js';
import { clearTelemetryActorCache } from '../lib/telemetry-actor.js';
import {
  fetchPostHogTelemetryUsage,
  getPostHogTelemetryUsageConfig,
  isPostHogTelemetryUsageError,
  isTelemetryUsageSource,
  parseTelemetryUsageDays,
  type TelemetryAliasIdentityRef,
} from '../lib/posthog-telemetry-usage.js';
import {
  listTelemetryUsageSnapshots,
  persistTelemetryUsageSnapshot,
  type TelemetryUsageSnapshotRunRequest,
} from '../lib/telemetry-usage-snapshots.js';

export const adminRoutes = new Hono<Env>();
const ORG_TIERS = ['team', 'enterprise'] as const;
const TELEMETRY_IDENTITY_TYPES = ['anonymous', 'install', 'project'] as const;
type TelemetryIdentityType = (typeof TELEMETRY_IDENTITY_TYPES)[number];

const TELEMETRY_ALIAS_SELECT = `
  id,
  identity_type,
  identity_id,
  actor_type,
  user_id,
  org_id,
  label,
  created_at,
  updated_at,
  users(email, display_name, username, is_internal, is_test),
  organizations(name, slug, is_internal, is_test)
`;
const DEFAULT_TELEMETRY_SNAPSHOT_REQUESTS: TelemetryUsageSnapshotRunRequest[] = [
  { days: 7 },
  { days: 30 },
  { actorType: 'customer', days: 30 },
];

/** Timing-safe string comparison to prevent timing attacks on admin key */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Compare against b to burn constant time, then return false
    timingSafeEqual(Buffer.from(b), Buffer.from(b));
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// Admin check middleware — requires both user auth AND admin key
function requireAdmin() {
  return async (c: any, next: any) => {
    const auth = c.get('auth') as AuthContext;
    if (!auth?.isAuthenticated || !auth.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const adminKey = c.req.header('X-Admin-Key') ?? '';
    const expected = process.env.DECANTR_ADMIN_KEY ?? '';
    if (!expected || !adminKey || !safeCompare(adminKey, expected)) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    await next();
  };
}

// Scoped service-token middleware — for CI/CD sync/prune paths (no user auth required).
function requireServiceToken(
  envVar: 'DECANTR_CONTENT_SYNC_TOKEN' | 'DECANTR_CONTENT_PRUNE_TOKEN' | 'DECANTR_TELEMETRY_SNAPSHOT_TOKEN',
  headerName: string,
) {
  return async (c: any, next: any) => {
    const supplied =
      c.req.header(headerName) ??
      c.req.header('X-Decantr-Service-Token') ??
      c.req.header('X-Admin-Key') ??
      '';
    const expected = process.env[envVar] ?? process.env.DECANTR_ADMIN_KEY ?? '';
    if (!expected || !supplied || !safeCompare(supplied, expected)) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('adminAuditIdentity', {
      auth_source: 'service_token',
      service_principal: envVar,
    });
    await next();
  };
}

// Admin sync/prune endpoints use scoped service tokens (no user required, for CI/CD).
adminRoutes.use('/admin/sync', requireServiceToken('DECANTR_CONTENT_SYNC_TOKEN', 'X-Content-Sync-Token'));
adminRoutes.use('/admin/content/*', requireServiceToken('DECANTR_CONTENT_PRUNE_TOKEN', 'X-Content-Prune-Token'));
adminRoutes.use('/admin/telemetry-snapshots/run', requireServiceToken('DECANTR_TELEMETRY_SNAPSHOT_TOKEN', 'X-Telemetry-Snapshot-Token'));

// All other admin endpoints require both user auth + admin key
adminRoutes.use('/admin/moderation/*', requireAuth());
adminRoutes.use('/admin/moderation/*', requireAdmin());
adminRoutes.use('/admin/commercial/*', requireAuth());
adminRoutes.use('/admin/commercial/*', requireAdmin());
adminRoutes.use('/admin/organizations', requireAuth());
adminRoutes.use('/admin/organizations', requireAdmin());
adminRoutes.use('/admin/organizations/*', requireAuth());
adminRoutes.use('/admin/organizations/*', requireAdmin());
adminRoutes.use('/admin/telemetry', requireAuth());
adminRoutes.use('/admin/telemetry', requireAdmin());
adminRoutes.use('/admin/telemetry/*', requireAuth());
adminRoutes.use('/admin/telemetry/*', requireAdmin());
adminRoutes.use('/admin/users/*', requireAuth());
adminRoutes.use('/admin/users/*', requireAdmin());

// GET /v1/admin/moderation/queue
adminRoutes.get('/admin/moderation/queue', async (c) => {
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));
  const status = (c.req.query('status') || 'pending') as 'pending' | 'approved' | 'rejected';
  const client = createAdminClient();

  const { data, error, count } = await client
    .from('moderation_queue')
    .select(`
      id,
      content_id,
      submitted_by,
      submitted_at,
      status,
      content (id, type, slug, namespace, version, data)
    `, { count: 'exact' })
    .eq('status', status)
    .order('submitted_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    return c.json({ error: 'Failed to fetch moderation queue' }, 500);
  }

  return c.json({
    total: count ?? 0,
    limit,
    offset,
    items: data ?? [],
  });
});

// POST /v1/admin/moderation/:id/approve
adminRoutes.post('/admin/moderation/:id/approve', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const queueId = c.req.param('id');
  const client = createAdminClient();

  // Get the queue entry
  const { data: entry, error: fetchError } = await client
    .from('moderation_queue')
    .select('id, content_id, submitted_by, status')
    .eq('id', queueId)
    .single();

  if (fetchError || !entry) {
    return c.json({ error: 'Queue entry not found' }, 404);
  }

  if (entry.status !== 'pending') {
    return c.json({ error: `Already ${entry.status}` }, 400);
  }

  // Update queue entry
  await client
    .from('moderation_queue')
    .update({
      status: 'approved',
      reviewed_by: auth.user!.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', queueId);

  // Update content status to published
  await client
    .from('content')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', entry.content_id);

  // Update user reputation
  try {
    await client.rpc('increment_reputation', {
      user_id_param: entry.submitted_by,
      amount: 10,
    });
  } catch {
    // If RPC doesn't exist yet, update directly
    const { data: reputationUser } = await client
      .from('users')
      .select('reputation_score')
      .eq('id', entry.submitted_by)
      .single();

    if (reputationUser) {
      await client
        .from('users')
        .update({ reputation_score: reputationUser.reputation_score + 10 })
        .eq('id', entry.submitted_by);
    }
  }

  // Check trust threshold
  const { data: submitter } = await client
    .from('users')
    .select('id, reputation_score, trusted')
    .eq('id', entry.submitted_by)
    .single();

  if (submitter && !submitter.trusted && submitter.reputation_score >= 50) {
    // Check approved count
    const { count: approvedCount } = await client
      .from('moderation_queue')
      .select('*', { count: 'exact', head: true })
      .eq('submitted_by', entry.submitted_by)
      .eq('status', 'approved');

    // Check recent rejections
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentRejections } = await client
      .from('moderation_queue')
      .select('*', { count: 'exact', head: true })
      .eq('submitted_by', entry.submitted_by)
      .eq('status', 'rejected')
      .gte('reviewed_at', thirtyDaysAgo);

    if ((approvedCount ?? 0) >= 3 && (recentRejections ?? 0) === 0) {
      await client
        .from('users')
        .update({ trusted: true })
        .eq('id', entry.submitted_by);
    }
  }

  return c.json({ message: 'Content approved and published' });
});

// POST /v1/admin/moderation/:id/reject
adminRoutes.post('/admin/moderation/:id/reject', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const queueId = c.req.param('id');
  const body = await c.req.json();
  const client = createAdminClient();

  const { data: entry, error: fetchError } = await client
    .from('moderation_queue')
    .select('id, content_id, submitted_by, status')
    .eq('id', queueId)
    .single();

  if (fetchError || !entry) {
    return c.json({ error: 'Queue entry not found' }, 404);
  }

  if (entry.status !== 'pending') {
    return c.json({ error: `Already ${entry.status}` }, 400);
  }

  await client
    .from('moderation_queue')
    .update({
      status: 'rejected',
      reviewed_by: auth.user!.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: body.reason ? String(body.reason).slice(0, 1000).trim() : null,
    })
    .eq('id', queueId);

  await client
    .from('content')
    .update({ status: 'rejected' })
    .eq('id', entry.content_id);

  // Decrease reputation and revoke trust if user was trusted
  const { data: submitter } = await client
    .from('users')
    .select('id, reputation_score, trusted')
    .eq('id', entry.submitted_by)
    .single();

  if (submitter) {
    const updates: Record<string, unknown> = {
      reputation_score: Math.max(0, submitter.reputation_score - 5),
    };

    // Trusted user submits bad content -> revoke trust
    if (submitter.trusted) {
      updates.trusted = false;
    }

    await client
      .from('users')
      .update(updates)
      .eq('id', entry.submitted_by);
  }

  return c.json({ message: 'Content rejected' });
});

function aggregateUsageTotals(rows: Array<{ metric?: string | null; quantity?: number | null }>) {
  return rows.reduce((totals: Record<string, number>, row) => {
    const metric = row.metric ?? 'unknown';
    totals[metric] = (totals[metric] ?? 0) + (row.quantity ?? 0);
    return totals;
  }, {});
}

function parseTelemetryClassificationPatch(body: unknown): { is_internal: boolean; is_test: boolean } | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }

  const input = body as Record<string, unknown>;
  if (typeof input.is_internal !== 'boolean' || typeof input.is_test !== 'boolean') {
    return null;
  }

  return {
    is_internal: input.is_internal,
    is_test: input.is_test,
  };
}

function isTelemetryIdentityType(value: unknown): value is TelemetryIdentityType {
  return (
    typeof value === 'string' &&
    (TELEMETRY_IDENTITY_TYPES as readonly string[]).includes(value)
  );
}

function readOptionalString(value: unknown, maxLength = 256): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) {
    return null;
  }
  return trimmed;
}

async function fetchTelemetryAliasRefs(
  client: ReturnType<typeof createAdminClient>,
): Promise<{ aliases: TelemetryAliasIdentityRef[] } | { error: string }> {
  const { data, error } = await client
    .from('telemetry_identity_aliases')
    .select('identity_type, identity_id');

  if (error) {
    return { error: 'Failed to fetch telemetry identity aliases' };
  }

  return {
    aliases: ((data ?? []) as TelemetryAliasIdentityRef[]).filter((alias) =>
      isTelemetryIdentityType(alias.identity_type) &&
      typeof alias.identity_id === 'string' &&
      alias.identity_id.length > 0
    ),
  };
}

function parseTelemetrySnapshotRunRequests(body: unknown): TelemetryUsageSnapshotRunRequest[] {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return DEFAULT_TELEMETRY_SNAPSHOT_REQUESTS;
  }

  const input = body as Record<string, unknown>;
  const rawSnapshots = Array.isArray(input.snapshots) ? input.snapshots : [input];
  const requests = rawSnapshots
    .map(parseTelemetrySnapshotRunRequest)
    .filter((request): request is TelemetryUsageSnapshotRunRequest => request !== null);

  return dedupeSnapshotRequests(requests.length ? requests : DEFAULT_TELEMETRY_SNAPSHOT_REQUESTS);
}

function parseTelemetrySnapshotRunRequest(value: unknown): TelemetryUsageSnapshotRunRequest | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const input = value as Record<string, unknown>;
  const hasSnapshotFilter =
    Object.hasOwn(input, 'actor_type') ||
    Object.hasOwn(input, 'actorType') ||
    Object.hasOwn(input, 'days') ||
    Object.hasOwn(input, 'source');
  if (!hasSnapshotFilter) {
    return null;
  }

  const actorType = DECANTR_TELEMETRY_ACTOR_TYPES.find((option) =>
    option === (input.actor_type ?? input.actorType)
  );
  const rawSource = input.source;
  const source = isTelemetryUsageSource(rawSource) ? rawSource : undefined;
  const days = parseTelemetryUsageDays(
    typeof input.days === 'number' || typeof input.days === 'string'
      ? String(input.days)
      : undefined,
  );

  return {
    actorType,
    days,
    source,
  };
}

function dedupeSnapshotRequests(requests: TelemetryUsageSnapshotRunRequest[]) {
  const seen = new Set<string>();
  const deduped: TelemetryUsageSnapshotRunRequest[] = [];
  for (const request of requests) {
    const key = `${request.days}:${request.actorType ?? 'all'}:${request.source ?? 'all'}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(request);
  }
  return deduped.slice(0, 12);
}

function parseSnapshotLimit(value: string | undefined) {
  const parsed = Number.parseInt(value ?? '12', 10);
  if (!Number.isFinite(parsed)) return 12;
  return Math.min(Math.max(parsed, 1), 60);
}

function parseTelemetryAliasWrite(body: unknown): {
  actor_type: TelemetryActorType;
  identity_id: string;
  identity_type: TelemetryIdentityType;
  label: string | null;
  org_ref: string | null;
  user_ref: string | null;
} | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }

  const input = body as Record<string, unknown>;
  const identityId = readOptionalString(input.identity_id);
  if (!identityId || !isTelemetryIdentityType(input.identity_type) || !isTelemetryActorType(input.actor_type)) {
    return null;
  }

  return {
    identity_type: input.identity_type,
    identity_id: identityId,
    actor_type: input.actor_type,
    user_ref: readOptionalString(input.user_ref ?? input.user_id) ?? null,
    org_ref: readOptionalString(input.org_ref ?? input.org_id) ?? null,
    label: readOptionalString(input.label, 160) ?? null,
  };
}

function parseTelemetryAliasPatch(body: unknown): {
  actor_type?: TelemetryActorType;
  label?: string | null;
  org_ref?: string | null;
  user_ref?: string | null;
} | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }

  const input = body as Record<string, unknown>;
  const patch: {
    actor_type?: TelemetryActorType;
    label?: string | null;
    org_ref?: string | null;
    user_ref?: string | null;
  } = {};

  if ('actor_type' in input) {
    if (!isTelemetryActorType(input.actor_type)) {
      return null;
    }
    patch.actor_type = input.actor_type;
  }

  if ('user_ref' in input || 'user_id' in input) {
    patch.user_ref = readOptionalString(input.user_ref ?? input.user_id) ?? null;
  }

  if ('org_ref' in input || 'org_id' in input) {
    patch.org_ref = readOptionalString(input.org_ref ?? input.org_id) ?? null;
  }

  if ('label' in input) {
    patch.label = readOptionalString(input.label, 160) ?? null;
  }

  return Object.keys(patch).length ? patch : null;
}

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveTelemetryAliasLinkIds(
  client: ReturnType<typeof createAdminClient>,
  input: {
    actor_type?: TelemetryActorType;
    identity_id?: string;
    identity_type?: TelemetryIdentityType;
    label?: string | null;
    org_ref?: string | null;
    user_ref?: string | null;
  },
): Promise<
  | {
      actor_type?: TelemetryActorType;
      identity_id?: string;
      identity_type?: TelemetryIdentityType;
      label?: string | null;
      org_id?: string | null;
      user_id?: string | null;
    }
  | { error: string }
> {
  const output: {
    actor_type?: TelemetryActorType;
    identity_id?: string;
    identity_type?: TelemetryIdentityType;
    label?: string | null;
    org_id?: string | null;
    user_id?: string | null;
  } = {};

  if ('actor_type' in input) output.actor_type = input.actor_type;
  if ('identity_id' in input) output.identity_id = input.identity_id;
  if ('identity_type' in input) output.identity_type = input.identity_type;
  if ('label' in input) output.label = input.label ?? null;

  if ('user_ref' in input) {
    const userRef = input.user_ref;
    if (!userRef) {
      output.user_id = null;
    } else if (looksLikeUuid(userRef)) {
      output.user_id = userRef;
    } else if (userRef.includes('@')) {
      const { data, error } = await client
        .from('users')
        .select('id')
        .ilike('email', userRef)
        .maybeSingle();
      if (error || !data?.id) {
        return { error: 'User email was not found' };
      }
      output.user_id = data.id;
    } else {
      output.user_id = userRef;
    }
  }

  if ('org_ref' in input) {
    const orgRef = input.org_ref;
    if (!orgRef) {
      output.org_id = null;
    } else if (looksLikeUuid(orgRef)) {
      output.org_id = orgRef;
    } else {
      const { data, error } = await client
        .from('organizations')
        .select('id')
        .eq('slug', orgRef)
        .maybeSingle();
      if (error || !data?.id) {
        return { error: 'Organization slug was not found' };
      }
      output.org_id = data.id;
    }
  }

  return output;
}

function formatTelemetryAlias(row: any) {
  const user = Array.isArray(row.users) ? row.users[0] : row.users;
  const organization = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;

  return {
    id: row.id,
    identity_type: row.identity_type,
    identity_id: row.identity_id,
    actor_type: row.actor_type,
    user_id: row.user_id ?? null,
    org_id: row.org_id ?? null,
    label: row.label ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user: user ? {
      email: user.email ?? '',
      display_name: user.display_name ?? null,
      username: user.username ?? null,
      is_internal: user.is_internal ?? false,
      is_test: user.is_test ?? false,
    } : null,
    organization: organization ? {
      name: organization.name ?? '',
      slug: organization.slug ?? '',
      is_internal: organization.is_internal ?? false,
      is_test: organization.is_test ?? false,
    } : null,
  };
}

function telemetryAliasMatchesQuery(alias: ReturnType<typeof formatTelemetryAlias>, q: string) {
  if (!q) return true;
  const haystack = [
    alias.identity_id,
    alias.label,
    alias.user_id,
    alias.org_id,
    alias.user?.email,
    alias.user?.display_name,
    alias.user?.username,
    alias.organization?.name,
    alias.organization?.slug,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

function countBy<T extends string>(values: T[], allValues: readonly T[]): Record<T, number> {
  const counts = Object.fromEntries(allValues.map((value) => [value, 0])) as Record<T, number>;
  for (const value of values) {
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

async function recordTelemetryAliasAudit(
  auth: AuthContext,
  action: 'telemetry_alias.deleted' | 'telemetry_alias.updated' | 'telemetry_alias.upserted',
  alias: any,
) {
  await recordAuditEvent({
    actor_user_id: auth.user!.id,
    org_id: alias.org_id ?? null,
    scope: 'organization',
    action,
    target_type: 'telemetry_identity_alias',
    target_id: alias.id,
    details: {
      identity_type: alias.identity_type,
      identity_id: alias.identity_id,
      actor_type: alias.actor_type,
      user_id: alias.user_id ?? null,
      org_id: alias.org_id ?? null,
      label: alias.label ?? null,
    },
  });
}

// GET /v1/admin/organizations
adminRoutes.get('/admin/organizations', async (c) => {
  const client = createAdminClient();
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));
  const q = c.req.query('q')?.trim().toLowerCase() ?? '';
  const tier = ORG_TIERS.find((value) => value === c.req.query('tier'));
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: organizations, error } = await client
    .from('organizations')
    .select('id, name, slug, tier, seat_limit, stripe_subscription_id, is_internal, is_test')
    .order('name', { ascending: true });

  if (error) {
    return c.json({ error: 'Failed to fetch organizations' }, 500);
  }

  const filtered = (organizations ?? []).filter((org: any) => {
    if (tier && org.tier !== tier) {
      return false;
    }

    if (!q) {
      return true;
    }

    return [org.name, org.slug].join(' ').toLowerCase().includes(q);
  });

  const paged = filtered.slice(offset, offset + limit);
  const items = await Promise.all(
    paged.map(async (org: any) => {
      const [
        memberCountResult,
        privateCountResult,
        publicCountResult,
        pendingResult,
        policyResult,
        usageRowsResult,
      ] = await Promise.all([
        client.from('org_members').select('*', { count: 'exact', head: true }).eq('org_id', org.id),
        client.from('content').select('*', { count: 'exact', head: true }).eq('org_id', org.id).eq('visibility', 'private'),
        client.from('content').select('*', { count: 'exact', head: true }).eq('org_id', org.id).eq('visibility', 'public'),
        client.from('content').select('*', { count: 'exact', head: true }).eq('org_id', org.id).eq('status', 'pending'),
        client.from('organization_policies').select('require_public_content_approval').eq('org_id', org.id).single(),
        client.from('usage_events').select('metric, quantity').eq('org_id', org.id).gte('created_at', thirtyDaysAgo),
      ]);

      const usageTotals = aggregateUsageTotals((usageRowsResult.data ?? []) as Array<{ metric?: string | null; quantity?: number | null }>);
      const publicPackages = publicCountResult.count ?? 0;
      const privatePackages = privateCountResult.count ?? 0;

      return {
        id: org.id,
        slug: org.slug,
        name: org.name,
        tier: org.tier,
        seat_limit: org.seat_limit ?? 0,
        stripe_subscription_id: org.stripe_subscription_id ?? null,
        is_internal: org.is_internal ?? false,
        is_test: org.is_test ?? false,
        member_count: memberCountResult.count ?? 0,
        package_count: publicPackages + privatePackages,
        public_packages: publicPackages,
        private_packages: privatePackages,
        pending_approvals: pendingResult.count ?? 0,
        require_public_content_approval: policyResult.data?.require_public_content_approval ?? false,
        api_requests_30d: usageTotals.api_request ?? 0,
        org_package_publishes_30d: usageTotals.org_package_publish ?? 0,
        approval_actions_30d: usageTotals.approval_action ?? 0,
      };
    }),
  );

  return c.json({
    total: filtered.length,
    limit,
    offset,
    items,
  });
});

// GET /v1/admin/organizations/:slug
adminRoutes.get('/admin/organizations/:slug', async (c) => {
  const client = createAdminClient();
  const slug = c.req.param('slug');
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: org, error } = await client
    .from('organizations')
    .select('id, name, slug, tier, seat_limit, stripe_subscription_id, is_internal, is_test, created_at')
    .eq('slug', slug)
    .single();

  if (error || !org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  const [
    membersResult,
    privateCountResult,
    publicCountResult,
    pendingResult,
    policyResult,
    usageRowsResult,
    auditResult,
    recentContentResult,
  ] = await Promise.all([
    client
      .from('org_members')
      .select('user_id, role, created_at, users(email, display_name, username, is_internal, is_test)')
      .eq('org_id', org.id)
      .order('created_at', { ascending: true }),
    client.from('content').select('*', { count: 'exact', head: true }).eq('org_id', org.id).eq('visibility', 'private'),
    client.from('content').select('*', { count: 'exact', head: true }).eq('org_id', org.id).eq('visibility', 'public'),
    client.from('content').select('*', { count: 'exact', head: true }).eq('org_id', org.id).eq('status', 'pending'),
    client.from('organization_policies').select('require_public_content_approval').eq('org_id', org.id).single(),
    client.from('usage_events').select('metric, quantity').eq('org_id', org.id).gte('created_at', thirtyDaysAgo),
    client
      .from('audit_logs')
      .select('id, actor_user_id, org_id, scope, action, target_type, target_id, details, created_at')
      .eq('org_id', org.id)
      .order('created_at', { ascending: false })
      .range(0, 14),
    client
      .from('content')
      .select('id, type, slug, namespace, visibility, status, version, data, created_at, updated_at, published_at')
      .eq('org_id', org.id)
      .order('updated_at', { ascending: false })
      .range(0, 11),
  ]);

  const usageTotals = aggregateUsageTotals((usageRowsResult.data ?? []) as Array<{ metric?: string | null; quantity?: number | null }>);
  const members = (membersResult.data ?? []).map((member: any) => ({
    user_id: member.user_id,
    email: member.users?.email ?? '',
    display_name: member.users?.display_name ?? null,
    username: member.users?.username ?? null,
    is_internal: member.users?.is_internal ?? false,
    is_test: member.users?.is_test ?? false,
    role: member.role,
    created_at: member.created_at,
  }));
  const recentContent = (recentContentResult.data ?? []).map((item: any) => ({
    id: item.id,
    type: item.type,
    slug: item.slug,
    namespace: item.namespace,
    visibility: item.visibility,
    status: item.status,
    version: item.version,
    name: (item.data as Record<string, unknown>)?.name,
    description: (item.data as Record<string, unknown>)?.description,
    owner_username: null,
    published_at: item.published_at ?? null,
  }));
  const policyData = (policyResult.data ?? {}) as {
    require_public_content_approval?: boolean;
    allow_member_submissions?: boolean;
    require_private_content_approval?: boolean;
  };

  return c.json({
    organization: {
      id: org.id,
      slug: org.slug,
      name: org.name,
      tier: org.tier,
      seat_limit: org.seat_limit ?? 0,
      stripe_subscription_id: org.stripe_subscription_id ?? null,
      is_internal: org.is_internal ?? false,
      is_test: org.is_test ?? false,
      created_at: org.created_at,
    },
    usage: {
      member_count: members.length,
      public_packages: publicCountResult.count ?? 0,
      private_packages: privateCountResult.count ?? 0,
      pending_approvals: pendingResult.count ?? 0,
      api_requests_30d: usageTotals.api_request ?? 0,
      org_package_publishes_30d: usageTotals.org_package_publish ?? 0,
      approval_actions_30d: usageTotals.approval_action ?? 0,
    },
    policy: {
      require_public_content_approval: policyData.require_public_content_approval ?? false,
      allow_member_submissions: policyData.allow_member_submissions ?? false,
      require_private_content_approval: policyData.require_private_content_approval ?? false,
    },
    members,
    recent_audit: auditResult.data ?? [],
    recent_content: recentContent,
  });
});

// PATCH /v1/admin/organizations/:slug/telemetry
adminRoutes.patch('/admin/organizations/:slug/telemetry', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const client = createAdminClient();
  const slug = c.req.param('slug');
  const patch = parseTelemetryClassificationPatch(await c.req.json().catch(() => null));

  if (!patch) {
    return c.json({ error: 'is_internal and is_test boolean fields are required' }, 400);
  }

  const { data: org, error } = await client
    .from('organizations')
    .update(patch)
    .eq('slug', slug)
    .select('id, slug, is_internal, is_test')
    .single();

  if (error || !org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  clearTelemetryActorCache();
  await recordAuditEvent({
    actor_user_id: auth.user!.id,
    org_id: org.id,
    scope: 'organization',
    action: 'telemetry_identity.updated',
    target_type: 'organization',
    target_id: org.id,
    details: {
      is_internal: org.is_internal,
      is_test: org.is_test,
    },
  });

  return c.json({ organization: org });
});

// PATCH /v1/admin/users/:id/telemetry
adminRoutes.patch('/admin/users/:id/telemetry', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const client = createAdminClient();
  const userId = c.req.param('id');
  const patch = parseTelemetryClassificationPatch(await c.req.json().catch(() => null));

  if (!patch) {
    return c.json({ error: 'is_internal and is_test boolean fields are required' }, 400);
  }

  const { data: user, error } = await client
    .from('users')
    .update(patch)
    .eq('id', userId)
    .select('id, is_internal, is_test')
    .single();

  if (error || !user) {
    return c.json({ error: 'User not found' }, 404);
  }

  clearTelemetryActorCache();
  await recordAuditEvent({
    actor_user_id: auth.user!.id,
    scope: 'user',
    action: 'telemetry_identity.updated',
    target_type: 'user',
    target_id: user.id,
    details: {
      is_internal: user.is_internal,
      is_test: user.is_test,
    },
  });

  return c.json({ user });
});

// POST /v1/admin/telemetry-snapshots/run
adminRoutes.post('/admin/telemetry-snapshots/run', async (c) => {
  const configResult = getPostHogTelemetryUsageConfig();
  if ('error' in configResult) {
    return c.json({
      error: configResult.error,
      missing: configResult.missing,
    }, 503);
  }

  const requests = parseTelemetrySnapshotRunRequests(await c.req.json().catch(() => null));
  const client = createAdminClient();
  const aliasesResult = await fetchTelemetryAliasRefs(client);
  if ('error' in aliasesResult) {
    return c.json({ error: aliasesResult.error }, 500);
  }

  try {
    const snapshots = [];
    for (const request of requests) {
      const usage = await fetchPostHogTelemetryUsage({
        actorType: request.actorType,
        config: configResult.config,
        days: request.days,
        existingAliases: aliasesResult.aliases,
        source: request.source,
      });
      snapshots.push(await persistTelemetryUsageSnapshot(client, usage));
    }

    return c.json({
      generated_at: new Date().toISOString(),
      snapshots,
    });
  } catch (error) {
    logger.warn({
      error: error instanceof Error ? error.message : String(error),
      status: isPostHogTelemetryUsageError(error) ? error.status : undefined,
    }, 'Failed to persist telemetry usage snapshot');
    return c.json({ error: 'Failed to persist telemetry usage snapshot' }, 502);
  }
});

// GET /v1/admin/telemetry/usage
adminRoutes.get('/admin/telemetry/usage', async (c) => {
  const configResult = getPostHogTelemetryUsageConfig();
  if ('error' in configResult) {
    return c.json({
      error: configResult.error,
      missing: configResult.missing,
    }, 503);
  }

  const actorType = DECANTR_TELEMETRY_ACTOR_TYPES.find((value) => value === c.req.query('actor_type'));
  const sourceParam = c.req.query('source');
  const source = isTelemetryUsageSource(sourceParam) ? sourceParam : undefined;
  const days = parseTelemetryUsageDays(c.req.query('days'));
  const client = createAdminClient();
  const aliasesResult = await fetchTelemetryAliasRefs(client);
  if ('error' in aliasesResult) {
    return c.json({ error: aliasesResult.error }, 500);
  }

  try {
    const usage = await fetchPostHogTelemetryUsage({
      actorType,
      config: configResult.config,
      days,
      existingAliases: aliasesResult.aliases,
      source,
    });

    return c.json(usage);
  } catch (error) {
    logger.warn({
      error: error instanceof Error ? error.message : String(error),
      status: isPostHogTelemetryUsageError(error) ? error.status : undefined,
    }, 'Failed to query PostHog telemetry usage');
    return c.json({ error: 'Failed to query PostHog telemetry usage' }, 502);
  }
});

// GET /v1/admin/telemetry/snapshots
adminRoutes.get('/admin/telemetry/snapshots', async (c) => {
  const actorType = DECANTR_TELEMETRY_ACTOR_TYPES.find((value) => value === c.req.query('actor_type'));
  const sourceParam = c.req.query('source');
  const source = isTelemetryUsageSource(sourceParam) ? sourceParam : undefined;
  const daysParam = c.req.query('days');
  const days = daysParam ? parseTelemetryUsageDays(daysParam) : undefined;
  const limit = parseSnapshotLimit(c.req.query('limit'));
  const client = createAdminClient();

  try {
    const items = await listTelemetryUsageSnapshots(client, {
      actorType,
      days,
      limit,
      source,
    });
    return c.json({
      items,
      total: items.length,
    });
  } catch (error) {
    logger.warn({
      error: error instanceof Error ? error.message : String(error),
    }, 'Failed to fetch telemetry usage snapshots');
    return c.json({ error: 'Failed to fetch telemetry usage snapshots' }, 500);
  }
});

// GET /v1/admin/telemetry/aliases
adminRoutes.get('/admin/telemetry/aliases', async (c) => {
  const client = createAdminClient();
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));
  const q = c.req.query('q')?.trim().toLowerCase() ?? '';
  const identityType = TELEMETRY_IDENTITY_TYPES.find((value) => value === c.req.query('identity_type'));
  const actorType = DECANTR_TELEMETRY_ACTOR_TYPES.find((value) => value === c.req.query('actor_type'));
  const userId = c.req.query('user_id')?.trim();
  const orgId = c.req.query('org_id')?.trim();

  const { data, error } = await client
    .from('telemetry_identity_aliases')
    .select(TELEMETRY_ALIAS_SELECT)
    .order('updated_at', { ascending: false });

  if (error) {
    return c.json({ error: 'Failed to fetch telemetry identity aliases' }, 500);
  }

  const filtered = (data ?? [])
    .map(formatTelemetryAlias)
    .filter((alias) => {
      if (identityType && alias.identity_type !== identityType) return false;
      if (actorType && alias.actor_type !== actorType) return false;
      if (userId && alias.user_id !== userId) return false;
      if (orgId && alias.org_id !== orgId) return false;
      return telemetryAliasMatchesQuery(alias, q);
    });

  const items = filtered.slice(offset, offset + limit);

  return c.json({
    total: filtered.length,
    limit,
    offset,
    summary: {
      by_actor_type: countBy(filtered.map((alias) => alias.actor_type), DECANTR_TELEMETRY_ACTOR_TYPES),
      by_identity_type: countBy(filtered.map((alias) => alias.identity_type), TELEMETRY_IDENTITY_TYPES),
    },
    items,
  });
});

// POST /v1/admin/telemetry/aliases
adminRoutes.post('/admin/telemetry/aliases', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const client = createAdminClient();
  const alias = parseTelemetryAliasWrite(await c.req.json().catch(() => null));

  if (!alias) {
    return c.json({
      error: 'identity_type, identity_id, and a valid actor_type are required',
    }, 400);
  }

  const resolvedAlias = await resolveTelemetryAliasLinkIds(client, alias);
  if ('error' in resolvedAlias) {
    return c.json({ error: resolvedAlias.error }, 400);
  }
  if (!resolvedAlias.identity_type || !resolvedAlias.identity_id || !resolvedAlias.actor_type) {
    return c.json({ error: 'identity_type, identity_id, and a valid actor_type are required' }, 400);
  }

  const { data, error } = await client
    .from('telemetry_identity_aliases')
    .upsert({
      identity_type: resolvedAlias.identity_type,
      identity_id: resolvedAlias.identity_id,
      actor_type: resolvedAlias.actor_type,
      user_id: resolvedAlias.user_id ?? null,
      org_id: resolvedAlias.org_id ?? null,
      label: resolvedAlias.label ?? null,
    }, { onConflict: 'identity_type,identity_id' })
    .select(TELEMETRY_ALIAS_SELECT)
    .single();

  if (error || !data) {
    return c.json({ error: 'Failed to save telemetry identity alias' }, 400);
  }

  clearTelemetryActorCache();
  await recordTelemetryAliasAudit(auth, 'telemetry_alias.upserted', data);

  return c.json({ alias: formatTelemetryAlias(data) }, 201);
});

// PATCH /v1/admin/telemetry/aliases/:id
adminRoutes.patch('/admin/telemetry/aliases/:id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const client = createAdminClient();
  const aliasId = c.req.param('id');
  const patch = parseTelemetryAliasPatch(await c.req.json().catch(() => null));

  if (!patch) {
    return c.json({ error: 'At least one valid telemetry alias field is required' }, 400);
  }

  const resolvedPatch = await resolveTelemetryAliasLinkIds(client, patch);
  if ('error' in resolvedPatch) {
    return c.json({ error: resolvedPatch.error }, 400);
  }

  const { data, error } = await client
    .from('telemetry_identity_aliases')
    .update(resolvedPatch)
    .eq('id', aliasId)
    .select(TELEMETRY_ALIAS_SELECT)
    .single();

  if (error || !data) {
    return c.json({ error: 'Telemetry identity alias not found' }, 404);
  }

  clearTelemetryActorCache();
  await recordTelemetryAliasAudit(auth, 'telemetry_alias.updated', data);

  return c.json({ alias: formatTelemetryAlias(data) });
});

// DELETE /v1/admin/telemetry/aliases/:id
adminRoutes.delete('/admin/telemetry/aliases/:id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const client = createAdminClient();
  const aliasId = c.req.param('id');

  const { data: existing, error: fetchError } = await client
    .from('telemetry_identity_aliases')
    .select(TELEMETRY_ALIAS_SELECT)
    .eq('id', aliasId)
    .single();

  if (fetchError || !existing) {
    return c.json({ error: 'Telemetry identity alias not found' }, 404);
  }

  const { error: deleteError } = await client
    .from('telemetry_identity_aliases')
    .delete()
    .eq('id', aliasId);

  if (deleteError) {
    return c.json({ error: 'Failed to delete telemetry identity alias' }, 500);
  }

  clearTelemetryActorCache();
  await recordTelemetryAliasAudit(auth, 'telemetry_alias.deleted', existing);

  return c.json({ alias: formatTelemetryAlias(existing) });
});

// GET /v1/admin/commercial/summary
adminRoutes.get('/admin/commercial/summary', async (c) => {
  const client = createAdminClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    usersResult,
    orgsResult,
    publicContentResult,
    privateContentResult,
    orgContentResult,
    approvalsResult,
    auditResult,
    telemetryAliasesResult,
    usageRowsResult,
  ] = await Promise.all([
    client.from('users').select('tier'),
    client.from('organizations').select('id, tier, seat_limit'),
    client.from('content').select('*', { count: 'exact', head: true }).eq('visibility', 'public'),
    client.from('content').select('*', { count: 'exact', head: true }).eq('visibility', 'private'),
    client.from('content').select('*', { count: 'exact', head: true }).not('org_id', 'is', null),
    client.from('content').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    client.from('audit_logs').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    client.from('telemetry_identity_aliases').select('identity_type, actor_type'),
    client.from('usage_events').select('metric, quantity').gte('created_at', thirtyDaysAgo),
  ]);

  const usersByTier = { free: 0, pro: 0, team: 0, enterprise: 0 } as Record<string, number>;
  for (const row of usersResult.data ?? []) {
    usersByTier[row.tier] = (usersByTier[row.tier] ?? 0) + 1;
  }

  const orgsByTier = { team: 0, enterprise: 0 } as Record<string, number>;
  let totalSeatLimit = 0;
  for (const row of orgsResult.data ?? []) {
    orgsByTier[row.tier] = (orgsByTier[row.tier] ?? 0) + 1;
    totalSeatLimit += row.seat_limit ?? 0;
  }

  const usageTotals = aggregateUsageTotals((usageRowsResult.data ?? []) as Array<{ metric?: string | null; quantity?: number | null }>);
  const telemetryAliasRows = (telemetryAliasesResult.data ?? []) as Array<{
    actor_type: TelemetryActorType;
    identity_type: TelemetryIdentityType;
  }>;

  return c.json({
    users_by_tier: usersByTier,
    organizations_by_tier: orgsByTier,
    totals: {
      public_packages: publicContentResult.count ?? 0,
      private_packages: privateContentResult.count ?? 0,
      org_packages: orgContentResult.count ?? 0,
      pending_approvals: approvalsResult.count ?? 0,
      audit_events_30d: auditResult.count ?? 0,
      seat_limit_total: totalSeatLimit,
      api_requests_30d: usageTotals.api_request ?? 0,
      content_publishes_30d: usageTotals.content_publish ?? 0,
      private_package_publishes_30d: usageTotals.private_package_publish ?? 0,
      org_package_publishes_30d: usageTotals.org_package_publish ?? 0,
      approval_actions_30d: usageTotals.approval_action ?? 0,
    },
    telemetry: {
      aliases_total: telemetryAliasRows.length,
      aliases_by_actor_type: countBy(
        telemetryAliasRows.map((row) => row.actor_type),
        DECANTR_TELEMETRY_ACTOR_TYPES,
      ),
      aliases_by_identity_type: countBy(
        telemetryAliasRows.map((row) => row.identity_type),
        TELEMETRY_IDENTITY_TYPES,
      ),
    },
  });
});

// POST /v1/admin/sync - Bulk upsert official content (used by CI/CD)
adminRoutes.post('/admin/sync', async (c) => {
  const body = await c.req.json();
  const client = createAdminClient();

  if (!body.type || !CONTENT_TYPES.includes(body.type)) {
    return c.json({ error: `type must be one of: ${CONTENT_TYPES.join(', ')}` }, 400);
  }

  if (!body.item || typeof body.item !== 'object') {
    return c.json({ error: 'item is required' }, 400);
  }

  const item = body.item;
  const slug = item.id || item.slug;

  if (!slug) {
    return c.json({ error: 'item must have id or slug' }, 400);
  }

  const contentValidation = validateRegistryContent(body.type, item);
  if (!contentValidation.valid) {
    return c.json({
      error: 'Official content failed registry schema validation',
      validationErrors: contentValidation.errors,
    }, 400);
  }

  // Upsert into content table
  const { data, error } = await client
    .from('content')
    .upsert(
      {
        type: body.type,
        slug,
        namespace: '@official',
        owner_id: process.env.DECANTR_SYSTEM_USER_ID || 'dd68f50d-fda3-4223-b250-43f2a0d29210',
        visibility: 'public',
        status: 'published',
        version: item.version || '1.0.0',
        data: item,
        published_at: new Date().toISOString(),
      },
      {
        onConflict: 'namespace,type,slug',
      }
    )
    .select()
    .single();

  if (error) {
    logger.error({ error: error.message }, 'Admin sync error');
    return c.json({ error: 'Sync failed' }, 500);
  }

  return c.json({ message: 'Synced', id: data.id, slug });
});

// DELETE /v1/admin/content/:type/:namespace/:slug - Delete official content (used by CI/CD prune)
adminRoutes.delete('/admin/content/:type/:namespace/:slug', async (c) => {
  const type = c.req.param('type');
  const namespace = c.req.param('namespace');
  const slug = c.req.param('slug');

  if (!CONTENT_TYPES.includes(type as typeof CONTENT_TYPES[number])) {
    return c.json({ error: `type must be one of: ${CONTENT_TYPES.join(', ')}` }, 400);
  }
  const contentType = type as typeof CONTENT_TYPES[number];

  if (namespace !== '@official') {
    return c.json({ error: 'Only @official content can be pruned via admin content sync' }, 403);
  }

  const client = createAdminClient();
  const { data: existing, error: fetchError } = await client
    .from('content')
    .select('id')
    .eq('type', contentType)
    .eq('namespace', namespace)
    .eq('slug', slug)
    .single();

  if (fetchError || !existing) {
    return c.json({ error: 'Content not found' }, 404);
  }

  const { error: deleteError } = await client
    .from('content')
    .delete()
    .eq('id', existing.id);

  if (deleteError) {
    logger.error({ error: deleteError.message, type, namespace, slug }, 'Admin prune error');
    return c.json({ error: 'Prune failed' }, 500);
  }

  return c.json({ message: 'Deleted', id: existing.id, slug });
});
