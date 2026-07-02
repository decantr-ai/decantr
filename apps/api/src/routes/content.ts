import { Hono } from 'hono';
import {
  getContentRecord,
  isContentIntelligenceSource,
  isPublicBlueprintSet,
  isPublicContentSource,
  listContentRecords,
  OFFICIAL_CONTENT_NAMESPACE,
  type ContentIntelligenceSource,
  type PublicBlueprintSet,
  type PublicContentSource,
} from '@decantr/content';
import { isV4, validateEssence } from '@decantr/essence-spec';
import type { Env } from '../types.js';
import { API_CONTENT_TYPES, PLURAL_TO_SINGULAR, isApiContentType, parsePagination } from '../types.js';
import { logger } from '../lib/logger.js';

export const contentRoutes = new Hono<Env>();
const CONTENT_ROUTE_PATTERN = API_CONTENT_TYPES.join('|');

contentRoutes.get(`/:type{${CONTENT_ROUTE_PATTERN}}/:namespace/:slug/thumbnail`, (c) => (
  c.json({ error: 'Thumbnail assets are not served by the content API.' }, 404)
));

contentRoutes.get(`/:type{${CONTENT_ROUTE_PATTERN}}/:namespace/:slug`, (c) => {
  try {
    const pluralType = c.req.param('type');
    const namespace = c.req.param('namespace');
    const slug = c.req.param('slug');

    if (!isApiContentType(pluralType)) {
      return c.json({ error: `Unknown content type: ${pluralType}` }, 400);
    }

    const record = getContentRecord(PLURAL_TO_SINGULAR[pluralType], slug, namespace);
    if (!record) {
      return c.json({ error: `${PLURAL_TO_SINGULAR[pluralType]} "${namespace}/${slug}" not found` }, 404);
    }

    c.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
    return c.json(record);
  } catch (e) {
    logger.error({ err: e }, 'Content route error');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

contentRoutes.get(`/:type{${CONTENT_ROUTE_PATTERN}}`, (c) => {
  try {
    const pluralType = c.req.param('type');
    if (!isApiContentType(pluralType)) {
      return c.json({ error: `Unknown content type: ${pluralType}` }, 400);
    }

    const namespace = c.req.query('namespace') || OFFICIAL_CONTENT_NAMESPACE;
    const rawSource = c.req.query('source');
    const rawIntelligenceSource = c.req.query('intelligence_source');
    const rawBlueprintSet = c.req.query('blueprint_set');
    const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

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

    const result = listContentRecords({
      type: pluralType,
      namespace,
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
    return c.json(result);
  } catch (e) {
    logger.error({ err: e }, 'Content list error');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

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
  const isV4Doc = typeof body === 'object'
    && body !== null
    && 'version' in body
    && 'dna' in body
    && 'blueprint' in body
    ? isV4(body as never)
    : false;

  return c.json({
    valid: result.valid,
    errors: result.errors,
    version: version ?? null,
    schemaVersion: isV4Doc ? 'v4' : 'legacy',
  });
});
