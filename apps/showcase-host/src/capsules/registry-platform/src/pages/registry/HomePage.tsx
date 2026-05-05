import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchFilterBar } from '../../components/SearchFilterBar';
import { ContentCardGrid } from '../../components/ContentCardGrid';
import { KPIGrid } from '../../components/KPIGrid';
import { contentItems, registryKPIs, type ContentItem } from '../../data/mock';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const featured = contentItems.slice(0, 6);

  function handleItemClick(item: ContentItem) {
    navigate(`/browse/${item.type}/${item.namespace}/${item.slug}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hero section */}
      <div
        className="lum-orbs d-section"
        style={{
          textAlign: 'center',
          padding: 'var(--d-gap-12) var(--d-gap-6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--d-gap-4)',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Design Intelligence Registry
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--d-text-muted)',
            maxWidth: '32rem',
            lineHeight: 1.5,
          }}
        >
          Browse 116 patterns, 20 themes, and 19 blueprints
        </p>
        <button
          className="d-interactive"
          data-variant="primary"
          onClick={() => navigate('/browse')}
          style={{
            borderRadius: 'var(--d-radius-full)',
            padding: '0.625rem 1.5rem',
            fontWeight: 600,
            fontSize: '0.9375rem',
            marginTop: 'var(--d-gap-2)',
          }}
        >
          Browse Registry
        </button>
      </div>

      {/* Divider */}
      <div className="lum-divider" />

      {/* Compact search */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeType={activeType}
        onTypeChange={setActiveType}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Divider */}
      <div className="lum-divider" />

      {/* Featured content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-4)' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          Featured Content
        </h2>
        <ContentCardGrid items={featured} onItemClick={handleItemClick} />
      </div>

      {/* Divider */}
      <div className="lum-divider" />

      {/* KPI stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-4)' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          Registry Stats
        </h2>
        <KPIGrid kpis={registryKPIs} />
      </div>
    </div>
  );
}
