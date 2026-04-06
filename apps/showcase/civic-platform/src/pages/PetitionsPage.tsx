import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Search, MessageSquare, Vote } from 'lucide-react';
import { petitions, petitionCategories } from '@/data/mock';

export function PetitionsPage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = petitions.filter(p => {
    if (category !== 'All' && p.category !== category) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Petitions</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Browse and sign community petitions</p>
      </div>

      {/* Filters */}
      <div className={css('_flex _wrap _gap3 _aic')}>
        <div className={css('_flex _aic _gap2')} style={{ flex: 1, minWidth: 200, maxWidth: 360 }}>
          <Search size={16} style={{ color: 'var(--d-text-muted)' }} />
          <input
            type="text"
            className="d-control gov-input"
            placeholder="Search petitions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <div className={css('_flex _gap1 _wrap')}>
          {petitionCategories.map(cat => (
            <button
              key={cat}
              className="d-interactive"
              data-variant={category === cat ? 'primary' : 'ghost'}
              onClick={() => setCategory(cat)}
              style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className={css('_grid')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filtered.map((p, i) => {
          const pct = Math.min(100, Math.round((p.signatures / p.goal) * 100));
          return (
            <Link
              key={p.id}
              to={`/engage/petitions/${p.id}`}
              className="d-surface gov-card"
              data-interactive
              style={{
                textDecoration: 'none',
                color: 'inherit',
                padding: '1.25rem',
                display: 'block',
                opacity: 0,
                animation: `decantr-entrance 0.3s ease forwards`,
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div className={css('_flex _jcsb _aic _mb2')}>
                <span className="gov-badge" style={{
                  background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)',
                  color: 'var(--d-primary)',
                  fontSize: '0.6875rem',
                  padding: '0.125rem 0.5rem',
                }}>{p.category}</span>
                <span className="d-annotation" data-status={p.status === 'active' ? 'success' : 'info'}>
                  {p.status}
                </span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.375rem' }}>{p.title}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                {p.description.slice(0, 120)}...
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.5rem' }}>
                by {p.author} &middot; {p.createdAt}
              </div>
              {/* Progress */}
              <div className={css('_flex _jcsb')} style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600 }}>{p.signatures.toLocaleString()} signatures</span>
                <span>{pct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--d-surface-raised)', borderRadius: 1, overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? 'var(--d-success)' : 'var(--d-primary)', borderRadius: 1 }} />
              </div>
              <div className={css('_flex _gap3')} style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                <span className={css('_flex _aic _gap1')}><MessageSquare size={12} /> {p.comments.length}</span>
                <span className={css('_flex _aic _gap1')}><Vote size={12} /> {p.votes.yes + p.votes.no + p.votes.abstain}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
