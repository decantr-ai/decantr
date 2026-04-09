import { Hono } from 'hono';
import type { Env } from '../types.js';
import { API_CONTENT_TYPES, PLURAL_TO_SINGULAR, isApiContentType, parsePagination } from '../types.js';
import { createAdminClient } from '../db/client.js';
import { validateEssence, isV3 } from '@decantr/essence-spec';
import { logger } from '../lib/logger.js';
import { getContentIntelligence } from '../lib/content-intelligence.js';
import { applyPublicContentOrdering } from '../lib/public-content-ordering.js';

export const contentRoutes = new Hono<Env>();
const CONTENT_ROUTE_PATTERN = API_CONTENT_TYPES.join('|');

function getSummaryText(
  data: Record<string, unknown> | null | undefined,
  key: 'name' | 'description',
): string | undefined {
  const value = data?.[key];
  return typeof value === 'string' ? value : undefined;
}

// GET /v1/:type/:namespace/:slug - Get single item (must be before list route)
contentRoutes.get(`/:type{${CONTENT_ROUTE_PATTERN}}/:namespace/:slug`, async (c) => {
  try {
    const pluralType = c.req.param('type');
    const namespace = c.req.param('namespace');
    const slug = c.req.param('slug');

    if (!isApiContentType(pluralType)) {
      return c.json({ error: `Unknown content type: ${pluralType}` }, 400);
    }
    const singularType = PLURAL_TO_SINGULAR[pluralType];

    const client = createAdminClient();

    const { data, error } = await client
      .from('content')
      .select('*, owner:users!owner_id(display_name, username)')
      .eq('type', singularType)
      .eq('namespace', namespace)
      .eq('slug', slug)
      .eq('visibility', 'public')
      .eq('status', 'published')
      .single();

    if (error || !data) {
      return c.json({ error: `${singularType} "${namespace}/${slug}" not found` }, 404);
    }

    c.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
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
      owner_name: (data as any).owner?.display_name || null,
      owner_username: (data as any).owner?.username || null,
      intelligence: getContentIntelligence(singularType, data.namespace, data.slug),
    });
  } catch (e) {
    logger.error({ err: e }, 'Content route error');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /v1/:type - List content (e.g., /v1/patterns, /v1/themes)
contentRoutes.get(`/:type{${CONTENT_ROUTE_PATTERN}}`, async (c) => {
  try {
    const pluralType = c.req.param('type');

    if (!isApiContentType(pluralType)) {
      return c.json({ error: `Unknown content type: ${pluralType}` }, 400);
    }
    const singularType = PLURAL_TO_SINGULAR[pluralType];

    const namespace = c.req.query('namespace');
    const sort = c.req.query('sort') ?? undefined;
    const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

    const client = createAdminClient();

    let query = client
      .from('content')
      .select('id, type, slug, namespace, version, data, created_at, updated_at, published_at, owner:users!owner_id(display_name, username)', { count: 'exact' })
      .eq('type', singularType)
      .eq('visibility', 'public')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (namespace) {
      query = query.eq('namespace', namespace);
    }

    const { data, error, count } = await query;

    if (error) {
      return c.json({ error: 'Failed to fetch content' }, 500);
    }

    c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=3600');
    const mappedItems = (data ?? []).map((item) => {
      const itemData = item.data as Record<string, unknown> | null | undefined;
      return {
        id: item.id,
        type: item.type,
        slug: item.slug,
        namespace: item.namespace,
        version: item.version,
        name: getSummaryText(itemData, 'name'),
        description: getSummaryText(itemData, 'description'),
        published_at: item.published_at ?? undefined,
        owner_name: (item as any).owner?.display_name || null,
        owner_username: (item as any).owner?.username || null,
        intelligence: getContentIntelligence(singularType, item.namespace, item.slug),
      };
    });
    const ordered = applyPublicContentOrdering(mappedItems, sort, limit, offset);
    return c.json({
      total: count ?? 0,
      limit,
      offset,
      items: ordered.items,
    });
  } catch (e) {
    logger.error({ err: e }, 'Content list error');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /v1/validate - Validate essence file (supports both v2 and v3)
contentRoutes.post('/validate', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const result = validateEssence(body);
  const version = typeof body === 'object' && body !== null && 'version' in body
    ? (body as Record<string, unknown>).version
    : undefined;
  const isV3Doc = typeof body === 'object' && body !== null && 'version' in body && 'dna' in body && 'blueprint' in body
    ? isV3(body as any)
    : false;

  return c.json({
    valid: result.valid,
    errors: result.errors,
    version: version ?? null,
    schemaVersion: isV3Doc ? 'v3' : 'v2',
  });
});
