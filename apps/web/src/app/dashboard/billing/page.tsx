import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { upgradeAction, manageBillingAction } from './actions';

export const metadata = {
  title: 'Billing — Decantr',
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const upgraded = params.upgraded === 'true';
  const errorMsg = params.error as string | undefined;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';

  let profile: { tier: string } = { tier: 'free' };

  try {
    const me = await api.getMe(token);
    profile = { tier: me.tier ?? 'free' };
  } catch {
    // API may not be reachable
  }

  const isPaid = profile.tier === 'pro' || profile.tier === 'team' || profile.tier === 'enterprise';

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>

      {upgraded && (
        <Card className="border-[var(--success)]/30">
          <p className="text-sm text-[var(--success)]">
            Upgrade successful! Your new plan is now active.
          </p>
        </Card>
      )}

      {errorMsg && (
        <Card className="border-[var(--error)]/30">
          <p className="text-sm text-[var(--error)]">
            {decodeURIComponent(errorMsg)}
          </p>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Current Plan</h2>
          <Badge variant={isPaid ? 'success' : 'default'}>
            {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}
          </Badge>
        </div>

        {isPaid && (
          <form action={manageBillingAction} className="mt-4">
            <Button type="submit" variant="secondary">
              Manage Subscription
            </Button>
          </form>
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
            <form action={upgradeAction.bind(null, 'pro')} className="mt-4">
              <Button type="submit" className="w-full">Upgrade to Pro</Button>
            </form>
          </Card>

          <Card className="border-[var(--primary)]/30">
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
            <form action={upgradeAction.bind(null, 'team')} className="mt-4">
              <Button type="submit" className="w-full">Upgrade to Team</Button>
            </form>
          </Card>
        </div>
      )}

      {profile.tier === 'pro' && (
        <Card>
          <h3 className="text-lg font-semibold">Upgrade to Team</h3>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Get organization namespaces, team management, and shared API keys.
          </p>
          <form action={upgradeAction.bind(null, 'team')} className="mt-4">
            <Button type="submit">Upgrade to Team — $99/seat/mo</Button>
          </form>
        </Card>
      )}
    </div>
  );
}
