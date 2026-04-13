import { Hono } from 'hono';
import type { Env } from '../types.js';
import { CONTENT_TYPES, parsePagination } from '../types.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthContext } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';
import { validateRegistryContent } from '../lib/content-validation.js';
import { recordAuditEvent } from '../lib/audit-log.js';

export const orgRoutes = new Hono<Env>();

orgRoutes.use('/*', requireAuth());

async function requireOrgMembership(
  auth: AuthContext,
  slug: string,
) {
  const client = createAdminClient();
  const { data: org } = await client
    .from('organizations')
    .select('id, name, slug, tier, seat_limit')
    .eq('slug', slug)
    .single();

  if (!org) {
    return { client, org: null, membership: null };
  }

  const { data: membership } = await client
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', auth.user!.id)
    .single();

  return { client, org, membership };
}

// GET /v1/orgs/:slug
orgRoutes.get('/orgs/:slug', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const { client, org, membership } = await requireOrgMembership(auth, slug);

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

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
  const { client, org, membership } = await requireOrgMembership(auth, slug);

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

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

// GET /v1/orgs/:slug/members
orgRoutes.get('/orgs/:slug/members', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const { client, org, membership } = await requireOrgMembership(auth, slug);

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  if (!membership) {
    return c.json({ error: 'Not a member of this organization' }, 403);
  }

  const { data: members, error } = await client
    .from('org_members')
    .select('user_id, role, created_at, users(email, display_name, username)')
    .eq('org_id', org.id)
    .order('created_at', { ascending: true });

  if (error) {
    return c.json({ error: 'Failed to fetch members' }, 500);
  }

  return c.json({
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      tier: org.tier,
      seat_limit: org.seat_limit ?? 1,
    },
    your_role: membership.role,
    members: (members ?? []).map((member: any) => ({
      user_id: member.user_id,
      email: member.users?.email ?? '',
      display_name: member.users?.display_name ?? null,
      username: member.users?.username ?? null,
      role: member.role,
      created_at: member.created_at,
    })),
  });
});

// GET /v1/orgs/:slug/policy
orgRoutes.get('/orgs/:slug/policy', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const { client, org, membership } = await requireOrgMembership(auth, slug);

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  if (!membership) {
    return c.json({ error: 'Not a member of this organization' }, 403);
  }

  const { data: policy } = await client
    .from('organization_policies')
    .select('org_id, require_public_content_approval')
    .eq('org_id', org.id)
    .single();

  return c.json({
    org_id: org.id,
    require_public_content_approval: policy?.require_public_content_approval ?? false,
  });
});

// PATCH /v1/orgs/:slug/policy
orgRoutes.patch('/orgs/:slug/policy', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const body = await c.req.json();
  const { client, org, membership } = await requireOrgMembership(auth, slug);

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return c.json({ error: 'Requires admin or owner role' }, 403);
  }

  const { data, error } = await client
    .from('organization_policies')
    .upsert({
      org_id: org.id,
      require_public_content_approval: body.require_public_content_approval === true,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return c.json({ error: 'Failed to update organization policy' }, 500);
  }

  await recordAuditEvent({
    actor_user_id: auth.user!.id,
    org_id: org.id,
    scope: 'organization',
    action: 'policy.updated',
    target_type: 'organization_policy',
    target_id: org.id,
    details: {
      require_public_content_approval: data.require_public_content_approval,
    },
  });

  return c.json(data);
});

