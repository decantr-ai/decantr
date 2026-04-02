import { css } from '@decantr/css';

type EventType = 'action' | 'decision' | 'tool_call' | 'reasoning' | 'error';

const EVENT_COLORS: Record<EventType, string> = {
  action: 'var(--d-accent)',
  decision: 'var(--d-success)',
  tool_call: 'var(--d-info)',
  reasoning: 'var(--d-warning)',
  error: 'var(--d-error)',
};

const EVENT_LABELS: Record<EventType, string> = {
  action: 'ACTION',
  decision: 'DECISION',
  tool_call: 'TOOL CALL',
  reasoning: 'REASONING',
  error: 'ERROR',
};

interface TimelineEventProps {
  type: EventType;
  title: string;
  description: string;
  timestamp: string;
  duration?: string;
}

export function TimelineEvent({ type, title, description, timestamp, duration }: TimelineEventProps) {
  const color = EVENT_COLORS[type];
  return (
    <div className={css('_flex _gap3') + ' neon-entrance'} style={{ paddingBottom: 'var(--d-gap-4)' }}>
      {/* Dot + line */}
      <div className={css('_flex _col _aic')} style={{ width: 20, flexShrink: 0 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 'var(--d-radius-full)',
            background: color,
            boxShadow: `0 0 8px ${color}`,
            flexShrink: 0,
          }}
        />
        <div style={{ width: 1, flex: 1, background: 'var(--d-border)', marginTop: 4 }} />
      </div>

      {/* Content */}
      <div className={css('_flex _col _gap1')} style={{ flex: 1, paddingBottom: 'var(--d-gap-2)' }}>
        <div className={css('_flex _aic _gap2 _wrap')}>
          <span
            className="d-annotation mono-data"
            style={{ color, background: `color-mix(in srgb, ${color} 15%, transparent)` }}
            data-status={type === 'error' ? 'error' : type === 'reasoning' ? 'warning' : type === 'decision' ? 'success' : 'info'}
          >
            {EVENT_LABELS[type]}
          </span>
          <span className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
            {timestamp}
          </span>
          {duration && (
            <span className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
              {duration}
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{title}</span>
        <p className="mono-data" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>
    </div>
  );
}
