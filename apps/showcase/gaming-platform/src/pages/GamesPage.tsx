import { useState } from 'react';
import { FilterBar } from '@/components/FilterBar';
import { CardGrid } from '@/components/CardGrid';
import { games } from '@/data/mock';
import { Star, Users } from 'lucide-react';

export function GamesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('');

  const genres = [...new Set(games.map(g => g.genre))];

  const filtered = games.filter(game => {
    const matchesSearch = !searchQuery || game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !genreFilter || game.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Game Catalog</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Discover games, find your next obsession.</p>
      </div>

      {/* Search + Filter Bar */}
      <FilterBar
        placeholder="Search games..."
        filters={[{ label: 'Genre', options: genres }]}
        onSearch={setSearchQuery}
        onFilter={(_, value) => setGenreFilter(value)}
      />

      {/* Tag filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['All', 'Competitive', 'Co-op', 'Ranked'].map(tag => (
          <button
            key={tag}
            className="d-interactive"
            data-variant={tag === 'All' ? 'primary' : 'ghost'}
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Game Card Grid */}
      <CardGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
        {filtered.map(game => (
          <div
            key={game.id}
            className="d-surface"
            data-interactive
            style={{
              padding: 0,
              overflow: 'hidden',
              transition: 'transform 200ms ease, box-shadow 200ms ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--d-shadow-lg)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--d-shadow)';
            }}
          >
            {/* Cover art gradient */}
            <div style={{
              height: 160,
              background: game.coverGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.8)',
              transition: 'transform 300ms ease',
              overflow: 'hidden',
            }}>
              {game.title.charAt(0)}
            </div>
            <div style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <span className="d-annotation">{game.genre}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                  <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                  {game.rating}
                </span>
              </div>
              <h3 style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{game.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                <Users size={12} />
                {game.players.toLocaleString()} playing
              </div>
              <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
                {game.tags.slice(0, 2).map(tag => (
                  <span key={tag} style={{
                    fontSize: '0.6rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: 'var(--d-radius-full)',
                    background: 'var(--d-surface-raised)',
                    color: 'var(--d-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardGrid>
    </div>
  );
}
