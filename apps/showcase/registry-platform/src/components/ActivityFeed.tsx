import { type ActivityEvent } from '../data/mock';

interface ActivityFeedProps {
  events: ActivityEvent[];
}

function groupByDate(events: ActivityEvent[]): Map<string, ActivityEvent[]> {
  const groups = new Map<string, ActivityEvent[]>();
  for (const event of events) {
    const existing = groups.get(event.date);
    if (existing) {
      existing.push(event);
    } else {
      groups.set(event.date, [event]);
    }
  }
  return groups;
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  const grouped = groupByDate(events);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      {Array.from(grouped.entries()).map(([date, dateEvents]) => (
        <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Date header */}
          <div
            className="d-label"
            data-anchor=""
            style={{ marginBottom: 'var(--d-gap-3)' }}
          >
            {date}
          </div>

          {/* Events */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {dateEvents.map((event, index) => (
              <div
                key={event.id}
                className="d-data-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--d-gap-3)',
                  padding: '0.625rem var(--d-gap-4)',
                  borderRadius: 'var(--d-radius-sm)',
                  cursor: 'default',
                }}
              >
                {/* Color dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: event.dotColor,
                    flexShrink: 0,
                    boxShadow: `0 0 6px ${event.dotColor}44`,
                  }}
                />

                {/* Avatar initials */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--d-surface-raised)',
                    border: '1px solid var(--d-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--d-text-muted)',
                    flexShrink: 0,
                    letterSpacing: '0.02em',
                  }}
                >
                  {event.initials}
                </div>

                {/* Event content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      color: 'var(--d-text)',
                    }}
                  >
                    {event.user}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--d-text-muted)',
                      marginLeft: '0.375rem',
                    }}
                  >
                    {event.action}
                  </span>
                </div>

                {/* Timestamp */}
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'ui-monospace, monospace',
                    color: 'var(--d-text-muted)',
                    opacity: 0.6,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
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
