import { Hono } from 'hono';
import { createHash, randomBytes } from 'crypto';
import type { Env } from '../types.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthContext } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';
import { getStripe } from '../stripe/client.js';
import { logger } from '../lib/logger.js';
import {
  getCommercialEntitlements,
  getCommercialLimits,
  type OrganizationEntitlementSummary,
} from '../lib/entitlements.js';
import { recordAuditEvent } from '../lib/audit-log.js';
import { ensureUserProfile } from '../lib/user-profile.js';

export const authRoutes = new Hono<Env>();

// All auth routes require authentication
authRoutes.use('/*', requireAuth());

// GET /v1/me
authRoutes.get('/me', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const client = createAdminClient();

  let { data: user, error } = await client
    .from('users')
    .select('*')
    .eq('id', auth.user!.id)
    .single();

  if (!user) {
    try {
      user = await ensureUserProfile({
        id: auth.user!.id,
        email: auth.user!.email,
        user_metadata: {
          username: auth.user!.username,
          display_name: auth.user!.display_name,
        },
      });
      error = null;
    } catch (provisionError) {
      logger.warn({ err: provisionError, userId: auth.user!.id }, 'Failed to provision user during /me');
    }
  }

  if (error || !user) {
    return c.json({ error: 'User not found' }, 404);
  }

  const { data: memberships } = await client
    .from('org_members')
    .select('org_id, role, organizations(id, name, slug, tier, stripe_subscription_id, seat_limit)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const organizationLists = await Promise.all(
    (memberships ?? []).map(async (membership: any) => {
      const org = membership.organizations;
      if (!org?.id || !org?.slug || !org?.name || !org?.tier) return [];

      const { count } = await client
        .from('org_members')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', org.id);

      return [{
        id: org.id,
        slug: org.slug,
        name: org.name,
        tier: org.tier,
        role: membership.role,
        seat_limit: org.seat_limit ?? 1,
        member_count: count ?? 0,
        stripe_subscription_id: org.stripe_subscription_id ?? null,
      }];
    }),
  );
  const organizations: OrganizationEntitlementSummary[] = organizationLists.flat();

  const activeOrg = organizations[0] ?? null;
  const entitlements = getCommercialEntitlements(user.tier);
  const limits = getCommercialLimits(user.tier, activeOrg);

  return c.json({
    id: user.id,
    email: user.email,
    username: user.username,
    display_name: user.display_name,
    tier: user.tier,
    entitlements,
    limits,
    reputation_score: user.reputation_score,
    trusted: user.trusted,
    org_slug: activeOrg?.slug ?? null,
    organizations,
    created_at: user.created_at,
    updated_at: user.updated_at,
  });
});

// PATCH /v1/me
authRoutes.patch('/me', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const body = await c.req.json();

  const updates: Record<string, unknown> = {};

  if (body.email && typeof body.email === 'string') {
    updates.email = body.email;
  }

  if (body.display_name && typeof body.display_name === 'string') {
    updates.display_name = body.display_name;
  }

  if (body.username !== undefined) {
    const username = String(body.username).toLowerCase().trim();

    // Validate format: 3-30 chars, lowercase alphanumeric + hyphens, no leading/trailing hyphens
    if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(username)) {
      return c.json({
        error: 'Username must be 3-30 characters, lowercase alphanumeric and hyphens only, cannot start or end with a hyphen',
      }, 400);
    }

    // Check uniqueness
    const client = createAdminClient();
    const { data: existing } = await client
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', auth.user!.id)
      .maybeSingle();

    if (existing) {
      return c.json({ error: 'Username is already taken' }, 409);
    }

    updates.username = username;
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }

  const client = createAdminClient();
  const { data, error } = await client
    .from('users')
    .update(updates)
    .eq('id', auth.user!.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505' && error.message.includes('username')) {
      return c.json({ error: 'Username is already taken' }, 409);
    }
    return c.json({ error: 'Failed to update profile' }, 500);
  }

  return c.json(data);
});

// GET /v1/api-keys
authRoutes.get('/api-keys', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const client = createAdminClient();

  const { data: memberships } = await client
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', auth.user!.id);

  const accessibleOrgIds = (memberships ?? [])
    .filter((membership: any) => ['owner', 'admin'].includes(membership.role))
    .map((membership: any) => membership.org_id);

  const { data: ownKeys, error: ownError } = await client
    .from('api_keys')
    .select('id, name, scopes, org_id, created_at, last_used_at, revoked_at')
    .eq('user_id', auth.user!.id)
    .order('created_at', { ascending: false });

  if (ownError) {
    return c.json({ error: 'Failed to fetch API keys' }, 500);
  }

  let orgKeys: Array<Record<string, unknown>> = [];
  if (accessibleOrgIds.length > 0) {
    const { data: rawOrgKeys, error: orgError } = await client
      .from('api_keys')
      .select('id, name, scopes, org_id, created_at, last_used_at, revoked_at')
      .in('org_id', accessibleOrgIds)
      .order('created_at', { ascending: false });

    if (orgError) {
      return c.json({ error: 'Failed to fetch API keys' }, 500);
    }
    orgKeys = rawOrgKeys ?? [];
  }

  const merged = new Map<string, Record<string, unknown>>();
  for (const item of [...(ownKeys ?? []), ...orgKeys]) {
    merged.set(String(item.id), item);
  }

  return c.json({ items: Array.from(merged.values()) });
});

