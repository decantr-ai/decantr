interface ActivityEvent {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: string;
}

const EVENT_COLORS: Record<string, string> = {
  publish: 'var(--d-success)',
  update: 'var(--d-info)',
  review: 'var(--d-warning)',
  download: 'var(--d-cyan)',
  comment: 'var(--d-coral)',
};

interface Props {
  events: ActivityEvent[];
}

export function ActivityFeed({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3" style={{ padding: '3rem 0' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--d-text-muted)', opacity: 0.5 }}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
          No activity yet. Publish your first item to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {events.map((event) => (
        <div
          key={event.id}
          className="d-data-row flex items-start gap-3"
          style={{ padding: 'var(--d-data-py) 0' }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: EVENT_COLORS[event.type] || 'var(--d-text-muted)',
              marginTop: '0.5rem',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <span className="text-sm">
              <span className="font-medium">{event.user}</span>{' '}
              {event.action}{' '}
              <span style={{ color: 'var(--d-text-muted)' }}>{event.target}</span>
            </span>
          </div>
          <span className="text-xs" style={{ color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono, monospace)', flexShrink: 0 }}>
            {event.timestamp}
          </span>
        </div>
      ))}
    </div>
  );
}
