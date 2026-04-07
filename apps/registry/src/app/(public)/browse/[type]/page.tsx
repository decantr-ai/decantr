import { Suspense } from 'react';
import { listContent, searchContent } from '@/lib/api';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { ContentCardGrid } from '@/components/content-card-grid';
import { Pagination } from '@/components/pagination';

const LIMIT = 12;

interface Props {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ q?: string; sort?: string; offset?: string }>;
}

async function TypeResults({ params, searchParams }: Props) {
  const { type } = await params;
  const sp = await searchParams;
  const q = sp.q || '';
  const offset = parseInt(sp.offset || '0', 10);

  let total = 0;
  let items: any[] = [];

  try {
    if (q) {
      const res = await searchContent(q, { type });
      total = res.total;
      items = res.items;
    } else {
      const res = await listContent(type, { limit: LIMIT, offset });
      total = res.total;
      items = res.items;
    }
  } catch {
    // API unavailable
  }

  return (
    <>
      <ContentCardGrid items={items} />
      <Pagination total={total} limit={LIMIT} baseUrl={`/browse/${type}`} />
    </>
  );
}

export default async function BrowseTypePage({ params, searchParams }: Props) {
  const { type } = await params;
  const label = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">{label}</h2>

        <Suspense fallback={null}>
          <SearchFilterBar baseUrl={`/browse/${type}`} />
        </Suspense>

        <Suspense fallback={
          <div className="flex items-center justify-center" style={{ padding: '3rem 0' }}>
            <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>Loading {label.toLowerCase()}...</span>
          </div>
        }>
          <TypeResults params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
