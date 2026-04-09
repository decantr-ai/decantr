import { Suspense } from 'react';
import { listContent, searchContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';
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

export const revalidate = 300; // ISR: revalidate every 5 minutes

const LIMIT = 18;

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    namespace?: string;
    sort?: string;
    recommended?: string;
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
  const namespace = params.namespace;
  const sort = normalizePublicContentSort(params.sort);
  const recommended = params.recommended === 'true';
  const offset = parseInt(params.offset ?? '0', 10) || 0;

  let items: ContentItem[] = [];
  let total = 0;

  try {
    if (q) {
      const result = await searchContent(q, {
        type: selectedType,
        namespace: namespace || undefined,
        sort,
        recommended,
        limit: LIMIT,
        offset,
      });
      items = result.items;
      total = result.total;
    } else if (selectedType) {
      const result = await listContent(selectedType, {
        namespace: namespace || undefined,
        sort,
        recommended,
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
            namespace: namespace || undefined,
            sort,
            recommended,
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
    ? CONTENT_TYPE_DESCRIPTIONS[selectedType]
    : 'Explore the full Decantr registry across patterns, themes, blueprints, archetypes, and shells.';

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-d-muted">{description}</p>
      </div>

      <Suspense>
        <SearchFilterBar
          resultCount={total}
          activeType={selectedType ?? 'all'}
        />
      </Suspense>

      <div className="mt-8">
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
