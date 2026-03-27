import { Hono } from 'hono';
import { createHash, randomBytes } from 'crypto';
import type { Env } from '../types.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthContext } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';

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

  return c.json({
    id: user.id,
    email: user.email,
    tier: user.tier,
    reputation_score: user.reputation_score,
    trusted: user.trusted,
    created_at: user.created_at,
    updated_at: user.updated_at,
  });
});

// PATCH /v1/me
authRoutes.patch('/me', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const body = await c.req.json();

  // Only allow updating email (tier is managed by billing)
  const updates: Record<string, unknown> = {};
  if (body.email && typeof body.email === 'string') {
    updates.email = body.email;
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
