import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchFilterBar } from '../../components/SearchFilterBar';
import { ContentCardGrid } from '../../components/ContentCardGrid';
import { contentItems, type ContentItem } from '../../data/mock';

export default function BrowsePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const filtered = useMemo(() => {
    let items = contentItems;

    // Filter by type
    if (activeType !== 'all') {
      items = items.filter((item) => item.type === activeType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q) ||
          item.namespace.toLowerCase().includes(q)
      );
    }

    // Sort
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
  }, [searchQuery, activeType, sortBy]);

  function handleItemClick(item: ContentItem) {
    navigate(`/browse/${item.type}/${item.namespace}/${item.slug}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search and filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeType={activeType}
        onTypeChange={setActiveType}
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
