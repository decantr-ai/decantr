import { css } from '@decantr/css';
import { Search, Sparkles, Filter, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { searchResults, type SearchResult } from '../data/mock';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [mode, setMode] = useState<'text' | 'semantic'>('semantic');

  const filtered = useMemo(() => {
    let results = searchResults;
    if (query) {
      const q = query.toLowerCase();
      results = results.filter((r) => r.title.toLowerCase().includes(q) || r.excerpt.toLowerCase().includes(q));
    }
    if (category !== 'all') {
      results = results.filter((r) => r.category === category);
    }
    return results;
  }, [query, category]);

  const categories = ['all', ...new Set(searchResults.map((r) => r.category))];

  return (
    <div className="entrance-fade" style={{ maxWidth: '48rem', margin: '0 auto' }}>
      <h1 className={css('_fontsemi')} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        Search the Knowledge Base
      </h1>
      <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '2rem' }}>
        AI-powered semantic search across all documentation, guides, and API references.
      </p>

      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
        <input
          className="d-control paper-input"
          placeholder="Search for anything... try 'how to install' or 'design tokens'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ paddingLeft: '2.25rem', paddingRight: query ? '2.25rem' : undefined }}
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--d-text-muted)', padding: '0.25rem' }}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className={css('_flex _aic _gap3')} style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className={css('_flex _aic _gap2')}>
          <Filter size={14} style={{ color: 'var(--d-text-muted)' }} />
          {categories.map((cat) => (
            <button
              key={cat}
              className="d-interactive"
              data-variant={category === cat ? undefined : 'ghost'}
              onClick={() => setCategory(cat)}
              style={{
                padding: '0.25rem 0.625rem',
                fontSize: '0.75rem',
                borderRadius: 'var(--d-radius-full)',
                background: category === cat ? 'var(--d-primary)' : undefined,
                color: category === cat ? '#fff' : undefined,
                borderColor: category === cat ? 'var(--d-primary)' : undefined,
              }}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
        <div className={css('_flex _aic _gap2')} style={{ marginLeft: 'auto' }}>
          <button
            className="d-interactive"
            data-variant={mode === 'text' ? undefined : 'ghost'}
            onClick={() => setMode('text')}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          >
            Text
          </button>
          <button
            className="d-interactive"
            data-variant={mode === 'semantic' ? undefined : 'ghost'}
            onClick={() => setMode('semantic')}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              background: mode === 'semantic' ? 'var(--d-primary)' : undefined,
              color: mode === 'semantic' ? '#fff' : undefined,
              borderColor: mode === 'semantic' ? 'var(--d-primary)' : undefined,
            }}
          >
            <Sparkles size={11} />
            Semantic
          </button>
        </div>
      </div>

      {/* Results */}
      <div className={css('_flex _col _gap3')}>
        {filtered.length > 0 ? (
          filtered.map((result) => (
            <SearchResultCard key={result.slug} result={result} query={query} />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--d-text-muted)' }}>
            <Search size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>No results found</p>
            <p className={css('_textsm')}>Try different keywords or browse the documentation tree.</p>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '1.5rem', textAlign: 'center' }}>
          Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {mode === 'semantic' && ' with AI-powered semantic matching'}
        </p>
      )}
    </div>
  );
}

function SearchResultCard({ result, query }: { result: SearchResult; query: string }) {
  return (
    <Link
      to={`/docs/${result.slug}`}
      className="paper-card paper-fade"
      style={{ display: 'block', padding: 'var(--d-surface-p)', textDecoration: 'none', color: 'inherit', transition: 'border-color 150ms ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--d-primary)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--d-border)'; }}
    >
      <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
        <span className="d-annotation">{result.category}</span>
      </div>
      <h3 style={{ fontWeight: 500, marginBottom: '0.375rem', color: 'var(--d-text)' }}>{result.title}</h3>
      <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
        {highlightExcerpt(result.excerpt, query || result.highlights[0])}
      </p>
      {result.highlights.length > 0 && (
        <div className={css('_flex _gap2')} style={{ marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {result.highlights.map((h, i) => (
            <span key={i} className="paper-highlight" style={{ fontSize: '0.75rem' }}>{h}</span>
          ))}
        </div>
      )}
    </Link>
  );
}

function highlightExcerpt(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="paper-highlight">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}
