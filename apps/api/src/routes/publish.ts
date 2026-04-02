import { Hono } from 'hono';
import type { Env } from '../types.js';
import { CONTENT_TYPES, parsePagination } from '../types.js';
import type { ContentType } from '../types.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthContext } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';
import { validateEssence } from '@decantr/essence-spec';

export const publishRoutes = new Hono<Env>();

// All publish routes require auth
publishRoutes.use('/*', requireAuth());

// GET /v1/my/content - List own content
publishRoutes.get('/my/content', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));
  const typeFilter = c.req.query('type') as ContentType | undefined;

  const client = createAdminClient();

  let query = client
    .from('content')
    .select('id, type, slug, namespace, visibility, status, version, data, created_at, updated_at, published_at', { count: 'exact' })
    .eq('owner_id', auth.user!.id)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (typeFilter && CONTENT_TYPES.includes(typeFilter)) {
    query = query.eq('type', typeFilter);
  }

  const { data, error, count } = await query;

  if (error) {
    return c.json({ error: 'Failed to fetch content' }, 500);
  }

  return c.json({
    total: count ?? 0,
    limit,
    offset,
    items: (data ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      slug: item.slug,
      namespace: item.namespace,
      visibility: item.visibility,
      status: item.status,
      version: item.version,
      name: (item.data as Record<string, unknown>)?.name,
      description: (item.data as Record<string, unknown>)?.description,
      created_at: item.created_at,
      updated_at: item.updated_at,
      published_at: item.published_at,
    })),
  });
});

// POST /v1/content - Publish new content
publishRoutes.post('/content', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const body = await c.req.json();

  // Validate required fields
  if (!body.type || !CONTENT_TYPES.includes(body.type)) {
    return c.json({ error: `type must be one of: ${CONTENT_TYPES.join(', ')}` }, 400);
  }
  if (!body.slug || typeof body.slug !== 'string') {
    return c.json({ error: 'slug is required' }, 400);
  }
  if (!body.version || typeof body.version !== 'string') {
    return c.json({ error: 'version is required' }, 400);
  }
  if (!body.data || typeof body.data !== 'object') {
    return c.json({ error: 'data is required and must be an object' }, 400);
  }

  // Validate essence content data if the type is an essence document
  // (patterns, themes, etc. have their own data shapes, but
  // if the data looks like an essence document, validate it)
  if (body.data.version && (body.data.platform || body.data.dna)) {
    const validation = validateEssence(body.data);
    if (!validation.valid) {
      return c.json({
        error: 'Content data failed essence validation',
        validationErrors: validation.errors,
      }, 400);
    }
  }

  // Determine visibility
  const visibility = body.visibility === 'private' ? 'private' : 'public';

  // Private content requires Pro+ tier
  if (visibility === 'private' && auth.user!.tier === 'free') {
    return c.json({ error: 'Private content requires Pro tier or higher' }, 403);
  }

  // Spam prevention: max 5 pending submissions per user
  const client = createAdminClient();

  const { count: pendingCount } = await client
    .from('content')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', auth.user!.id)
    .eq('status', 'pending');

  if ((pendingCount ?? 0) >= 5) {
    return c.json({ error: 'Too many pending submissions. Wait for existing content to be reviewed.' }, 429);
  }

  // Determine namespace and status
  const namespace = body.namespace || '@community';
  let status: 'pending' | 'approved' | 'rejected' | 'published';

  if (namespace === '@official') {
    return c.json({ error: 'Cannot publish to @official namespace. Use admin sync.' }, 403);
  }

  // Trusted users publish instantly, others go to moderation
  if (auth.user!.trusted) {
    status = 'published';
  } else {
    status = 'pending';
  }

  const { data, error } = await client
    .from('content')
    .insert({
      type: body.type,
      slug: body.slug,
      namespace,
      owner_id: auth.user!.id,
      org_id: body.org_id || null,
      visibility,
      status,
      version: body.version,
      data: body.data,
      published_at: status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return c.json({ error: `Content "${namespace}/${body.type}/${body.slug}" already exists` }, 409);
    }
    return c.json({ error: 'Failed to publish content' }, 500);
  }

  // Also create version history entry
  await client.from('content_versions').insert({
    content_id: data.id,
    version: body.version,
    data: body.data,
    created_by: auth.user!.id,
  });

  const statusCode = status === 'published' ? 201 : 202;
  return c.json({
    ...data,
    message: status === 'pending'
      ? 'Content submitted for review. It will be published after approval.'
      : 'Content published successfully.',
  }, statusCode);
});

