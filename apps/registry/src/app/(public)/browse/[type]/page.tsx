import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isPublicBlueprintSet, type PublicBlueprintSet } from '@decantr/registry/client';
import { listContent, searchContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';
import { JsonLd } from '@/components/json-ld';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { Pagination } from '@/components/pagination';
import { normalizePublicContentSort } from '@/lib/content-ranking';
import {
  CONTENT_TYPE_DESCRIPTIONS,
  CONTENT_TYPE_LABELS,
  isRegistryContentType,
} from '@/lib/content-types';
import { buildRegistryCollectionJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const LIMIT = 18;

interface BrowseTypePageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{
    q?: string;
    source?: string;
    sort?: string;
    blueprint_set?: string;
    offset?: string;
  }>;
}

export async function generateMetadata({ params }: Pick<BrowseTypePageProps, 'params'>): Promise<Metadata> {
  const { type } = await params;

  if (!isRegistryContentType(type)) {
    return {
      title: 'Browse',
    };
  }

  return {
    title: CONTENT_TYPE_LABELS[type],
    description: CONTENT_TYPE_DESCRIPTIONS[type],
    alternates: {
      canonical: `/browse/${type}`,
    },
    openGraph: {
      title: `${CONTENT_TYPE_LABELS[type]} — Decantr Registry`,
      description: CONTENT_TYPE_DESCRIPTIONS[type],
      url: `/browse/${type}`,
      type: 'website',
    },
  };
}

export default async function BrowseTypePage({ params, searchParams }: BrowseTypePageProps) {
  const { type } = await params;
  const sp = await searchParams;

  if (!isRegistryContentType(type)) {
    notFound();
  }

  const q = sp.q ?? '';
  const source = sp.source === 'official' || sp.source === 'community' || sp.source === 'organization'
    ? sp.source
    : undefined;
  const sort = normalizePublicContentSort(sp.sort);
  const blueprintSet: PublicBlueprintSet = isPublicBlueprintSet(sp.blueprint_set)
    ? sp.blueprint_set
    : 'all';
  const offset = parseInt(sp.offset ?? '0', 10) || 0;

  let items: ContentItem[] = [];
  let total = 0;

  try {
    if (q) {
      const result = await searchContent(q, {
        type,
        source,
        sort,
        blueprintSet: type === 'blueprints' ? blueprintSet : undefined,
        limit: LIMIT,
        offset,
      });
      items = result.items;
      total = result.total;
    } else {
      const result = await listContent(type, {
        source,
        sort,
        blueprintSet: type === 'blueprints' ? blueprintSet : undefined,
        limit: LIMIT,
        offset,
      });
      items = result.items;
      total = result.total;
    }
  } catch {
    // API unavailable
  }
  const jsonLd = buildRegistryCollectionJsonLd({
    path: `/browse/${type}`,
    name: `Decantr ${CONTENT_TYPE_LABELS[type]}`,
    description: CONTENT_TYPE_DESCRIPTIONS[type],
    items,
  });
  const pageDescription = type === 'blueprints'
    ? 'Browse supported starter-kit contracts. Featured and Certified are the strongest default picks; Labs contains promising directions that need more proof.'
    : CONTENT_TYPE_DESCRIPTIONS[type];

  return (
    <div className="registry-page-max registry-browser-shell">
      <JsonLd data={jsonLd} />
      <div className="registry-page-intro">
        <h1 className="text-2xl font-bold">{CONTENT_TYPE_LABELS[type]}</h1>
        <p className="text-sm text-d-muted">{pageDescription}</p>
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
