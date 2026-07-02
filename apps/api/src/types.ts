import {
  API_CONTENT_TYPES as CONTENT_API_TYPES,
  API_CONTENT_TYPE_TO_CONTENT_TYPE,
  CONTENT_TYPES as CONTENT_CORPUS_TYPES,
  isApiContentType as isContentApiType,
  isContentType as isContentCorpusType,
} from '@decantr/content';
import type { ApiContentType, ContentType } from '@decantr/content';

export type Env = {
  Variables: Record<string, never>;
};

export type { ContentType, ApiContentType };

export const CONTENT_TYPES: ContentType[] = [...CONTENT_CORPUS_TYPES];
export const API_CONTENT_TYPES: ApiContentType[] = [...CONTENT_API_TYPES];
export const PLURAL_TO_SINGULAR: Record<ApiContentType, ContentType> = {
  ...API_CONTENT_TYPE_TO_CONTENT_TYPE,
};
export const isContentType = isContentCorpusType;
export const isApiContentType = isContentApiType;

export interface PaginationParams {
  limit: number;
  offset: number;
}

export function parsePagination(
  limitParam: string | undefined,
  offsetParam: string | undefined,
): PaginationParams {
  const limit = Math.min(Math.max(parseInt(limitParam || '20', 10), 1), 100);
  const offset = Math.max(parseInt(offsetParam || '0', 10), 0);
  return { limit, offset };
}
