import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface FilterBarProps {
  placeholder?: string;
  filters?: { label: string; options: string[] }[];
  onSearch?: (query: string) => void;
  onFilter?: (key: string, value: string) => void;
}

export function FilterBar({ placeholder = 'Search...', filters = [], onSearch, onFilter }: FilterBarProps) {
  const [query, setQuery] = useState('');

  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)', pointerEvents: 'none' }} />
        <input
          className="d-control"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); onSearch?.(e.target.value); }}
          style={{ paddingLeft: '2.25rem' }}
        />
        {query && (
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => { setQuery(''); onSearch?.(''); }}
            style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', padding: 4, border: 'none' }}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {filters.map(f => (
        <select
          key={f.label}
          className="d-control"
          style={{ width: 'auto', minWidth: 120, appearance: 'none', paddingRight: '2rem', cursor: 'pointer' }}
          onChange={e => onFilter?.(f.label, e.target.value)}
        >
          <option value="">{f.label}</option>
          {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ))}
    </div>
  );
}
