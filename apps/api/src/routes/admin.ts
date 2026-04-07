import { Hono } from 'hono';
import { timingSafeEqual } from 'node:crypto';
import type { Env } from '../types.js';
import { parsePagination, CONTENT_TYPES } from '../types.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthContext } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';

export const adminRoutes = new Hono<Env>();

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

// All other admin endpoints require both user auth + admin key
adminRoutes.use('/admin/moderation/*', requireAuth());
adminRoutes.use('/admin/moderation/*', requireAdmin());

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
    console.error('Admin sync error:', error.message);
    return c.json({ error: 'Sync failed' }, 500);
  }

  return c.json({ message: 'Synced', id: data.id, slug });
});
