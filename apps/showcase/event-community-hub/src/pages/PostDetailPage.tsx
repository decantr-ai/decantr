import { Link, useParams } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowLeft } from 'lucide-react';
import { posts, attendees, events, comments } from '../data/mock';
import { ReactionBar } from '../components/ReactionBar';

export function PostDetailPage() {
  const { id } = useParams();
  const post = posts.find((p) => p.id === id) || posts[0];
  const author = attendees.find((a) => a.id === post.authorId) || attendees[0];
  const event = events.find((e) => e.id === post.eventId);

  return (
    <div style={{ maxWidth: '44rem', margin: '0 auto', width: '100%', fontFamily: 'system-ui, sans-serif' }}>
      <Link to="/feed" className={css('_flex _aic _gap1')} style={{ textDecoration: 'none', color: 'var(--d-text-muted)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={14} /> Back to feed
      </Link>

      <article className="post-card" style={{ padding: '1.5rem' }}>
        <div className={css('_flex _aic _gap3')} style={{ marginBottom: '1rem' }}>
          <img src={author.avatar} alt="" style={{ width: 48, height: 48, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className={css('_fontmedium')}>{author.name}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
              {author.handle} · {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
        {event && (
          <Link to={`/events/${event.id}`} className="cat-chip" data-tone="primary" style={{ textDecoration: 'none', marginBottom: '1rem', display: 'inline-flex' }}>
            {event.title}
          </Link>
        )}
        <p style={{ fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: post.image ? '1rem' : '1.25rem' }}>{post.body}</p>
        {post.image && (
          <img src={post.image} alt="" style={{ width: '100%', borderRadius: 'var(--d-radius)', marginBottom: '1.25rem', aspectRatio: '16/9', objectFit: 'cover' }} />
        )}
        <ReactionBar reactions={post.reactions} />
      </article>

      <section style={{ marginTop: '2rem' }}>
        <h2 className="display-heading" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>{post.commentCount} comments</h2>

        <div className="feature-tile" style={{ marginBottom: '1.25rem' }}>
          <textarea className="d-control" rows={2} placeholder="Join the conversation..." style={{ resize: 'vertical' }} />
          <div className={css('_flex _aic _jcend')} style={{ marginTop: '0.75rem' }}>
            <button className="d-interactive cta-glossy" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>Post</button>
          </div>
        </div>

        <div className={css('_flex _col _gap3')}>
          {comments.map((c) => {
            const a = attendees.find((x) => x.id === c.authorId) || attendees[0];
            return (
              <div key={c.id} className={css('_flex _gap3')} style={{ padding: '1rem', background: 'var(--d-surface)', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)' }}>
                <img src={a.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.25rem' }}>
                    <span className={css('_textsm _fontmedium')}>{a.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                      {new Date(c.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={css('_textsm')} style={{ lineHeight: 1.5 }}>{c.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