// POST /v1/api-keys
authRoutes.post('/api-keys', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const body = await c.req.json();

  if (!body.name || typeof body.name !== 'string') {
    return c.json({ error: 'name is required' }, 400);
  }

  const scopes = Array.isArray(body.scopes) ? body.scopes : ['read'];
  const orgId = typeof body.org_id === 'string' && body.org_id.length > 0 ? body.org_id : null;

  const client = createAdminClient();

  if (orgId) {
    const { data: membership } = await client
      .from('org_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', auth.user!.id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return c.json({ error: 'Organization API keys require owner or admin role.' }, 403);
    }
  }

  // Generate API key
  const rawKey = `dctr_${randomBytes(32).toString('hex')}`;
  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  const { data, error } = await client
    .from('api_keys')
    .insert({
      user_id: auth.user!.id,
      org_id: orgId,
      key_hash: keyHash,
      name: body.name,
      scopes,
    })
    .select('id, name, scopes, created_at')
    .single();

  if (error) {
    return c.json({ error: 'Failed to create API key' }, 500);
  }

  await recordAuditEvent({
    actor_user_id: auth.user!.id,
    org_id: orgId,
    scope: 'user',
    action: orgId ? 'api_key.created_for_org' : 'api_key.created',
    target_type: 'api_key',
    target_id: data.id,
    details: {
      scopes,
      org_id: orgId,
      name: body.name,
    },
  });

  // Return the raw key ONCE (it's hashed in the DB, can't be retrieved later)
  return c.json({
    ...data,
    key: rawKey,
      warning: 'Save this key now. It cannot be retrieved again.',
  }, 201);
});

// DELETE /v1/api-keys/:id
authRoutes.delete('/api-keys/:id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const keyId = c.req.param('id');

  const client = createAdminClient();
  const { data: keyRow } = await client
    .from('api_keys')
    .select('id, user_id, org_id')
    .eq('id', keyId)
    .single();

  if (!keyRow) {
    return c.json({ error: 'API key not found' }, 404);
  }

  let allowed = keyRow.user_id === auth.user!.id;
  if (!allowed && keyRow.org_id) {
    const { data: membership } = await client
      .from('org_members')
      .select('role')
      .eq('org_id', keyRow.org_id)
      .eq('user_id', auth.user!.id)
      .single();

    allowed = Boolean(membership && ['owner', 'admin'].includes(membership.role));
  }

  if (!allowed) {
    return c.json({ error: 'Not authorized to revoke this API key' }, 403);
  }

  const { error } = await client
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', keyId);

  if (error) {
    return c.json({ error: 'Failed to revoke API key' }, 500);
  }

  await recordAuditEvent({
    actor_user_id: auth.user!.id,
    scope: 'user',
    action: 'api_key.revoked',
    target_type: 'api_key',
    target_id: keyId,
    details: {},
  });

  return c.json({ message: 'API key revoked' });
});

// ---------------------------------------------------------------------------
// GDPR: Data Export (Right to Access — Article 15)
// ---------------------------------------------------------------------------
authRoutes.get('/me/export', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const userId = auth.user!.id;
  const client = createAdminClient();

  // Collect all user data in parallel
  const [
    userResult,
    contentResult,
    apiKeysResult,
    orgMembershipsResult,
    moderationResult,
  ] = await Promise.all([
    client.from('users').select('*').eq('id', userId).single(),
    client.from('content').select('id, type, slug, namespace, version, visibility, status, data, created_at, updated_at, published_at').eq('owner_id', userId),
    client.from('api_keys').select('id, name, scopes, created_at, last_used_at, revoked_at').eq('user_id', userId),
    client.from('org_members').select('org_id, role, created_at, organizations(name, slug)').eq('user_id', userId),
    client.from('moderation_queue').select('id, content_id, submitted_at, status, reviewed_at, rejection_reason').eq('submitted_by', userId),
  ]);

  return c.json({
    exported_at: new Date().toISOString(),
    user: userResult.data ?? null,
    content: contentResult.data ?? [],
    api_keys: apiKeysResult.data ?? [],
    organizations: orgMembershipsResult.data ?? [],
    moderation_history: moderationResult.data ?? [],
  });
});

// ---------------------------------------------------------------------------
// GDPR: Account Deletion (Right to Be Forgotten — Article 17)
// ---------------------------------------------------------------------------
authRoutes.delete('/me', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const userId = auth.user!.id;
  const client = createAdminClient();

  // 1. Look up user for Stripe customer ID
  const { data: user } = await client
    .from('users')
    .select('id, stripe_customer_id, tier')
    .eq('id', userId)
    .single();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  // 2. Cancel Stripe subscription if active
  if (user.stripe_customer_id) {
    try {
      const stripe = getStripe();
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'active',
      });
      for (const sub of subscriptions.data) {
        await stripe.subscriptions.cancel(sub.id);
      }
    } catch (e) {
      logger.error({ userId, err: e }, 'Failed to cancel Stripe subscriptions');
      // Continue with deletion — don't block GDPR on Stripe failure
    }
  }

  // 3. Clear moderation_queue references
  //    - submitted_by: delete rows (user's submissions)
  //    - reviewed_by: nullify (preserve audit trail)
  await client
    .from('moderation_queue')
    .delete()
    .eq('submitted_by', userId);

  await client
    .from('moderation_queue')
    .update({ reviewed_by: null })
    .eq('reviewed_by', userId);

  // 4. Delete all user content (content_versions cascade from content)
  await client
    .from('content')
    .delete()
    .eq('owner_id', userId);

  // 5. Delete the Supabase auth user — this cascades to:
  //    public.users → api_keys, organizations, org_members
  const { error: authError } = await client.auth.admin.deleteUser(userId);

  if (authError) {
    logger.error({ userId, error: authError.message }, 'Failed to delete auth user');
    return c.json({ error: 'Account deletion partially failed. Contact support.' }, 500);
  }

  return c.json({ message: 'Account deleted successfully' });
});
