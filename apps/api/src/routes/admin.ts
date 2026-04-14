import { Hono } from 'hono';
import { timingSafeEqual } from 'node:crypto';
import type { Env } from '../types.js';
import { parsePagination, CONTENT_TYPES } from '../types.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthContext } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';
import { logger } from '../lib/logger.js';
import { validateRegistryContent } from '../lib/content-validation.js';

export const adminRoutes = new Hono<Env>();
const ORG_TIERS = ['team', 'enterprise'] as const;

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

// Admin key-only middleware — for CI/CD sync (no user auth required)
function requireAdminKeyOnly() {
  return async (c: any, next: any) => {
    const adminKey = c.req.header('X-Admin-Key') ?? '';
    const expected = process.env.DECANTR_ADMIN_KEY ?? '';
    if (!expected || !adminKey || !safeCompare(adminKey, expected)) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await next();
  };
}

// Admin sync endpoint uses admin-key-only auth (no user required, for CI/CD)
adminRoutes.use('/admin/sync', requireAdminKeyOnly());
adminRoutes.use('/admin/content/*', requireAdminKeyOnly());

// All other admin endpoints require both user auth + admin key
adminRoutes.use('/admin/moderation/*', requireAuth());
adminRoutes.use('/admin/moderation/*', requireAdmin());
adminRoutes.use('/admin/commercial/*', requireAuth());
adminRoutes.use('/admin/commercial/*', requireAdmin());
adminRoutes.use('/admin/organizations/*', requireAuth());
adminRoutes.use('/admin/organizations/*', requireAdmin());

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

// GET /v1/admin/organizations
adminRoutes.get('/admin/organizations', async (c) => {
  const client = createAdminClient();
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));
  const q = c.req.query('q')?.trim().toLowerCase() ?? '';
  const tier = ORG_TIERS.find((value) => value === c.req.query('tier'));
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: organizations, error } = await client
    .from('organizations')
    .select('id, name, slug, tier, seat_limit, stripe_subscription_id')
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
    .select('id, name, slug, tier, seat_limit, stripe_subscription_id, created_at')
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
      .select('user_id, role, created_at, users(email, display_name, username)')
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

  return c.json({
    organization: {
      id: org.id,
      slug: org.slug,
      name: org.name,
      tier: org.tier,
      seat_limit: org.seat_limit ?? 0,
      stripe_subscription_id: org.stripe_subscription_id ?? null,
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
      require_public_content_approval: policyResult.data?.require_public_content_approval ?? false,
    },
    members,
    recent_audit: auditResult.data ?? [],
    recent_content: recentContent,
  });
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
    usageRowsResult,
  ] = await Promise.all([
    client.from('users').select('tier'),
    client.from('organizations').select('id, tier, seat_limit'),
    client.from('content').select('*', { count: 'exact', head: true }).eq('visibility', 'public'),
    client.from('content').select('*', { count: 'exact', head: true }).eq('visibility', 'private'),
    client.from('content').select('*', { count: 'exact', head: true }).not('org_id', 'is', null),
    client.from('content').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    client.from('audit_logs').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
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
