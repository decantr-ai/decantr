import { Hono } from 'hono';
import type { Env } from '../types.js';
import { createAdminClient } from '../db/client.js';
import { logger } from '../lib/logger.js';
import { buildRegistryIntelligenceSummary } from '../lib/registry-intelligence-summary.js';

export const intelligenceRoutes = new Hono<Env>();

intelligenceRoutes.get('/intelligence/summary', async (c) => {
  try {
    const namespace = c.req.query('namespace') ?? null;
    const client = createAdminClient();

    let query = client
      .from('content')
      .select('type, slug, namespace, data')
      .eq('visibility', 'public')
      .eq('status', 'published');

    if (namespace) {
      query = query.eq('namespace', namespace);
    }

    const { data, error } = await query;

    if (error) {
      logger.error({ err: error }, 'Registry intelligence summary error');
      return c.json({ error: 'Failed to compute registry intelligence summary' }, 500);
    }

    const summary = buildRegistryIntelligenceSummary(
      (data ?? []) as Array<{
        type: 'pattern' | 'theme' | 'blueprint' | 'archetype' | 'shell';
        slug: string;
        namespace: string;
        data?: Record<string, unknown> | null;
      }>,
      namespace,
    );

    c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=3600');
    return c.json(summary);
  } catch (e) {
    logger.error({ err: e }, 'Registry intelligence summary route error');
    return c.json({ error: 'Internal server error' }, 500);
  }
});
