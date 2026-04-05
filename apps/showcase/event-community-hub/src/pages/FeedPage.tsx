import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { MessageCircle, TrendingUp } from 'lucide-react';
import { posts, attendees, events } from '../data/mock';
import { ReactionBar } from '../components/ReactionBar';

export function FeedPage() {
  const trending = events.slice(0, 3);

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', width: '100%', fontFamily: 'system-ui, sans-serif' }}>
      <header className={css('_flex _col _gap2')} style={{ marginBottom: '2rem' }}>
        <span className="display-label">Community</span>
        <h1 className="display-heading section-title" style={{ fontSize: '2.25rem' }}>What's happening</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }} className="feed-grid">
        <div className={css('_flex _col _gap4')}>
          {/* Composer */}
          <div className="feature-tile">
            <textarea className="d-control" rows={2} placeholder="Share what you're excited about..." style={{ resize: 'vertical' }} />
            <div className={css('_flex _aic _jcsb')} style={{ marginTop: '0.75rem' }}>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Posting as @juno</span>
              <button className="d-interactive cta-glossy" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>Share</button>
            </div>
          </div>

          {/* Posts */}
          {posts.map((p) => {
            const author = attendees.find((a) => a.id === p.authorId) || attendees[0];
            const event = events.find((e) => e.id === p.eventId);
            return (
              <article key={p.id} className="post-card">
                <div className={css('_flex _aic _gap3')} style={{ marginBottom: '0.875rem' }}>
                  <img src={author.avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div className={css('_flex _aic _gap2')}>
                      <span className={css('_fontmedium')}>{author.name}</span>
                      <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{author.handle}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {event && <> · <Link to={`/events/${event.id}`} style={{ color: 'var(--d-primary)' }}>{event.title}</Link></>}
                    </div>
                  </div>
                </div>
                <p style={{ marginBottom: p.image ? '0.875rem' : '0.75rem', lineHeight: 1.55 }}>{p.body}</p>
                {p.image && (
                  <img src={p.image} alt="" style={{ width: '100%', borderRadius: 'var(--d-radius)', marginBottom: '0.875rem', aspectRatio: '16/9', objectFit: 'cover' }} />
                )}
                <div className={css('_flex _aic _jcsb')}>
                  <ReactionBar reactions={p.reactions} />
                  <Link to={`/feed/${p.id}`} className="reaction-pill" style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
                    <MessageCircle size={13} /> {p.commentCount}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <aside className={css('_flex _col _gap4')}>
          <div className="feature-tile">
            <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
              <TrendingUp size={16} style={{ color: 'var(--d-primary)' }} />
              <span className="display-label">Trending Events</span>
            </div>
            <div className={css('_flex _col _gap3')}>
              {trending.map((e) => (
                <Link key={e.id} to={`/events/${e.id}`} className={css('_flex _aic _gap3')} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img src={e.image} alt="" style={{ width: 48, height: 48, borderRadius: 'var(--d-radius-sm)', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={css('_textsm _fontmedium')} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{e.attendees.toLocaleString()} going</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="feature-tile">
            <span className="display-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Active Members</span>
            <div className={css('_flex _col _gap2')}>
              {attendees.slice(0, 4).map((a) => (
                <div key={a.id} className={css('_flex _aic _gap2')}>
                  <img src={a.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={css('_textsm _fontmedium')}>{a.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{a.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style>{`@media (max-width: 900px) { .feed-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
