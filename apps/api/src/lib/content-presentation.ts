import { createAdminClient } from '../db/client.js';
import type { ApiContentType } from '../types.js';

export const REGISTRY_THUMBNAIL_BUCKET = 'registry-thumbnails';
export const PUBLIC_CONTENT_SOURCES = [
  'official',
  'community',
  'organization',
] as const;

export type PublicContentSource = (typeof PUBLIC_CONTENT_SOURCES)[number];

export interface RegistryThumbnailMetadata {
  path: string;
  alt?: string;
  width?: number;
  height?: number;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function getPublicContentSource(namespace: string): PublicContentSource {
  if (namespace === '@official') return 'official';
  if (namespace.startsWith('@org:')) return 'organization';
  return 'community';
}

export function isPublicContentSource(value: string): value is PublicContentSource {
  return PUBLIC_CONTENT_SOURCES.includes(value as PublicContentSource);
}

export function matchesPublicContentSource(
  namespace: string,
  source?: PublicContentSource,
): boolean {
  if (!source) return true;
  return getPublicContentSource(namespace) === source;
}

export function getRegistryThumbnailMetadata(
  data: Record<string, unknown> | null | undefined,
): RegistryThumbnailMetadata | null {
  const registryPresentation = asObject(data?.registry_presentation);
  const thumbnail = asObject(registryPresentation?.thumbnail);

  if (!thumbnail || typeof thumbnail.path !== 'string' || thumbnail.path.trim().length === 0) {
    return null;
  }

  return {
    path: thumbnail.path.trim(),
    alt: typeof thumbnail.alt === 'string' ? thumbnail.alt : undefined,
    width: typeof thumbnail.width === 'number' ? thumbnail.width : undefined,
    height: typeof thumbnail.height === 'number' ? thumbnail.height : undefined,
  };
}

export function getPublicApiBaseUrl(requestUrl: string): string {
  return new URL('/v1', requestUrl).toString().replace(/\/$/, '');
}

export function getPublicThumbnailUrl(
  publicApiBaseUrl: string,
  type: ApiContentType,
  namespace: string,
  slug: string,
  data: Record<string, unknown> | null | undefined,
): string | null {
  const metadata = getRegistryThumbnailMetadata(data);
  if (!metadata) return null;
  return `${publicApiBaseUrl}/${type}/${encodeURIComponent(namespace)}/${slug}/thumbnail`;
}

export async function getSignedThumbnailUrl(
  data: Record<string, unknown> | null | undefined,
  expiresIn = 60 * 60,
): Promise<string | null> {
  const metadata = getRegistryThumbnailMetadata(data);
  if (!metadata) return null;

  const client = createAdminClient();
  const { data: signed, error } = await client.storage
    .from(REGISTRY_THUMBNAIL_BUCKET)
    .createSignedUrl(metadata.path, expiresIn);

  if (error || !signed?.signedUrl) {
    return null;
  }

  return signed.signedUrl;
}
