import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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
    if (typeof data.id === 'string' && !patternRegistry.has(data.id)) {
      patternRegistry.set(data.id, data);
    }
  }

  for (const data of loadJsonEntries(join(customDir, 'patterns'))) {
    if (typeof data.id === 'string') {
      patternRegistry.set(data.id, data);
    }
  }

  return { themeRegistry, patternRegistry };
}
