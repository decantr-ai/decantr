import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { samples } from '../data/mock';
import { useState } from 'react';

const statusMap: Record<string, { label: string; dot: string }> = {
  available: { label: 'Available', dot: 'active' },
  'in-use': { label: 'In Use', dot: 'pending' },
  expired: { label: 'Expired', dot: 'error' },
  quarantined: { label: 'Quarantined', dot: 'error' },
};

export function SamplesPage() {
  const [query, setQuery] = useState('');
  const filtered = query
    ? samples.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.barcode.toLowerCase().includes(query.toLowerCase()))
    : samples;

  return (
    <div>
      <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontWeight: 500, fontSize: '1.25rem' }}>Sample Inventory</h1>
        <button className="d-interactive" data-variant="primary" style={{ borderRadius: 2, padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
          Register Sample
        </button>
      </div>

      {/* Search bar */}
      <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
        <div className={css('_flex _aic')} style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.625rem', color: 'var(--d-text-muted)' }} />
          <input
            className="d-control"
            placeholder="Search by name or barcode..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2rem', borderRadius: 2 }}
          />
        </div>
        <button className="d-interactive" data-variant="ghost" style={{ padding: '0.5rem', borderRadius: 2 }}>
          <Filter size={14} />
        </button>
      </div>

      {/* Data table */}
      <div className="lab-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Barcode</th>
              <th className="d-data-header">Name</th>
              <th className="d-data-header">Type</th>
              <th className="d-data-header">Location</th>
              <th className="d-data-header">Status</th>
              <th className="d-data-header">Expires</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const st = statusMap[s.status];
              return (
                <tr key={s.id} className="d-data-row">
                  <td className="d-data-cell">
                    <Link to={`/samples/${s.id}`} style={{ textDecoration: 'none' }}>
                      <span className="lab-barcode">{s.barcode}</span>
                    </Link>
                  </td>
                  <td className="d-data-cell">
                    <Link to={`/samples/${s.id}`} style={{ textDecoration: 'none', color: 'var(--d-text)', fontWeight: 500, fontSize: '0.8125rem' }}>
                      {s.name}
                    </Link>
                  </td>
                  <td className="d-data-cell" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{s.type}</td>
                  <td className="d-data-cell" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{s.location}</td>
                  <td className="d-data-cell">
                    <span className={css('_flex _aic _gap2')} style={{ fontSize: '0.8125rem' }}>
                      <span className="lab-status-dot" data-status={st.dot} />
                      {st.label}
                    </span>
                  </td>
                  <td className="d-data-cell">
                    <span className="lab-reading" style={{ fontSize: '0.8125rem' }}>{s.expiresAt}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
