import type { MetadataRoute } from 'next';
import { listContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { CONTENT_TYPES, toSingularRegistryContentType, type RegistryContentType } from '@/lib/content-types';
import { getContentRoutePath, getRegistryUrl } from '@/lib/seo';

export const revalidate = 3600;

const LIST_PAGE_SIZE = 100;

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: getRegistryUrl('/'), changeFrequency: 'weekly', priority: 1 },
  { url: getRegistryUrl('/browse'), changeFrequency: 'daily', priority: 0.9 },
  { url: getRegistryUrl('/browse/blueprints'), changeFrequency: 'daily', priority: 0.9 },
  { url: getRegistryUrl('/browse/patterns'), changeFrequency: 'daily', priority: 0.8 },
  { url: getRegistryUrl('/browse/themes'), changeFrequency: 'daily', priority: 0.8 },
  { url: getRegistryUrl('/browse/archetypes'), changeFrequency: 'daily', priority: 0.75 },
  { url: getRegistryUrl('/browse/shells'), changeFrequency: 'daily', priority: 0.7 },
  { url: getRegistryUrl('/privacy'), changeFrequency: 'yearly', priority: 0.3 },
  { url: getRegistryUrl('/terms'), changeFrequency: 'yearly', priority: 0.3 },
];

async function listAllContent(type: RegistryContentType): Promise<ContentItem[]> {
  const items: ContentItem[] = [];
  let offset = 0;

  while (true) {
    const result = await listContent(type, {
      sort: 'newest',
      limit: LIST_PAGE_SIZE,
      offset,
    });

    items.push(...result.items);

    if (result.items.length === 0 || items.length >= result.total) {
      break;
    }

    offset += LIST_PAGE_SIZE;
  }

  return items;
}

function contentItemToSitemapEntry(
  fallbackType: RegistryContentType,
  item: ContentItem,
): MetadataRoute.Sitemap[number] {
  const singularType = item.type || toSingularRegistryContentType(fallbackType);

  return {
    url: getRegistryUrl(getContentRoutePath(singularType, item.namespace, item.slug)),
    lastModified: item.published_at ? new Date(item.published_at) : undefined,
    changeFrequency: item.namespace === '@official' ? 'weekly' : 'monthly',
    priority: singularType === 'blueprint' ? 0.75 : 0.6,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const contentEntries = await Promise.all(
    CONTENT_TYPES.map(async (type) => {
      try {
        const items = await listAllContent(type);
        return items.map((item) => contentItemToSitemapEntry(type, item));
      } catch {
        return [];
      }
    }),
  );

  return [...STATIC_ROUTES, ...contentEntries.flat()];
}
