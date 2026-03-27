import { Suspense } from 'react';
import { listContent, searchContent } from '@/lib/api';
import { SearchFilterBar } from '@/components/registry/search-filter-bar';
import { ContentGrid } from '@/components/registry/content-grid';
import { Pagination } from '@/components/registry/pagination';

const PAGE_SIZE = 20;

export const metadata = {
  title: 'Registry — Decantr',
  description: 'Browse patterns, themes, blueprints, recipes, archetypes, and shells.',
};

export default async function RegistryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const type = (params.type as string) || '';
  const namespace = (params.namespace as string) || '';
  const query = (params.q as string) || '';
  const offset = Number(params.offset || '0');

  let items: Awaited<ReturnType<typeof listContent>>['items'] = [];
  let total = 0;

  try {
    if (query) {
      const result = await searchContent(query, {
        type: type || undefined,
        namespace: namespace || undefined,
      });
      items = result.items;
      total = result.total;
    } else {
      const contentType = type || 'patterns';
      const result = await listContent(contentType, {
        namespace: namespace || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      items = result.items;
      total = result.total;
    }
  } catch {
    // API may be unavailable during build or dev — show empty state
  }

  return (
    <section className="mx-auto max-w-[var(--max-w)] px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">Registry</h1>

      <Suspense>
        <SearchFilterBar />
      </Suspense>

      <div className="mt-8">
        <ContentGrid items={items} />
        <Suspense>
          <Pagination total={total} />
        </Suspense>
      </div>
    </section>
  );
}
