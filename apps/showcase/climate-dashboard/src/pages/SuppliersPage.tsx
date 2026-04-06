import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Search, Filter } from 'lucide-react';
import { suppliers } from '@/data/mock';
import { SupplyChainMap } from '@/components/SupplyChainMap';

export function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<number | null>(null);

  const filtered = suppliers.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.country.toLowerCase().includes(search.toLowerCase())) return false;
    if (tierFilter && s.tier !== tierFilter) return false;
    return true;
  });

  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Supply Chain</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Supplier emissions mapping and tier tracking</p>
      </div>

      {/* Map */}
      <div className="d-surface earth-card">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>Supplier Map</div>
        <SupplyChainMap />
      </div>

      {/* Filters */}
      <div className={css('_flex _gap3 _aic _wrap')}>
        <div className={css('_flex _aic _gap2')} style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ color: 'var(--d-text-muted)' }} />
          <input
            className="d-control earth-input"
            type="text"
            placeholder="Search suppliers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={css('_flex _aic _gap2')}>
          <Filter size={14} style={{ color: 'var(--d-text-muted)' }} />
          {[null, 1, 2, 3].map(t => (
            <button
              key={String(t)}
              className="d-interactive"
              data-variant={tierFilter === t ? 'primary' : 'ghost'}
              onClick={() => setTierFilter(t)}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}
            >
              {t === null ? 'All' : `Tier ${t}`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="d-surface earth-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Supplier</th>
              <th className="d-data-header">Tier</th>
              <th className="d-data-header">Country</th>
              <th className="d-data-header">Category</th>
              <th className="d-data-header">Emissions</th>
              <th className="d-data-header">Status</th>
              <th className="d-data-header">SBTi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="d-data-row">
                <td className="d-data-cell">
                  <Link to={`/suppliers/${s.id}`} style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 500 }}>
                    {s.name}
                  </Link>
                </td>
                <td className="d-data-cell">
                  <span className="earth-badge" style={{ background: s.tier === 1 ? 'color-mix(in srgb, var(--d-primary) 15%, transparent)' : s.tier === 2 ? 'color-mix(in srgb, var(--d-warning) 15%, transparent)' : 'color-mix(in srgb, var(--d-error) 15%, transparent)', padding: '0.125rem 0.5rem', borderRadius: 'var(--d-radius-full)', fontSize: '0.75rem' }}>
                    Tier {s.tier}
                  </span>
                </td>
                <td className="d-data-cell">{s.country}</td>
                <td className="d-data-cell">{s.category}</td>
                <td className="d-data-cell" style={{ fontWeight: 600 }}>{s.emissions.toLocaleString()} tCO2e</td>
                <td className="d-data-cell">
                  <span className="d-annotation" data-status={s.status === 'compliant' ? 'success' : s.status === 'at-risk' ? 'warning' : 'error'}>
                    {s.status}
                  </span>
                </td>
                <td className="d-data-cell">
                  {s.sbtiCommitted ? (
                    <span className="d-annotation" data-status="success">Committed</span>
                  ) : (
                    <span className="d-annotation">Not yet</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
