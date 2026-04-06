import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowLeft, CreditCard, CheckCircle, Leaf } from 'lucide-react';
import { offsetProjects } from '@/data/mock';

export function CheckoutPage() {
  const [submitted, setSubmitted] = useState(false);

  // Mock cart
  const cartItems = [
    { projectId: 'o1', quantity: 200 },
    { projectId: 'o3', quantity: 100 },
  ];

  const items = cartItems.map(ci => ({
    ...ci,
    project: offsetProjects.find(p => p.id === ci.projectId)!,
  })).filter(i => i.project);

  const total = items.reduce((sum, i) => sum + i.project.price * i.quantity, 0);
  const totalCredits = items.reduce((sum, i) => sum + i.quantity, 0);

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'color-mix(in srgb, var(--d-success) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={32} style={{ color: 'var(--d-success)' }} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Purchase Complete</h1>
        <p style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
          {totalCredits.toLocaleString()} carbon credits retired to your portfolio.
        </p>
        <Link to="/offsets" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none' }}>
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <Link to="/offsets" className={css('_flex _aic _gap1')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none', marginBottom: '0.5rem' }}>
          <ArrowLeft size={14} /> Back to marketplace
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Checkout</h1>
      </div>

      <div className={css('_grid _gc1 lg:_gc3 _gap6')}>
        {/* Items */}
        <div className={css('_flex _col _gap4')} style={{ gridColumn: 'span 2' }}>
          {items.map(i => (
            <div key={i.projectId} className="d-surface earth-card">
              <div className={css('_flex _gap4')}>
                <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, color-mix(in srgb, var(--d-primary) 20%, transparent), color-mix(in srgb, var(--d-accent) 20%, transparent))', borderRadius: 'var(--d-radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Leaf size={24} style={{ color: 'var(--d-primary)', opacity: 0.5 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{i.project.name}</h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{i.project.type} &middot; {i.project.standard}</div>
                  <div className={css('_flex _jcsb _aic')} style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem' }}>{i.quantity.toLocaleString()} tCO2e &times; ${i.project.price}</span>
                    <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>${(i.project.price * i.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Payment form */}
          <div className="d-surface earth-card">
            <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
              <CreditCard size={18} style={{ color: 'var(--d-primary)' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Payment Details</h2>
            </div>
            <form className={css('_flex _col _gap4')} onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
              <div className={css('_flex _col _gap1')}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Card Number</label>
                <input className="d-control earth-input" placeholder="4242 4242 4242 4242" />
              </div>
              <div className={css('_grid _gc2 _gap4')}>
                <div className={css('_flex _col _gap1')}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Expiry</label>
                  <input className="d-control earth-input" placeholder="MM / YY" />
                </div>
                <div className={css('_flex _col _gap1')}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>CVC</label>
                  <input className="d-control earth-input" placeholder="123" />
                </div>
              </div>
              <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>
                Complete Purchase &middot; ${total.toLocaleString()}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="d-surface earth-card" style={{ position: 'sticky', top: '1rem' }}>
            <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>Order Summary</div>
            <div className={css('_flex _col _gap3')} style={{ fontSize: '0.875rem' }}>
              {items.map(i => (
                <div key={i.projectId} className={css('_flex _jcsb')}>
                  <span>{i.quantity}t &times; {i.project.name.split(' ').slice(0, 2).join(' ')}</span>
                  <span style={{ fontWeight: 600 }}>${(i.project.price * i.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--d-border)', paddingTop: '0.75rem' }}>
                <div className={css('_flex _jcsb')}>
                  <span style={{ fontWeight: 600 }}>Total</span>
                  <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>${total.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
                  {totalCredits.toLocaleString()} tCO2e carbon credits
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
