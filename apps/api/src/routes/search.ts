import { Hono } from 'hono';
import {
  isContentIntelligenceSource,
  type ContentIntelligenceSource,
  CONTENT_TYPE_TO_API_CONTENT_TYPE,
} from '@decantr/registry';
import type { Env } from '../types.js';
import { PLURAL_TO_SINGULAR, isApiContentType, isContentType, parsePagination } from '../types.js';
import type { ContentType } from '../types.js';
import { createAdminClient } from '../db/client.js';
import { logger } from '../lib/logger.js';
import { getContentIntelligence } from '../lib/content-intelligence.js';
import { applyPublicContentOrdering } from '../lib/public-content-ordering.js';
import {
  getPublicApiBaseUrl,
  getPublicThumbnailUrl,
  isPublicContentSource,
  matchesPublicContentSource,
  type PublicContentSource,
} from '../lib/content-presentation.js';

export const searchRoutes = new Hono<Env>();

searchRoutes.get('/search', async (c) => {
  const query = c.req.query('q');
  const typeFilter = c.req.query('type');
  const namespace = c.req.query('namespace');
  const rawSource = c.req.query('source');
  const sort = c.req.query('sort') ?? undefined;
  const recommendedOnly = c.req.query('recommended') === 'true';
  const rawIntelligenceSource = c.req.query('intelligence_source');
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

  if (!query) {
    return c.json({ error: 'Query parameter "q" is required' }, 400);
  }

  if (rawSource && !isPublicContentSource(rawSource)) {
    return c.json({ error: `Invalid source filter: ${rawSource}` }, 400);
  }

  if (rawIntelligenceSource && !isContentIntelligenceSource(rawIntelligenceSource)) {
    return c.json({ error: `Invalid intelligence source: ${rawIntelligenceSource}` }, 400);
  }

  const source: PublicContentSource | undefined =
    rawSource && isPublicContentSource(rawSource)
      ? rawSource
      : undefined;
  const intelligenceSource: ContentIntelligenceSource | undefined =
    rawIntelligenceSource && isContentIntelligenceSource(rawIntelligenceSource)
      ? rawIntelligenceSource
      : undefined;

  // Map plural type filter to singular
  let singularType: ContentType | null = null;
  if (typeFilter) {
    singularType = isApiContentType(typeFilter)
      ? PLURAL_TO_SINGULAR[typeFilter]
      : isContentType(typeFilter)
        ? typeFilter
        : null;
    if (typeFilter && !singularType) {
      return c.json({ error: `Invalid type filter: ${typeFilter}` }, 400);
    }
  }

  const client = createAdminClient();
  const requestedCount =
    recommendedOnly || intelligenceSource ? 500 : Math.min(limit + offset, 500);

  const { data, error } = await client.rpc('search_content', {
    search_query: query,
    content_type: singularType,
    content_namespace: namespace || null,
    result_limit: requestedCount,
    result_offset: 0,
  });

  if (error) {
    logger.error({ err: error }, 'Search error');
    return c.json({ error: 'Search failed' }, 500);
  }

  const rows = data ?? [];
  const total = rows[0] ? Number(rows[0].total_count) : 0;
  const publicApiBaseUrl = getPublicApiBaseUrl(c.req.url);
  const mappedResults = rows.map((item: any) => ({
    type: item.type,
    id: item.slug,
    slug: item.slug,
    namespace: item.namespace,
    version: item.version ?? undefined,
    name: item.data?.name,
    description: item.data?.description,
    published_at: item.published_at ?? undefined,
    owner_name: item.owner_display_name || null,
    owner_username: item.owner_username || null,
    thumbnail_url: getPublicThumbnailUrl(
      publicApiBaseUrl,
      CONTENT_TYPE_TO_API_CONTENT_TYPE[item.type as keyof typeof CONTENT_TYPE_TO_API_CONTENT_TYPE],
      item.namespace,
      item.slug,
      item.data as Record<string, unknown> | null | undefined,
    ),
    intelligence: getContentIntelligence(
      item.type as ContentType,
      item.namespace,
      item.slug,
      item.data as Record<string, unknown> | null | undefined,
    ),
  }));
  const sourceFilteredResults = mappedResults.filter((item) =>
    matchesPublicContentSource(item.namespace, source),
  );
  const ordered = applyPublicContentOrdering(
    sourceFilteredResults,
    sort,
    recommendedOnly,
    intelligenceSource,
    limit,
    offset,
  );

  return c.json({
    total: recommendedOnly || intelligenceSource || source ? ordered.filteredTotal : total,
      limit,
      offset,
      results: ordered.items,
  });
});
