import { useState, useMemo } from 'react';
import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Search, Heart } from 'lucide-react';
import { customers, formatCurrency } from '../../data/mock';

const tierColor: Record<string, string> = { bronze: '#CD7F32', silver: '#A0A0A0', gold: '#D4A017', platinum: '#8B7D6B' };

export function CustomersPage() {
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState('All');

  const filtered = useMemo(() =>
    customers.filter(c => {
      if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (tier !== 'All' && c.tier !== tier) return false;
      return true;
    }),
  [query, tier]);

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Customers</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{customers.length} guests in your book</p>
        </div>
        <Link to="/customers/loyalty" className="d-interactive" style={{ textDecoration: 'none', fontSize: '0.8125rem' }}>
          <Heart size={14} /> Loyalty Program
        </Link>
      </div>

      {/* Filters */}
      <div className={css('_flex _aic _gap3')} style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input className="d-control" placeholder="Search guests..."
            value={query} onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem' }} />
        </div>
        <div className={css('_flex _aic _gap2')}>
          {['All', 'bronze', 'silver', 'gold', 'platinum'].map(t => (
            <button key={t} className="d-interactive" data-variant={tier === t ? 'primary' : 'ghost'}
              onClick={() => setTier(t)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Customer list */}
      <table className="d-data">
        <thead>
          <tr>
            <th className="d-data-header">Guest</th>
            <th className="d-data-header">Tier</th>
            <th className="d-data-header">Visits</th>
            <th className="d-data-header">Total Spent</th>
            <th className="d-data-header">Last Visit</th>
            <th className="d-data-header">Favorites</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(c => (
            <tr key={c.id} className="d-data-row">
              <td className="d-data-cell">
                <Link to={`/customers/${c.id}`} style={{ textDecoration: 'none', color: 'var(--d-text)', fontWeight: 500 }}>{c.name}</Link>
              </td>
              <td className="d-data-cell">
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
                  color: tierColor[c.tier], letterSpacing: '0.05em',
                }}>{c.tier}</span>
              </td>
              <td className="d-data-cell">{c.visits}</td>
              <td className="d-data-cell">{formatCurrency(c.totalSpent)}</td>
              <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>{c.lastVisit}</td>
              <td className="d-data-cell">
                <div className={css('_flex _wrap _gap1')}>
                  {c.favoriteItems.map(f => (
                    <span key={f} className="d-annotation" style={{ fontSize: '0.625rem' }}>{f}</span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
