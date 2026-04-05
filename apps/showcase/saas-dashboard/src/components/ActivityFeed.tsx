import type { ActivityEvent } from '@/data/mock';

interface ActivityFeedProps {
  events: ActivityEvent[];
  compact?: boolean;
}

export function ActivityFeed({ events, compact }: ActivityFeedProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {events.map(ev => (
        <div
          key={ev.id}
          className="d-data-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: compact ? '0.5rem 0.5rem' : 'var(--d-data-py) 0.5rem',
            borderRadius: 'var(--d-radius-sm)',
          }}
        >
          <span className="sd-event-dot" data-type={ev.type} />
          <div className="sd-avatar" style={{ width: 26, height: 26, fontSize: '0.6rem' }}>
            {ev.userAvatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 500, fontSize: '0.8rem' }}>{ev.user}</span>{' '}
            <span style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem' }}>{ev.action}</span>{' '}
            <span style={{ fontSize: '0.8rem' }}>{ev.target}</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', flexShrink: 0, fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>
            {ev.timestamp}
          </span>
        </div>
      ))}
    </div>
  );
}
