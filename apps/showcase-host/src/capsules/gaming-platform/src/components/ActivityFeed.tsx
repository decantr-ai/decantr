import type { ActivityEvent } from '@/data/mock';

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div>
      <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
        Recent Activity
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {events.map(event => (
          <div
            key={event.id}
            className="d-data-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: 'var(--d-data-py) 0',
            }}
          >
            <span className="gg-event-dot" data-type={event.type} />
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--d-radius-full)',
              background: 'var(--d-surface-raised)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6rem',
              fontWeight: 700,
              flexShrink: 0,
              color: 'var(--d-text-muted)',
            }}>
              {event.userAvatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{event.user}</span>
              <span style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}> {event.action} </span>
              <span style={{ color: 'var(--d-primary)', fontSize: '0.875rem' }}>{event.target}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', fontFamily: 'ui-monospace, monospace', whiteSpace: 'nowrap' }}>
              {event.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
