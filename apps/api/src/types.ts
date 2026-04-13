import type { AuthContext } from './middleware/auth.js';
import {
  CONTENT_TYPES as REGISTRY_CONTENT_TYPES,
  API_CONTENT_TYPES as REGISTRY_API_CONTENT_TYPES,
  API_CONTENT_TYPE_TO_CONTENT_TYPE,
  isContentType as isRegistryContentType,
  isApiContentType as isRegistryApiContentType,
} from '@decantr/registry';
import type { ContentType, ApiContentType } from '@decantr/registry';

export type Env = {
  Variables: {
    auth: AuthContext;
  };
};

export type { ContentType, ApiContentType };

export const CONTENT_TYPES: ContentType[] = [...REGISTRY_CONTENT_TYPES];
export const API_CONTENT_TYPES: ApiContentType[] = [...REGISTRY_API_CONTENT_TYPES];
export const PLURAL_TO_SINGULAR: Record<ApiContentType, ContentType> = { ...API_CONTENT_TYPE_TO_CONTENT_TYPE };
export const isContentType = isRegistryContentType;
export const isApiContentType = isRegistryApiContentType;

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