// POST /v1/orgs/:slug/content
orgRoutes.post('/orgs/:slug/content', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const body = await c.req.json();
  const { client, org, membership } = await requireOrgMembership(auth, slug);

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

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

  const contentValidation = validateRegistryContent(body.type, body.data);
  if (!contentValidation.valid) {
    return c.json({
      error: 'Content data failed registry schema validation',
      validationErrors: contentValidation.errors,
    }, 400);
  }

  const namespace = `@org:${org.slug}`;
  const visibility = body.visibility === 'public' ? 'public' : 'private';
  const { data: policy } = await client
    .from('organization_policies')
    .select('require_public_content_approval')
    .eq('org_id', org.id)
    .single();
  const requiresPublicApproval = policy?.require_public_content_approval === true;
  const status = visibility === 'public' && requiresPublicApproval ? 'pending' : 'published';

  const { data, error } = await client
    .from('content')
    .insert({
      type: body.type,
      slug: body.slug,
      namespace,
      owner_id: auth.user!.id,
      org_id: org.id,
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

  await recordAuditEvent({
    actor_user_id: auth.user!.id,
    org_id: org.id,
    scope: 'content',
    action: 'org_content.published',
    target_type: body.type,
    target_id: data.id,
    details: {
      slug: body.slug,
      namespace,
      visibility,
      status,
      version: body.version,
    },
  });

  return c.json({
    ...data,
    message:
      status === 'pending'
        ? 'Organization content submitted for approval.'
        : 'Organization content published successfully.',
  }, 201);
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

  // Accept user_id, email, or username (@username)
  let userId = body.user_id;
  const identifier = body.email || body.username;

  if (!userId && identifier) {
    const isUsername = identifier.startsWith('@');
    const lookupValue = isUsername ? identifier.slice(1) : identifier;
    const lookupField = isUsername ? 'username' : 'email';

    const { data: foundUser } = await client
      .from('users')
      .select('id')
      .eq(lookupField, lookupValue)
      .single();

    if (!foundUser) {
      return c.json({ error: `No user found with ${lookupField} "${identifier}". They need to sign up first.` }, 404);
    }
    userId = foundUser.id;
  }

  if (!userId || typeof userId !== 'string') {
    return c.json({ error: 'user_id, email, or username is required' }, 400);
  }

  const role = body.role === 'admin' ? 'admin' : 'member';

  const { data, error } = await client
    .from('org_members')
    .insert({
      org_id: org.id,
      user_id: userId,
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

  await recordAuditEvent({
    actor_user_id: auth.user!.id,
    org_id: org.id,
    scope: 'membership',
    action: 'member.invited',
    target_type: 'org_member',
    target_id: userId,
    details: {
      role,
      org_slug: slug,
    },
  });

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

  await recordAuditEvent({
    actor_user_id: auth.user!.id,
    org_id: org.id,
    scope: 'membership',
    action: 'member.role_updated',
    target_type: 'org_member',
    target_id: targetUserId,
    details: {
      role: body.role,
      org_slug: slug,
    },
  });

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

  await recordAuditEvent({
    actor_user_id: auth.user!.id,
    org_id: org.id,
    scope: 'membership',
    action: 'member.removed',
    target_type: 'org_member',
    target_id: targetUserId,
    details: {
      org_slug: slug,
    },
  });

  return c.json({ message: 'Member removed' });
});

// GET /v1/orgs/:slug/audit
orgRoutes.get('/orgs/:slug/audit', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));
  const { client, org, membership } = await requireOrgMembership(auth, slug);

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  if (!membership) {
    return c.json({ error: 'Not a member of this organization' }, 403);
  }

  const { data, error, count } = await client
    .from('audit_logs')
    .select('id, actor_user_id, org_id, scope, action, target_type, target_id, details, created_at', { count: 'exact' })
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return c.json({ error: 'Failed to fetch audit log' }, 500);
  }

  return c.json({
    total: count ?? 0,
    limit,
    offset,
    items: data ?? [],
  });
});

// GET /v1/orgs/:slug/approvals
orgRoutes.get('/orgs/:slug/approvals', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));
  const { client, org, membership } = await requireOrgMembership(auth, slug);

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return c.json({ error: 'Requires admin or owner role' }, 403);
  }

  const { data, error, count } = await client
    .from('content')
    .select('id, type, slug, namespace, visibility, status, version, data, created_at, updated_at, published_at', { count: 'exact' })
    .eq('org_id', org.id)
    .eq('status', 'pending')
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return c.json({ error: 'Failed to fetch approval queue' }, 500);
  }

  return c.json({
    total: count ?? 0,
    limit,
    offset,
    items: data ?? [],
  });
});

// POST /v1/orgs/:slug/approvals/:content_id/approve
orgRoutes.post('/orgs/:slug/approvals/:content_id/approve', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const contentId = c.req.param('content_id');
  const { client, org, membership } = await requireOrgMembership(auth, slug);

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return c.json({ error: 'Requires admin or owner role' }, 403);
  }

  const { data, error } = await client
    .from('content')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('org_id', org.id)
    .eq('id', contentId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error || !data) {
    return c.json({ error: 'Pending content not found' }, 404);
  }

  await recordAuditEvent({
    actor_user_id: auth.user!.id,
    org_id: org.id,
    scope: 'content',
    action: 'org_content.approved',
    target_type: data.type,
    target_id: contentId,
    details: {
      slug: data.slug,
      namespace: data.namespace,
    },
  });

  return c.json(data);
});

// POST /v1/orgs/:slug/approvals/:content_id/reject
orgRoutes.post('/orgs/:slug/approvals/:content_id/reject', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const contentId = c.req.param('content_id');
  const { client, org, membership } = await requireOrgMembership(auth, slug);

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return c.json({ error: 'Requires admin or owner role' }, 403);
  }

  const { data, error } = await client
    .from('content')
    .update({
      status: 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('org_id', org.id)
    .eq('id', contentId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error || !data) {
    return c.json({ error: 'Pending content not found' }, 404);
  }

  await recordAuditEvent({
    actor_user_id: auth.user!.id,
    org_id: org.id,
    scope: 'content',
    action: 'org_content.rejected',
    target_type: data.type,
    target_id: contentId,
    details: {
      slug: data.slug,
      namespace: data.namespace,
    },
  });

  return c.json(data);
});
