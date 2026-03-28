import { Hono } from 'hono';
import type { Env } from '../types.js';
import { PLURAL_TO_SINGULAR, parsePagination } from '../types.js';
import { createAdminClient } from '../db/client.js';

export const contentRoutes = new Hono<Env>();

// GET /v1/:type/:namespace/:slug - Get single item (must be before list route)
contentRoutes.get('/:type{patterns|recipes|themes|blueprints|archetypes|shells}/:namespace/:slug', async (c) => {
  const pluralType = c.req.param('type');
  const namespace = c.req.param('namespace');
  const slug = c.req.param('slug');
  const singularType = PLURAL_TO_SINGULAR[pluralType];

  if (!singularType) {
    return c.json({ error: `Unknown content type: ${pluralType}` }, 400);
  }

  const client = createAdminClient();

  const { data, error } = await client
    .from('content')
    .select('*')
    .eq('type', singularType)
    .eq('namespace', namespace)
    .eq('slug', slug)
    .eq('visibility', 'public')
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return c.json({ error: `${singularType} "${namespace}/${slug}" not found` }, 404);
  }

  return c.json({
    id: data.id,
    type: data.type,
    slug: data.slug,
    namespace: data.namespace,
    version: data.version,
    visibility: data.visibility,
    status: data.status,
    data: data.data,
    created_at: data.created_at,
    updated_at: data.updated_at,
    published_at: data.published_at,
  });
});

// GET /v1/:type - List content (e.g., /v1/patterns, /v1/themes)
contentRoutes.get('/:type{patterns|recipes|themes|blueprints|archetypes|shells}', async (c) => {
  const pluralType = c.req.param('type');
  const singularType = PLURAL_TO_SINGULAR[pluralType];

  if (!singularType) {
    return c.json({ error: `Unknown content type: ${pluralType}` }, 400);
  }

  const namespace = c.req.query('namespace');
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

  const client = createAdminClient();

  let query = client
    .from('content')
    .select('id, type, slug, namespace, version, data, created_at, updated_at, published_at', { count: 'exact' })
    .eq('type', singularType)
    .eq('visibility', 'public')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (namespace) {
    query = query.eq('namespace', namespace);
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

// POST /v1/validate - Validate essence file
contentRoutes.post('/validate', async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const errors: string[] = [];

  if (!body.version) errors.push('Missing required field: version');
  if (!body.platform) errors.push('Missing required field: platform');
  if (!body.structure && !body.sections) errors.push('Missing required field: structure');

  return c.json({ valid: errors.length === 0, errors });
});
