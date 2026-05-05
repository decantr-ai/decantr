import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Search, Filter, Database, FileSpreadsheet, FileJson } from 'lucide-react';
import { datasets } from '../data/mock';
import { useState } from 'react';

const formatIcon: Record<string, typeof Database> = {
  CSV: FileSpreadsheet,
  XLSX: FileSpreadsheet,
  JSON: FileJson,
};

export function DatasetsPage() {
  const [query, setQuery] = useState('');
  const filtered = query
    ? datasets.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
    : datasets;

  return (
    <div>
      <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontWeight: 500, fontSize: '1.25rem' }}>Data Repository</h1>
        <button className="d-interactive" data-variant="primary" style={{ borderRadius: 2, padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
          Upload Dataset
        </button>
      </div>

      {/* Search bar */}
      <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
        <div className={css('_flex _aic')} style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.625rem', color: 'var(--d-text-muted)' }} />
          <input
            className="d-control"
            placeholder="Search datasets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2rem', borderRadius: 2 }}
          />
        </div>
        <button className="d-interactive" data-variant="ghost" style={{ padding: '0.5rem', borderRadius: 2 }}>
          <Filter size={14} />
        </button>
      </div>

      {/* Card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '0.75rem' }}>
        {filtered.map((ds) => {
          const Icon = formatIcon[ds.format] || Database;
          return (
            <Link
              key={ds.id}
              to={`/datasets/${ds.id}`}
              className="lab-panel"
              style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: '1rem', transition: 'border-color 100ms linear' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--d-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--d-border)'; }}
            >
              <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
                <Icon size={16} style={{ color: 'var(--d-primary)' }} />
                <h3 style={{ fontWeight: 500, fontSize: '0.9375rem', flex: 1 }}>{ds.name}</h3>
              </div>
              <div className={css('_flex _aic _gap3')} style={{ marginBottom: '0.5rem' }}>
                <span className="lab-chip">{ds.format}</span>
                <span className="lab-chip">{ds.size}</span>
                <span className="lab-quality" data-level={ds.quality}>{ds.quality} quality</span>
              </div>
              <div className={css('_flex _aic _jcsb')} style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                <span>{ds.experiment}</span>
                <span className="lab-reading">{ds.records.toLocaleString()} records</span>
              </div>

              {/* Schema preview */}
              <div style={{ marginTop: '0.625rem', borderTop: '1px solid var(--d-border)', paddingTop: '0.5rem' }}>
                <span className="d-label" style={{ fontSize: '0.5625rem' }}>Schema</span>
                <div className={css('_flex _col _gap1')} style={{ marginTop: '0.25rem' }}>
                  {ds.columns.slice(0, 3).map((col) => (
                    <div key={col.name} className={css('_flex _aic _gap2')} style={{ fontSize: '0.6875rem' }}>
                      <span className="lab-reading" style={{ color: 'var(--d-text)', fontWeight: 500 }}>{col.name}</span>
                      <span style={{ color: 'var(--d-text-muted)' }}>{col.type}</span>
                      {col.nullable && <span style={{ color: 'var(--d-warning)', fontSize: '0.625rem' }}>nullable</span>}
                    </div>
                  ))}
                  {ds.columns.length > 3 && (
                    <span style={{ fontSize: '0.625rem', color: 'var(--d-text-muted)' }}>+{ds.columns.length - 3} more columns</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
