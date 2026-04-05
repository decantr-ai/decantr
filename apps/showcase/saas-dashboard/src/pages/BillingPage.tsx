import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { UsageMeterBar } from '@/components/UsageMeter';
import { pricingTiers, usageMeters } from '@/data/mock';

export function BillingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Billing"
        description="You're on the Business plan. Next invoice on May 1, 2026."
        actions={
          <Link
            to="/billing/invoices"
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem', textDecoration: 'none' }}
          >
            View invoices <ArrowRight size={14} />
          </Link>
        }
      />

      {/* Current usage */}
      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Current Usage</SectionLabel>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {usageMeters.map(m => (
              <UsageMeterBar key={m.label} meter={m} />
            ))}
          </div>
        </div>
      </div>

      {/* Plan selector */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <SectionLabel>Plans</SectionLabel>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: !annual ? 'var(--d-text)' : 'var(--d-text-muted)' }}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              role="switch"
              aria-checked={annual}
              style={{
                width: 40,
                height: 22,
                borderRadius: 'var(--d-radius-full)',
                background: annual ? 'var(--d-accent)' : 'var(--d-surface-raised)',
                border: '1px solid var(--d-border)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 250ms ease',
              }}
            >
              <div style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: 2,
                left: annual ? 20 : 2,
                transition: 'left 250ms ease',
              }} />
            </button>
            <span style={{ fontSize: '0.8rem', color: annual ? 'var(--d-text)' : 'var(--d-text-muted)' }}>
              Annual <span className="d-annotation" data-status="success" style={{ marginLeft: '0.25rem' }}>Save 20%</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--d-content-gap)', alignItems: 'stretch' }}>
          {pricingTiers.map(tier => (
            <div
              key={tier.name}
              className="d-surface"
              style={{
                padding: 'var(--d-surface-p)',
                borderColor: tier.current ? 'var(--d-accent)' : undefined,
                borderTop: tier.recommended ? '3px solid var(--d-accent)' : undefined,
                boxShadow: tier.current ? '0 0 30px color-mix(in srgb, var(--d-accent) 15%, transparent)' : undefined,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {tier.current && (
                <span className="d-annotation" data-status="info" style={{ position: 'absolute', top: -10, right: 16 }}>
                  Current plan
                </span>
              )}
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{tier.name}</h3>
              <div style={{ marginBottom: '0.75rem' }}>
                {tier.price > 0 ? (
                  <>
                    <span style={{ fontSize: '1.875rem', fontWeight: 700, fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>
                      ${annual ? Math.floor(tier.price * 0.8) : tier.price}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}> {tier.period}</span>
                  </>
                ) : (
                  <span style={{ fontSize: '1.875rem', fontWeight: 700 }}>
                    {tier.name === 'Enterprise' ? 'Custom' : 'Free'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1, marginBottom: '1rem' }}>
                {tier.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <Check size={13} style={{ color: 'var(--d-success)', flexShrink: 0, marginTop: 3 }} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <button
                className={tier.current ? 'd-interactive' : tier.recommended ? 'sd-button-accent' : 'd-interactive'}
                data-variant={tier.current ? 'ghost' : tier.recommended ? undefined : undefined}
                disabled={tier.current}
                style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
