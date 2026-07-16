import { realpathSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { ContentAPIClient } from '@decantr/content';
import type { EssenceFile, EssenceV4 } from '@decantr/essence-spec';
import { isV4 } from '@decantr/essence-spec';

const MAX_INPUT_LENGTH = 1000;

export function validateStringArg(args: Record<string, unknown>, field: string): string | null {
  const val = args[field];
  if (!val || typeof val !== 'string') {
    return `Required parameter "${field}" must be a non-empty string.`;
  }
  if (val.length > MAX_INPUT_LENGTH) {
    return `Parameter "${field}" exceeds maximum length of ${MAX_INPUT_LENGTH} characters.`;
  }
  return null;
}

export function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 80;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length ? 60 : 0;
}

let _apiClient: ContentAPIClient | null = null;
let _publicApiClient: ContentAPIClient | null = null;

export function getAPIClient(): ContentAPIClient {
  if (!_apiClient) {
    _apiClient = new ContentAPIClient({
      baseUrl: process.env.DECANTR_API_URL || undefined,
      apiKey: process.env.DECANTR_API_KEY || undefined,
    });
  }
  return _apiClient;
}

export function getPublicAPIClient(): ContentAPIClient {
  if (!_publicApiClient) {
    _publicApiClient = new ContentAPIClient({
      baseUrl: process.env.DECANTR_API_URL || undefined,
    });
  }
  return _publicApiClient;
}

export function resetAPIClient(): void {
  _apiClient = null;
  _publicApiClient = null;
}

export function resolveWorkspacePath(inputPath: string, workspaceRoot = process.cwd()): string {
  const rawRoot = resolve(workspaceRoot);
  const resolvedPath = isAbsolute(inputPath) ? resolve(inputPath) : resolve(rawRoot, inputPath);
  const root = canonicalizeForContainment(rawRoot);
  const candidate = canonicalizeForContainment(resolvedPath);
  const relativePath = relative(root, candidate);

  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error(`Path escapes the active workspace root: ${inputPath}`);
  }

  return candidate;
}

function canonicalizeForContainment(path: string): string {
  const resolvedPath = resolve(path);
  try {
    return realpathSync.native(resolvedPath);
  } catch {
    const parent = dirname(resolvedPath);
    try {
      return join(realpathSync.native(parent), basename(resolvedPath));
    } catch {
      return resolvedPath;
    }
  }
}

// --- Essence file helpers ---

export interface EssenceReadResult {
  essence: EssenceFile;
  raw: string;
  path: string;
}

/**
 * Read and parse an essence file. Returns the parsed essence and raw content.
 */
export async function readEssenceFile(essencePath?: string): Promise<EssenceReadResult> {
  const resolvedPath = essencePath
    ? resolveWorkspacePath(essencePath)
    : join(process.cwd(), 'decantr.essence.json');
  const raw = await readFile(resolvedPath, 'utf-8');
  const essence = JSON.parse(raw) as EssenceFile;
  return { essence, raw, path: resolvedPath };
}

/**
 * Write an essence file back to disk as formatted JSON.
 */
export async function writeEssenceFile(essencePath: string, essence: EssenceFile): Promise<void> {
  const dir = dirname(essencePath);
  await mkdir(dir, { recursive: true });
  await writeFile(essencePath, JSON.stringify(essence, null, 2) + '\n', 'utf-8');
}

/**
 * Read an Essence v4 file, apply a mutation, and write back.
 * Older essence formats must use `decantr migrate --to v4` first.
 */
export async function mutateEssenceFile(
  essencePath: string | undefined,
  mutate: (essence: EssenceV4) => EssenceV4,
): Promise<{ essence: EssenceV4; path: string }> {
  const { essence, path } = await readEssenceFile(essencePath);
  if (!isV4(essence)) {
    throw new Error(
      'Active Decantr V2 workflows require Essence v4.0.0. Run `decantr migrate --to v4` for older essence files.',
    );
  }
  const v4 = structuredClone(essence);
  const updated = mutate(v4);
  await writeEssenceFile(path, updated);
  return { essence: updated, path };
}

// --- Drift log helpers ---

export interface DriftLogEntry {
  rule: string;
  page_id?: string;
  details?: string;
  resolution: string;
  scope?: string;
  timestamp: string;
}

/**
 * Read the drift log from `.decantr/drift-log.json`.
 * Returns an empty array if it doesn't exist.
 */
export async function readDriftLog(projectRoot?: string): Promise<DriftLogEntry[]> {
  const root = projectRoot ? resolveWorkspacePath(projectRoot) : process.cwd();
  const logPath = join(root, '.decantr', 'drift-log.json');
  try {
    const raw = await readFile(logPath, 'utf-8');
    return JSON.parse(raw) as DriftLogEntry[];
  } catch {
    return [];
  }
}

/**
 * Write drift log entries to `.decantr/drift-log.json`.
 */
export async function writeDriftLog(
  entries: DriftLogEntry[],
  projectRoot?: string,
): Promise<string> {
  const root = projectRoot ? resolveWorkspacePath(projectRoot) : process.cwd();
  const logPath = join(root, '.decantr', 'drift-log.json');
  await mkdir(dirname(logPath), { recursive: true });
  await writeFile(logPath, JSON.stringify(entries, null, 2) + '\n', 'utf-8');
  return logPath;
}
