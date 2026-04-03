import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Clock, ArrowRight } from 'lucide-react';
import { blogPosts } from '../data/mock';

export function BlogPage() {
  return (
    <div className="entrance-fade" style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <section className="d-section">
        <h1
          className="d-gradient-text"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 600, marginBottom: '0.75rem' }}
        >
          Blog
        </h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '1.0625rem', marginBottom: '3rem', maxWidth: '36rem' }}>
          Thoughts on design systems, creative coding, performance, and the craft of building for the web.
        </p>

        <div className={css('_flex _col _gap6')}>
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <article
                className="d-surface d-glass"
                data-interactive
                style={{
                  borderRadius: 'var(--d-radius-lg)',
                  overflow: 'hidden',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'row',
                  minHeight: '200px',
                }}
              >
                <div style={{ width: '300px', flexShrink: 0, position: 'relative', overflow: 'hidden' }} className="blog-card-image">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: 'var(--d-surface-p)', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                  <div className={css('_flex _aic _gap3')} style={{ marginBottom: '0.75rem' }}>
                    <span className="d-annotation">{post.category}</span>
                    <span className={css('_flex _aic _gap1 _textsm')} style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>
                      <Clock size={12} />
                      {post.readingTime}
                    </span>
                  </div>
                  <h2 className={css('_fontsemi')} style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    {post.title}
                  </h2>
                  <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                    {post.excerpt}
                  </p>
                  <span className={css('_flex _aic _gap1 _textsm')} style={{ color: 'var(--d-primary)', fontWeight: 500 }}>
                    Read More <ArrowRight size={14} />
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 639px) {
          .blog-card-image { display: none !important; }
        }
      `}</style>
    </div>
  );
}
