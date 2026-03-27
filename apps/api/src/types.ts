import type { AuthContext } from './middleware/auth.js';

export type Env = {
  Variables: {
    auth: AuthContext;
  };
};

export type ContentType = 'pattern' | 'recipe' | 'theme' | 'blueprint' | 'archetype' | 'shell';

export const CONTENT_TYPES: ContentType[] = [
  'pattern',
  'recipe',
  'theme',
  'blueprint',
  'archetype',
  'shell',
];

export const PLURAL_TO_SINGULAR: Record<string, ContentType> = {
  patterns: 'pattern',
  recipes: 'recipe',
  themes: 'theme',
  blueprints: 'blueprint',
  archetypes: 'archetype',
  shells: 'shell',
};

export interface PaginationParams {
  limit: number;
  offset: number;
}

export function parsePagination(
  limitParam: string | undefined,
  offsetParam: string | undefined
): PaginationParams {
  const limit = Math.min(Math.max(parseInt(limitParam || '20', 10), 1), 100);
  const offset = Math.max(parseInt(offsetParam || '0', 10), 0);
  return { limit, offset };
}
