import { Hono } from 'hono';
import { buildContentIntelligenceSummary } from '@decantr/content';
import type { Env } from '../types.js';
import { logger } from '../lib/logger.js';

export const intelligenceRoutes = new Hono<Env>();

intelligenceRoutes.get('/intelligence/summary', (c) => {
  try {
    const namespace = c.req.query('namespace') ?? '@official';
    const summary = buildContentIntelligenceSummary(namespace);

    c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=3600');
    return c.json(summary);
  } catch (e) {
    logger.error({ err: e }, 'Content intelligence summary route error');
    return c.json({ error: 'Failed to compute content intelligence summary' }, 500);
  }
});
