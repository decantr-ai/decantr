import { Suspense } from 'react';
import { listContent, searchContent } from '@/lib/api';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { ContentCardGrid } from '@/components/content-card-grid';
import { Pagination } from '@/components/pagination';

const LIMIT = 12;

interface Props {
  searchParams: Promise<{ q?: string; type?: string; sort?: string; offset?: string }>;
}

async function BrowseResults({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q || '';
  const type = params.type || '';
  const offset = parseInt(params.offset || '0', 10);

  let total = 0;
  let items: any[] = [];

  try {
    if (q) {
      const res = await searchContent(q, { type: type || undefined });
      total = res.total;
      items = res.items;
    } else {
      const contentType = type || 'patterns';
      const res = await listContent(contentType, { limit: LIMIT, offset });
      total = res.total;
      items = res.items;

      // Also try other types if no specific type
      if (!type) {
        const [themes, blueprints, shells] = await Promise.all([
          listContent('themes', { limit: LIMIT, offset }),
          listContent('blueprints', { limit: LIMIT, offset }),
          listContent('shells', { limit: LIMIT, offset }),
        ]);
        items = [...items, ...themes.items, ...blueprints.items, ...shells.items].slice(0, LIMIT);
        total = res.total + themes.total + blueprints.total + shells.total;
      }
    }
  } catch {
    // API unavailable
  }

  return (
    <>
      <ContentCardGrid items={items} />
      <Pagination total={total} limit={LIMIT} baseUrl="/browse" />
    </>
  );
}

export default function BrowsePage({ searchParams }: Props) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">Browse Registry</h2>

        <Suspense fallback={null}>
          <SearchFilterBar baseUrl="/browse" />
        </Suspense>

        <Suspense fallback={
          <div className="flex items-center justify-center" style={{ padding: '3rem 0' }}>
            <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>Loading content...</span>
          </div>
        }>
          <BrowseResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
