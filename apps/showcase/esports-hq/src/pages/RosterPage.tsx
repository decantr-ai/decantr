import { useState } from 'react';
import { PlayerCard } from '@/components/PlayerCard';
import { players } from '@/data/mock';

export function RosterPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [gameFilter, setGameFilter] = useState<string>('');

  const games = [...new Set(players.map(p => p.game))];
  const statuses = [...new Set(players.map(p => p.status))];

  const filtered = players.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (gameFilter && p.game !== gameFilter) return false;
    return true;
  });

  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Player Roster</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>
          {players.length} players across {games.length} game{games.length > 1 ? 's' : ''}.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className="d-interactive"
          data-variant={!statusFilter ? 'primary' : 'ghost'}
          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
          onClick={() => setStatusFilter('')}
        >
          All Status
        </button>
        {statuses.map(s => (
          <button
            key={s}
            className="d-interactive"
            data-variant={statusFilter === s ? 'primary' : 'ghost'}
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', textTransform: 'capitalize' }}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
        <div style={{ width: 1, height: 24, background: 'var(--d-border)', margin: '0 0.25rem' }} />
        <button
          className="d-interactive"
          data-variant={!gameFilter ? 'primary' : 'ghost'}
          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
          onClick={() => setGameFilter('')}
        >
          All Games
        </button>
        {games.map(g => (
          <button
            key={g}
            className="d-interactive"
            data-variant={gameFilter === g ? 'primary' : 'ghost'}
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
            onClick={() => setGameFilter(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Player cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 'var(--d-gap-4)',
      }}>
        {filtered.map(player => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}
