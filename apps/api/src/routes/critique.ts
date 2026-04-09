import { Hono } from 'hono';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, normalize } from 'node:path';
import { tmpdir } from 'node:os';
import { validateEssence } from '@decantr/essence-spec';
import type { EssenceFile } from '@decantr/essence-spec';
import { compileExecutionPackBundle } from '@decantr/core';
import { auditProject, critiqueSource } from '@decantr/verifier';
import type { Env } from '../types.js';
import { createPublicContentResolver } from '../lib/content-resolver.js';
import { logger } from '../lib/logger.js';

export const critiqueRoutes = new Hono<Env>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDistSnapshot(value: unknown): value is { indexHtml: string; assets?: Record<string, string> } {
  if (!isRecord(value) || typeof value.indexHtml !== 'string') {
    return false;
  }

  if (value.assets == null) {
    return true;
  }

  if (!isRecord(value.assets)) {
    return false;
  }

  return Object.values(value.assets).every(entry => typeof entry === 'string');
}

function normalizeSnapshotAssetPath(assetPath: string): string {
  return normalize(assetPath)
    .replace(/^[/\\]+/, '')
    .replace(/^(\.\.[/\\])+/, '');
}

async function materializeHostedAuditProject(
  essence: EssenceFile,
  namespace: string,
  dist?: { indexHtml: string; assets?: Record<string, string> },
): Promise<string> {
  const projectRoot = await mkdtemp(join(tmpdir(), 'decantr-hosted-audit-'));
  const contextDir = join(projectRoot, '.decantr', 'context');
  await mkdir(contextDir, { recursive: true });
  await writeFile(join(projectRoot, 'decantr.essence.json'), JSON.stringify(essence, null, 2) + '\n', 'utf-8');

  const bundle = await compileExecutionPackBundle(essence, {
    resolver: createPublicContentResolver(namespace),
  });

  await writeFile(join(contextDir, 'review-pack.json'), JSON.stringify(bundle.review, null, 2) + '\n', 'utf-8');
  await writeFile(join(contextDir, 'pack-manifest.json'), JSON.stringify(bundle.manifest, null, 2) + '\n', 'utf-8');

  if (dist) {
    const distDir = join(projectRoot, 'dist');
    await mkdir(distDir, { recursive: true });
    await writeFile(join(distDir, 'index.html'), dist.indexHtml, 'utf-8');

    for (const [assetPath, contents] of Object.entries(dist.assets ?? {})) {
      const normalizedAssetPath = normalizeSnapshotAssetPath(assetPath);
      const destination = join(distDir, normalizedAssetPath);
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, contents, 'utf-8');
    }
  }

  return projectRoot;
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

critiqueRoutes.post('/audit/project', async (c) => {
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
  const dist = body.dist;

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

  if (dist != null && !isDistSnapshot(dist)) {
    return c.json({ error: 'dist must include string `indexHtml` and optional string-valued `assets`.' }, 400);
  }

  const preferredNamespace = c.req.query('namespace') || '@official';

  let projectRoot: string | null = null;
  try {
    projectRoot = await materializeHostedAuditProject(
      essence as unknown as EssenceFile,
      preferredNamespace,
      dist as { indexHtml: string; assets?: Record<string, string> } | undefined,
    );
    const report = await auditProject(projectRoot);

    c.header('Cache-Control', 'no-store');
    return c.json({
      ...report,
      projectRoot: '[hosted-audit]',
    });
  } catch (error) {
    logger.error({ err: error }, 'Hosted project audit failed');
    return c.json({ error: (error as Error).message || 'Hosted project audit failed' }, 500);
  } finally {
    if (projectRoot) {
      await rm(projectRoot, { recursive: true, force: true }).catch(() => undefined);
    }
  }
});
