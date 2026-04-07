'use client';

import { useState } from 'react';
import { KPIGrid, type KPIStat } from '@/components/kpi-grid';
import { upgradeAction, manageBillingAction } from './actions';

const TIERS = [
  {
    name: 'Free',
    price: 0,
    description: 'For individuals exploring the registry.',
    features: ['Browse all content', '100 API calls/month', '1 published item', 'Community support'],
    current: false,
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For developers building with Decantr.',
    features: ['Everything in Free', '10,000 API calls/month', 'Unlimited published items', 'API key management', 'Priority support', 'Custom namespaces'],
    current: true,
    highlighted: true,
  },
  {
    name: 'Team',
    price: 79,
    description: 'For teams and organizations.',
    features: ['Everything in Pro', '100,000 API calls/month', 'Team management', 'Admin moderation', 'SSO integration', 'SLA guarantee', 'Dedicated support'],
    current: false,
    highlighted: false,
  },
];

const BILLING_KPIS: KPIStat[] = [
  { label: 'Current Plan', value: 29, trend: 0, icon: 'CreditCard' },
  { label: 'API Usage', value: 78, trend: 12.0, icon: 'Activity' },
  { label: 'Storage Used', value: 64, trend: 5.0, icon: 'HardDrive' },
  { label: 'Team Seats', value: 3, trend: 0, icon: 'Users' },
];

export default function BillingPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  async function handleUpgrade(plan: 'pro' | 'team') {
    setError('');
    setLoading(plan);
    const result = await upgradeAction(plan);
    setLoading('');
    if (result?.error) setError(result.error);
  }

  async function handleManage() {
    setError('');
    setLoading('manage');
    const result = await manageBillingAction();
    setLoading('');
    if (result?.error) setError(result.error);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Billing</h3>
        <button
          className="d-interactive"
          data-variant="ghost"
          onClick={handleManage}
          disabled={loading === 'manage'}
          style={{ fontSize: '0.875rem' }}
        >
          {loading === 'manage' ? 'Opening...' : 'Manage Billing'}
        </button>
      </div>

      {error && <div className="d-annotation" data-status="error">{error}</div>}

      {/* Usage KPIs */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Usage
        </span>
        <KPIGrid stats={BILLING_KPIS} />
      </section>

      {/* Tier cards */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Plans
        </span>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="d-surface"
              style={{
                border: tier.highlighted ? '2px solid var(--d-primary)' : undefined,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">{tier.name}</h4>
                {tier.current && <span className="d-annotation" data-status="success">Current</span>}
                {tier.highlighted && !tier.current && <span className="d-annotation" data-status="info">Popular</span>}
              </div>
              <div className="mb-2">
                <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--d-font-mono, monospace)' }}>
                  ${tier.price}
                </span>
                <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>/mo</span>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--d-text-muted)' }}>{tier.description}</p>
              <ul className="flex flex-col gap-2 mb-4">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--d-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              {tier.current ? (
                <button className="d-interactive" disabled style={{ width: '100%', justifyContent: 'center' }}>
                  Current Plan
                </button>
              ) : (
                <button
                  className="d-interactive"
                  data-variant={tier.highlighted ? 'primary' : 'ghost'}
                  onClick={() => handleUpgrade(tier.name.toLowerCase() as 'pro' | 'team')}
                  disabled={loading === tier.name.toLowerCase()}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {loading === tier.name.toLowerCase() ? 'Redirecting...' : `Upgrade to ${tier.name}`}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
