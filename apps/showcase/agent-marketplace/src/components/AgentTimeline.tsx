import { useState } from 'react';
import { css } from '@decantr/css';
import { ChevronDown, ChevronRight, Zap, Brain, AlertTriangle, Wrench, MessageSquare, Info } from 'lucide-react';

export type EventType = 'action' | 'decision' | 'error' | 'tool_call' | 'reasoning' | 'info';

export interface TimelineEvent {
  id: string;
  type: EventType;
  summary: string;
  timestamp: string;
  detail?: string;
}

export interface TimelineSummary {
  agentName: string;
  modelId: string;
  status: 'active' | 'idle' | 'error' | 'completed';
  eventCount: number;
  elapsed: string;
  tokens: string;
}

const EVENT_COLORS: Record<EventType, string> = {
  action: 'var(--d-accent)',
  decision: 'var(--d-success)',
  error: 'var(--d-error)',
  tool_call: 'var(--d-secondary)',
  reasoning: 'var(--d-warning)',
  info: 'var(--d-info)',
};

const EVENT_ICONS: Record<EventType, React.ComponentType<{ size?: number }>> = {
  action: Zap,
  decision: Brain,
  error: AlertTriangle,
  tool_call: Wrench,
  reasoning: MessageSquare,
  info: Info,
};

const EVENT_LABELS: Record<EventType, string> = {
  action: 'Action',
  decision: 'Decision',
  error: 'Error',
  tool_call: 'Tool Call',
  reasoning: 'Reasoning',
  info: 'Info',
};

const ALL_TYPES: EventType[] = ['action', 'decision', 'error', 'tool_call', 'reasoning', 'info'];

export function AgentTimeline({
  events,
  summary,
}: {
  events: TimelineEvent[];
  summary?: TimelineSummary;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Set<EventType>>(new Set(ALL_TYPES));

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleFilter(type: EventType) {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  const filtered = events.filter(e => activeFilters.has(e.type));

  const statusMap: Record<string, string> = {
    active: 'success',
    completed: 'info',
    error: 'error',
    idle: 'warning',
  };

  return (
    <div className={css('_flex _col _gap4')} role="feed" aria-label="Agent timeline">
      {/* Summary header */}
      {summary && (
        <div className="d-surface carbon-card" style={{ padding: '0.75rem 1rem' }}>
          <div className={css('_flex _aic _wrap _gap4')} style={{ fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: 'var(--d-text)' }}>{summary.agentName}</span>
            <span className="mono-data" style={{ color: 'var(--d-text-muted)', fontSize: 11 }}>
              {summary.modelId}
            </span>
            <span className="d-annotation" data-status={statusMap[summary.status]}>
              {summary.status}
            </span>
            <span className="mono-data" style={{ color: 'var(--d-text-muted)', fontSize: 12 }}>
              {summary.eventCount} events
            </span>
            <span className="mono-data" style={{ color: 'var(--d-text-muted)', fontSize: 12 }}>
              {summary.elapsed}
            </span>
            <span className="mono-data" style={{ color: 'var(--d-text-muted)', fontSize: 12 }}>
              {summary.tokens} tokens
            </span>
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className={css('_flex _wrap _gap2')}>
        {ALL_TYPES.map(type => (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            className="d-annotation"
            style={{
              cursor: 'pointer',
              border: 'none',
              opacity: activeFilters.has(type) ? 1 : 0.4,
              background: activeFilters.has(type)
                ? `color-mix(in srgb, ${EVENT_COLORS[type]} 15%, transparent)`
                : 'var(--d-surface)',
              color: activeFilters.has(type) ? EVENT_COLORS[type] : 'var(--d-text-muted)',
              transition: 'opacity 150ms ease',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: EVENT_COLORS[type],
                display: 'inline-block',
              }}
            />
            {EVENT_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: 32 }}>
        {/* Vertical line */}
        <div
          style={{
            position: 'absolute',
            left: 16,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'var(--d-border)',
            transform: 'translateX(-50%)',
          }}
        />

        <div className={css('_flex _col _gap3')}>
          {filtered.map(event => {
            const Icon = EVENT_ICONS[event.type];
            const expanded = expandedIds.has(event.id);
            const color = EVENT_COLORS[event.type];

            return (
              <div key={event.id} style={{ position: 'relative' }}>
                {/* Orb */}
                <div
                  style={{
                    position: 'absolute',
                    left: -32 + 16 - 6,
                    top: 12,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: color,
                    border: '2px solid var(--d-bg)',
                    zIndex: 1,
                  }}
                />

                {/* Event card */}
                <div
                  className="carbon-card"
                  style={{
                    padding: '0.625rem 0.75rem',
                    borderLeft: `3px solid ${color}`,
                    cursor: event.detail ? 'pointer' : 'default',
                    transition: 'transform 150ms ease',
                  }}
                  onClick={() => event.detail && toggleExpand(event.id)}
                  onMouseEnter={e => { if (event.detail) e.currentTarget.style.transform = 'translateX(2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div className={css('_flex _aic _jcsb')}>
                    <div className={css('_flex _aic _gap2')}>
                      <span className="d-annotation" style={{ color, background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                        <Icon size={10} />
                        {EVENT_LABELS[event.type]}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--d-text)' }}>{event.summary}</span>
                    </div>
                    <div className={css('_flex _aic _gap2')}>
                      <span className="mono-data" style={{ fontSize: 11, color: 'var(--d-text-muted)' }}>
                        {event.timestamp}
                      </span>
                      {event.detail && (
                        expanded ? <ChevronDown size={14} style={{ color: 'var(--d-text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--d-text-muted)' }} />
                      )}
                    </div>
                  </div>

                  {expanded && event.detail && (
                    <div
                      className="carbon-code"
                      style={{
                        marginTop: '0.5rem',
                        fontSize: 12,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                      }}
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
