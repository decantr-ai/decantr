import { Hono } from 'hono';
import type { Env } from '../types.js';
import { parsePagination } from '../types.js';
import type { ContentType } from '../types.js';
import { createAdminClient } from '../db/client.js';
import { logger } from '../lib/logger.js';

export const searchRoutes = new Hono<Env>();

searchRoutes.get('/search', async (c) => {
  const query = c.req.query('q');
  const typeFilter = c.req.query('type');
  const namespace = c.req.query('namespace');
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

  if (!query) {
    return c.json({ error: 'Query parameter "q" is required' }, 400);
  }

  // Map plural type filter to singular
  let singularType: string | null = null;
  if (typeFilter) {
    const typeMap: Record<string, string> = {
      patterns: 'pattern', pattern: 'pattern',
      themes: 'theme', theme: 'theme',
      blueprints: 'blueprint', blueprint: 'blueprint',
      archetypes: 'archetype', archetype: 'archetype',
      shells: 'shell', shell: 'shell',
    };
    singularType = typeMap[typeFilter] ?? null;
    if (typeFilter && !singularType) {
      return c.json({ error: `Invalid type filter: ${typeFilter}` }, 400);
    }
  }

  const client = createAdminClient();

  const { data, error } = await client.rpc('search_content', {
    search_query: query,
    content_type: singularType,
    content_namespace: namespace || null,
    result_limit: limit,
    result_offset: offset,
  });

  if (error) {
    logger.error({ err: error }, 'Search error');
    return c.json({ error: 'Search failed' }, 500);
  }

  const rows = data ?? [];
  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

  return c.json({
    total,
    limit,
    offset,
    results: rows.map((item: any) => ({
      type: item.type,
      id: item.slug,
      slug: item.slug,
      namespace: item.namespace,
      name: item.data?.name,
      description: item.data?.description,
      owner_name: item.owner_display_name || null,
      owner_username: item.owner_username || null,
    })),
  });
});
