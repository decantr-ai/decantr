import { notFound } from 'next/navigation';
import { getUserProfile, getUserContent } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { ContentCard } from '@/components/registry/content-card';

interface ProfileParams {
  params: Promise<{ username: string }>;
}

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
  enterprise: 'Enterprise',
};

function getReputationBadge(score: number): { label: string; variant: string } {
  if (score >= 500) return { label: 'Trusted Contributor', variant: 'success' };
  if (score >= 100) return { label: 'Active Contributor', variant: 'default' };
  if (score >= 10) return { label: 'Contributor', variant: 'default' };
  return { label: 'Member', variant: 'default' };
}

export async function generateMetadata({ params }: ProfileParams) {
  const { username } = await params;
  const title = `@${username} - Decantr`;
  const description = `View @${username}'s public profile and published content on Decantr.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'profile' },
  };
}

export default async function ProfilePage({ params }: ProfileParams) {
  const { username } = await params;

  let profile;
  try {
    profile = await getUserProfile(username);
  } catch {
    notFound();
  }

  let contentResponse;
  try {
    contentResponse = await getUserContent(username, { limit: 24 });
  } catch {
    contentResponse = { total: 0, items: [] };
  }

  const reputation = getReputationBadge(profile.reputation_score);
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  const contentTypes = Object.entries(profile.content_counts);

  return (
    <section className="mx-auto max-w-[var(--max-w)] px-6 py-12">
      {/* Profile header */}
      <div className="mb-10">
        <h1 className="mb-1 text-3xl font-bold">
          {profile.display_name || `@${profile.username}`}
        </h1>
        <p className="mb-4 text-[var(--fg-muted)]">@{profile.username}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={reputation.variant as 'default' | 'success'}>
            {reputation.label}
          </Badge>
          {profile.tier !== 'free' && (
            <Badge>{TIER_LABELS[profile.tier]}</Badge>
          )}
        </div>
        <p className="mt-3 text-sm text-[var(--fg-dim)]">Member since {memberSince}</p>

        {/* Content counts by type */}
        {contentTypes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {contentTypes.map(([type, count]) => (
              <span key={type} className="text-xs text-[var(--fg-muted)]">
                {count} {count === 1 ? type : type + 's'}
              </span>
            ))}
            <span className="text-xs font-medium text-[var(--fg)]">
              {profile.content_count} total
            </span>
          </div>
        )}
      </div>

      {/* Published content grid */}
      {contentResponse.items.length > 0 ? (
        <>
          <h2 className="mb-4 text-lg font-semibold">Published Content</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contentResponse.items.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-[var(--fg-muted)]">No published content yet.</p>
      )}
    </section>
  );
}
