import { css } from '@decantr/css';
import { Clock, ArrowLeft, Bookmark, Share2 } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { articles, author } from '../data/mock';

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const article = articles.find((a) => a.id === id) ?? articles[0];

  const paragraphs = article.content.split('\n\n');

  return (
    <div style={{ maxWidth: '42rem', margin: '0 auto', width: '100%' }}>
      {/* Breadcrumb */}
      <div className={css('_flex _aic _gap2')} style={{ marginBottom: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <Link
          to="/articles"
          className={css('_flex _aic _gap1')}
          style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}
        >
          <ArrowLeft size={14} />
          Articles
        </Link>
        <span style={{ color: 'var(--d-border)' }}>/</span>
        <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{article.category}</span>
      </div>

      {/* Article header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <span className="editorial-caption" style={{ marginBottom: '0.75rem', display: 'block', color: 'var(--d-accent)' }}>
          {article.category}
        </span>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 600, lineHeight: 1.15, marginBottom: '1rem' }}>
          {article.title}
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          {article.excerpt}
        </p>

        {/* Meta row */}
        <div className={css('_flex _aic _jcsb')} style={{ fontFamily: 'system-ui, sans-serif' }}>
          <div className={css('_flex _aic _gap3')}>
            <img
              src={author.avatar}
              alt={article.author}
              style={{ width: 36, height: 36, borderRadius: 'var(--d-radius-full)', objectFit: 'cover' }}
            />
            <div>
              <p className={css('_textsm _fontsemi')}>{article.author}</p>
              <div className={css('_flex _aic _gap2')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                <span>{article.date}</span>
                <span style={{ color: 'var(--d-border)' }}>|</span>
                <span className={css('_flex _aic _gap1')}>
                  <Clock size={12} />
                  {article.readingTime}
                </span>
              </div>
            </div>
          </div>
          <div className={css('_flex _aic _gap2')}>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem' }} aria-label="Bookmark">
              <Bookmark size={16} />
            </button>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem' }} aria-label="Share">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </header>

      <hr className="editorial-divider" />

      {/* Article image */}
      <img
        src={article.image}
        alt=""
        style={{ width: '100%', height: 'auto', borderRadius: 'var(--d-radius)', marginBottom: '2.5rem', aspectRatio: '16 / 9', objectFit: 'cover' }}
      />

      {/* Article body */}
      <article style={{ lineHeight: 1.8, fontSize: '1.0625rem' }}>
        {paragraphs.map((p, i) => {
          if (i === 0) {
            return (
              <p key={i} className="editorial-dropcap" style={{ marginBottom: '1.5rem' }}>
                {p}
              </p>
            );
          }
          if (i === Math.floor(paragraphs.length / 2)) {
            return (
              <div key={i}>
                <blockquote className="editorial-pullquote">
                  {p.length > 120 ? p.slice(0, 120) + '...' : p}
                </blockquote>
                <p style={{ marginBottom: '1.5rem' }}>{p}</p>
              </div>
            );
          }
          return (
            <p key={i} style={{ marginBottom: '1.5rem' }}>{p}</p>
          );
        })}
      </article>

      <hr className="editorial-divider" />

      {/* Author card */}
      <div className="editorial-card" style={{ borderRadius: 'var(--d-radius)', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        <img
          src={author.avatar}
          alt={author.name}
          style={{ width: 56, height: 56, borderRadius: 'var(--d-radius-full)', objectFit: 'cover', flexShrink: 0 }}
        />
        <div>
          <p className={css('_fontsemi')} style={{ fontFamily: 'system-ui, sans-serif' }}>{author.name}</p>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, fontFamily: 'system-ui, sans-serif' }}>
            {author.bio.split('.').slice(0, 2).join('.') + '.'}
          </p>
        </div>
      </div>
    </div>
  );
}
