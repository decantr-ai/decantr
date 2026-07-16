import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  ContentResolver,
  ContentType,
  ContentTypeMap,
  ResolvedContent,
  ResolverOptions,
} from './types.js';

export type { ContentResolver, ResolverOptions } from './types.js';

const TYPE_DIRS: Record<ContentType, string> = {
  pattern: 'patterns',
  archetype: 'archetypes',
  theme: 'themes',
  blueprint: 'blueprints',
  shell: 'shells',
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
    async resolve<T extends ContentType>(
      type: T,
      id: string,
    ): Promise<ResolvedContent<ContentTypeMap[T]> | null> {
      const dir = TYPE_DIRS[type];
      const fileName = `${id}.json`;
      for (const overridePath of overridePaths) {
        const filePath = join(overridePath, dir, fileName);
        const item = await tryLoadJson<ContentTypeMap[T]>(filePath);
        if (item) return { item, source: 'local', path: filePath };
      }
      // Check main content directory
      const mainPath = join(contentRoot, dir, fileName);
      const mainItem = await tryLoadJson<ContentTypeMap[T]>(mainPath);
      if (mainItem) return { item: mainItem, source: 'core', path: mainPath };

      // Check content/core/{type}/ as fallback
      const corePath = join(contentRoot, 'core', dir, fileName);
      const coreItem = await tryLoadJson<ContentTypeMap[T]>(corePath);
      if (coreItem) return { item: coreItem, source: 'core', path: corePath };

      return null;
    },
  };
}
