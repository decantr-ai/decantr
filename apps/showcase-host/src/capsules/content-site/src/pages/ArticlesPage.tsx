import { css } from '@decantr/css';
import { Search, Clock, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { articles } from '../data/mock';

export function ArticlesPage() {
  const [query, setQuery] = useState('');

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  const featured = filtered.filter((a) => a.featured);
  const rest = filtered.filter((a) => !a.featured);

  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Articles</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
          Long-form writing on design, engineering, and the craft of building for the web.
        </p>
      </div>

      {/* Search */}
      <div className={css('_flex _aic _gap3')} style={{ marginBottom: '2.5rem', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--d-text-muted)' }} />
        <input
          type="text"
          className="d-control"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ paddingLeft: '2.25rem', fontFamily: 'system-ui, sans-serif' }}
        />
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <p className="editorial-caption" style={{ marginBottom: '1rem' }}>Featured</p>
          <div className={css('_flex _col _gap6')}>
            {featured.map((article) => (
              <a
                key={article.id}
                href={`#/articles/${article.id}`}
                className="editorial-card"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                  borderRadius: 'var(--d-radius)',
                  cursor: 'pointer',
                  transition: 'border-color 150ms ease',
                }}
              >
                <img
                  src={article.image}
                  alt=""
                  style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 'var(--d-radius-sm)' }}
                />
                <div className={css('_flex _col')} style={{ justifyContent: 'center' }}>
                  <span className="editorial-caption" style={{ marginBottom: '0.5rem', color: 'var(--d-accent)' }}>{article.category}</span>
                  <h2 style={{ fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '0.75rem' }}>
                    {article.title}
                  </h2>
                  <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, marginBottom: '0.75rem', fontFamily: 'system-ui, sans-serif' }}>
                    {article.excerpt}
                  </p>
                  <div className={css('_flex _aic _gap3')} style={{ fontFamily: 'system-ui, sans-serif' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{article.author}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--d-border)' }}>|</span>
                    <span className={css('_flex _aic _gap1')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                      <Clock size={12} />
                      {article.readingTime}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Article list */}
      <div>
        <p className="editorial-caption" style={{ marginBottom: '1rem' }}>All Articles</p>
        <div className={css('_flex _col')}>
          {rest.map((article) => (
            <a
              key={article.id}
              href={`#/articles/${article.id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                gap: '1.5rem',
                padding: '1.25rem 0',
                borderBottom: '1px solid var(--d-border)',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1 }}>
                <span className="editorial-caption" style={{ marginBottom: '0.375rem', display: 'block', color: 'var(--d-accent)' }}>{article.category}</span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '0.5rem' }}>
                  {article.title}
                </h3>
                <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, marginBottom: '0.5rem', fontFamily: 'system-ui, sans-serif' }}>
                  {article.excerpt}
                </p>
                <div className={css('_flex _aic _gap3')} style={{ fontFamily: 'system-ui, sans-serif' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{article.date}</span>
                  <span className={css('_flex _aic _gap1')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                    <Clock size={12} />
                    {article.readingTime}
                  </span>
                </div>
              </div>
              <img
                src={article.image}
                alt=""
                style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 'var(--d-radius-sm)', flexShrink: 0 }}
              />
            </a>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p style={{ color: 'var(--d-text-muted)', marginBottom: '0.5rem' }}>No articles match "{query}"</p>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
            Try a different search term or <a href="#/categories" style={{ color: 'var(--d-accent)' }}>browse categories</a>.
          </p>
        </div>
      )}
    </div>
  );
}
