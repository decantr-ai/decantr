'use client';

import { useEffect, useState, useTransition } from 'react';
import { upgradeAction, manageBillingAction } from './actions';
import { KPIGrid } from '@/components/kpi-grid';

interface BillingStatus {
  tier: string;
  usage: {
    api_calls: number;
    api_limit: number;
    content_items: number;
    content_limit: number;
  };
}

interface PlanTier {
  name: string;
  price: string;
  priceNote: string;
  description: string;
  features: { label: string; included: boolean }[];
  highlighted?: boolean;
  planId?: 'pro' | 'team';
}

const PLANS: PlanTier[] = [
  {
    name: 'Free',
    price: '$0',
    priceNote: 'forever',
    description: 'For individual developers getting started.',
    features: [
      { label: '50 API calls/day', included: true },
      { label: '5 published items', included: true },
      { label: 'Community namespace', included: true },
      { label: 'Custom namespace', included: false },
      { label: 'Priority support', included: false },
      { label: 'Team features', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    priceNote: '/mo',
    description: 'For professionals shipping production apps.',
    highlighted: true,
    planId: 'pro',
    features: [
      { label: '5,000 API calls/day', included: true },
      { label: '100 published items', included: true },
      { label: 'Community namespace', included: true },
      { label: 'Custom namespace', included: true },
      { label: 'Priority support', included: true },
      { label: 'Team features', included: false },
    ],
  },
  {
    name: 'Team',
    price: '$99',
    priceNote: '/mo',
    description: 'For teams collaborating on design systems.',
    planId: 'team',
    features: [
      { label: '50,000 API calls/day', included: true },
      { label: 'Unlimited published items', included: true },
      { label: 'Community namespace', included: true },
      { label: 'Custom namespace', included: true },
      { label: 'Priority support', included: true },
      { label: 'Team features', included: true },
    ],
  },
];

function UsageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function ContentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16.5 9.4-9-5.19" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
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
        // Use defaults
      }
    }
    load();
  }, []);

  const currentTier = billing?.tier ?? 'free';

  const kpiItems = [
    {
      label: 'API Calls Today',
      value: billing?.usage?.api_calls ?? 0,
      icon: <UsageIcon />,
    },
    {
      label: 'API Limit',
      value: billing?.usage?.api_limit ?? 50,
      icon: <UsageIcon />,
    },
    {
      label: 'Content Items',
      value: billing?.usage?.content_items ?? 0,
      icon: <ContentIcon />,
    },
    {
      label: 'Content Limit',
      value: billing?.usage?.content_limit ?? 5,
      icon: <ContentIcon />,
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
    <div className="d-section max-w-5xl" data-density="compact">
      <h1 className="d-label border-l-2 border-d-accent pl-2 text-lg mb-6">
        Billing &amp; Plans
      </h1>

      {error && (
        <div
          className="d-annotation px-3 py-2 rounded text-sm mb-6"
          data-status="error"
        >
          {error}
        </div>
      )}

      {/* Usage KPIs */}
      <div className="mb-8">
        <KPIGrid items={kpiItems} />
      </div>

      {/* Manage billing link for paying customers */}
      {currentTier !== 'free' && (
        <div className="mb-6">
          <button
            type="button"
            onClick={handleManageBilling}
            disabled={isPending}
            className="d-interactive py-1.5 px-4 text-sm rounded-md disabled:opacity-50"
            data-variant="ghost"
          >
            {isPending ? 'Loading...' : 'Manage Billing in Stripe'}
          </button>
        </div>
      )}

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent =
            currentTier.toLowerCase() === plan.name.toLowerCase();

          return (
            <div
              key={plan.name}
              className={`d-surface rounded-lg p-5 flex flex-col ${
                plan.highlighted
                  ? 'ring-2 ring-d-primary'
                  : 'border border-d-border'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-d-text">
                  {plan.name}
                </h3>
                {plan.highlighted && (
                  <span className="d-annotation text-xs" data-status="info">
                    Popular
                  </span>
                )}
                {isCurrent && (
                  <span
                    className="d-annotation text-xs"
                    data-status="success"
                  >
                    Current
                  </span>
                )}
              </div>

              <div className="mb-2">
                <span className="text-3xl font-bold font-mono text-d-text">
                  {plan.price}
                </span>
                <span className="text-sm text-d-muted ml-1">
                  {plan.priceNote}
                </span>
              </div>

              <p className="text-sm text-d-muted mb-4">{plan.description}</p>

              {/* Features */}
              <ul className="flex flex-col gap-2 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature.label}
                    className="flex items-center gap-2 text-sm"
                  >
                    {feature.included ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--d-success)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-d-muted"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                    <span
                      className={
                        feature.included ? 'text-d-text' : 'text-d-muted'
                      }
                    >
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <button
                  disabled
                  className="d-interactive w-full py-2 text-sm rounded-md opacity-60"
                  data-variant="ghost"
                >
                  Current Plan
                </button>
              ) : plan.planId ? (
                <button
                  type="button"
                  onClick={() => handleUpgrade(plan.planId!)}
                  disabled={isPending}
                  className="d-interactive w-full py-2 text-sm rounded-md disabled:opacity-50"
                  data-variant={plan.highlighted ? 'primary' : 'ghost'}
                >
                  {isPending ? 'Loading...' : `Upgrade to ${plan.name}`}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
