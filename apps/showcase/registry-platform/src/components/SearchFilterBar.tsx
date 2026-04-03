import { css } from '@decantr/css';
import { Search } from 'lucide-react';

const TYPES = ['All', 'Patterns', 'Themes', 'Blueprints', 'Shells'] as const;
const SORTS = ['Relevance', 'Most Downloaded', 'Recently Updated', 'Name A-Z'] as const;

interface Props {
  onSearch?: (q: string) => void;
  onTypeFilter?: (type: string) => void;
  onSort?: (sort: string) => void;
  activeType?: string | null;
  resultCount?: number;
  query?: string;
  onQueryChange?: (q: string) => void;
  onTypeChange?: (type: string | null) => void;
  sort?: string;
  onSortChange?: (sort: string) => void;
}

export function SearchFilterBar({ onSearch, onTypeFilter, onSort, activeType = 'All', resultCount, query, onQueryChange, onTypeChange, sort, onSortChange }: Props) {
  const handleSearch = (v: string) => { onSearch?.(v); onQueryChange?.(v); };
  const handleType = (t: string) => {
    if (onTypeFilter) onTypeFilter(t);
    if (onTypeChange) onTypeChange(t === 'All' ? null : t.toLowerCase().replace(/s$/, '') as string);
  };
  const handleSort = (s: string) => { onSort?.(s); onSortChange?.(s as string); };
  const currentType = activeType ? (activeType.charAt(0).toUpperCase() + activeType.slice(1) + (activeType !== 'All' && !activeType.endsWith('s') ? 's' : '')) : 'All';
  return (
    <div className={css('_flex _col _gap4')}>
      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--d-text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          className="d-control"
          type="text"
          placeholder="Search patterns, themes, blueprints..."
          value={query ?? ''}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ paddingLeft: '2.25rem' }}
        />
      </div>

      {/* Filters row */}
      <div className={css('_flex _aic _jcsb _wrap _gap3')}>
        {/* Type tabs */}
        <div className={css('_flex _aic _gap2 _wrap')}>
          {TYPES.map((type) => (
            <button
              key={type}
              className="d-interactive"
              data-variant={currentType === type ? 'primary' : 'ghost'}
              onClick={() => handleType(type as string)}
              style={{
                borderRadius: 'var(--d-radius-full)',
                fontSize: '0.8125rem',
                padding: '0.25rem 0.75rem',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        <div className={css('_flex _aic _gap3')}>
          {resultCount !== undefined && (
            <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
              {resultCount} results
            </span>
          )}
          <select
            className="d-control"
            value={sort ?? 'Relevance'}
            onChange={(e) => handleSort(e.target.value)}
            style={{ width: 'auto', minWidth: 160 }}
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
