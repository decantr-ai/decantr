import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Heart, MessageCircle, ArrowLeft, Lock } from 'lucide-react';
import { TierBadge } from '../../components/TierBadge';
import { postById, creatorByUsername } from '../../data/mock';

export function PostPage() {
  const { id, username } = useParams();
  const post = postById(id || '');
  const creator = creatorByUsername(username || '');

  return (
    <article style={{ maxWidth: 760, margin: '0 auto' }}>
      <Link to={`/creator/${creator.username}`} className={css('_flex _aic _gap2')} style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.8125rem', marginBottom: '1rem', fontFamily: 'system-ui, sans-serif' }}>
        <ArrowLeft size={14} /> Back to {creator.name}
      </Link>

      <div style={{ marginBottom: '1rem' }}>
        <TierBadge tier={post.tier} />
      </div>
      <h1 className="serif-display" style={{ fontSize: '2.25rem', lineHeight: 1.15, marginBottom: '1rem' }}>{post.title}</h1>

      <div className={css('_flex _aic _gap3')} style={{ marginBottom: '2rem' }}>
        <img src={creator.avatar} alt="" width={40} height={40} style={{ borderRadius: '50%' }} />
        <div style={{ fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{creator.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Published {post.publishedAt}</div>
        </div>
      </div>

      <img src={post.cover} alt="" style={{ width: '100%', borderRadius: 'var(--d-radius-lg)', marginBottom: '2rem' }} />

      <div style={{ fontSize: '1.0625rem', lineHeight: 1.75, fontFamily: 'system-ui, sans-serif', color: 'var(--d-text)', marginBottom: '2rem' }}>
        <p style={{ marginBottom: '1.25rem' }}>{post.excerpt}</p>
        <p style={{ marginBottom: '1.25rem' }}>This is the body of the post. In a real application this would render rich Markdown content, embedded media, quotations, and downloads — rendered with typography that feels like reading a printed essay.</p>
        <p>Canvas treats every post like it matters, because it does. Your readers chose to be here.</p>
      </div>

      {post.tier !== 'free' && (
        <div className="studio-card-premium" style={{ marginBottom: '2rem' }}>
          <div className="inner" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Lock size={20} style={{ color: 'var(--d-secondary)', margin: '0 auto 0.5rem' }} />
            <h3 className="serif-display" style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Supporters see more</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif', marginBottom: '1rem' }}>This post includes downloads and a walkthrough video.</p>
            <Link to="/checkout" className="d-interactive studio-glow" data-variant="primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', textDecoration: 'none' }}>Unlock with Fan tier</Link>
          </div>
        </div>
      )}

      <div className={css('_flex _aic _gap4')} style={{ padding: '1rem 0', borderTop: '1px solid var(--d-border)', borderBottom: '1px solid var(--d-border)', fontFamily: 'system-ui, sans-serif' }}>
        <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8125rem' }}>
          <Heart size={14} /> {post.likes}
        </button>
        <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8125rem' }}>
          <MessageCircle size={14} /> {post.comments} comments
        </button>
      </div>
    </article>
  );
}
