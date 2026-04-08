import { type ContentItem } from '../data/mock';

const CONTENT_TYPES = ['all', 'pattern', 'theme', 'blueprint', 'shell'] as const;
type ContentType = (typeof CONTENT_TYPES)[number];

const TYPE_LABELS: Record<ContentType, string> = {
  all: 'All',
  pattern: 'Patterns',
  theme: 'Themes',
  blueprint: 'Blueprints',
  shell: 'Shells',
};

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'downloads', label: 'Most Downloaded' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'name', label: 'Name A-Z' },
] as const;

type SortBy = (typeof SORT_OPTIONS)[number]['value'];

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeType: string;
  onTypeChange: (type: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  activeType,
  onTypeChange,
  sortBy,
  onSortChange,
}: SearchFilterBarProps) {
  const activeFilters: { key: string; label: string }[] = [];
  if (activeType !== 'all') {
    activeFilters.push({ key: 'type', label: TYPE_LABELS[activeType as ContentType] ?? activeType });
  }
  if (searchQuery.trim()) {
    activeFilters.push({ key: 'search', label: `"${searchQuery}"` });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-4)' }}>
      {/* Search row */}
      <div style={{ position: 'relative' }}>
        <span
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1rem',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          aria-hidden="true"
        >
          🔍
        </span>
        <input
          type="text"
          className="d-control"
          placeholder="Search patterns, themes, blueprints..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ paddingLeft: '2.5rem', fontSize: '0.9375rem' }}
        />
      </div>

      {/* Filter row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--d-gap-4)',
          flexWrap: 'wrap',
        }}
      >
        {/* Type tabs */}
        <div style={{ display: 'flex', gap: 'var(--d-gap-2)', flexWrap: 'wrap' }}>
          {CONTENT_TYPES.map((type) => {
            const isActive = activeType === type;
            return (
              <button
                key={type}
                className="d-interactive"
                data-variant={isActive ? 'primary' : 'ghost'}
                onClick={() => onTypeChange(type)}
                style={{
                  borderRadius: 'var(--d-radius-full)',
                  fontSize: '0.8125rem',
                  padding: '0.375rem 0.875rem',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>

        {/* Sort dropdown */}
        <select
          className="d-control"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          style={{
            width: 'auto',
            minWidth: '10rem',
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--d-gap-2)', flexWrap: 'wrap' }}>
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="d-annotation"
              style={{
                cursor: 'pointer',
                transition: 'opacity 0.15s ease',
                padding: '0.25rem 0.625rem',
              }}
              onClick={() => {
                if (filter.key === 'type') onTypeChange('all');
                if (filter.key === 'search') onSearchChange('');
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (filter.key === 'type') onTypeChange('all');
                  if (filter.key === 'search') onSearchChange('');
                }
              }}
            >
              {filter.label}
              <span style={{ marginLeft: '0.375rem', opacity: 0.6 }}>✕</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
