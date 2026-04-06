import { css } from '@decantr/css';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, TrendingDown } from 'lucide-react';
import { ingredients, stockPercent, formatCurrency } from '../../data/mock';
import { MiniBarChart } from '../../components/MiniChart';

export function IngredientDetailPage() {
  const { id } = useParams();
  const ing = ingredients.find(i => i.id === id) ?? ingredients[0];
  const pct = stockPercent(ing.currentStock, ing.parLevel);
  const barColor = pct < 30 ? 'var(--d-error)' : pct < 60 ? 'var(--d-warning)' : 'var(--d-success)';

  // Mock usage data
  const usageData = [
    { label: 'Mon', value: 4 },
    { label: 'Tue', value: 3 },
    { label: 'Wed', value: 5 },
    { label: 'Thu', value: 6 },
    { label: 'Fri', value: 8 },
    { label: 'Sat', value: 10 },
    { label: 'Sun', value: 7 },
  ];

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640 }}>
      <div className={css('_flex _aic _gap3')}>
        <Link to="/inventory" className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>{ing.name}</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{ing.category} &middot; {ing.supplier}</p>
        </div>
      </div>

      {/* Stock header */}
      <div className="bistro-warm-card" style={{ cursor: 'default' }}>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '1rem' }}>
          <div className={css('_flex _aic _gap2')}>
            <Package size={20} style={{ color: barColor }} />
            <div>
              <div className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>{ing.currentStock} <span style={{ fontSize: '0.875rem', fontFamily: 'system-ui' }}>{ing.unit}</span></div>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Par: {ing.parLevel} {ing.unit}</p>
            </div>
          </div>
          <span className="d-annotation" data-status={pct < 50 ? 'warning' : 'success'}>{pct}% stocked</span>
        </div>
        <div className="depletion-bar" style={{ height: 12 }}>
          <div className="depletion-bar-fill" style={{ width: `${pct}%`, background: barColor, height: '100%' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="bistro-warm-card" style={{ cursor: 'default' }}>
          <span className="d-label">Unit Cost</span>
          <div className="bistro-handwritten" style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>{formatCurrency(ing.cost)}</div>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>per {ing.unit}</p>
        </div>
        <div className="bistro-warm-card" style={{ cursor: 'default' }}>
          <span className="d-label">Last Ordered</span>
          <div className="bistro-handwritten" style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>{ing.lastOrdered}</div>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>from {ing.supplier}</p>
        </div>
      </div>

      {/* Usage chart */}
      <div className="bistro-warm-card" style={{ cursor: 'default' }}>
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
          <TrendingDown size={16} style={{ color: 'var(--d-text-muted)' }} />
          <span className={css('_fontmedium')}>Weekly Usage</span>
        </div>
        <MiniBarChart data={usageData} barColor={barColor} />
      </div>

      <button className="d-interactive" data-variant="primary" style={{ alignSelf: 'flex-start' }}>
        <Package size={14} /> Create Purchase Order
      </button>
    </div>
  );
}
