import { notFound } from 'next/navigation';
import { getUserProfile, getUserContent } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';
import { ActivityFeed } from '@/components/activity-feed';

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  let profile;
  let content: any[] = [];
  try {
    profile = await getUserProfile(username);
  } catch (error: any) {
    if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      notFound();
    }
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div className="d-surface flex flex-col items-center gap-3" style={{ padding: '3rem' }}>
          <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
            Failed to load profile. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  try {
    const res = await getUserContent(username);
    content = res.items || [];
  } catch {
    // non-critical
  }

  const initials = (profile.display_name || username)
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const levelName = profile.reputation_score > 200 ? 'Expert'
    : profile.reputation_score > 50 ? 'Trusted'
    : profile.reputation_score > 10 ? 'Contributor'
    : 'Newcomer';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="flex flex-col gap-6">
        {/* Profile header */}
        <section className="flex items-start gap-6">
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: 'var(--d-surface-raised)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--d-text-muted)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold">{profile.display_name || username}</h2>
            <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>@{username}</p>
            <div className="flex items-center gap-3" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
              <span>{profile.content_count} items published</span>
              <span className="d-annotation">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                {profile.reputation_score} ({levelName})
              </span>
              <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </section>

        {/* Content grid */}
        <section>
          <span
            className="d-label block mb-4"
            style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
          >
            Published Content
          </span>
          <ContentCardGrid items={content} />
        </section>

        {/* Activity placeholder */}
        <section>
          <span
            className="d-label block mb-4"
            style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
          >
            Recent Activity
          </span>
          <ActivityFeed events={[]} />
        </section>
      </div>
    </div>
  );
}
