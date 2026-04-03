import type { ActivityEvent } from '@/data/mock';

interface ActivityFeedProps {
  events: ActivityEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  // Group by time-based categories
  const groups: { label: string; events: ActivityEvent[] }[] = [];
  const today: ActivityEvent[] = [];
  const older: ActivityEvent[] = [];

  for (const ev of events) {
    if (ev.timestamp.includes('ago') && !ev.timestamp.includes('d ago')) {
      today.push(ev);
    } else {
      older.push(ev);
    }
  }

  if (today.length) groups.push({ label: 'Today', events: today });
  if (older.length) groups.push({ label: 'Earlier', events: older });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {groups.map(group => (
        <div key={group.label}>
          <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            {group.label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {group.events.map(ev => (
              <div
                key={ev.id}
                className="d-data-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: 'var(--d-data-py) 0.5rem',
                  borderRadius: 'var(--d-radius-sm)',
                }}
              >
                <span className="lp-event-dot" data-type={ev.type} />
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
                  {ev.userAvatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{ev.user}</span>{' '}
                  <span style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>{ev.action}</span>{' '}
                  <span style={{ fontSize: '0.875rem' }}>{ev.target}</span>
                </div>
                <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', flexShrink: 0 }}>
                  {ev.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
