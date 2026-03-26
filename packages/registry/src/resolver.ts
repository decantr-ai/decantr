import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Pattern, Archetype, Recipe, ContentType, ResolvedContent } from './types.js';

type ContentMap = {
  pattern: Pattern;
  archetype: Archetype;
  recipe: Recipe;
  theme: Record<string, unknown>;
  blueprint: Record<string, unknown>;
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
  recipe: 'recipes',
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
      const corePath = join(contentRoot, dir, fileName);
      const coreItem = await tryLoadJson<ContentMap[T]>(corePath);
      if (coreItem) return { item: coreItem, source: 'core', path: corePath };
      return null;
    },
  };
}
