import { Suspense } from 'react';
import { listContent, searchContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { Pagination } from '@/components/pagination';

export const dynamic = 'force-dynamic';

const LIMIT = 18;

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    namespace?: string;
    sort?: string;
    offset?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const q = params.q ?? '';
  const type = params.type || 'patterns';
  const namespace = params.namespace;
  const offset = parseInt(params.offset ?? '0', 10) || 0;

  let items: ContentItem[] = [];
  let total = 0;

  try {
    if (q) {
      const result = await searchContent(q, {
        type: type || undefined,
        namespace: namespace || undefined,
      });
      items = result.items;
      total = result.total;
    } else {
      const result = await listContent(type, {
        namespace: namespace || undefined,
        limit: LIMIT,
        offset,
      });
      items = result.items;
      total = result.total;
    }
  } catch {
    // API unavailable — empty state rendered below
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-d-text">Browse</h1>
        <p className="text-sm text-d-muted">
          Explore the design intelligence registry.
        </p>
      </div>

      <Suspense>
        <SearchFilterBar />
      </Suspense>

      {q && (
        <p className="text-sm text-d-muted">
          {total} result{total !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
        </p>
      )}

      <ContentCardGrid
        items={items}
        emptyMessage={
          q
            ? `No results found for "${q}". Try a different search.`
            : 'No content available yet. Check back soon.'
        }
      />

      <Suspense>
        <Pagination total={total} limit={LIMIT} offset={offset} />
      </Suspense>
    </div>
  );
}
