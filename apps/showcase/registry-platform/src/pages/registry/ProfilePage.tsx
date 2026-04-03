import { useParams } from 'react-router-dom';
import { css } from '@decantr/css';
import { ContentCardGrid } from '@/components/ContentCardGrid';
import { ActivityFeed } from '@/components/ActivityFeed';
import { CONTENT_ITEMS, ACTIVITY_EVENTS, getInitials, formatNumber } from '@/data/mock';
import { Package, Download, Star } from 'lucide-react';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const displayName = username ?? 'decantr';

  // Find items by this author (fallback to "decantr")
  const authorItems = CONTENT_ITEMS.filter(
    (i) => i.author === displayName || (displayName === 'decantr' && i.author === 'decantr'),
  );

  const totalDownloads = authorItems.reduce((sum, i) => sum + i.downloads, 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Profile header */}
      <div
        className={css('_flex _aic _gap6 _wrap')}
        style={{ marginBottom: '2.5rem' }}
      >
        {/* Avatar */}
        <div
          className={css('_flex _aic _jcc _shrink0')}
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'var(--d-primary)',
            color: '#fff',
            fontSize: '2rem',
            fontWeight: 700,
          }}
        >
          {getInitials(displayName)}
        </div>

        {/* Info */}
        <div className={css('_flex _col _gap2')} style={{ flex: 1, minWidth: 200 }}>
          <h2
            className={css('_fontbold')}
            style={{ fontSize: '1.75rem', color: 'var(--d-text)', lineHeight: 1.2 }}
          >
            {displayName}
          </h2>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9375rem' }}>
            @{displayName}
          </p>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem', maxWidth: 480 }}>
            Building the design intelligence layer for AI-native applications.
            Creator and maintainer of official registry content.
          </p>

          {/* Stats row */}
          <div className={css('_flex _aic _gap6')} style={{ marginTop: '0.5rem' }}>
            <div className={css('_flex _aic _gap2')}>
              <Package size={14} style={{ color: 'var(--d-text-muted)' }} />
              <span className={css('_fontsemi _textsm')} style={{ color: 'var(--d-text)' }}>
                {authorItems.length}
              </span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                published
              </span>
            </div>
            <div className={css('_flex _aic _gap2')}>
              <Download size={14} style={{ color: 'var(--d-text-muted)' }} />
              <span className={css('_fontsemi _textsm')} style={{ color: 'var(--d-text)' }}>
                {formatNumber(totalDownloads)}
              </span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                downloads
              </span>
            </div>
            <div className={css('_flex _aic _gap2')}>
              <Star size={14} style={{ color: 'var(--d-text-muted)' }} />
              <span className={css('_fontsemi _textsm')} style={{ color: 'var(--d-text)' }}>
                142
              </span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                reputation
              </span>
            </div>
          </div>
        </div>

        {/* Follow button */}
        <button
          className="d-interactive"
          data-variant="primary"
          style={{ alignSelf: 'flex-start' }}
        >
          Follow
        </button>
      </div>

      <div className="lum-divider" />

      {/* Published content */}
      <section style={{ marginTop: '2rem' }}>
        <h3
          className={css('_fontsemi')}
          style={{ fontSize: '1.25rem', color: 'var(--d-text)', marginBottom: '1.25rem' }}
        >
          Published Content
        </h3>
        <ContentCardGrid items={authorItems} />
      </section>

      <div className="lum-divider" style={{ margin: '2.5rem 0' }} />

      {/* Recent activity */}
      <section>
        <h3
          className={css('_fontsemi')}
          style={{ fontSize: '1.25rem', color: 'var(--d-text)', marginBottom: '1.25rem' }}
        >
          Recent Activity
        </h3>
        <ActivityFeed events={ACTIVITY_EVENTS} />
      </section>
    </div>
  );
}
