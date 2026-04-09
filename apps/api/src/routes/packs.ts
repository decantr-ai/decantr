import { Hono } from 'hono';
import { validateEssence } from '@decantr/essence-spec';
import type { EssenceFile } from '@decantr/essence-spec';
import { compileExecutionPackBundle, compileSelectedExecutionPack } from '@decantr/core';
import type { ExecutionPackType } from '@decantr/core';
import type { Env } from '../types.js';
import { createPublicContentResolver } from '../lib/content-resolver.js';
import { logger } from '../lib/logger.js';

export const packRoutes = new Hono<Env>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isExecutionPackType(value: unknown): value is ExecutionPackType {
  return value === 'scaffold'
    || value === 'section'
    || value === 'page'
    || value === 'mutation'
    || value === 'review';
}

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

packRoutes.post('/packs/select', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!isRecord(body) || !('essence' in body)) {
    return c.json({ error: 'Body must include an essence document.' }, 400);
  }

  if (!isExecutionPackType(body.pack_type)) {
    return c.json({ error: 'Body must include a valid pack_type.' }, 400);
  }

  const packType = body.pack_type as ExecutionPackType;
  const id = typeof body.id === 'string' ? body.id : undefined;

  if ((packType === 'section' || packType === 'page' || packType === 'mutation') && !id) {
    return c.json({ error: `Body must include id for pack_type "${packType}".` }, 400);
  }

  const validation = validateEssence(body.essence);
  if (!validation.valid) {
    return c.json({
      error: 'Essence failed validation',
      validationErrors: validation.errors,
    }, 400);
  }

  const preferredNamespace = c.req.query('namespace') || '@official';

  try {
    const selected = await compileSelectedExecutionPack(body.essence as EssenceFile, {
      packType,
      id,
    }, {
      resolver: createPublicContentResolver(preferredNamespace),
    });

    if (!selected) {
      return c.json({ error: `Requested ${packType} pack was not found.` }, 404);
    }

    c.header('Cache-Control', 'no-store');
    return c.json(selected);
  } catch (error) {
    logger.error({ err: error }, 'Execution pack selection failed');
    return c.json({ error: (error as Error).message || 'Execution pack selection failed' }, 500);
  }
});
