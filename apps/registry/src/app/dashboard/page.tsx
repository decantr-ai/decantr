import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { KPIGrid } from '@/components/kpi-grid';
import { ActivityFeed } from '@/components/activity-feed';
import Link from 'next/link';

/* ── Inline icons for KPI cards ── */

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

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function TierIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

/* ── Reputation helpers ── */

function reputationLevel(score: number): string {
  if (score > 200) return 'Expert';
  if (score > 50) return 'Trusted';
  if (score > 10) return 'Contributor';
  return 'Newcomer';
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';
  const email = session?.user?.email ?? 'there';

  let profile: {
    reputation_score: number;
    tier: string;
    content_count: number;
  } = { reputation_score: 0, tier: 'free', content_count: 0 };
  let apiKeyCount = 0;

  try {
    const [me, keys] = await Promise.all([
      api.getMe(token),
      api.getApiKeys(token),
    ]);
    profile = me;
    const keyItems = Array.isArray(keys) ? keys : keys?.items ?? [];
    apiKeyCount = keyItems.filter(
      (k: { revoked_at?: string | null }) => !k.revoked_at
    ).length;
  } catch {
    // Fallback to defaults on API error
  }

  const level = reputationLevel(profile.reputation_score);

  const kpiItems = [
    {
      label: 'Content Items',
      value: profile.content_count,
      icon: <ContentIcon />,
    },
    {
      label: 'API Keys',
      value: apiKeyCount,
      icon: <KeyIcon />,
    },
    {
      label: 'Reputation',
      value: profile.reputation_score,
      icon: <StarIcon />,
    },
    {
      label: 'Tier',
      value: profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1),
      icon: <TierIcon />,
    },
  ];

  return (
    <div className="d-section max-w-5xl" data-density="compact">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-d-text">Welcome back</h1>
        <p className="text-sm text-d-muted mt-1">{email}</p>
      </div>

      {/* KPI Grid */}
      <div className="mb-8">
        <KPIGrid items={kpiItems} />
      </div>

      {/* Reputation Badge */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-d-primary/10 px-3 py-1.5 text-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--d-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="font-semibold text-d-text">{profile.reputation_score}</span>
          <span className="text-d-muted">{level}</span>
        </span>
      </div>

      {/* Activity Feed */}
      <div className="mb-8">
        <h2 className="d-label border-l-2 border-d-accent pl-2 mb-4">
          Recent Activity
        </h2>
        <div className="d-surface rounded-lg p-4">
          <ActivityFeed items={[]} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="d-label border-l-2 border-d-accent pl-2 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/content/new"
            className="d-interactive inline-flex items-center gap-2 py-1.5 px-4 text-sm rounded-md no-underline"
            data-variant="primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Content
          </Link>
          <Link
            href="/dashboard/api-keys"
            className="d-interactive inline-flex items-center gap-2 py-1.5 px-4 text-sm rounded-md no-underline"
            data-variant="ghost"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
            Manage API Keys
          </Link>
          <Link
            href="/"
            className="d-interactive inline-flex items-center gap-2 py-1.5 px-4 text-sm rounded-md no-underline"
            data-variant="ghost"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Browse Registry
          </Link>
        </div>
      </div>
    </div>
  );
}
