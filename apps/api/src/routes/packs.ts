import { Hono } from 'hono';
import { validateEssence } from '@decantr/essence-spec';
import type { EssenceFile } from '@decantr/essence-spec';
import { compileExecutionPackBundle } from '@decantr/core';
import type { Env } from '../types.js';
import { createPublicContentResolver } from '../lib/content-resolver.js';
import { logger } from '../lib/logger.js';

export const packRoutes = new Hono<Env>();

packRoutes.post('/packs/compile', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const validation = validateEssence(body);
  if (!validation.valid) {
    return c.json({
      error: 'Essence failed validation',
      validationErrors: validation.errors,
    }, 400);
  }

  const preferredNamespace = c.req.query('namespace') || '@official';

  try {
    const bundle = await compileExecutionPackBundle(body as EssenceFile, {
      resolver: createPublicContentResolver(preferredNamespace),
    });
    c.header('Cache-Control', 'no-store');
    return c.json(bundle);
  } catch (error) {
    logger.error({ err: error }, 'Execution pack compilation failed');
    return c.json({ error: (error as Error).message || 'Execution pack compilation failed' }, 500);
  }
});
