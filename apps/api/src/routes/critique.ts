import { Hono } from 'hono';
import { validateEssence } from '@decantr/essence-spec';
import type { EssenceFile } from '@decantr/essence-spec';
import { compileExecutionPackBundle } from '@decantr/core';
import { critiqueSource } from '@decantr/verifier';
import type { Env } from '../types.js';
import { createPublicContentResolver } from '../lib/content-resolver.js';
import { logger } from '../lib/logger.js';

export const critiqueRoutes = new Hono<Env>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

critiqueRoutes.post('/critique/file', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!isRecord(body)) {
    return c.json({ error: 'Request body must be an object' }, 400);
  }

  const essence = body.essence;
  const code = body.code;
  const filePath = body.filePath;
  const treatmentsCss = body.treatmentsCss;

  if (!isRecord(essence)) {
    return c.json({ error: 'Essence must be provided as an object on `essence`.' }, 400);
  }

  const validation = validateEssence(essence);
  if (!validation.valid) {
    return c.json({
      error: 'Essence failed validation',
      validationErrors: validation.errors,
    }, 400);
  }

  if (typeof code !== 'string' || code.trim().length === 0) {
    return c.json({ error: 'Code must be a non-empty string on `code`.' }, 400);
  }

  if (filePath != null && typeof filePath !== 'string') {
    return c.json({ error: 'filePath must be a string when provided.' }, 400);
  }

  if (treatmentsCss != null && typeof treatmentsCss !== 'string') {
    return c.json({ error: 'treatmentsCss must be a string when provided.' }, 400);
  }

  const preferredNamespace = c.req.query('namespace') || '@official';

  try {
    const bundle = await compileExecutionPackBundle(essence as unknown as EssenceFile, {
      resolver: createPublicContentResolver(preferredNamespace),
    });
    const report = critiqueSource({
      filePath: typeof filePath === 'string' && filePath.length > 0 ? filePath : 'Component.tsx',
      code,
      reviewPack: bundle.review,
      packManifest: bundle.manifest,
      treatmentsCss: typeof treatmentsCss === 'string' ? treatmentsCss : '',
    });

    c.header('Cache-Control', 'no-store');
    return c.json(report);
  } catch (error) {
    logger.error({ err: error }, 'Hosted file critique failed');
    return c.json({ error: (error as Error).message || 'Hosted file critique failed' }, 500);
  }
});
