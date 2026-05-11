import type { ContentItem, ContentRecord } from '@/lib/api';

const FALLBACK_REGISTRY_SITE_URL = 'https://registry.decantr.ai';
const FALLBACK_DECANTR_SITE_URL = 'https://decantr.ai';

function normalizeSiteUrl(value: string | undefined, fallback: string): string {
  const candidate = (value || fallback).trim().replace(/\/+$/, '');
  return candidate || fallback;
}

export const REGISTRY_SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_REGISTRY_URL || process.env.REGISTRY_PORTAL_URL,
  FALLBACK_REGISTRY_SITE_URL,
);

export const DECANTR_SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_DECANTR_URL,
  FALLBACK_DECANTR_SITE_URL,
);

export const INDEXNOW_KEY = '24d33581c24e009daf33a15d040ef127';

export const REGISTRY_SITE_NAME = 'Decantr Registry';

const CONTENT_TYPE_LABELS: Record<string, string> = {
  pattern: 'Pattern',
  theme: 'Theme',
  blueprint: 'Blueprint',
  archetype: 'Archetype',
  shell: 'Shell',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

export function getRegistryUrl(path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, `${REGISTRY_SITE_URL}/`).toString();
}

export function getDecantrUrl(path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, `${DECANTR_SITE_URL}/`).toString();
}

export function getContentRoutePath(type: string, namespace: string, slug: string): string {
  return `/${type}/${encodeURIComponent(namespace)}/${encodeURIComponent(slug)}`;
}

export function getContentRouteUrl(type: string, namespace: string, slug: string): string {
  return getRegistryUrl(getContentRoutePath(type, namespace, slug));
}

export function getContentTypeLabel(type: string): string {
  return CONTENT_TYPE_LABELS[type] ?? type;
}

export function getContentDisplayName(content: Pick<ContentItem, 'name' | 'slug'> & { data?: unknown }): string {
  if (content.name) return content.name;
  if (isRecord(content.data) && typeof content.data.name === 'string') return content.data.name;
  return content.slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getContentDescription(content: Pick<ContentItem, 'description'> & { data?: unknown }): string {
  if (content.description) return content.description;
  if (isRecord(content.data) && typeof content.data.description === 'string') {
    return content.data.description;
  }
  return 'A Decantr registry contract for AI-generated UI workflows.';
}

export function buildRegistrySiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': getDecantrUrl('/#organization'),
        name: 'Decantr AI',
        url: getDecantrUrl('/'),
        logo: getDecantrUrl('/logo.svg'),
        sameAs: [
          'https://github.com/decantr-ai/decantr',
          'https://www.npmjs.com/org/decantr',
          'https://registry.decantr.ai',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': getRegistryUrl('/#website'),
        name: REGISTRY_SITE_NAME,
        url: getRegistryUrl('/'),
        publisher: {
          '@id': getDecantrUrl('/#organization'),
        },
        isPartOf: {
          '@id': getDecantrUrl('/#website'),
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': getDecantrUrl('/#software'),
        name: 'Decantr',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Cross-platform',
        url: getDecantrUrl('/'),
        sameAs: 'https://github.com/decantr-ai/decantr',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    ],
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; item: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export function buildRegistryCollectionJsonLd({
  path,
  name,
  description,
  items,
}: {
  path: string;
  name: string;
  description: string;
  items: ContentItem[];
}) {
  const url = getRegistryUrl(path);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#collection`,
        name,
        description,
        url,
        isPartOf: {
          '@id': getRegistryUrl('/#website'),
        },
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#items`,
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: getContentDisplayName(item),
          url: getContentRouteUrl(item.type, item.namespace, item.slug),
        })),
      },
    ],
  };
}

export function buildRegistryContentJsonLd(content: ContentRecord) {
  const name = getContentDisplayName(content);
  const description = getContentDescription(content);
  const url = getContentRouteUrl(content.type, content.namespace, content.slug);
  const label = getContentTypeLabel(content.type);
  const data = isRecord(content.data) ? content.data : {};
  const tags = getStringArray(data.tags);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildBreadcrumbJsonLd([
        { name: 'Decantr Registry', item: getRegistryUrl('/') },
        { name: `${label}s`, item: getRegistryUrl(`/browse/${content.type}s`) },
        { name, item: url },
      ]),
      {
        '@type': 'CreativeWork',
        '@id': `${url}#content`,
        name,
        description,
        url,
        version: content.version,
        dateCreated: content.created_at,
        dateModified: content.updated_at,
        datePublished: content.published_at ?? content.created_at,
        genre: label,
        keywords: tags,
        isAccessibleForFree: content.visibility === 'public',
        license: 'https://opensource.org/license/mit',
        creator: {
          '@type': 'Organization',
          '@id': getDecantrUrl('/#organization'),
          name: content.namespace === '@official' ? 'Decantr AI' : (content.owner_name ?? content.namespace),
        },
        publisher: {
          '@id': getDecantrUrl('/#organization'),
        },
        isPartOf: {
          '@id': getRegistryUrl('/#website'),
        },
      },
    ],
  };
}
