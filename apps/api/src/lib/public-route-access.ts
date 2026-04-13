const PUBLIC_READ_ROUTE_PREFIXES = [
  '/v1/patterns',
  '/v1/themes',
  '/v1/blueprints',
  '/v1/archetypes',
  '/v1/shells',
  '/v1/search',
  '/v1/schema',
  '/v1/showcase',
  '/v1/intelligence',
  '/v1/health',
] as const;

export function isAdminSyncRoute(method: string, path: string): boolean {
  return method === 'POST' && path === '/v1/admin/sync';
}

export function isPublicReadOnlyRoute(method: string, path: string): boolean {
  if (method !== 'GET') {
    return false;
  }

  return PUBLIC_READ_ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export const PUBLIC_READ_ROUTE_PREFIX_LIST = [...PUBLIC_READ_ROUTE_PREFIXES];
