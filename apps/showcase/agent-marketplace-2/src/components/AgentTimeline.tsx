import { useState } from 'react';
import { css } from '@decantr/css';
import { Zap, Brain, AlertTriangle, Wrench, Info, XCircle, ChevronDown, ChevronRight } from 'lucide-react';

type EventType = 'action' | 'decision' | 'error' | 'warning' | 'tool_call' | 'reasoning';

interface TimelineEvent {
  id: string;
  type: EventType;
  summary: string;
  detail?: string;
  timestamp: string;
}

const eventConfig: Record<EventType, { color: string; icon: typeof Zap; label: string }> = {
  action:     { color: 'var(--d-accent)',  icon: Zap,            label: 'Action' },
  decision:   { color: 'var(--d-success)', icon: Brain,          label: 'Decision' },
  error:      { color: 'var(--d-error)',   icon: XCircle,        label: 'Error' },
  warning:    { color: 'var(--d-warning)', icon: AlertTriangle,  label: 'Warning' },
  tool_call:  { color: '#A78BFA',          icon: Wrench,         label: 'Tool Call' },
  reasoning:  { color: '#F59E0B',          icon: Brain,          label: 'Reasoning' },
};

const sampleEvents: TimelineEvent[] = [
  { id: '1', type: 'action', summary: 'Agent initialized with task parameters', timestamp: '12:00:01', detail: 'Loaded configuration from /agents/config.yaml. Target: data-ingestion pipeline.' },
  { id: '2', type: 'tool_call', summary: 'Invoked data_fetch(source="api/v2")', timestamp: '12:00:03', detail: 'HTTP GET https://api.example.com/v2/stream — 200 OK — 1.2MB payload' },
  { id: '3', type: 'decision', summary: 'Classified input as structured JSON', timestamp: '12:00:04', detail: 'Confidence: 97.3%. Schema match: events/v2. Proceeding with JSON parser.' },
  { id: '4', type: 'reasoning', summary: 'Evaluating output format options', timestamp: '12:00:05', detail: 'Considered: CSV (rejected — nested data), Parquet (accepted — columnar, efficient).' },
  { id: '5', type: 'warning', summary: 'Rate limit approaching (85%)', timestamp: '12:00:08', detail: 'Current rate: 850/1000 req/min. Throttling subsequent requests to 1/sec.' },
  { id: '6', type: 'action', summary: 'Wrote 1,247 records to storage', timestamp: '12:00:12' },
  { id: '7', type: 'error', summary: 'Connection timeout on retry attempt 3', timestamp: '12:00:15', detail: 'upstream connect error or disconnect/reset before headers. retried 3/3.' },
];

const filterTypes: EventType[] = ['action', 'decision', 'error', 'warning', 'tool_call', 'reasoning'];

export function AgentTimeline({ title = 'Activity Feed' }: { title?: string }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Set<EventType>>(new Set(filterTypes));

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleFilter = (type: EventType) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  };

  const filtered = sampleEvents.filter(e => activeFilters.has(e.type));

  return (
    <div className={css('_flex _col _gap4')}>
      {/* Header */}
      <div className={css('_flex _aic _jcsb')}>
        <h3
          className={css('_textsm _fontsemi') + ' d-label'}
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}
        >
          {title}
        </h3>
        <span className={css('_textsm') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
          {filtered.length} events
        </span>
      </div>

      {/* Filter chips */}
      <div className={css('_flex _wrap _gap2')} role="group" aria-label="Event type filters">
        {filterTypes.map(type => {
          const cfg = eventConfig[type];
          const active = activeFilters.has(type);
          return (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={'d-annotation'}
              data-status={active ? undefined : undefined}
              style={{
                cursor: 'pointer',
                border: 'none',
                background: active
                  ? `color-mix(in srgb, ${cfg.color} 20%, transparent)`
                  : 'var(--d-surface)',
                color: active ? cfg.color : 'var(--d-text-muted)',
                opacity: active ? 1 : 0.5,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className={css('_rel')} role="feed" aria-label="Agent timeline">
        {/* Vertical line */}
        <div
          style={{
            position: 'absolute',
            left: '16px',
            top: 0,
            bottom: 0,
            width: '2px',
            background: 'var(--d-border)',
          }}
        />

        <div className={css('_flex _col _gap3')}>
          {filtered.map(event => {
            const cfg = eventConfig[event.type];
            const Icon = cfg.icon;
            const isExpanded = expanded.has(event.id);

            return (
              <div
                key={event.id}
                className={css('_flex _gap3 _rel')}
                style={{ paddingLeft: '40px' }}
              >
                {/* Orb */}
                <div
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: cfg.color,
                    zIndex: 1,
                  }}
                />

                {/* Event content */}
                <div className={css('_flex _col _gap1 _flex1')}>
                  <div className={css('_flex _aic _gap2 _wrap')}>
                    <span
                      className={'d-annotation'}
                      style={{
                        background: `color-mix(in srgb, ${cfg.color} 15%, transparent)`,
                        color: cfg.color,
                        fontSize: '0.7rem',
                      }}
                    >
                      <Icon size={12} />
                      {cfg.label}
                    </span>
                    <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                      {event.timestamp}
                    </span>
                  </div>

                  <button
                    onClick={() => event.detail && toggleExpand(event.id)}
                    className={css('_textsm _textl')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--d-text)',
                      cursor: event.detail ? 'pointer' : 'default',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    {event.detail && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                    {event.summary}
                  </button>

                  {isExpanded && event.detail && (
                    <div
                      className={css('_textsm _p3 _rounded') + ' carbon-code carbon-fade-slide'}
                    >
                      {event.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
