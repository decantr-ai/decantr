import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { listings } from '@/data/mock';
import { ListingCard } from '@/components/ListingCard';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState<string[]>(['cabin']);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return listings.filter(l =>
      (!q || l.title.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)) &&
      tags.every(t => (l.title + l.category + l.description).toLowerCase().includes(t.toLowerCase())),
    );
  }, [query, tags]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <div className="d-label" style={{ marginBottom: '0.5rem' }}>Search</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Find your stay</h1>
      </header>

      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
        <input
          className="nm-input"
          placeholder="Try 'cabin with hot tub' or 'Paris studio'"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          style={{ paddingLeft: 40, fontSize: '1rem', padding: '0.875rem 1rem 0.875rem 40px' }}
        />
      </div>

      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tags.map(t => (
            <span key={t} className="nm-badge" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
              {t}
              <button
                aria-label={`Remove ${t}`}
                onClick={() => setTags(tags.filter(x => x !== t))}
                style={{ background: 'none', border: 'none', padding: 0, marginLeft: '0.25rem', cursor: 'pointer', color: 'inherit', display: 'flex' }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>
        {results.length} result{results.length === 1 ? '' : 's'}
      </div>

      {results.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {results.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--d-text-muted)' }}>
          <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--d-text)', marginBottom: '0.35rem' }}>No results</h3>
          <p style={{ fontSize: '0.875rem' }}>Try different keywords or clear your tags.</p>
        </div>
      )}
    </div>
  );
}
