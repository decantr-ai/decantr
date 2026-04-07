import { Hono } from 'hono';
import { createHash, randomBytes } from 'crypto';
import type { Env } from '../types.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthContext } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';
import { getStripe } from '../stripe/client.js';
import { logger } from '../lib/logger.js';

export const authRoutes = new Hono<Env>();

// All auth routes require authentication
authRoutes.use('/*', requireAuth());

// GET /v1/me
authRoutes.get('/me', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const client = createAdminClient();

  const { data: user, error } = await client
    .from('users')
    .select('*')
    .eq('id', auth.user!.id)
    .single();

  if (error || !user) {
    return c.json({ error: 'User not found' }, 404);
  }

  // Find user's org membership
  let orgSlug: string | null = null;
  const { data: membership } = await client
    .from('org_members')
    .select('org_id, role, organizations(slug)')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (membership && (membership as any).organizations) {
    orgSlug = (membership as any).organizations.slug;
  }

  return c.json({
    id: user.id,
    email: user.email,
    username: user.username,
    display_name: user.display_name,
    tier: user.tier,
    reputation_score: user.reputation_score,
    trusted: user.trusted,
    org_slug: orgSlug,
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

  const { data, error } = await client
    .from('api_keys')
    .select('id, name, scopes, created_at, last_used_at, revoked_at')
    .eq('user_id', auth.user!.id)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ error: 'Failed to fetch API keys' }, 500);
  }

  return c.json({ items: data ?? [] });
});

// POST /v1/api-keys
authRoutes.post('/api-keys', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const body = await c.req.json();

  if (!body.name || typeof body.name !== 'string') {
    return c.json({ error: 'name is required' }, 400);
  }

  const scopes = Array.isArray(body.scopes) ? body.scopes : ['read'];

  // Generate API key
  const rawKey = `dctr_${randomBytes(32).toString('hex')}`;
  const keyHash = createHash('sha256').update(rawKey).digest('hex');

  const client = createAdminClient();
  const { data, error } = await client
    .from('api_keys')
    .insert({
      user_id: auth.user!.id,
      org_id: body.org_id || null,
      key_hash: keyHash,
      name: body.name,
      scopes,
    })
    .select('id, name, scopes, created_at')
    .single();

  if (error) {
    return c.json({ error: 'Failed to create API key' }, 500);
  }

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
  const { error } = await client
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', keyId)
    .eq('user_id', auth.user!.id);

  if (error) {
    return c.json({ error: 'Failed to revoke API key' }, 500);
  }

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
