import { css } from '@decantr/css';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Calendar, DollarSign, Star } from 'lucide-react';
import { customers, formatCurrency } from '../../data/mock';

const tierColor: Record<string, string> = { bronze: '#CD7F32', silver: '#A0A0A0', gold: '#D4A017', platinum: '#8B7D6B' };

export function CustomerDetailPage() {
  const { id } = useParams();
  const customer = customers.find(c => c.id === id) ?? customers[0];

  const visitHistory = [
    { date: '2026-04-06', spend: 86, items: ['Rigatoni Bolognese', 'Tiramisu', 'Glass of Barolo'] },
    { date: '2026-04-02', spend: 124, items: ['Steak Frites x2', 'Caesar Salad', 'Bottle of Chianti'] },
    { date: '2026-03-28', spend: 68, items: ['Margherita Pizza', 'Burrata', 'Espresso'] },
    { date: '2026-03-20', spend: 92, items: ['Grilled Branzino', 'Risotto', 'Panna Cotta'] },
    { date: '2026-03-14', spend: 54, items: ['Caesar Salad', 'Roast Chicken'] },
  ];

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640 }}>
      <div className={css('_flex _aic _gap3')}>
        <Link to="/customers" className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} />
        </Link>
        <div style={{ flex: 1 }}>
          <div className={css('_flex _aic _gap2')}>
            <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>{customer.name}</h1>
            <span style={{
              fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
              color: tierColor[customer.tier], letterSpacing: '0.08em',
              border: `1px solid ${tierColor[customer.tier]}`, borderRadius: 'var(--d-radius-sm)',
              padding: '0.125rem 0.5rem',
            }}>{customer.tier}</span>
          </div>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{customer.email} &middot; {customer.phone}</p>
        </div>
      </div>

      {/* Customer header stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <div className="bistro-warm-card" style={{ textAlign: 'center', cursor: 'default' }}>
          <Calendar size={18} style={{ color: 'var(--d-primary)', margin: '0 auto 0.25rem' }} />
          <div className="bistro-handwritten" style={{ fontSize: '1.25rem' }}>{customer.visits}</div>
          <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Visits</span>
        </div>
        <div className="bistro-warm-card" style={{ textAlign: 'center', cursor: 'default' }}>
          <DollarSign size={18} style={{ color: 'var(--d-success)', margin: '0 auto 0.25rem' }} />
          <div className="bistro-handwritten" style={{ fontSize: '1.25rem' }}>{formatCurrency(customer.totalSpent)}</div>
          <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Lifetime</span>
        </div>
        <div className="bistro-warm-card" style={{ textAlign: 'center', cursor: 'default' }}>
          <Star size={18} style={{ color: 'var(--d-warning)', margin: '0 auto 0.25rem' }} />
          <div className="bistro-handwritten" style={{ fontSize: '1.25rem' }}>{formatCurrency(customer.totalSpent / customer.visits)}</div>
          <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Avg Check</span>
        </div>
      </div>

      {/* Favorites */}
      <div className="bistro-warm-card" style={{ cursor: 'default' }}>
        <span className="d-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Favorites</span>
        <div className={css('_flex _wrap _gap2')}>
          {customer.favoriteItems.map(f => (
            <span key={f} className="d-annotation" data-status="info">{f}</span>
          ))}
        </div>
        {customer.notes && (
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.75rem', fontStyle: 'italic' }}>
            Note: {customer.notes}
          </p>
        )}
      </div>

      {/* Visit history */}
      <div>
        <span className="d-label" style={{ marginBottom: '0.5rem', display: 'block', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>Visit History</span>
        <div className={css('_flex _col _gap2')}>
          {visitHistory.map((v, i) => (
            <div key={i} className="bistro-warm-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--d-primary)', marginTop: '0.5rem', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className={css('_flex _aic _jcsb')}>
                  <span className={css('_fontmedium')} style={{ fontSize: '0.875rem' }}>{v.date}</span>
                  <span className={css('_fontmedium')} style={{ fontSize: '0.875rem', color: 'var(--d-success)' }}>{formatCurrency(v.spend)}</span>
                </div>
                <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>{v.items.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
