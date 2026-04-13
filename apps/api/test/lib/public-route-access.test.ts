import { describe, expect, it } from 'vitest';
import {
  PUBLIC_READ_ROUTE_PREFIX_LIST,
  isAdminSyncRoute,
  isPublicReadOnlyRoute,
} from '../../src/lib/public-route-access.js';

describe('public route access helpers', () => {
  it('marks the expected GET routes as public read-only', () => {
    expect(PUBLIC_READ_ROUTE_PREFIX_LIST).toEqual([
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
    ]);

    expect(isPublicReadOnlyRoute('GET', '/v1/search')).toBe(true);
    expect(isPublicReadOnlyRoute('GET', '/v1/schema/search-response.v1.json')).toBe(true);
    expect(isPublicReadOnlyRoute('GET', '/v1/showcase/shortlist-verification')).toBe(true);
    expect(isPublicReadOnlyRoute('GET', '/v1/intelligence/summary')).toBe(true);
    expect(isPublicReadOnlyRoute('GET', '/v1/blueprints/@official/portfolio')).toBe(true);
  });

  it('does not mark non-GET or unrelated routes as public read-only', () => {
    expect(isPublicReadOnlyRoute('POST', '/v1/search')).toBe(false);
    expect(isPublicReadOnlyRoute('GET', '/v1/admin/sync')).toBe(false);
    expect(isPublicReadOnlyRoute('GET', '/v1/me')).toBe(false);
    expect(isPublicReadOnlyRoute('GET', '/v1/billing/status')).toBe(false);
  });

  it('matches only the admin sync write route', () => {
    expect(isAdminSyncRoute('POST', '/v1/admin/sync')).toBe(true);
    expect(isAdminSyncRoute('GET', '/v1/admin/sync')).toBe(false);
    expect(isAdminSyncRoute('POST', '/v1/admin/content/blueprint/@official/portfolio')).toBe(false);
  });
});
