import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { KpiGrid } from '@/components/KpiGrid';
import { billingKpis, pricingTiers, paymentHistory } from '@/data/mock';

export function BillingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Billing</h1>

      {/* KPIs */}
      <KpiGrid items={billingKpis} />

      {/* Pricing Tiers */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem', textAlign: 'left' }}>
          Plans
        </div>
        {/* Billing Toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: !annual ? 'var(--d-text)' : 'var(--d-text-muted)' }}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 'var(--d-radius-full)',
              background: annual ? 'var(--d-primary)' : 'var(--d-surface-raised)',
              border: '1px solid var(--d-border)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 250ms ease',
            }}
          >
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: 2,
              left: annual ? 22 : 2,
              transition: 'left 250ms ease',
            }} />
          </button>
          <span style={{ fontSize: '0.875rem', color: annual ? 'var(--d-text)' : 'var(--d-text-muted)' }}>
            Annual
            <span className="d-annotation" data-status="success" style={{ marginLeft: '0.375rem' }}>Save 20%</span>
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--d-content-gap)', alignItems: 'stretch' }}>
        {pricingTiers.map(tier => (
          <div
            key={tier.name}
            className="d-surface"
            style={{
              padding: 'var(--d-surface-p)',
              borderTop: tier.recommended ? '3px solid var(--d-primary)' : undefined,
              transform: tier.recommended ? 'scale(1.02)' : undefined,
              boxShadow: tier.recommended ? '0 0 30px rgba(124, 58, 237, 0.15)' : undefined,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {tier.recommended && (
              <span className="d-annotation" data-status="info" style={{ position: 'absolute', top: -10, right: 16 }}>
                Popular
              </span>
            )}
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{tier.name}</h3>
            <div style={{ marginBottom: '0.75rem' }}>
              <span className="mono-data" style={{ fontSize: '2rem', fontWeight: 700 }}>
                ${annual ? Math.floor(tier.price * 0.8) : tier.price}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{tier.period}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1, marginBottom: '1rem' }}>
              {tier.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <Check size={14} style={{ color: 'var(--d-success)', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
            <button
              className={tier.recommended ? 'lp-button-primary' : 'd-interactive'}
              data-variant={tier.recommended ? undefined : 'ghost'}
              style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginTop: '0.5rem' }}>
        Payment History
      </div>
      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="d-data" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="d-data-header">Date</th>
              <th className="d-data-header">Description</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Amount</th>
              <th className="d-data-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.map(pay => (
              <tr key={pay.id} className="d-data-row">
                <td className="d-data-cell mono-data" style={{ fontSize: '0.8rem' }}>{pay.date}</td>
                <td className="d-data-cell">{pay.description}</td>
                <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontWeight: 500 }}>
                  ${pay.amount.toFixed(2)}
                </td>
                <td className="d-data-cell">
                  <span className="d-annotation" data-status={pay.status === 'completed' ? 'success' : pay.status === 'pending' ? 'warning' : 'error'}>
                    {pay.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
