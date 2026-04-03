import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';

  let profile: { email: string; tier: string; reputation: number } = {
    email: session?.user?.email ?? '',
    tier: 'free',
    reputation: 0,
  };
  let contentCount = 0;
  let apiKeyCount = 0;

  try {
    const me = await api.getMe(token);
    profile = {
      email: me.email ?? session?.user?.email ?? '',
      tier: me.tier ?? 'free',
      reputation: me.reputation ?? 0,
    };
  } catch {
    // API may not be reachable; fall back to session data
  }

  try {
    const content = await api.getMyContent(token);
    contentCount = Array.isArray(content) ? content.length : (content?.items?.length ?? 0);
  } catch {
    // ignore
  }

  try {
    const keys = await api.getApiKeys(token);
    apiKeyCount = Array.isArray(keys) ? keys.length : (keys?.items?.length ?? 0);
  } catch {
    // ignore
  }

  const tierVariant = profile.tier === 'pro' ? 'official' : profile.tier === 'team' ? 'org' : 'default';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Welcome back</h1>
        <p className="text-[var(--fg-muted)] mt-1">{profile.email}</p>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={tierVariant}>{profile.tier} tier</Badge>
        <Badge variant="success">Reputation: {profile.reputation}</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-[var(--fg-dim)] text-sm">Content Items</p>
          <p className="text-3xl font-bold text-[var(--fg)] mt-1">{contentCount}</p>
        </Card>
        <Card>
          <p className="text-[var(--fg-dim)] text-sm">API Keys</p>
          <p className="text-3xl font-bold text-[var(--fg)] mt-1">{apiKeyCount}</p>
        </Card>
        <Card>
          <p className="text-[var(--fg-dim)] text-sm">Tier</p>
          <p className="text-3xl font-bold text-[var(--fg)] mt-1 capitalize">{profile.tier}</p>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/content/new">
            <Button>Create Content</Button>
          </Link>
          <Link href="/dashboard/api-keys">
            <Button variant="secondary">Manage API Keys</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">Browse Registry</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
