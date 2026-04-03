interface ActivityItem {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type?: string;
}

const EVENT_DOT_COLORS: Record<string, string> = {
  publish: 'bg-d-green',
  create: 'bg-d-cyan',
  update: 'bg-d-amber',
  delete: 'bg-d-coral',
  login: 'bg-d-purple',
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function groupByDate(items: ActivityItem[]): Map<string, ActivityItem[]> {
  const groups = new Map<string, ActivityItem[]>();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const item of items) {
    const d = new Date(item.timestamp).toDateString();
    let label: string;
    if (d === today) label = 'Today';
    else if (d === yesterday) label = 'Yesterday';
    else
      label = new Date(item.timestamp).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    const existing = groups.get(label);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(label, [item]);
    }
  }

  return groups;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-d-muted mb-3"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <p className="text-sm text-d-muted">
          No activity yet. Publish your first item to see it here.
        </p>
      </div>
    );
  }

  const grouped = groupByDate(items);

  return (
    <div className="flex flex-col gap-4">
      {Array.from(grouped.entries()).map(([dateLabel, group]) => (
        <div key={dateLabel}>
          <h4 className="d-label border-l-2 border-d-accent pl-2 mb-3">
            {dateLabel}
          </h4>
          <div className="flex flex-col gap-1">
            {group.map((item) => {
              const dotColor =
                EVENT_DOT_COLORS[item.type ?? ''] ?? 'bg-d-muted';
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-1.5 px-2 rounded-md transition-colors duration-150 hover:bg-d-surface-raised"
                >
                  <span
                    className={`shrink-0 w-2 h-2 rounded-full ${dotColor}`}
                  />
                  <span className="font-mono text-xs text-d-muted shrink-0 w-14">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                  <span className="text-sm text-d-text truncate">
                    <span className="font-medium">{item.user}</span>{' '}
                    {item.action}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
