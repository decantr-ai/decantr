import { notFound } from 'next/navigation';
import { getUserProfile, getUserContent } from '@/lib/api';
import type { UserProfile, ContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';

const TIER_STYLES: Record<string, string> = {
  free: 'bg-d-surface text-d-muted',
  pro: 'bg-d-amber/15 text-d-amber',
  team: 'bg-d-cyan/15 text-d-cyan',
  enterprise: 'bg-d-purple/15 text-d-purple',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  let profile: UserProfile | null = null;
  let items: ContentItem[] = [];

  try {
    [profile, { items }] = await Promise.all([
      getUserProfile(username),
      getUserContent(username, { limit: 12, sort: 'recommended' }),
    ]);
  } catch {
    notFound();
  }

  if (!profile) {
    notFound();
  }

  const tierStyle = TIER_STYLES[profile.tier] ?? TIER_STYLES.free;

  return (
    <div className="registry-page-max registry-page-stack">
      <section className="d-section registry-profile-hero">
        <div className="registry-profile-avatar">
          {(profile.display_name?.[0] ?? profile.username[0]).toUpperCase()}
        </div>

        <div className="registry-profile-body">
          <div className="registry-profile-heading-row">
            <h1 className="registry-profile-title">
              {profile.display_name || profile.username}
            </h1>
            <span className={`d-annotation ${tierStyle} uppercase`}>
              {profile.tier}
            </span>
          </div>

          <p className="registry-profile-handle">@{profile.username}</p>

          <div className="registry-profile-stats">
            <div className="registry-profile-stat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>
                <span className="font-medium text-d-text">{profile.reputation_score}</span> reputation
              </span>
            </div>
            <div className="registry-profile-stat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>
                <span className="font-medium text-d-text">{profile.content_count}</span> item{profile.content_count !== 1 ? 's' : ''} published
              </span>
            </div>
            <div className="registry-profile-stat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Member since {formatDate(profile.created_at)}</span>
            </div>
          </div>

          {profile.content_counts && Object.keys(profile.content_counts).length > 0 && (
            <div className="registry-profile-breakdown">
              {Object.entries(profile.content_counts).map(([contentType, count]) => (
                <span key={contentType} className="d-annotation text-xs">
                  {count} {contentType}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Published content */}
      <section>
        <h2 className="d-label registry-anchor-label">
          Published Content
        </h2>
        <ContentCardGrid
          items={items}
          emptyMessage={`${profile.display_name || profile.username} hasn't published any content yet.`}
        />
      </section>

      {/* Activity feed placeholder */}
      <section>
        <h2 className="d-label registry-anchor-label">
          Recent Activity
        </h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-d-muted mb-3 opacity-40"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p className="text-sm text-d-muted">
            Activity feed coming soon.
          </p>
        </div>
      </section>
    </div>
  );
}
