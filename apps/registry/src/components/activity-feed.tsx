interface ActivityEvent {
  id: string;
  user: string;
  action: string;
  target?: string;
  timestamp: string;
  type: 'publish' | 'update' | 'review' | 'download' | 'comment';
}

const EVENT_COLORS: Record<ActivityEvent['type'], string> = {
  publish: 'var(--d-success)',
  update: 'var(--d-info)',
  review: 'var(--d-warning)',
  download: 'var(--d-accent)',
  comment: 'var(--d-primary)',
};

function ActivityIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function groupByDate(
  events: ActivityEvent[]
): Map<string, ActivityEvent[]> {
  const groups = new Map<string, ActivityEvent[]>();
  for (const event of events) {
    let label: string;
    const ts = event.timestamp;
    if (ts.includes('h ago') || ts.includes('m ago') || ts.includes('s ago')) {
      label = 'Today';
    } else if (ts === '1d ago') {
      label = 'Yesterday';
    } else {
      label = ts;
    }
    const list = groups.get(label) || [];
    list.push(event);
    groups.set(label, list);
  }
  return groups;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '3rem 0',
        }}
      >
        <span style={{ color: 'var(--d-text-muted)', opacity: 0.5 }}>
          <ActivityIcon size={48} />
        </span>
        <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
          No recent activity yet.
        </p>
      </div>
    );
  }

  const groups = groupByDate(events);

  return (
    <div className="flex flex-col gap-4">
      {[...groups.entries()].map(([label, items]) => (
        <div key={label}>
          <div
            className="d-label"
            style={{
              marginBottom: '0.75rem',
              paddingLeft: '0.75rem',
              borderLeft: '2px solid var(--d-accent)',
            }}
          >
            {label}
          </div>
          <div className="flex flex-col">
            {items.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3"
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--d-radius-sm)',
                  transition: 'background 0.1s ease',
                  cursor: 'default',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: EVENT_COLORS[event.type],
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 600 }}>{event.user}</span>{' '}
                  <span style={{ color: 'var(--d-text-muted)' }}>
                    {event.action}
                  </span>
                  {event.target && <> <span>{event.target}</span></>}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--d-text-muted)',
                    fontFamily: 'var(--d-font-mono, monospace)',
                    flexShrink: 0,
                  }}
                >
                  {event.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
