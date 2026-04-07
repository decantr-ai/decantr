import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { KPIGrid, type KPIStat } from '@/components/kpi-grid';
import { ActivityFeed } from '@/components/activity-feed';

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || '';

  let me: any = {};
  let myContent: any = { items: [] };
  let apiKeys: any = [];

  try {
    [me, myContent, apiKeys] = await Promise.all([
      api.getMe(token).catch(() => ({})),
      api.getMyContent(token).catch(() => ({ items: [] })),
      api.getApiKeys(token).catch(() => []),
    ]);
  } catch {
    // API errors
  }

  const contentItems = myContent.items || myContent || [];
  const keys = Array.isArray(apiKeys) ? apiKeys : apiKeys?.keys || [];

  const stats: KPIStat[] = [
    { label: 'Published Items', value: Array.isArray(contentItems) ? contentItems.length : 0, trend: 0, icon: 'Package' },
    { label: 'Total Downloads', value: me.total_downloads || 0, trend: 0, icon: 'Download' },
    { label: 'API Calls (30d)', value: me.api_calls_30d || 0, trend: 0, icon: 'Activity' },
    { label: 'Reputation', value: me.reputation_score || 0, trend: 0, icon: 'Star' },
  ];

  const repScore = me.reputation_score || 0;
  const levelName = repScore > 200 ? 'Expert'
    : repScore > 50 ? 'Trusted'
    : repScore > 10 ? 'Contributor'
    : 'Newcomer';

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold">Dashboard</h3>

      {/* Overview KPIs */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Overview
        </span>
        <KPIGrid stats={stats} />
      </section>

      {/* Reputation */}
      <section className="d-section" data-density="compact">
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>Your Reputation</span>
          <span
            className="d-annotation"
            style={{
              background: 'color-mix(in srgb, var(--d-accent) 15%, transparent)',
              color: 'var(--d-accent)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            {repScore} ({levelName})
          </span>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Quick Actions
        </span>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/content/new" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Publish Content
          </Link>
          <Link href="/browse" className="d-interactive" data-variant="ghost" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>
            Browse Registry
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Recent Activity
        </span>
        <ActivityFeed events={[]} />
      </section>
    </div>
  );
}
