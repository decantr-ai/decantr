import { Hono } from 'hono';
import type { Context } from 'hono';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, normalize } from 'node:path';
import { tmpdir } from 'node:os';
import { validateEssence } from '@decantr/essence-spec';
import type { EssenceFile } from '@decantr/essence-spec';
import { compileExecutionPackBundle } from '@decantr/core';
import type { RegistryItemResolvedProperties, RegistrySource } from '@decantr/telemetry';
import { auditProject, critiqueSource } from '@decantr/verifier';
import type { Env } from '../types.js';
import { createPublicContentResolver } from '../lib/content-resolver.js';
import { logger } from '../lib/logger.js';
import { emitApiTelemetry } from '../lib/telemetry.js';
import { requireApiKeyScope, requireAuth } from '../middleware/auth.js';

export const critiqueRoutes = new Hono<Env>();

const MAX_CRITIQUE_CODE_BYTES = 512 * 1024;
const MAX_TREATMENTS_CSS_BYTES = 256 * 1024;
const MAX_DIST_INDEX_HTML_BYTES = 1024 * 1024;
const MAX_DIST_ASSET_COUNT = 64;
const MAX_DIST_ASSET_BYTES = 1024 * 1024;
const MAX_DIST_TOTAL_BYTES = 5 * 1024 * 1024;
const MAX_SOURCE_FILE_COUNT = 128;
const MAX_SOURCE_FILE_BYTES = 256 * 1024;
const MAX_SOURCE_TOTAL_BYTES = 3 * 1024 * 1024;
const HOSTED_AUDIT_TIMEOUT_MS = 10_000;

const HOSTED_SOURCE_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
]);

const HOSTED_DIST_EXTENSIONS = new Set([
  '.css',
  '.gif',
  '.html',
  '.jpeg',
  '.jpg',
  '.js',
  '.json',
  '.mjs',
  '.png',
  '.svg',
  '.webp',
  '.woff',
  '.woff2',
]);

critiqueRoutes.use('/*', requireAuth());
critiqueRoutes.use('/*', requireApiKeyScope('read'));

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

function isSourceSnapshot(value: unknown): value is { files: Record<string, string> } {
  return isRecord(value)
    && isRecord(value.files)
    && Object.values(value.files).every(entry => typeof entry === 'string');
}

function byteLength(value: string): number {
  return Buffer.byteLength(value, 'utf-8');
}

function reject(status: 413, error: string): { status: 413; error: string };
function reject(status: 422, error: string): { status: 422; error: string };
function reject(status: 413 | 422, error: string): { status: 413 | 422; error: string } {
  return { status, error };
}

function validateStringBytes(
  label: string,
  value: string,
  maxBytes: number,
): { status: 413; error: string } | null {
  const bytes = byteLength(value);
  if (bytes > maxBytes) {
    return reject(413, `${label} exceeds the ${maxBytes} byte limit.`);
  }
  return null;
}

function normalizeHostedSnapshotFilePath(
  filePath: string,
  allowedExtensions: Set<string>,
): string {
  if (filePath.length === 0 || filePath.length > 240) {
    throw new Error('Snapshot file paths must be between 1 and 240 characters.');
  }
  if (isAbsolute(filePath) || /^[a-zA-Z]:[/\\]/.test(filePath)) {
    throw new Error(`Snapshot file path is absolute: ${filePath}`);
  }

  const normalized = normalize(filePath).replace(/\\/g, '/');
  if (normalized === '.' || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`Snapshot file path escapes the project root: ${filePath}`);
  }

  const parts = normalized.split('/');
  if (parts.some(part => part === '.decantr')) {
    throw new Error(`Snapshot file path targets .decantr control files: ${filePath}`);
  }
  if (parts.some(part => part.startsWith('.'))) {
    throw new Error(`Snapshot file path targets a hidden control path: ${filePath}`);
  }

  const extension = extname(normalized).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw new Error(`Snapshot file path uses an unsupported extension: ${filePath}`);
  }

  return normalized;
}

function validateHostedFilePath(
  filePath: string,
  allowedExtensions: Set<string>,
): { status: 422; error: string } | null {
  try {
    normalizeHostedSnapshotFilePath(filePath, allowedExtensions);
    return null;
  } catch (err) {
    return reject(422, (err as Error).message);
  }
}

function validateDistSnapshotLimits(
  dist: { indexHtml: string; assets?: Record<string, string> },
): { status: 413 | 422; error: string } | null {
  const indexValidation = validateStringBytes('dist.indexHtml', dist.indexHtml, MAX_DIST_INDEX_HTML_BYTES);
  if (indexValidation) return indexValidation;

  const entries = Object.entries(dist.assets ?? {});
  if (entries.length > MAX_DIST_ASSET_COUNT) {
    return reject(413, `dist.assets exceeds the ${MAX_DIST_ASSET_COUNT} file limit.`);
  }

  let totalBytes = byteLength(dist.indexHtml);
  for (const [assetPath, contents] of entries) {
    const pathValidation = validateHostedFilePath(assetPath, HOSTED_DIST_EXTENSIONS);
    if (pathValidation) return pathValidation;
    const assetBytes = byteLength(contents);
    if (assetBytes > MAX_DIST_ASSET_BYTES) {
      return reject(413, `dist asset exceeds the ${MAX_DIST_ASSET_BYTES} byte limit: ${assetPath}`);
    }
    totalBytes += assetBytes;
  }

  if (totalBytes > MAX_DIST_TOTAL_BYTES) {
    return reject(413, `dist snapshot exceeds the ${MAX_DIST_TOTAL_BYTES} byte total limit.`);
  }

  return null;
}

