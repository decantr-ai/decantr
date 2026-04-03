import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { css } from '@decantr/css';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { ContentCardGrid } from '@/components/ContentCardGrid';
import { CONTENT_ITEMS } from '@/data/mock';
const TYPE_LABELS: Record<string, string> = {
  pattern: 'Patterns',
  theme: 'Themes',
  blueprint: 'Blueprints',
  shell: 'Shells',
  archetype: 'Archetypes',
};

export function BrowseTypePage() {
  const { type } = useParams<{ type: string }>();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('popular');

  const filtered = useMemo(() => {
    let items = CONTENT_ITEMS.filter((i) => i.type === type);

    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      );
    }

    const sorted = [...items];
    if (sort === 'popular') {
      sorted.sort((a, b) => b.downloads - a.downloads);
    } else if (sort === 'recent') {
      sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  }, [type, query, sort]);

  const label = TYPE_LABELS[type ?? ''] ?? type ?? 'Unknown';

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <h2
        className={css('_fontsemi')}
        style={{ fontSize: '1.75rem', color: 'var(--d-text)', marginBottom: '1.5rem' }}
      >
        {label}
      </h2>

      <SearchFilterBar
        resultCount={filtered.length}
        query={query}
        onQueryChange={setQuery}
        activeType={type ?? null}
        onTypeChange={() => {}}
        sort={sort}
        onSortChange={setSort}
      />

      <div style={{ marginTop: '2rem' }}>
        <ContentCardGrid items={filtered} />
      </div>
    </div>
  );
}
