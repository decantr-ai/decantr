import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { KPIGrid } from '@/components/kpi-grid';
import { ActivityFeed } from '@/components/activity-feed';

/* ── Inline icons for KPI cards ── */

function PackageIcon({ size = 18 }: { size?: number }) {
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
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function DownloadIcon({ size = 18 }: { size?: number }) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
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

function StarIcon({ size = 18 }: { size?: number }) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* ── Reputation badge ── */

function reputationLevel(score: number): string {
  if (score > 200) return 'Expert';
  if (score > 50) return 'Trusted';
  if (score > 10) return 'Contributor';
  return 'Newcomer';
}

const LEVEL_STYLES: Record<string, { bg: string; color: string }> = {
  Newcomer: {
    bg: 'var(--d-surface)',
    color: 'var(--d-text-muted)',
  },
  Contributor: {
    bg: 'color-mix(in srgb, var(--d-info) 15%, transparent)',
    color: 'var(--d-info)',
  },
  Trusted: {
    bg: 'color-mix(in srgb, var(--d-warning) 15%, transparent)',
    color: 'var(--d-warning)',
  },
  Expert: {
    bg: 'color-mix(in srgb, var(--d-success) 15%, transparent)',
    color: 'var(--d-success)',
  },
};

function ReputationBadge({ score, level }: { score: number; level: string }) {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.Newcomer;
  return (
    <span
      className="flex items-center gap-1"
      style={{
        display: 'inline-flex',
        padding: '0.125rem 0.5rem',
        borderRadius: 'var(--d-radius-full)',
        background: style.bg,
        fontSize: '0.75rem',
        whiteSpace: 'nowrap',
      }}
    >
      <svg
        width={10}
        height={10}
        viewBox="0 0 24 24"
        fill="none"
        stroke={style.color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span style={{ fontWeight: 600, color: style.color }}>{score}</span>
      <span style={{ color: 'var(--d-text-muted)' }}>{level}</span>
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';

  let profile: {
    reputation_score: number;
    tier: string;
    content_count: number;
  } = { reputation_score: 0, tier: 'free', content_count: 0 };
  let apiCallsLast30d = 0;
  let totalDownloads = 0;

  try {
    const [me, keys, myContent] = await Promise.all([
      api.getMe(token),
      api.getApiKeys(token).catch(() => null),
      api.getMyContent(token).catch(() => null),
    ]);
    profile = me ?? profile;

    const keyItems = Array.isArray(keys) ? keys : keys?.items ?? [];
    apiCallsLast30d = keyItems.reduce(
      (acc: number, k: { usage_30d?: number }) => acc + (k.usage_30d ?? 0),
      0
    );

    const contentItems = Array.isArray(myContent)
      ? myContent
      : myContent?.items ?? [];
    totalDownloads = contentItems.reduce(
      (acc: number, item: { downloads?: number }) => acc + (item.downloads ?? 0),
      0
    );
  } catch {
    // Fallback to defaults on API error
  }

  const level = reputationLevel(profile.reputation_score);

  const kpiItems = [
    {
      label: 'Published Items',
      value: profile.content_count,
      icon: <PackageIcon size={18} />,
    },
    {
      label: 'Total Downloads',
      value: totalDownloads,
      icon: <DownloadIcon size={18} />,
    },
    {
      label: 'API Calls (30d)',
      value: apiCallsLast30d,
      icon: <ActivityIcon size={18} />,
    },
    {
      label: 'Reputation',
      value: profile.reputation_score,
      icon: <StarIcon size={18} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold">Dashboard</h3>

      {/* Overview */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{
            paddingLeft: '0.75rem',
            borderLeft: '2px solid var(--d-accent)',
          }}
        >
          Overview
        </span>
        <KPIGrid items={kpiItems} />
      </section>

      {/* Reputation */}
      <section className="d-section" data-density="compact">
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
            Your Reputation
          </span>
          <ReputationBadge score={profile.reputation_score} level={level} />
        </div>
      </section>

      {/* Recent Activity */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{
            paddingLeft: '0.75rem',
            borderLeft: '2px solid var(--d-accent)',
          }}
        >
          Recent Activity
        </span>
        <ActivityFeed events={[]} />
      </section>
    </div>
  );
}
