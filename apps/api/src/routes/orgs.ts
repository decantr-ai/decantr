import { Hono } from 'hono';
import type { Env } from '../types.js';
import { CONTENT_TYPES, parsePagination } from '../types.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthContext } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';

export const orgRoutes = new Hono<Env>();

orgRoutes.use('/*', requireAuth());

// GET /v1/orgs/:slug
orgRoutes.get('/orgs/:slug', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const client = createAdminClient();

  const { data: org, error } = await client
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  // Check membership
  const { data: membership } = await client
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', auth.user!.id)
    .single();

  if (!membership) {
    return c.json({ error: 'Not a member of this organization' }, 403);
  }

  // Get member count
  const { count } = await client
    .from('org_members')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', org.id);

  return c.json({
    id: org.id,
    name: org.name,
    slug: org.slug,
    tier: org.tier,
    member_count: count ?? 0,
    your_role: membership.role,
    created_at: org.created_at,
  });
});

// GET /v1/orgs/:slug/content
orgRoutes.get('/orgs/:slug/content', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));
  const client = createAdminClient();

  const { data: org } = await client
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single();

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  // Check membership
  const { data: membership } = await client
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', auth.user!.id)
    .single();

  if (!membership) {
    return c.json({ error: 'Not a member of this organization' }, 403);
  }

  const { data, error, count } = await client
    .from('content')
    .select('id, type, slug, namespace, visibility, status, version, data, created_at, updated_at, published_at', { count: 'exact' })
    .eq('org_id', org.id)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

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
    })),
  });
});

// POST /v1/orgs/:slug/content
orgRoutes.post('/orgs/:slug/content', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const body = await c.req.json();
  const client = createAdminClient();

  const { data: org } = await client
    .from('organizations')
    .select('id, slug')
    .eq('slug', slug)
    .single();

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  // Check admin/owner role
  const { data: membership } = await client
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', auth.user!.id)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return c.json({ error: 'Requires admin or owner role' }, 403);
  }

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
    return c.json({ error: 'data is required' }, 400);
  }

  const namespace = `@org:${org.slug}`;
  const visibility = body.visibility === 'public' ? 'public' : 'private';

  const { data, error } = await client
    .from('content')
    .insert({
      type: body.type,
      slug: body.slug,
      namespace,
      owner_id: auth.user!.id,
      org_id: org.id,
      visibility,
      status: 'published',
      version: body.version,
      data: body.data,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return c.json({ error: `Content "${namespace}/${body.type}/${body.slug}" already exists` }, 409);
    }
    return c.json({ error: 'Failed to publish content' }, 500);
  }

  return c.json(data, 201);
});

// POST /v1/orgs/:slug/members
orgRoutes.post('/orgs/:slug/members', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const body = await c.req.json();
  const client = createAdminClient();

  const { data: org } = await client
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single();

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  // Check admin/owner role
  const { data: membership } = await client
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', auth.user!.id)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return c.json({ error: 'Requires admin or owner role' }, 403);
  }

  if (!body.user_id || typeof body.user_id !== 'string') {
    return c.json({ error: 'user_id is required' }, 400);
  }

  const role = body.role === 'admin' ? 'admin' : 'member';

  const { data, error } = await client
    .from('org_members')
    .insert({
      org_id: org.id,
      user_id: body.user_id,
      role,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return c.json({ error: 'User is already a member' }, 409);
    }
    return c.json({ error: 'Failed to add member' }, 500);
  }

  return c.json(data, 201);
});

// PATCH /v1/orgs/:slug/members/:user_id
orgRoutes.patch('/orgs/:slug/members/:user_id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const targetUserId = c.req.param('user_id');
  const body = await c.req.json();
  const client = createAdminClient();

  const { data: org } = await client
    .from('organizations')
    .select('id, owner_id')
    .eq('slug', slug)
    .single();

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  // Only owner can change roles
  if (org.owner_id !== auth.user!.id) {
    return c.json({ error: 'Only the organization owner can change roles' }, 403);
  }

  if (!body.role || !['admin', 'member'].includes(body.role)) {
    return c.json({ error: 'role must be "admin" or "member"' }, 400);
  }

  const { data, error } = await client
    .from('org_members')
    .update({ role: body.role })
    .eq('org_id', org.id)
    .eq('user_id', targetUserId)
    .select()
    .single();

  if (error || !data) {
    return c.json({ error: 'Member not found' }, 404);
  }

  return c.json(data);
});

// DELETE /v1/orgs/:slug/members/:user_id
orgRoutes.delete('/orgs/:slug/members/:user_id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const targetUserId = c.req.param('user_id');
  const client = createAdminClient();

  const { data: org } = await client
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single();

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  // Check admin/owner role
  const { data: membership } = await client
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', auth.user!.id)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return c.json({ error: 'Requires admin or owner role' }, 403);
  }

  // Can't remove the owner
  const { data: targetMember } = await client
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', targetUserId)
    .single();

  if (targetMember?.role === 'owner') {
    return c.json({ error: 'Cannot remove the organization owner' }, 403);
  }

  const { error } = await client
    .from('org_members')
    .delete()
    .eq('org_id', org.id)
    .eq('user_id', targetUserId);

  if (error) {
    return c.json({ error: 'Failed to remove member' }, 500);
  }

  return c.json({ message: 'Member removed' });
});
