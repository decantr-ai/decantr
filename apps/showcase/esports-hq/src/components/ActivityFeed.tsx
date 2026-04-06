import type { ActivityEvent } from '@/data/mock';

const typeColors: Record<string, string> = {
  match: 'var(--d-primary)',
  roster: 'var(--d-accent)',
  sponsor: 'var(--d-success)',
  vod: 'var(--d-warning)',
  scrim: 'var(--d-info)',
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {events.map((event, i) => (
        <div
          key={event.id}
          className="d-data-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 0',
            animationDelay: `${i * 50}ms`,
          }}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--d-radius-full)',
            background: 'var(--d-surface-raised)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6rem',
            fontWeight: 700,
            flexShrink: 0,
            border: `2px solid ${typeColors[event.type] || 'var(--d-border)'}`,
          }}>
            {event.userAvatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '0.8rem' }}>
              <span style={{ fontWeight: 500 }}>{event.user}</span>
              {' '}{event.action}{' '}
              <span style={{ color: 'var(--d-primary)' }}>{event.target}</span>
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {event.timestamp}
          </span>
        </div>
      ))}
    </div>
  );
}
