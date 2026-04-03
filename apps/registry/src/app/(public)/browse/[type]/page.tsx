import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { listContent, searchContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { Pagination } from '@/components/pagination';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['patterns', 'themes', 'blueprints', 'shells', 'archetypes'] as const;
type ContentType = (typeof VALID_TYPES)[number];

const TYPE_LABELS: Record<ContentType, string> = {
  patterns: 'Patterns',
  themes: 'Themes',
  blueprints: 'Blueprints',
  shells: 'Shells',
  archetypes: 'Archetypes',
};

const TYPE_DESCRIPTIONS: Record<ContentType, string> = {
  patterns: 'Composable UI sections — hero, nav, footer, data tables, and more.',
  themes: 'Complete visual themes with tokens, decorators, and personality.',
  blueprints: 'Full application templates built from patterns and archetypes.',
  shells: 'App shell layouts defining spatial regions and navigation.',
  archetypes: 'High-level app categories with default pages and features.',
};

const LIMIT = 18;

interface BrowseTypePageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{
    q?: string;
    namespace?: string;
    sort?: string;
    offset?: string;
  }>;
}

function isValidType(type: string): type is ContentType {
  return VALID_TYPES.includes(type as ContentType);
}

export default async function BrowseTypePage({ params, searchParams }: BrowseTypePageProps) {
  const { type } = await params;
  const sp = await searchParams;

  if (!isValidType(type)) {
    notFound();
  }

  const q = sp.q ?? '';
  const namespace = sp.namespace;
  const offset = parseInt(sp.offset ?? '0', 10) || 0;

  let items: ContentItem[] = [];
  let total = 0;

  try {
    if (q) {
      const result = await searchContent(q, { type, namespace: namespace || undefined });
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
    // API unavailable
  }

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <div className="flex flex-col gap-1" style={{ marginBottom: '1.5rem' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--d-text)' }}>{TYPE_LABELS[type]}</h1>
        <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>{TYPE_DESCRIPTIONS[type]}</p>
      </div>

      <Suspense>
        <SearchFilterBar baseUrl={`/browse/${type}`} resultCount={total} />
      </Suspense>

      <div style={{ marginTop: '2rem' }}>
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
