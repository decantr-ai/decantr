import type { MatchEvent } from '@/data/mock';

const typeColors: Record<string, string> = {
  kill: 'var(--d-success)',
  death: 'var(--d-error)',
  objective: 'var(--d-warning)',
  'round-start': 'var(--d-info)',
  'round-end': 'var(--d-primary)',
  timeout: 'var(--d-text-muted)',
};

export function Timeline({ events }: { events: MatchEvent[] }) {
  return (
    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
      <div style={{
        position: 'absolute',
        left: 6,
        top: 8,
        bottom: 8,
        width: 2,
        background: 'var(--d-border)',
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {events.map((event, i) => (
          <div key={event.id} style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '-2rem',
              top: 6,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: typeColors[event.type] || 'var(--d-border)',
              border: '2px solid var(--d-bg)',
              transform: 'translateX(1px)',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
              <span style={{
                fontFamily: 'var(--d-font-mono, monospace)',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: typeColors[event.type],
              }}>
                {event.timestamp}
              </span>
              {event.player && (
                <span className="d-annotation" style={{ fontSize: '0.6rem' }}>{event.player}</span>
              )}
            </div>
            <div style={{ fontSize: '0.85rem', color: i === 0 ? 'var(--d-text)' : 'var(--d-text-muted)', lineHeight: 1.5 }}>
              {event.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
