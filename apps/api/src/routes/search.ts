import { Hono } from 'hono';
import type { Env } from '../types.js';
import { parsePagination } from '../types.js';
import type { ContentType } from '../types.js';
import { createAdminClient } from '../db/client.js';

export const searchRoutes = new Hono<Env>();

// GET /v1/search?q=dashboard&type=blueprints&namespace=@official
searchRoutes.get('/search', async (c) => {
  const query = c.req.query('q')?.toLowerCase();
  const typeFilter = c.req.query('type');
  const namespace = c.req.query('namespace');
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

  if (!query) {
    return c.json({ error: 'Query parameter "q" is required' }, 400);
  }

  const client = createAdminClient();

  // Map plural type filter to singular if provided
  let singularType: ContentType | undefined;
  if (typeFilter) {
    const typeMap: Record<string, ContentType> = {
      patterns: 'pattern', pattern: 'pattern',
      recipes: 'recipe', recipe: 'recipe',
      themes: 'theme', theme: 'theme',
      blueprints: 'blueprint', blueprint: 'blueprint',
      archetypes: 'archetype', archetype: 'archetype',
      shells: 'shell', shell: 'shell',
    };
    singularType = typeMap[typeFilter];
    if (!singularType) {
      return c.json({ error: `Invalid type filter: ${typeFilter}` }, 400);
    }
  }

  // Search in data->name and data->description using JSONB text search
  let dbQuery = client
    .from('content')
    .select('id, type, slug, namespace, version, data, published_at', { count: 'exact' })
    .eq('visibility', 'public')
    .eq('status', 'published')
    .or(`data->name.ilike.%${query}%,data->description.ilike.%${query}%,slug.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (singularType) {
    dbQuery = dbQuery.eq('type', singularType);
  }

  if (namespace) {
    dbQuery = dbQuery.eq('namespace', namespace);
  }

  const { data, error, count } = await dbQuery;

  if (error) {
    return c.json({ error: 'Search failed' }, 500);
  }

  return c.json({
    total: count ?? 0,
    limit,
    offset,
    results: (data ?? []).map((item) => ({
      type: item.type,
      id: item.slug,
      slug: item.slug,
      namespace: item.namespace,
      name: (item.data as Record<string, unknown>)?.name,
      description: (item.data as Record<string, unknown>)?.description,
    })),
  });
});
