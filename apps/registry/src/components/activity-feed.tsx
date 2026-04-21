interface ActivityEvent {
  id: string;
  user: string;
  action: string;
  target?: string;
  timestamp: string;
  type: 'publish' | 'update' | 'review' | 'download' | 'comment';
}

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
      <div className="registry-empty-state" data-density="compact">
        <span className="registry-empty-state-icon">
          <ActivityIcon size={48} />
        </span>
        <p className="registry-empty-state-copy">No recent activity yet.</p>
      </div>
    );
  }

  const groups = groupByDate(events);

  return (
    <div className="registry-activity-feed">
      {[...groups.entries()].map(([label, items]) => (
        <div key={label} className="registry-activity-group">
          <div className="d-label registry-anchor-label">{label}</div>
          <div className="registry-activity-list">
            {items.map((event) => (
              <div key={event.id} className="registry-activity-item">
                <div className="registry-activity-dot" data-type={event.type} />
                <div className="registry-activity-body">
                  <span className="registry-activity-user">{event.user}</span>{' '}
                  <span className="registry-activity-action">{event.action}</span>
                  {event.target && <> <span>{event.target}</span></>}
                </div>
                <span className="registry-activity-timestamp">{event.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
