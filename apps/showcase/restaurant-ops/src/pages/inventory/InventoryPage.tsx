import { useState, useMemo } from 'react';
import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Search, Package, AlertTriangle } from 'lucide-react';
import { ingredients, stockPercent, formatCurrency } from '../../data/mock';

export function InventoryPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const categories = ['All', ...new Set(ingredients.map(i => i.category))];

  const filtered = useMemo(() =>
    ingredients.filter(i => {
      if (query && !i.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (category !== 'All' && i.category !== category) return false;
      return true;
    }),
  [query, category]);

  const lowStock = ingredients.filter(i => stockPercent(i.currentStock, i.parLevel) < 50);

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Inventory</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{ingredients.length} ingredients tracked</p>
        </div>
        <Link to="/inventory/orders" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none', fontSize: '0.8125rem' }}>
          <Package size={14} /> Purchase Orders
        </Link>
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div className="bistro-daily" style={{ padding: '0.875rem 1.25rem' }}>
          <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
            <AlertTriangle size={16} />
            <span className={css('_fontmedium')} style={{ fontSize: '0.875rem' }}>{lowStock.length} items below par level</span>
          </div>
          <div className={css('_flex _wrap _gap2')}>
            {lowStock.map(i => (
              <Link key={i.id} to={`/inventory/${i.id}`} style={{ textDecoration: 'none' }}>
                <span className="d-annotation" data-status="warning">{i.name} ({stockPercent(i.currentStock, i.parLevel)}%)</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search / Filter */}
      <div className={css('_flex _aic _gap3')} style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input className="d-control" placeholder="Search ingredients..."
            value={query} onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem' }} />
        </div>
        <div className={css('_flex _aic _gap2')}>
          {categories.map(c => (
            <button key={c} className="d-interactive" data-variant={category === c ? 'primary' : 'ghost'}
              onClick={() => setCategory(c)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredient list */}
      <table className="d-data">
        <thead>
          <tr>
            <th className="d-data-header">Ingredient</th>
            <th className="d-data-header">Category</th>
            <th className="d-data-header">Stock Level</th>
            <th className="d-data-header">Par</th>
            <th className="d-data-header">Unit Cost</th>
            <th className="d-data-header">Supplier</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(i => {
            const pct = stockPercent(i.currentStock, i.parLevel);
            const barColor = pct < 30 ? 'var(--d-error)' : pct < 60 ? 'var(--d-warning)' : 'var(--d-success)';
            return (
              <tr key={i.id} className="d-data-row">
                <td className="d-data-cell">
                  <Link to={`/inventory/${i.id}`} style={{ textDecoration: 'none', color: 'var(--d-text)', fontWeight: 500 }}>{i.name}</Link>
                </td>
                <td className="d-data-cell">{i.category}</td>
                <td className="d-data-cell">
                  <div className={css('_flex _aic _gap2')}>
                    <div className="depletion-bar" style={{ width: 80 }}>
                      <div className="depletion-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: barColor }}>{i.currentStock} {i.unit}</span>
                  </div>
                </td>
                <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>{i.parLevel} {i.unit}</td>
                <td className="d-data-cell">{formatCurrency(i.cost)}</td>
                <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>{i.supplier}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
