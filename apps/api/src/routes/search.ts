import { Hono } from 'hono';
import {
  isContentIntelligenceSource,
  isPublicBlueprintSet,
  isPublicContentSource,
  searchContent,
  type ContentIntelligenceSource,
  type PublicBlueprintSet,
  type PublicContentSource,
} from '@decantr/content';
import type { Env } from '../types.js';
import { isApiContentType, isContentType, parsePagination } from '../types.js';
import { logger } from '../lib/logger.js';

export const searchRoutes = new Hono<Env>();

searchRoutes.get('/search', (c) => {
  try {
    const query = c.req.query('q');
    const typeFilter = c.req.query('type');
    const namespace = c.req.query('namespace');
    const rawSource = c.req.query('source');
    const rawIntelligenceSource = c.req.query('intelligence_source');
    const rawBlueprintSet = c.req.query('blueprint_set');
    const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

    if (!query) {
      return c.json({ error: 'Query parameter "q" is required' }, 400);
    }
    if (typeFilter && !isApiContentType(typeFilter) && !isContentType(typeFilter)) {
      return c.json({ error: `Invalid type filter: ${typeFilter}` }, 400);
    }
    if (rawSource && !isPublicContentSource(rawSource)) {
      return c.json({ error: `Invalid source filter: ${rawSource}` }, 400);
    }
    if (rawIntelligenceSource && !isContentIntelligenceSource(rawIntelligenceSource)) {
      return c.json({ error: `Invalid intelligence source: ${rawIntelligenceSource}` }, 400);
    }
    if (rawBlueprintSet && !isPublicBlueprintSet(rawBlueprintSet)) {
      return c.json({ error: `Invalid blueprint set: ${rawBlueprintSet}` }, 400);
    }

    const source: PublicContentSource | undefined =
      rawSource && isPublicContentSource(rawSource) ? rawSource : undefined;
    const intelligenceSource: ContentIntelligenceSource | undefined =
      rawIntelligenceSource && isContentIntelligenceSource(rawIntelligenceSource)
        ? rawIntelligenceSource
        : undefined;
    const blueprintSet: PublicBlueprintSet =
      rawBlueprintSet && isPublicBlueprintSet(rawBlueprintSet) ? rawBlueprintSet : 'all';

    const response = searchContent({
      q: query,
      type: typeFilter && (isApiContentType(typeFilter) || isContentType(typeFilter))
        ? typeFilter
        : undefined,
      namespace: namespace ?? undefined,
      source,
      sort: c.req.query('sort') ?? undefined,
      recommended: c.req.query('recommended') === 'true',
      intelligenceSource,
      blueprintSet,
      labs: c.req.query('labs') === 'true',
      limit,
      offset,
    });

    c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=3600');
    return c.json(response);
  } catch (e) {
    logger.error({ err: e }, 'Search route error');
    return c.json({ error: 'Search failed' }, 500);
  }
});
