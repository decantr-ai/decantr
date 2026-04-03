import { useState, useMemo } from 'react';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { ContentCardGrid } from '@/components/ContentCardGrid';
import { CONTENT_ITEMS } from '@/data/mock';

export function BrowsePage() {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);
  const [sort, setSort] = useState('popular');

  const filtered = useMemo(() => {
    let items = CONTENT_ITEMS;

    // Filter by type
    if (activeType) {
      items = items.filter((i) => i.type === activeType);
    }

    // Filter by search query
    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      );
    }

    // Sort
    const sorted = [...items];
    if (sort === 'popular') {
      sorted.sort((a, b) => b.downloads - a.downloads);
    } else if (sort === 'recent') {
      sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  }, [query, activeType, sort]);

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <SearchFilterBar
        resultCount={filtered.length}
        query={query}
        onQueryChange={setQuery}
        activeType={activeType}
        onTypeChange={setActiveType}
        sort={sort}
        onSortChange={setSort}
      />

      <div style={{ marginTop: '2rem' }}>
        <ContentCardGrid items={filtered} />
      </div>
    </div>
  );
}
