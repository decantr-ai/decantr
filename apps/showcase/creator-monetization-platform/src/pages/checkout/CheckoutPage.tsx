import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { CreditCard, Tag } from 'lucide-react';
import { currentCreator, tiers } from '../../data/mock';

export function CheckoutPage() {
  const navigate = useNavigate();
  const tier = tiers[1];
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div>
        <h1 className="serif-display" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Subscribe to {currentCreator.name}</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9375rem' }}>You'll be charged ${tier.price} today and monthly after that. Cancel anytime.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem' }} className="checkout-grid">
        <div className="studio-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Payment method</h3>
          <div className={css('_flex _col _gap3')}>
            <div className={css('_flex _gap2')}>
              <button className="d-interactive studio-glow" data-variant="primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem', padding: '0.625rem' }}>
                <CreditCard size={14} /> Card
              </button>
              <button className="d-interactive" data-variant="ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem' }}>Apple Pay</button>
              <button className="d-interactive" data-variant="ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem' }}>Google Pay</button>
            </div>
            <label className={css('_flex _col _gap1')}>
              <span className={css('_textsm _fontmedium')}>Card number</span>
              <input className="studio-input" type="text" placeholder="4242 4242 4242 4242" />
            </label>
            <div className={css('_flex _gap3')}>
              <label className={css('_flex _col _gap1')} style={{ flex: 1 }}>
                <span className={css('_textsm _fontmedium')}>Expiry</span>
                <input className="studio-input" type="text" placeholder="MM/YY" />
              </label>
              <label className={css('_flex _col _gap1')} style={{ flex: 1 }}>
                <span className={css('_textsm _fontmedium')}>CVC</span>
                <input className="studio-input" type="text" placeholder="123" />
              </label>
            </div>
            <label className={css('_flex _col _gap1')}>
              <span className={css('_textsm _fontmedium')}>Postal code</span>
              <input className="studio-input" type="text" placeholder="11201" />
            </label>
            <label className={css('_flex _aic _gap2')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', padding: '0.5rem 0.75rem', border: '1px dashed var(--d-border)', borderRadius: 8, cursor: 'pointer' }}>
              <Tag size={14} /> Have a promo code?
            </label>
          </div>
        </div>

        <aside className="studio-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <p className="d-label" style={{ marginBottom: '0.75rem' }}>Summary</p>
          <div className={css('_flex _aic _gap3')} style={{ marginBottom: '1rem' }}>
            <img src={currentCreator.avatar} alt="" width={40} height={40} className="studio-avatar-creator" style={{ borderWidth: 2 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{currentCreator.name}</div>
              <span className="studio-badge-tier" data-tier={tier.color}>{tier.name}</span>
            </div>
          </div>
          <hr className="studio-divider" style={{ margin: '0.75rem 0' }} />
          <div className={css('_flex _col _gap2')} style={{ fontSize: '0.8125rem' }}>
            <div className={css('_flex _jcsb')}><span style={{ color: 'var(--d-text-muted)' }}>Tier</span><span>${tier.price}.00</span></div>
            <div className={css('_flex _jcsb')}><span style={{ color: 'var(--d-text-muted)' }}>Tax</span><span>$0.00</span></div>
          </div>
          <hr className="studio-divider" style={{ margin: '0.75rem 0' }} />
          <div className={css('_flex _jcsb _aic')} style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1rem' }}>
            <span>Total</span><span>${tier.price}.00</span>
          </div>
          <button onClick={() => navigate('/checkout/success')} className="d-interactive studio-glow" data-variant="primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.625rem 1rem', fontSize: '0.875rem' }}>
            Subscribe — ${tier.price}/mo
          </button>
          <p style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', textAlign: 'center', marginTop: '0.625rem' }}>Secured by Stripe</p>
        </aside>
      </div>

      <style>{`@media (max-width: 720px) { .checkout-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
