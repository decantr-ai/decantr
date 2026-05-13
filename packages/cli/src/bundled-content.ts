import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ApiContentType } from '@decantr/registry';

export interface BundledContentEntry<T = Record<string, unknown>> {
  id: string;
  data: T;
  path: string;
}

function bundledDirCandidates(contentType: ApiContentType): string[] {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return [
    join(currentDir, 'bundled', contentType),
    join(currentDir, '..', 'src', 'bundled', contentType),
    join(currentDir, '..', 'bundled', contentType),
  ];
}

export function getBundledContentPath(contentType: ApiContentType, id: string): string | null {
  for (const dir of bundledDirCandidates(contentType)) {
    const candidate = join(dir, `${id}.json`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export function loadBundledContentItem<T = Record<string, unknown>>(
  contentType: ApiContentType,
  id: string,
): BundledContentEntry<T> | null {
  const path = getBundledContentPath(contentType, id);
  if (!path) return null;
  try {
    const data = JSON.parse(readFileSync(path, 'utf-8')) as T;
    return { id, data, path };
  } catch {
    return null;
  }
}

export function loadBundledContentList<T = Record<string, unknown>>(
  contentType: ApiContentType,
): BundledContentEntry<T>[] {
  const entries: BundledContentEntry<T>[] = [];
  const seen = new Set<string>();
  for (const dir of bundledDirCandidates(contentType)) {
    if (!existsSync(dir)) continue;
    try {
      for (const file of readdirSync(dir).filter((name) => name.endsWith('.json'))) {
        const id = file.replace(/\.json$/, '');
        if (seen.has(id)) continue;
        const path = join(dir, file);
        const data = JSON.parse(readFileSync(path, 'utf-8')) as T;
        entries.push({ id, data, path });
        seen.add(id);
      }
    } catch {
      /* best effort */
    }
  }
  return entries;
}
