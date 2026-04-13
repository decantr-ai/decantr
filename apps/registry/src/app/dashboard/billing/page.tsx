'use client';

import { useEffect, useState, useTransition } from 'react';
import { upgradeAction, manageBillingAction } from './actions';
import { KPIGrid } from '@/components/kpi-grid';
import type { BillingStatus } from '@/lib/api';

/* ── Icons ── */

function CreditCardIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function ActivityIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function HardDriveIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" x2="2" y1="12" y2="12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      <line x1="6" x2="6.01" y1="16" y2="16" />
      <line x1="10" x2="10.01" y1="16" y2="16" />
    </svg>
  );
}

function UsersIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--d-success)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ── Tier Upgrade Card ── */

interface TierDef {
  name: string;
  price: number;
  description: string;
  features: string[];
  planId?: 'pro' | 'team';
  highlighted?: boolean;
  current?: boolean;
}

function TierUpgradeCard({
  tier,
  highlighted,
  isPending,
  onUpgrade,
}: {
  tier: TierDef;
  highlighted: boolean;
  isPending: boolean;
  onUpgrade: (plan: 'pro' | 'team') => void;
}) {
  return (
    <div
      className="d-surface"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderColor: highlighted ? 'var(--d-primary)' : undefined,
        borderTopWidth: highlighted ? 3 : undefined,
        borderTopColor: highlighted ? 'var(--d-primary)' : undefined,
        position: 'relative',
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: '0.5rem' }}
      >
        <h4 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{tier.name}</h4>
        {tier.current && (
          <span className="d-annotation" data-status="success">
            Current
          </span>
        )}
        {highlighted && !tier.current && (
          <span className="d-annotation" data-status="info">
            Popular
          </span>
        )}
      </div>

      <div
        className="flex items-center"
        style={{ marginBottom: '0.5rem' }}
      >
        <span
          style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}
        >
          ${tier.price}
        </span>
        <span
          className="text-sm"
          style={{ color: 'var(--d-text-muted)', marginLeft: '0.25rem' }}
        >
          /mo
        </span>
      </div>

      <p
        className="text-sm"
        style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}
      >
        {tier.description}
      </p>

      <ul
        className="flex flex-col gap-2"
        style={{
          listStyle: 'none',
          marginBottom: '1.5rem',
          flex: 1,
          padding: 0,
        }}
      >
        {tier.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2"
            style={{ fontSize: '0.875rem' }}
          >
            <CheckIcon size={14} />
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="d-interactive"
        data-variant={tier.current ? undefined : 'primary'}
        disabled={tier.current || isPending || !tier.planId}
        onClick={() => tier.planId && onUpgrade(tier.planId)}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {tier.current
          ? 'Current Plan'
          : isPending
          ? 'Loading...'
          : 'Upgrade'}
      </button>
    </div>
  );
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token ?? '';
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1'}/billing/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          setBilling(await res.json());
        }
      } catch {
        // defaults
      }
    }
    load();
  }, []);

  const currentTier = (billing?.tier ?? 'free').toLowerCase();
  const planName = currentTier.charAt(0).toUpperCase() + currentTier.slice(1);
  const activeOrg = billing?.organizations?.[0] ?? null;

  const kpiItems = [
    {
      label: 'Current Plan',
      value: planName === 'Free' ? 0 : planName === 'Pro' ? 1 : 2,
      icon: <CreditCardIcon size={18} />,
    },
    {
      label: 'API Calls (30d)',
      value: billing?.usage?.api_requests_30d ?? 0,
      icon: <ActivityIcon size={18} />,
    },
    {
      label: 'Personal Packages',
      value: billing?.usage?.personal_content_items ?? 0,
      icon: <HardDriveIcon size={18} />,
    },
    {
      label: 'Team Seats',
      value: billing?.usage?.seats_limit ?? 0,
      icon: <UsersIcon size={18} />,
    },
  ];

  const tiers: TierDef[] = [
    {
      name: 'Free',
      price: 0,
      description: 'For community publishing and local experimentation.',
      features: [
        'Community publishing',
        '60 API requests / minute',
        'Up to 5 personal published items',
      ],
      current: currentTier === 'free',
    },
    {
      name: 'Pro',
      price: 29,
      description: 'For individual operators who need personal private packages.',
      features: [
        'Personal private packages',
        '300 API requests / minute',
        'Up to 100 personal packages',
        'Priority support',
      ],
      planId: 'pro',
      highlighted: true,
      current: currentTier === 'pro',
    },
    {
      name: 'Team',
      price: 99,
      description: 'For organizations collaborating on shared private packages.',
      features: [
        'Shared org-private packages',
        'Member roles and seats',
        '600 API requests / minute',
        'Priority support',
      ],
      planId: 'team',
      current: currentTier === 'team',
    },
  ];

  function handleUpgrade(plan: 'pro' | 'team') {
    setError(null);
    startTransition(async () => {
      const result = await upgradeAction(plan);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  function handleManageBilling() {
    setError(null);
    startTransition(async () => {
      const result = await manageBillingAction();
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold">Billing &amp; Plans</h3>

      {error && (
        <div className="d-annotation" data-status="error" style={{ display: 'block' }}>
          {error}
        </div>
      )}

      {/* Current Usage */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{
            paddingLeft: '0.75rem',
            borderLeft: '2px solid var(--d-accent)',
          }}
        >
          Current Usage
        </span>
        <KPIGrid items={kpiItems} />
        <div
          className="d-surface"
          style={{
            marginTop: '1rem',
            display: 'grid',
            gap: '0.75rem',
          }}
        >
          <div>
            <div className="text-sm" style={{ fontWeight: 600 }}>
              What this plan currently unlocks
            </div>
            <div className="text-sm" style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
              {billing?.entitlements?.personal_private_packages
                ? 'Personal private packages are enabled.'
                : 'Personal private packages are not enabled on this plan.'}
            </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
                {billing?.entitlements?.org_collaboration
                  ? `Organization collaboration is enabled${activeOrg ? ` for ${activeOrg.name}` : ''}.`
                  : 'Organization collaboration is not enabled on this plan.'}
              </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
                API usage in the last 30 days: {billing?.usage?.api_requests_30d ?? 0} requests.
                {billing?.limits?.api_requests_per_minute != null
                  ? ` Current live limit: ${billing.limits.api_requests_per_minute}/minute.`
                  : ' Unlimited per-minute usage on this plan.'}
              </div>
            </div>

          {activeOrg && (
            <div
              style={{
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--d-border)',
                display: 'grid',
                gap: '0.25rem',
              }}
            >
              <div className="text-sm" style={{ fontWeight: 600 }}>
                Active organization
              </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                {activeOrg.name} ({activeOrg.slug})
              </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Seats used: {billing?.usage?.seats_used ?? 0} / {billing?.usage?.seats_limit ?? activeOrg.seat_limit}
              </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Org packages: {billing?.usage?.org_content_items ?? 0}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Manage billing for paying customers */}
      {currentTier !== 'free' && (
        <section className="d-section" data-density="compact">
          <button
            type="button"
            className="d-interactive"
            data-variant="ghost"
            onClick={handleManageBilling}
            disabled={isPending}
            style={{ fontSize: '0.875rem' }}
          >
            {isPending ? 'Loading...' : 'Manage Billing in Stripe'}
          </button>
        </section>
      )}

      {/* Plans */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{
            paddingLeft: '0.75rem',
            borderLeft: '2px solid var(--d-accent)',
          }}
        >
          Plans
        </span>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
        >
          {tiers.map((tier) => (
            <TierUpgradeCard
              key={tier.name}
              tier={tier}
              highlighted={!!tier.highlighted}
              isPending={isPending}
              onUpgrade={handleUpgrade}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