function validateSourceSnapshotLimits(
  sources: { files: Record<string, string> },
): { status: 413 | 422; error: string } | null {
  const entries = Object.entries(sources.files);
  if (entries.length > MAX_SOURCE_FILE_COUNT) {
    return reject(413, `sources.files exceeds the ${MAX_SOURCE_FILE_COUNT} file limit.`);
  }

  let totalBytes = 0;
  for (const [filePath, contents] of entries) {
    const pathValidation = validateHostedFilePath(filePath, HOSTED_SOURCE_EXTENSIONS);
    if (pathValidation) return pathValidation;
    const fileBytes = byteLength(contents);
    if (fileBytes > MAX_SOURCE_FILE_BYTES) {
      return reject(413, `source file exceeds the ${MAX_SOURCE_FILE_BYTES} byte limit: ${filePath}`);
    }
    totalBytes += fileBytes;
  }

  if (totalBytes > MAX_SOURCE_TOTAL_BYTES) {
    return reject(413, `source snapshot exceeds the ${MAX_SOURCE_TOTAL_BYTES} byte total limit.`);
  }

  return null;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, rejectTimeout) => {
        timeout = setTimeout(() => {
          rejectTimeout(new Error(`Hosted analysis timed out after ${timeoutMs}ms.`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

async function materializeHostedAuditProject(
  essence: EssenceFile,
  namespace: string,
  resolveTelemetryOptions: Parameters<typeof createPublicContentResolver>[1],
  dist?: { indexHtml: string; assets?: Record<string, string> },
  sources?: { files: Record<string, string> },
): Promise<string> {
  const projectRoot = await mkdtemp(join(tmpdir(), 'decantr-hosted-audit-'));
  const contextDir = join(projectRoot, '.decantr', 'context');
  await mkdir(contextDir, { recursive: true });
  await writeFile(join(projectRoot, 'decantr.essence.json'), JSON.stringify(essence, null, 2) + '\n', 'utf-8');

  const bundle = await compileExecutionPackBundle(essence, {
    resolver: createPublicContentResolver(namespace, resolveTelemetryOptions),
  });

  await writeFile(join(contextDir, 'review-pack.json'), JSON.stringify(bundle.review, null, 2) + '\n', 'utf-8');
  await writeFile(join(contextDir, 'pack-manifest.json'), JSON.stringify(bundle.manifest, null, 2) + '\n', 'utf-8');

  if (dist) {
    const distDir = join(projectRoot, 'dist');
    await mkdir(distDir, { recursive: true });
    await writeFile(join(distDir, 'index.html'), dist.indexHtml, 'utf-8');

    for (const [assetPath, contents] of Object.entries(dist.assets ?? {})) {
      const normalizedAssetPath = normalizeHostedSnapshotFilePath(assetPath, HOSTED_DIST_EXTENSIONS);
      const destination = join(distDir, normalizedAssetPath);
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, contents, 'utf-8');
    }
  }

  if (sources) {
    for (const [filePath, contents] of Object.entries(sources.files)) {
      const normalizedFilePath = normalizeHostedSnapshotFilePath(filePath, HOSTED_SOURCE_EXTENSIONS);
      const destination = join(projectRoot, normalizedFilePath);
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, contents, 'utf-8');
    }
  }

  return projectRoot;
}

critiqueRoutes.post('/critique/file', async (c) => {
  const startedAt = Date.now();
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
  const codeSizeValidation = validateStringBytes('code', code, MAX_CRITIQUE_CODE_BYTES);
  if (codeSizeValidation) {
    return c.json({ error: codeSizeValidation.error }, codeSizeValidation.status);
  }

  if (filePath != null && typeof filePath !== 'string') {
    return c.json({ error: 'filePath must be a string when provided.' }, 400);
  }
  if (typeof filePath === 'string' && filePath.length > 0) {
    const filePathValidation = validateHostedFilePath(filePath, HOSTED_SOURCE_EXTENSIONS);
    if (filePathValidation) {
      return c.json({ error: filePathValidation.error }, filePathValidation.status);
    }
  }

  if (treatmentsCss != null && typeof treatmentsCss !== 'string') {
    return c.json({ error: 'treatmentsCss must be a string when provided.' }, 400);
  }
  if (typeof treatmentsCss === 'string') {
    const treatmentsValidation = validateStringBytes('treatmentsCss', treatmentsCss, MAX_TREATMENTS_CSS_BYTES);
    if (treatmentsValidation) {
      return c.json({ error: treatmentsValidation.error }, treatmentsValidation.status);
    }
  }

  const preferredNamespace = c.req.query('namespace') || '@official';

  try {
    const report = await withTimeout((async () => {
      const bundle = await compileExecutionPackBundle(essence as unknown as EssenceFile, {
        resolver: createPublicContentResolver(preferredNamespace, createResolveTelemetryOptions(c)),
      });
      return critiqueSource({
        filePath: typeof filePath === 'string' && filePath.length > 0 ? filePath : 'Component.tsx',
        code,
        reviewPack: bundle.review,
        packManifest: bundle.manifest,
        treatmentsCss: typeof treatmentsCss === 'string' ? treatmentsCss : '',
      });
    })(), HOSTED_AUDIT_TIMEOUT_MS);

    c.header('Cache-Control', 'no-store');
    emitApiTelemetry(c, {
      name: 'critique.completed',
      context: {
        registrySource: registrySourceForNamespace(preferredNamespace),
      },
      properties: {
        scope: 'hosted',
        success: true,
        durationMs: Date.now() - startedAt,
        overall: report.overall,
        errorCount: countFindingsBySeverity(report.findings, 'error'),
        warnCount: countFindingsBySeverity(report.findings, 'warn'),
        infoCount: countFindingsBySeverity(report.findings, 'info'),
      },
    });
    return c.json(report);
  } catch (error) {
    emitApiTelemetry(c, {
      name: 'critique.completed',
      context: {
        registrySource: registrySourceForNamespace(preferredNamespace),
      },
      properties: {
        scope: 'hosted',
        success: false,
        durationMs: Date.now() - startedAt,
        errorCode: 'hosted_file_critique_failed',
      },
    });
    logger.error({ err: error }, 'Hosted file critique failed');
    return c.json({ error: (error as Error).message || 'Hosted file critique failed' }, 500);
  }
});

critiqueRoutes.post('/audit/project', async (c) => {
  const startedAt = Date.now();
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
  const sources = body.sources;

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
  if (dist != null) {
    const distValidation = validateDistSnapshotLimits(dist);
    if (distValidation) {
      return c.json({ error: distValidation.error }, distValidation.status);
    }
  }

  if (sources != null && !isSourceSnapshot(sources)) {
    return c.json({ error: 'sources must include a string-valued `files` object when provided.' }, 400);
  }
  if (sources != null) {
    const sourceValidation = validateSourceSnapshotLimits(sources);
    if (sourceValidation) {
      return c.json({ error: sourceValidation.error }, sourceValidation.status);
    }
  }

  const preferredNamespace = c.req.query('namespace') || '@official';

  let projectRoot: string | null = null;
  try {
    const report = await withTimeout((async () => {
      projectRoot = await materializeHostedAuditProject(
        essence as unknown as EssenceFile,
        preferredNamespace,
        createResolveTelemetryOptions(c),
        dist as { indexHtml: string; assets?: Record<string, string> } | undefined,
        sources as { files: Record<string, string> } | undefined,
      );
      return auditProject(projectRoot);
    })(), HOSTED_AUDIT_TIMEOUT_MS);

    c.header('Cache-Control', 'no-store');
    emitApiTelemetry(c, {
      name: 'audit.completed',
      context: {
        registrySource: registrySourceForNamespace(preferredNamespace),
      },
      properties: {
        scope: 'hosted',
        success: true,
        durationMs: Date.now() - startedAt,
        errorCount: report.summary.errorCount,
        warnCount: report.summary.warnCount,
        pageCount: report.summary.pageCount,
        runtimePassed: report.summary.runtimePassed,
      },
    });
    return c.json({
      ...report,
      projectRoot: '[hosted-audit]',
    });
  } catch (error) {
    emitApiTelemetry(c, {
      name: 'audit.completed',
      context: {
        registrySource: registrySourceForNamespace(preferredNamespace),
      },
      properties: {
        scope: 'hosted',
        success: false,
        durationMs: Date.now() - startedAt,
        errorCode: 'hosted_project_audit_failed',
      },
    });
    logger.error({ err: error }, 'Hosted project audit failed');
    return c.json({ error: (error as Error).message || 'Hosted project audit failed' }, 500);
  } finally {
    if (projectRoot) {
      await rm(projectRoot, { recursive: true, force: true }).catch(() => undefined);
    }
  }
});

function countFindingsBySeverity(
  findings: Array<{ severity?: string }>,
  severity: 'error' | 'info' | 'warn',
): number {
  return findings.filter(finding => finding.severity === severity).length;
}

function registrySourceForNamespace(namespace: string): 'custom' | 'official' {
  return namespace === '@official' ? 'official' : 'custom';
}

function createResolveTelemetryOptions(c: Context<Env>) {
  return {
    onResolve(properties: RegistryItemResolvedProperties) {
      emitApiTelemetry(c, {
        name: 'registry.item.resolved',
        context: {
          registrySource: isRegistrySource(properties.registrySource) ? properties.registrySource : undefined,
        },
        properties,
      });
    },
  };
}

function isRegistrySource(value: unknown): value is RegistrySource {
  return value === 'cache'
    || value === 'custom'
    || value === 'none'
    || value === 'official'
    || value === 'private';
}
