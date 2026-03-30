import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { RegistryAPIClient } from '@decantr/registry';
import type { EssenceFile, EssenceV3 } from '@decantr/essence-spec';
import { isV3, migrateV2ToV3 } from '@decantr/essence-spec';

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

let _apiClient: RegistryAPIClient | null = null;

export function getAPIClient(): RegistryAPIClient {
  if (!_apiClient) {
    _apiClient = new RegistryAPIClient({
      baseUrl: process.env.DECANTR_API_URL || undefined,
      apiKey: process.env.DECANTR_API_KEY || undefined,
    });
  }
  return _apiClient;
}

export function resetAPIClient(): void {
  _apiClient = null;
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
  const resolvedPath = essencePath || join(process.cwd(), 'decantr.essence.json');
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
 * Read an essence, ensure it's v3 (migrating if needed), apply a mutation, and write back.
 * Returns the updated v3 essence.
 */
export async function mutateEssenceFile(
  essencePath: string | undefined,
  mutate: (essence: EssenceV3) => EssenceV3,
): Promise<{ essence: EssenceV3; path: string }> {
  const { essence, path } = await readEssenceFile(essencePath);
  const v3 = isV3(essence) ? structuredClone(essence) : migrateV2ToV3(essence);
  const updated = mutate(v3);
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
  const root = projectRoot || process.cwd();
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
export async function writeDriftLog(entries: DriftLogEntry[], projectRoot?: string): Promise<string> {
  const root = projectRoot || process.cwd();
  const logPath = join(root, '.decantr', 'drift-log.json');
  await mkdir(dirname(logPath), { recursive: true });
  await writeFile(logPath, JSON.stringify(entries, null, 2) + '\n', 'utf-8');
  return logPath;
}
