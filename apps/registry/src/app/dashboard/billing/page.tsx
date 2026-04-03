'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/api';
import { upgradeAction, manageBillingAction } from './actions';

export default function BillingPage() {
  const [tier, setTier] = useState('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgrading, setUpgrading] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const me = await api.getMe(session.access_token);
          setTier(me.tier || 'free');
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    loadProfile();

    // Check URL params for success/error
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded') === 'true') {
      setError('');
    }
    if (params.get('error')) {
      setError(decodeURIComponent(params.get('error')!));
    }
  }, []);

  async function handleUpgrade(plan: 'pro' | 'team') {
    setError('');
    setUpgrading(plan);
    const result = await upgradeAction(plan);
    if (result?.error) {
      setError(result.error);
      setUpgrading('');
    }
    // If no error, redirect() was called in the action
  }

  async function handleManageBilling() {
    setError('');
    setUpgrading('manage');
    const result = await manageBillingAction();
    if (result?.error) {
      setError(result.error);
      setUpgrading('');
    }
  }

  const isPaid = tier === 'pro' || tier === 'team' || tier === 'enterprise';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Billing</h1>
        <Card><p className="text-[var(--fg-muted)]">Loading...</p></Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>

      {error && (
        <Card>
          <p className="text-sm text-[var(--error)]">{error}</p>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Current Plan</h2>
          <Badge variant={isPaid ? 'success' : 'default'}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </Badge>
        </div>

        {isPaid && (
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={handleManageBilling}
              disabled={upgrading === 'manage'}
            >
              {upgrading === 'manage' ? 'Loading...' : 'Manage Subscription'}
            </Button>
          </div>
        )}
      </Card>

      {!isPaid && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="text-lg font-semibold">Pro</h3>
            <p className="mt-1 text-2xl font-bold">
              $29<span className="text-sm font-normal text-[var(--fg-muted)]">/mo</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--fg-muted)]">
              <li>Instant publish (if trusted)</li>
              <li>API keys</li>
              <li>Private content</li>
              <li>300 requests/min</li>
            </ul>
            <Button
              className="w-full mt-4"
              onClick={() => handleUpgrade('pro')}
              disabled={!!upgrading}
            >
              {upgrading === 'pro' ? 'Redirecting to Stripe...' : 'Upgrade to Pro'}
            </Button>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Team</h3>
              <Badge variant="official">Popular</Badge>
            </div>
            <p className="mt-1 text-2xl font-bold">
              $99<span className="text-sm font-normal text-[var(--fg-muted)]">/seat/mo</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--fg-muted)]">
              <li>Everything in Pro</li>
              <li>Organization namespace</li>
              <li>Team management</li>
              <li>Shared API keys</li>
              <li>600 requests/min</li>
            </ul>
            <Button
              className="w-full mt-4"
              onClick={() => handleUpgrade('team')}
              disabled={!!upgrading}
            >
              {upgrading === 'team' ? 'Redirecting to Stripe...' : 'Upgrade to Team'}
            </Button>
          </Card>
        </div>
      )}

      {tier === 'pro' && (
        <Card>
          <h3 className="text-lg font-semibold">Upgrade to Team</h3>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Get organization namespaces, team management, and shared API keys.
          </p>
          <Button
            className="mt-4"
            onClick={() => handleUpgrade('team')}
            disabled={!!upgrading}
          >
            {upgrading === 'team' ? 'Redirecting to Stripe...' : 'Upgrade to Team — $99/seat/mo'}
          </Button>
        </Card>
      )}
    </div>
  );
}
