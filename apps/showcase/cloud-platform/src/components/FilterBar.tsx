import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  placeholder?: string;
  filters?: { label: string; options: FilterOption[] }[];
  onSearch?: (query: string) => void;
  onFilter?: (key: string, value: string) => void;
}

export function FilterBar({ placeholder = 'Search...', filters = [], onSearch, onFilter }: FilterBarProps) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input
            className="d-control"
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={e => { setQuery(e.target.value); onSearch?.(e.target.value); }}
            style={{ paddingLeft: '2rem' }}
          />
        </div>
        {filters.map(filter => (
          <select
            key={filter.label}
            className="d-control"
            style={{ width: 'auto', minWidth: 120, appearance: 'none', paddingRight: '2rem', cursor: 'pointer' }}
            value={activeFilters[filter.label] || ''}
            onChange={e => {
              setActiveFilters(prev => ({ ...prev, [filter.label]: e.target.value }));
              onFilter?.(filter.label, e.target.value);
            }}
          >
            <option value="">{filter.label}</option>
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ))}
        {Object.keys(activeFilters).some(k => activeFilters[k]) && (
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => { setActiveFilters({}); setQuery(''); onSearch?.(''); }}
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
