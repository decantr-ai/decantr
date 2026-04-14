import { Suspense } from 'react';
import {
  isContentIntelligenceSource,
  type ContentIntelligenceSource,
} from '@decantr/registry/client';
import { notFound } from 'next/navigation';
import { listContent, searchContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { Pagination } from '@/components/pagination';
import { normalizePublicContentSort } from '@/lib/content-ranking';
import {
  CONTENT_TYPE_DESCRIPTIONS,
  CONTENT_TYPE_LABELS,
  isRegistryContentType,
} from '@/lib/content-types';

export const dynamic = 'force-dynamic';

const LIMIT = 18;

interface BrowseTypePageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{
    q?: string;
    namespace?: string;
    sort?: string;
    recommended?: string;
    intelligence_source?: string;
    offset?: string;
  }>;
}

export default async function BrowseTypePage({ params, searchParams }: BrowseTypePageProps) {
  const { type } = await params;
  const sp = await searchParams;

  if (!isRegistryContentType(type)) {
    notFound();
  }

  const q = sp.q ?? '';
  const namespace = sp.namespace;
  const sort = normalizePublicContentSort(sp.sort);
  const recommended = sp.recommended === 'true';
  const intelligenceSource: ContentIntelligenceSource | undefined =
    sp.intelligence_source && isContentIntelligenceSource(sp.intelligence_source)
      ? sp.intelligence_source
      : undefined;
  const offset = parseInt(sp.offset ?? '0', 10) || 0;

  let items: ContentItem[] = [];
  let total = 0;

  try {
    if (q) {
      const result = await searchContent(q, {
        type,
        namespace: namespace || undefined,
        sort,
        recommended,
        intelligenceSource,
        limit: LIMIT,
        offset,
      });
      items = result.items;
      total = result.total;
    } else {
      const result = await listContent(type, {
        namespace: namespace || undefined,
        sort,
        recommended,
        intelligenceSource,
        limit: LIMIT,
        offset,
      });
      items = result.items;
      total = result.total;
    }
  } catch {
    // API unavailable
  }

  return (
    <div className="registry-page-max registry-browser-shell">
      <div className="registry-page-intro">
        <h1 className="text-2xl font-bold">{CONTENT_TYPE_LABELS[type]}</h1>
        <p className="text-sm text-d-muted">{CONTENT_TYPE_DESCRIPTIONS[type]}</p>
      </div>

      <Suspense>
        <SearchFilterBar
          baseUrl={`/browse/${type}`}
          resultCount={total}
          activeType={type}
        />
      </Suspense>

      <div>
        <ContentCardGrid
          items={items}
          emptyMessage={
            q
              ? `No ${type} found matching "${q}".`
              : `No ${type} published yet. Check back soon.`
          }
        />
      </div>

      <Suspense>
        <Pagination total={total} limit={LIMIT} offset={offset} />
      </Suspense>
    </div>
  );
}
