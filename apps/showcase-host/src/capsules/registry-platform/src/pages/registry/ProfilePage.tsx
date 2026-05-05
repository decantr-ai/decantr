import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentCardGrid } from '../../components/ContentCardGrid';
import { ActivityFeed } from '../../components/ActivityFeed';
import { contentItems, recentActivity, type ContentItem } from '../../data/mock';

function getInitials(name: string): string {
  return name
    .split(/[\s_]+/)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();

  const userItems = useMemo(() => {
    const byAuthor = contentItems.filter((i) => i.author === username);
    return byAuthor.length > 0 ? byAuthor : contentItems.slice(0, 4);
  }, [username]);

  const totalDownloads = userItems.reduce((sum, i) => sum + i.downloads, 0);
  const displayName = username ?? 'Unknown';
  const initials = getInitials(displayName);

  function handleItemClick(item: ContentItem) {
    navigate(`/browse/${item.type}/${item.namespace}/${item.slug}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Profile header */}
      <div
        className="d-section"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--d-gap-6)',
          flexWrap: 'wrap',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--d-surface-raised)',
            border: '2px solid var(--d-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--d-text-muted)',
            letterSpacing: '0.02em',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-2)' }}>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            {displayName}
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--d-text-muted)',
              lineHeight: 1.5,
            }}
          >
            Building design intelligence tools and patterns for the community.
          </p>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--d-gap-6)',
              fontSize: '0.8125rem',
              color: 'var(--d-text-muted)',
              marginTop: 'var(--d-gap-1)',
            }}
          >
            <span>
              <strong style={{ color: 'var(--d-text)' }}>{userItems.length}</strong> items published
            </span>
            <span>
              <strong style={{ color: 'var(--d-text)' }}>{totalDownloads.toLocaleString()}</strong> downloads
            </span>
            <span>
              <strong style={{ color: 'var(--d-text)' }}>187</strong> reputation
            </span>
          </div>
        </div>
      </div>

      {/* Published content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-4)' }}>
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          Published Content
        </h2>
        <ContentCardGrid items={userItems} onItemClick={handleItemClick} />
      </div>

      {/* Activity feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-4)' }}>
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          Recent Activity
        </h2>
        <ActivityFeed events={recentActivity} />
      </div>
    </div>
  );
}
