'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { upgradeAction, manageBillingAction } from './actions';
import { KPIGrid } from '@/components/kpi-grid';
import { useWorkspaceState } from '@/components/workspace-state-provider';

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
  priceLabel?: string;
  description: string;
  features: string[];
  planId?: 'pro' | 'team';
  highlighted?: boolean;
  current?: boolean;
  ctaLabel?: string;
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
      className="d-surface registry-plan-card"
      data-current={tier.current || undefined}
      data-highlighted={highlighted || undefined}
    >
      <div className="registry-plan-card-head">
        <div className="registry-plan-card-title-row">
          <h4 className="registry-plan-card-title">{tier.name}</h4>
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

        <div className="registry-plan-card-price-row">
          <span className="registry-plan-card-price">
            {tier.priceLabel ?? `$${tier.price}`}
          </span>
          {!tier.priceLabel && (
            <span className="registry-plan-card-price-suffix">
              /mo
            </span>
          )}
        </div>

        <p className="registry-plan-card-description">
          {tier.description}
        </p>
      </div>

      <ul className="registry-plan-feature-list">
        {tier.features.map((feature) => (
          <li key={feature} className="registry-plan-feature-item">
            <CheckIcon size={14} />
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="d-interactive registry-plan-card-cta"
        data-variant={tier.current ? 'ghost' : 'primary'}
        disabled={tier.current || isPending || !tier.planId}
        onClick={() => tier.planId && onUpgrade(tier.planId)}
      >
        {tier.current
          ? 'Current Plan'
          : isPending
          ? 'Loading...'
          : tier.ctaLabel || 'Upgrade'}
      </button>
    </div>
  );
}

export default function BillingPage() {
  const workspace = useWorkspaceState();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const billing = workspace.billing;
  const currentTier = workspace.tier.toLowerCase();
  const planName = currentTier.charAt(0).toUpperCase() + currentTier.slice(1);
  const activeOrg = workspace.activeOrganization;

  const kpiItems = [
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
    {
      label: 'Approval Actions (30d)',
      value: billing?.usage?.approval_actions_30d ?? 0,
      icon: <CreditCardIcon size={18} />,
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
      highlighted: currentTier === 'free',
      current: currentTier === 'pro',
      ctaLabel: currentTier === 'free' ? 'Recommended upgrade' : 'Upgrade',
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
      highlighted: currentTier === 'pro',
      current: currentTier === 'team',
      ctaLabel: currentTier === 'pro' ? 'Upgrade to Team' : 'Upgrade',
    },
    {
      name: 'Enterprise',
      price: 0,
      priceLabel: 'Custom',
      description: 'For organizations that need a dedicated internal registry plus advanced governance and approvals.',
      features: [
        'Enterprise private registry workspace',
        'Expanded approval workflows',
        'Advanced member submission controls',
        'Private package review controls',
        'Advanced governance controls',
        'Dedicated support path',
      ],
      ctaLabel: 'Contact Sales',
      current: currentTier === 'enterprise',
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
    <div className="registry-page-stack">
      <div className="registry-page-intro">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">Billing &amp; Plans</h3>
          <span className="d-annotation" data-status={currentTier === 'free' ? 'info' : currentTier === 'enterprise' ? 'warning' : 'success'}>
            {planName}
          </span>
        </div>
        <p className="registry-dashboard-description">
          Review current entitlements, compare the commercial plan model, and move into Stripe only when you need to manage a paid subscription.
        </p>
      </div>

      {error && (
        <div className="d-annotation registry-settings-message" data-status="error">
          {error}
        </div>
      )}

      {/* Current Usage */}
      <section className="d-section" data-density="compact">
        <span className="d-label registry-anchor-label">
          Current Usage
        </span>
        <div className="registry-region-stack" data-density="compact">
          <KPIGrid items={kpiItems} />
          <div className="d-surface registry-dashboard-panel">
            <div className="registry-panel-note">
              <h4 className="registry-panel-title">What this plan currently unlocks</h4>
              <div className="registry-detail-list">
                <div>
                  {workspace.entitlements.personal_private_packages
                    ? 'Personal private packages are enabled.'
                    : 'Personal private packages are not enabled on this plan.'}
                </div>
                <div>
                  {workspace.entitlements.org_collaboration
                    ? `Organization collaboration is enabled${activeOrg ? ` for ${activeOrg.name}` : ''}.`
                    : 'Organization collaboration is not enabled on this plan.'}
                </div>
                <div>
                  {workspace.entitlements.private_registry_portal
                    ? 'Private registry browsing is enabled for your organization.'
                    : 'Private registry browsing is not enabled on this plan.'}
                </div>
                <div>
                  API usage in the last 30 days: {billing?.usage?.api_requests_30d ?? 0} requests.
                  {billing?.limits?.api_requests_per_minute != null
                    ? ` Current live limit: ${billing.limits.api_requests_per_minute}/minute.`
                    : ' Unlimited per-minute usage on this plan.'}
                </div>
                <div>
                  Personal publishes in the last 30 days: {billing?.usage?.personal_publishes_30d ?? 0}. Private package publishes: {billing?.usage?.private_package_publishes_30d ?? 0}.
                </div>
              </div>
            </div>

            {activeOrg && (
              <div className="registry-panel-divider registry-panel-note">
                <h4 className="registry-panel-title">Active organization</h4>
                <div className="registry-detail-list">
                  <div>{activeOrg.name} ({activeOrg.slug})</div>
                  <div>
                    Seats used: {billing?.usage?.seats_used ?? 0} / {billing?.usage?.seats_limit ?? activeOrg.seat_limit}
                  </div>
                  <div>
                    Org packages: {billing?.usage?.org_content_items ?? 0}
                  </div>
                  <div>
                    Org package publishes in the last 30 days: {billing?.usage?.org_package_publishes_30d ?? 0}. Approval actions: {billing?.usage?.approval_actions_30d ?? 0}.
                  </div>
                </div>
                {workspace.capabilities.canAccessPrivateRegistry ? (
                  <div className="registry-action-band-actions">
                    <Link href="/dashboard/private-registry" className="d-interactive no-underline" data-variant="primary">
                      Open Private Registry
                    </Link>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Manage billing for paying customers */}
      {currentTier !== 'free' && (
        <section className="d-section" data-density="compact">
          <div className="registry-action-band" data-tone="billing">
            <div className="registry-action-band-copy">
              <h4 className="registry-action-band-title">Stripe billing workspace</h4>
              <p className="registry-dashboard-description">
                Open the hosted billing portal to manage invoices, payment methods, or subscription status for the active paid plan.
              </p>
            </div>
            <div className="registry-action-band-actions">
              <button
                type="button"
                className="d-interactive"
                data-variant="primary"
                onClick={handleManageBilling}
                disabled={isPending}
              >
                {isPending ? 'Loading...' : 'Manage Billing in Stripe'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Plans */}
      <section className="d-section" data-density="compact">
        <span className="d-label registry-anchor-label">
          Plans
        </span>
        <div className="registry-region-stack" data-density="compact">
          <div className="d-surface registry-dashboard-panel">
            <h4 className="registry-panel-title">Plan model</h4>
            <p className="registry-dashboard-description">
              Pro is for personal private packages. Team is for shared organization packages and collaboration.
              Enterprise adds a dedicated internal private registry workspace on top of the shared org package model.
            </p>
          </div>
          <div className="registry-plan-grid">
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
        </div>
      </section>
    </div>
  );
}
