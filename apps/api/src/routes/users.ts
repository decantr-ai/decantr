import { Hono } from 'hono';
import type { Env } from '../types.js';
import { parsePagination } from '../types.js';
import { CONTENT_TYPES } from '../types.js';
import type { ContentType } from '../types.js';
import { createAdminClient } from '../db/client.js';

export const userRoutes = new Hono<Env>();

// GET /v1/users/:username - Public profile
userRoutes.get('/users/:username', async (c) => {
  const username = c.req.param('username').toLowerCase();
  const client = createAdminClient();

  const { data: user, error } = await client
    .from('users')
    .select('username, display_name, reputation_score, tier, created_at')
    .eq('username', username)
    .single();

  if (error || !user) {
    return c.json({ error: `User "${username}" not found` }, 404);
  }

  // Get content counts by type
  const { data: contentRows } = await client
    .from('content')
    .select('type')
    .eq('owner_id', (
      await client.from('users').select('id').eq('username', username).single()
    ).data!.id)
    .eq('visibility', 'public')
    .eq('status', 'published');

  const contentCounts: Record<string, number> = {};
  let totalContent = 0;
  for (const row of contentRows ?? []) {
    contentCounts[row.type] = (contentCounts[row.type] || 0) + 1;
    totalContent++;
  }

  return c.json({
    username: user.username,
    display_name: user.display_name,
    reputation_score: user.reputation_score,
    tier: user.tier,
    created_at: user.created_at,
    content_count: totalContent,
    content_counts: contentCounts,
  });
});

// GET /v1/users/:username/content - User's published public content (paginated)
userRoutes.get('/users/:username/content', async (c) => {
  const username = c.req.param('username').toLowerCase();
  const rawTypeFilter = c.req.query('type');
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

  if (rawTypeFilter && !CONTENT_TYPES.includes(rawTypeFilter as ContentType)) {
    return c.json({ error: `Invalid type filter: ${rawTypeFilter}` }, 400);
  }

  const typeFilter = rawTypeFilter as ContentType | undefined;

  const client = createAdminClient();

  // Look up user ID from username
  const { data: user, error: userError } = await client
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (userError || !user) {
    return c.json({ error: `User "${username}" not found` }, 404);
  }

  let query = client
    .from('content')
    .select('id, type, slug, namespace, version, data, published_at', { count: 'exact' })
    .eq('owner_id', user.id)
    .eq('visibility', 'public')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (typeFilter) {
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
      version: item.version,
      name: (item.data as Record<string, unknown>)?.name,
      description: (item.data as Record<string, unknown>)?.description,
      published_at: item.published_at,
    })),
  });
});