// PATCH /v1/content/:id - Update own content
publishRoutes.patch('/content/:id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const contentId = c.req.param('id');
  const body = await c.req.json();

  const client = createAdminClient();

  // Verify ownership
  const { data: existing } = await client
    .from('content')
    .select('id, owner_id')
    .eq('id', contentId)
    .single();

  if (!existing) {
    return c.json({ error: 'Content not found' }, 404);
  }

  if (existing.owner_id !== auth.user!.id) {
    return c.json({ error: 'Not authorized to update this content' }, 403);
  }

  const updates: Record<string, unknown> = {};
  if (body.data && typeof body.data === 'object') updates.data = body.data;
  if (body.version && typeof body.version === 'string') updates.version = body.version;
  if (body.visibility === 'public' || body.visibility === 'private') updates.visibility = body.visibility;

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }

  const { data, error } = await client
    .from('content')
    .update(updates)
    .eq('id', contentId)
    .select()
    .single();

  if (error) {
    return c.json({ error: 'Failed to update content' }, 500);
  }

  // Save version history if data or version changed
  if (updates.data || updates.version) {
    await client.from('content_versions').insert({
      content_id: contentId,
      version: (data.version as string),
      data: (data.data as Record<string, unknown>),
      created_by: auth.user!.id,
    });
  }

  return c.json(data);
});

// DELETE /v1/content/:id - Delete own content
publishRoutes.delete('/content/:id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const contentId = c.req.param('id');

  const client = createAdminClient();

  // Verify ownership
  const { data: existing } = await client
    .from('content')
    .select('id, owner_id')
    .eq('id', contentId)
    .single();

  if (!existing) {
    return c.json({ error: 'Content not found' }, 404);
  }

  if (existing.owner_id !== auth.user!.id) {
    return c.json({ error: 'Not authorized to delete this content' }, 403);
  }

  const { error } = await client
    .from('content')
    .delete()
    .eq('id', contentId);

  if (error) {
    return c.json({ error: 'Failed to delete content' }, 500);
  }

  return c.json({ message: 'Content deleted' });
});

// POST /v1/content/:id/flag - Flag content (deducts 2 reputation points from owner)
publishRoutes.post('/content/:id/flag', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const contentId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));

  const client = createAdminClient();

  // Verify content exists and is published
  const { data: content } = await client
    .from('content')
    .select('id, owner_id, status')
    .eq('id', contentId)
    .single();

  if (!content) {
    return c.json({ error: 'Content not found' }, 404);
  }

  if (content.status !== 'published') {
    return c.json({ error: 'Can only flag published content' }, 400);
  }

  // Prevent self-flagging
  if (content.owner_id === auth.user!.id) {
    return c.json({ error: 'Cannot flag your own content' }, 400);
  }

  // Record the flag (re-queue for moderation)
  await client
    .from('moderation_queue')
    .insert({
      content_id: contentId,
      submitted_by: content.owner_id,
      status: 'pending',
      rejection_reason: body.reason ? `Flagged: ${body.reason}` : 'Flagged by user',
    });

  // Deduct 2 reputation points from content owner
  const { data: owner } = await client
    .from('users')
    .select('id, reputation_score')
    .eq('id', content.owner_id)
    .single();

  if (owner) {
    await client
      .from('users')
      .update({ reputation_score: Math.max(0, owner.reputation_score - 2) })
      .eq('id', content.owner_id);
  }

  return c.json({ message: 'Content flagged for review' });
});
