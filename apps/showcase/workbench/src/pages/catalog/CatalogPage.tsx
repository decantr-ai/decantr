import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Tag } from 'lucide-react';
import { catalogItems } from '@/data/mock';

const allCategories = Array.from(new Set(catalogItems.map(c => c.category)));

const statusAnnotation: Record<string, string> = {
  stable: 'success',
  beta: 'warning',
  experimental: 'info',
  deprecated: 'error',
};

export function CatalogPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = catalogItems.filter(item => {
    const matchesQuery = !query || item.name.toLowerCase().includes(query.toLowerCase()) || item.tags.some(t => t.includes(query.toLowerCase()));
    const matchesCat = !activeCategory || item.category === activeCategory;
    return matchesQuery && matchesCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Component Catalog</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          Browse and search the design system component library.
        </p>
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input
            className="d-control"
            placeholder="Search components..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: '2rem', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setActiveCategory(null)}
            className="wb-tab"
            data-active={activeCategory === null ? 'true' : undefined}
          >
            All
          </button>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="wb-tab"
              data-active={activeCategory === cat ? 'true' : undefined}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="d-label">
        {filtered.length} component{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {filtered.map(item => (
          <Link
            key={item.id}
            to={`/catalog/${item.id}`}
            className="d-surface d-glass"
            data-interactive
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 className="mono-data" style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{item.name}</h3>
              <span className="d-annotation" data-status={statusAnnotation[item.status]}>
                {item.status}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.5, flex: 1 }}>
              {item.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {item.tags.map(tag => (
                  <span key={tag} className="d-annotation" style={{ fontSize: '0.625rem' }}>
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
                <Download size={10} />
                {item.downloads}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
