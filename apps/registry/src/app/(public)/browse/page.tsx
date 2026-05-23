import { Suspense } from 'react';
import type { Metadata } from 'next';
import { isPublicBlueprintSet, type PublicBlueprintSet } from '@decantr/registry/client';
import { listContent, searchContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';
import { JsonLd } from '@/components/json-ld';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { Pagination } from '@/components/pagination';
import {
  normalizePublicContentSort,
  sortContentItems,
} from '@/lib/content-ranking';
import {
  CONTENT_TYPE_DESCRIPTIONS,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPES,
  isRegistryContentType,
} from '@/lib/content-types';
import { buildRegistryCollectionJsonLd } from '@/lib/seo';

export const revalidate = 300; // ISR: revalidate every 5 minutes

export const metadata: Metadata = {
  title: 'Browse',
  description:
    'Explore Decantr certified vocabulary across patterns, themes, starter kits, archetypes, and shells.',
  alternates: {
    canonical: '/browse',
  },
};

const LIMIT = 18;

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    source?: string;
    sort?: string;
    blueprint_set?: string;
    offset?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const q = params.q ?? '';
  const requestedType = params.type ?? '';
  const selectedType = isRegistryContentType(requestedType)
    ? requestedType
    : undefined;
  const source = params.source === 'official' || params.source === 'community' || params.source === 'organization'
    ? params.source
    : undefined;
  const sort = normalizePublicContentSort(params.sort);
  const blueprintSet: PublicBlueprintSet = isPublicBlueprintSet(params.blueprint_set)
    ? params.blueprint_set
    : 'all';
  const offset = parseInt(params.offset ?? '0', 10) || 0;

  let items: ContentItem[] = [];
  let total = 0;

  try {
    if (q) {
      const result = await searchContent(q, {
        type: selectedType,
        source,
        sort,
        blueprintSet: selectedType === 'blueprints' ? blueprintSet : undefined,
        limit: LIMIT,
        offset,
      });
      items = result.items;
      total = result.total;
    } else if (selectedType) {
      const result = await listContent(selectedType, {
        source,
        sort,
        blueprintSet: selectedType === 'blueprints' ? blueprintSet : undefined,
        limit: LIMIT,
        offset,
      });
      items = result.items;
      total = result.total;
    } else {
      const requestedCount = LIMIT + offset;
      const results = await Promise.allSettled(
        CONTENT_TYPES.map((type) =>
          listContent(type, {
            source,
            sort,
            blueprintSet: type === 'blueprints' ? blueprintSet : undefined,
            limit: requestedCount,
            offset: 0,
          })
        )
      );

      const mixedItems: ContentItem[] = [];
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          total += result.value.total;
          mixedItems.push(...result.value.items);
        }
      });

      items = sortContentItems(mixedItems, sort).slice(offset, offset + LIMIT);
    }
  } catch {
    // API unavailable
  }

  const title = selectedType ? CONTENT_TYPE_LABELS[selectedType] : 'Browse';
  const description = selectedType
    ? selectedType === 'blueprints'
      ? 'Browse supported starter-kit contracts. Featured and Certified are the strongest default picks; Labs contains promising directions that need more proof.'
      : CONTENT_TYPE_DESCRIPTIONS[selectedType]
    : 'Explore Decantr certified vocabulary across patterns, themes, starter kits, archetypes, and shells.';
  const jsonLd = buildRegistryCollectionJsonLd({
    path: selectedType ? `/browse/${selectedType}` : '/browse',
    name: selectedType ? `Decantr ${CONTENT_TYPE_LABELS[selectedType]}` : 'Decantr Registry Browse',
    description,
    items,
  });

  return (
    <div className="registry-page-max registry-browser-shell">
      <JsonLd data={jsonLd} />
      <div className="registry-page-intro">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-d-muted">{description}</p>
      </div>

      <Suspense>
        <SearchFilterBar
          resultCount={total}
          activeType={selectedType ?? 'all'}
        />
      </Suspense>

      <div>
        <ContentCardGrid
          items={items}
          emptyMessage={
            q
              ? `No results found for "${q}". Try a different search.`
              : selectedType
                ? `No ${selectedType} available yet. Check back soon.`
                : 'No content available yet. Check back soon.'
          }
        />
      </div>

      <Suspense>
        <Pagination total={total} limit={LIMIT} offset={offset} />
      </Suspense>
    </div>
  );
}
