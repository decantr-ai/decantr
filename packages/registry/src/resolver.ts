import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Pattern, Archetype, Theme, Blueprint, ContentType, ResolvedContent } from './types.js';

type ContentMap = {
  pattern: Pattern;
  archetype: Archetype;
  theme: Theme;
  blueprint: Blueprint;
};

export interface ResolverOptions {
  contentRoot: string;
  overridePaths?: string[];
}

export interface ContentResolver {
  resolve<T extends ContentType>(type: T, id: string): Promise<ResolvedContent<ContentMap[T]> | null>;
}

const TYPE_DIRS: Record<ContentType, string> = {
  pattern: 'patterns',
  archetype: 'archetypes',
  theme: 'themes',
  blueprint: 'blueprints',
};

async function tryLoadJson<T>(filePath: string): Promise<T | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export function createResolver(options: ResolverOptions): ContentResolver {
  const { contentRoot, overridePaths = [] } = options;
  return {
    async resolve<T extends ContentType>(type: T, id: string): Promise<ResolvedContent<ContentMap[T]> | null> {
      const dir = TYPE_DIRS[type];
      const fileName = `${id}.json`;
      for (const overridePath of overridePaths) {
        const filePath = join(overridePath, dir, fileName);
        const item = await tryLoadJson<ContentMap[T]>(filePath);
        if (item) return { item, source: 'local', path: filePath };
      }
      // Check main content directory
      const mainPath = join(contentRoot, dir, fileName);
      const mainItem = await tryLoadJson<ContentMap[T]>(mainPath);
      if (mainItem) return { item: mainItem, source: 'core', path: mainPath };

      // Check content/core/{type}/ as fallback
      const corePath = join(contentRoot, 'core', dir, fileName);
      const coreItem = await tryLoadJson<ContentMap[T]>(corePath);
      if (coreItem) return { item: coreItem, source: 'core', path: corePath };

      return null;
    },
  };
}
