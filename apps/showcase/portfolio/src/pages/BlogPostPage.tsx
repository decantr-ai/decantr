import { useParams, Link, Navigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { blogPosts } from '../data/mock';

export function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="entrance-fade" style={{ maxWidth: '48rem', margin: '0 auto' }}>
      {/* Breadcrumbs */}
      <nav className={css('_flex _aic _gap2 _textsm')} style={{ marginBottom: '2rem' }}>
        <Link to="/blog" className={css('_flex _aic _gap1')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>
          <ArrowLeft size={14} />
          Blog
        </Link>
        <span style={{ color: 'var(--d-border)' }}>/</span>
        <span style={{ color: 'var(--d-text-muted)' }}>{post.title}</span>
      </nav>

      {/* Post header */}
      <article className="d-section" style={{ paddingTop: 0 }}>
        <div style={{ marginBottom: '2rem' }}>
          <div className={css('_flex _aic _gap3')} style={{ marginBottom: '1rem' }}>
            <span className="d-annotation">{post.category}</span>
            <span className={css('_flex _aic _gap1')} style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>
              <Calendar size={13} />
              {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className={css('_flex _aic _gap1')} style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>
              <Clock size={13} />
              {post.readingTime}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 600, lineHeight: 1.2, marginBottom: '1.5rem' }}>
            {post.title}
          </h1>
          <div
            className="d-glass"
            style={{ borderRadius: 'var(--d-radius-lg)', overflow: 'hidden', marginBottom: '2.5rem' }}
          >
            <img
              src={post.image}
              alt={post.title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>

        {/* Post content — comfortable reading typography */}
        <div
          style={{
            fontSize: '1.0625rem',
            lineHeight: 1.85,
            color: 'var(--d-text-muted)',
          }}
        >
          {post.content.split('\n\n').map((block, i) => {
            if (block.startsWith('## ')) {
              return (
                <h2
                  key={i}
                  style={{
                    fontSize: '1.375rem',
                    fontWeight: 600,
                    color: 'var(--d-text)',
                    marginTop: '2.5rem',
                    marginBottom: '1rem',
                    lineHeight: 1.3,
                  }}
                >
                  {block.replace('## ', '')}
                </h2>
              );
            }
            return (
              <p key={i} style={{ marginBottom: '1.25rem' }}>
                {block}
              </p>
            );
          })}
        </div>
      </article>
    </div>
  );
}
