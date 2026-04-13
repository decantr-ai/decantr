import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SearchFilterBar } from '../../components/SearchFilterBar';
import { ContentCardGrid } from '../../components/ContentCardGrid';
import { contentItems, type ContentItem } from '../../data/mock';

const TYPE_LABELS: Record<string, string> = {
  pattern: 'Patterns',
  theme: 'Themes',
  blueprint: 'Blueprints',
  shell: 'Shells',
  archetype: 'Archetypes',
};

export default function BrowseTypePage() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  const filtered = useMemo(() => {
    let items = contentItems.filter((item) => item.type === type);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'downloads':
        items = [...items].sort((a, b) => b.downloads - a.downloads);
        break;
      case 'updated':
        items = [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        break;
      case 'name':
        items = [...items].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return items;
  }, [type, searchQuery, sortBy]);

  function handleItemClick(item: ContentItem) {
    navigate(`/browse/${item.type}/${item.namespace}/${item.slug}`);
  }

  function handleTypeChange(newType: string) {
    if (newType === 'all') {
      navigate('/browse');
    } else {
      navigate(`/browse/${newType}`);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Heading */}
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        Browse {TYPE_LABELS[type ?? ''] ?? type}
      </h1>

      {/* Search and filters with type pre-selected */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeType={type ?? 'all'}
        onTypeChange={handleTypeChange}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Result count */}
      <div
        style={{
          fontSize: '0.8125rem',
          color: 'var(--d-text-muted)',
        }}
      >
        Showing {filtered.length} results
      </div>

      {/* Content grid */}
      <ContentCardGrid items={filtered} onItemClick={handleItemClick} />
    </div>
  );
}
