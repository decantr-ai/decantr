import { Link } from 'react-router-dom';
import type { Scrim } from '@/data/mock';

const statusColors: Record<string, { bg: string; text: string }> = {
  scheduled: { bg: 'color-mix(in srgb, var(--d-info) 15%, transparent)', text: 'var(--d-info)' },
  live: { bg: 'color-mix(in srgb, var(--d-success) 15%, transparent)', text: 'var(--d-success)' },
  completed: { bg: 'color-mix(in srgb, var(--d-text-muted) 15%, transparent)', text: 'var(--d-text-muted)' },
  cancelled: { bg: 'color-mix(in srgb, var(--d-error) 15%, transparent)', text: 'var(--d-error)' },
};

export function ScrimCalendar({ scrims }: { scrims: Scrim[] }) {
  const grouped = scrims.reduce<Record<string, Scrim[]>>((acc, s) => {
    (acc[s.date] = acc[s.date] || []).push(s);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {sortedDates.map(date => {
        const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        return (
          <div key={date}>
            <div className="d-label" style={{
              marginBottom: '0.5rem',
              paddingLeft: '0.5rem',
              borderLeft: '2px solid var(--d-accent)',
            }}>
              {dayLabel}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {grouped[date].map(scrim => {
                const sc = statusColors[scrim.status];
                return (
                  <Link
                    key={scrim.id}
                    to={`/scrims/${scrim.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div
                      className="d-surface"
                      data-interactive
                      style={{
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                      }}
                    >
                      {/* Time */}
                      <span style={{
                        fontFamily: 'var(--d-font-mono, monospace)',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        width: 50,
                        flexShrink: 0,
                      }}>
                        {scrim.time}
                      </span>

                      {/* Opponent */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--d-radius-sm)',
                          background: 'var(--d-surface-raised)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}>
                          {scrim.opponentLogo}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>vs {scrim.opponent}</span>
                      </div>

                      {/* Map */}
                      <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', flexShrink: 0 }}>{scrim.map}</span>

                      {/* Score or status */}
                      {scrim.score ? (
                        <span style={{
                          fontFamily: 'var(--d-font-mono, monospace)',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          color: scrim.score.us > scrim.score.them ? 'var(--d-success)' : 'var(--d-error)',
                          flexShrink: 0,
                        }}>
                          {scrim.score.us}-{scrim.score.them}
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: 'var(--d-radius-full)',
                          background: sc.bg,
                          color: sc.text,
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          flexShrink: 0,
                        }}>
                          {scrim.status === 'live' && '● '}{scrim.status}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
