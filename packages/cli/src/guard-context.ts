import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadBundledContentList } from './bundled-content.js';

export interface GuardRegistryContext {
  themeRegistry: Map<string, { modes: string[] }>;
  patternRegistry: Map<string, unknown>;
}

function loadJsonEntries(dir: string): Record<string, unknown>[] {
  if (!existsSync(dir)) return [];

  try {
    return readdirSync(dir)
      .filter((file) => file.endsWith('.json') && file !== 'index.json')
      .map((file) => JSON.parse(readFileSync(join(dir, file), 'utf-8')) as Record<string, unknown>);
  } catch {
    return [];
  }
}

function readJson(path: string): Record<string, unknown> | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function addPattern(
  registry: Map<string, unknown>,
  id: unknown,
  source: string,
  data: unknown = null,
): void {
  if (typeof id !== 'string' || !id.trim() || registry.has(id)) return;
  registry.set(id, data ?? { id, source });
}

export function buildGuardRegistryContext(
  projectRoot: string = process.cwd(),
): GuardRegistryContext {
  const themeRegistry = new Map<string, { modes: string[] }>();
  const patternRegistry = new Map<string, unknown>();
  const cacheDir = join(projectRoot, '.decantr', 'cache');
  const customDir = join(projectRoot, '.decantr', 'custom');

  for (const data of loadJsonEntries(join(cacheDir, '@official', 'themes'))) {
    if (typeof data.id === 'string' && !themeRegistry.has(data.id)) {
      themeRegistry.set(data.id, {
        modes: Array.isArray(data.modes)
          ? data.modes.filter((mode): mode is string => typeof mode === 'string')
          : ['light', 'dark'],
      });
    }
  }

  for (const data of loadJsonEntries(join(customDir, 'themes'))) {
    if (typeof data.id === 'string') {
      themeRegistry.set(`custom:${data.id}`, {
        modes: Array.isArray(data.modes)
          ? data.modes.filter((mode): mode is string => typeof mode === 'string')
          : ['light', 'dark'],
      });
    }
  }

  for (const data of loadJsonEntries(join(cacheDir, '@official', 'patterns'))) {
    addPattern(patternRegistry, data.id, 'cache', data);
  }

  for (const entry of loadBundledContentList('patterns')) {
    const data = entry.data as Record<string, unknown>;
    const id = typeof data.id === 'string' ? data.id : entry.id;
    addPattern(patternRegistry, id, 'bundled', data);
  }

  for (const data of loadJsonEntries(join(customDir, 'patterns'))) {
    addPattern(patternRegistry, data.id, 'custom', data);
  }

  const localPatterns = readJson(join(projectRoot, '.decantr', 'local-patterns.json'));
  const patterns = Array.isArray(localPatterns?.patterns) ? localPatterns.patterns : [];
  for (const pattern of patterns) {
    if (!pattern || typeof pattern !== 'object') continue;
    const data = pattern as Record<string, unknown>;
    addPattern(patternRegistry, data.id, 'local-law', data);
  }

  return { themeRegistry, patternRegistry };
}
