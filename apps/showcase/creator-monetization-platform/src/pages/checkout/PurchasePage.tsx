import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { CreditCard } from 'lucide-react';

export function PurchasePage() {
  const navigate = useNavigate();
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div>
        <h1 className="serif-display" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>One-time purchase</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9375rem' }}>Buy "A year of mornings, illustrated" — PDF zine ($14).</p>
      </div>

      <div className="studio-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Payment</h3>
        <div className={css('_flex _col _gap3')}>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Email (for receipt)</span>
            <input className="studio-input" type="email" placeholder="you@email.com" />
          </label>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Card</span>
            <input className="studio-input" type="text" placeholder="Card number" />
          </label>
        </div>
        <button onClick={() => navigate('/checkout/success')} className="d-interactive studio-glow" data-variant="primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '0.625rem 1rem', fontSize: '0.875rem' }}>
          <CreditCard size={14} /> Pay $14.00
        </button>
      </div>
    </div>
  );
}
