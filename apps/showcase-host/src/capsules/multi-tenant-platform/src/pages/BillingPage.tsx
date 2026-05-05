import { CreditCard, Check } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { pricingTiers, invoices } from '@/data/mock';

export function BillingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Plans & Billing"
        description="Manage your subscription and payment methods"
      />

      {/* Plan selector */}
      <div>
        <h3 className="d-label" style={{ marginBottom: '0.75rem', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>Plans</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {pricingTiers.map(t => {
            const current = t.name === 'Enterprise';
            return (
              <div
                key={t.name}
                className="lp-card-elevated"
                style={{
                  padding: '1.5rem',
                  border: current ? '1px solid var(--d-primary)' : undefined,
                  position: 'relative',
                }}
              >
                {current && (
                  <div style={{
                    position: 'absolute', top: -9, left: '1.5rem',
                    background: 'var(--d-primary)', color: '#fff', fontSize: '0.6rem',
                    fontWeight: 600, padding: '2px 7px', borderRadius: 'var(--d-radius-sm)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>Current</div>
                )}
                <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--d-text-muted)', marginBottom: '0.5rem' }}>{t.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 600 }}>${t.price}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{t.period}</span>
                </div>
                <button
                  className={current ? 'd-interactive' : 'lp-button-primary'}
                  disabled={current}
                  style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem', fontSize: '0.8rem' }}
                >
                  {current ? 'Current plan' : t.cta}
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {t.features.slice(0, 5).map(feat => (
                    <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                      <Check size={12} style={{ color: 'var(--d-success)', flexShrink: 0 }} />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment method */}
      <div className="d-surface" style={{ padding: '1.25rem' }}>
        <h3 className="d-label" style={{ marginBottom: '1rem' }}>Payment Method</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 44, height: 30, background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
              borderRadius: 'var(--d-radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CreditCard size={16} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Visa ending in 4242</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>Expires 08/2028 · Default</div>
            </div>
          </div>
          <button className="d-interactive" style={{ fontSize: '0.75rem' }}>Update</button>
        </div>
      </div>

      {/* Recent payments */}
      <div className="d-surface" style={{ padding: '1.25rem' }}>
        <h3 className="d-label" style={{ marginBottom: '0.75rem' }}>Recent Payments</h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {invoices.filter(i => i.status === 'paid').slice(0, 4).map(i => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid var(--d-border)' }}>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 500 }}>{i.period}</div>
                <div className="mono-data" style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{i.number} · {i.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="d-annotation" data-status="success" style={{ fontSize: '0.65rem' }}>Paid</span>
                <span className="mono-data" style={{ fontSize: '0.875rem', fontWeight: 500 }}>${i.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
