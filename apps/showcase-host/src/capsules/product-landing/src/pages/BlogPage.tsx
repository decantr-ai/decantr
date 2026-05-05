import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { BLOG_POSTS } from '../data/mock';

export function BlogPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="d-label" style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>BLOG</p>
        <h1 className={css('_fontsemi')} style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Insights & Updates
        </h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', maxWidth: 500 }}>
          Thoughts on design systems, performance, and building better products.
        </p>
      </div>

      <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {BLOG_POSTS.map(post => (
          <Link
            key={post.id}
            to={`/blog/${post.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <article
              className="lum-card-outlined"
              style={{
                padding: '1.5rem',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 200ms ease, border-color 200ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              <span className="d-annotation" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem' }}>
                {post.category}
              </span>
              <h2 className={css('_fontsemi')} style={{ fontSize: '1.125rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                {post.title}
              </h2>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>
                {post.excerpt}
              </p>
              <div className={css('_flex _aic _jcsb')}>
                <div className={css('_flex _aic _gap3')}>
                  <span className={css('_flex _aic _gap1 _textxs')} style={{ color: 'var(--d-text-muted)' }}>
                    <Calendar size={12} /> {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className={css('_flex _aic _gap1 _textxs')} style={{ color: 'var(--d-text-muted)' }}>
                    <Clock size={12} /> {post.readTime}
                  </span>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--d-primary)' }} />
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
