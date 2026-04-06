import { Link } from 'react-router-dom';
import { Sparkline } from './Sparkline';
import type { Player } from '@/data/mock';

const moodColors: Record<string, string> = {
  great: 'var(--d-success)',
  good: 'var(--d-info)',
  neutral: 'var(--d-warning)',
  tired: 'var(--d-warning)',
  tilted: 'var(--d-error)',
};

const moodEmoji: Record<string, string> = {
  great: 'On Fire',
  good: 'Solid',
  neutral: 'Steady',
  tired: 'Fatigued',
  tilted: 'Tilted',
};

const statusStyles: Record<string, { bg: string; color: string }> = {
  active: { bg: 'color-mix(in srgb, var(--d-success) 15%, transparent)', color: 'var(--d-success)' },
  benched: { bg: 'color-mix(in srgb, var(--d-warning) 15%, transparent)', color: 'var(--d-warning)' },
  injured: { bg: 'color-mix(in srgb, var(--d-error) 15%, transparent)', color: 'var(--d-error)' },
  tryout: { bg: 'color-mix(in srgb, var(--d-info) 15%, transparent)', color: 'var(--d-info)' },
};

export function PlayerCard({ player }: { player: Player }) {
  const sStatus = statusStyles[player.status] || statusStyles.active;

  return (
    <Link
      to={`/team/players/${player.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        className="d-surface gg-achievement-shine"
        data-interactive
        style={{
          padding: 'var(--d-surface-p)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--d-radius-full)',
            background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {player.avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{player.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{player.role}</div>
          </div>
          <span style={{
            fontSize: '0.65rem',
            padding: '0.125rem 0.5rem',
            borderRadius: 'var(--d-radius-full)',
            background: sStatus.bg,
            color: sStatus.color,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {player.status}
          </span>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div>
              <div className="d-label" style={{ marginBottom: '0.125rem' }}>K/D</div>
              <div style={{ fontWeight: 600, fontFamily: 'var(--d-font-mono, monospace)', fontSize: '0.9rem' }}>{player.kd.toFixed(2)}</div>
            </div>
            <div>
              <div className="d-label" style={{ marginBottom: '0.125rem' }}>Win%</div>
              <div style={{ fontWeight: 600, fontFamily: 'var(--d-font-mono, monospace)', fontSize: '0.9rem' }}>{player.winRate}%</div>
            </div>
          </div>
          <Sparkline data={player.sparkline} />
        </div>

        {/* Mood indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.25rem', borderTop: '1px solid var(--d-border)' }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: moodColors[player.mood],
          }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
            Mood: {moodEmoji[player.mood]}
          </span>
        </div>
      </div>
    </Link>
  );
}
