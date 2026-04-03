import { css } from '@decantr/css';
import type { ActivityEvent } from '@/data/mock';

const EVENT_COLORS: Record<ActivityEvent['type'], string> = {
  publish: 'var(--d-success)',
  update: 'var(--d-info)',
  review: 'var(--d-warning)',
  download: 'var(--d-accent)',
  comment: 'var(--d-primary)',
};

function groupByDate(events: ActivityEvent[]): Map<string, ActivityEvent[]> {
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

interface Props {
  events: ActivityEvent[];
}

export function ActivityFeed({ events }: Props) {
  const groups = groupByDate(events);

  return (
    <div className={css('_flex _col _gap4')}>
      {[...groups.entries()].map(([label, items]) => (
        <div key={label}>
          <div className="d-label" style={{ marginBottom: '0.75rem' }}>
            {label}
          </div>
          <div className={css('_flex _col')}>
            {items.map((event) => (
              <div
                key={event.id}
                className={css('_flex _aic _gap3')}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--d-radius-sm)',
                  transition: 'background 0.1s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--d-surface)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {/* Color dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: EVENT_COLORS[event.type],
                    flexShrink: 0,
                  }}
                />

                {/* Content */}
                <div style={{ flex: 1, fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 600 }}>{event.user}</span>{' '}
                  <span style={{ color: 'var(--d-text-muted)' }}>{event.action}</span>{' '}
                  <span>{event.target}</span>
                </div>

                {/* Timestamp */}
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
