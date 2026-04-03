import { css } from '@decantr/css';
import { ChevronDown, ChevronRight, Cpu, GitBranch, AlertTriangle, Wrench, Brain, Info } from 'lucide-react';
import { useState } from 'react';

export interface TimelineEvent {
  id: string;
  type: 'action' | 'decision' | 'error' | 'tool_call' | 'reasoning' | 'info';
  summary: string;
  timestamp: string;
  detail?: string;
}

const EVENT_COLORS: Record<string, string> = {
  action: 'var(--d-accent)',
  decision: 'var(--d-success)',
  error: 'var(--d-error)',
  tool_call: 'var(--d-secondary)',
  reasoning: 'var(--d-warning)',
  info: 'var(--d-info)',
};

const EVENT_ICONS: Record<string, typeof Cpu> = {
  action: Cpu,
  decision: GitBranch,
  error: AlertTriangle,
  tool_call: Wrench,
  reasoning: Brain,
  info: Info,
};

interface Props {
  events: TimelineEvent[];
  title?: string;
  agentName?: string;
  modelId?: string;
}

export function AgentTimeline({ events, title, agentName, modelId }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  const eventTypes = [...new Set(events.map(e => e.type))];
  const filtered = activeFilters.size === 0
    ? events
    : events.filter(e => activeFilters.has(e.type));

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleFilter(type: string) {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  return (
    <div className={css('_flex _col _gap4')}>
      {/* Summary header */}
      {(title || agentName) && (
        <div className="d-surface carbon-card" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
          <div className={css('_flex _aic _jcsb _wrap _gap3')}>
            <div className={css('_flex _col _gap1')}>
              {title && <h3 className={css('_fontsemi _textlg')}>{title}</h3>}
              {agentName && <span className={css('_textsm') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>{agentName}{modelId ? ` / ${modelId}` : ''}</span>}
            </div>
            <div className={css('_flex _aic _gap4')}>
              {eventTypes.map(type => (
                <span key={type} className={css('_flex _aic _gap1')}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: EVENT_COLORS[type] }} />
                  <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                    {events.filter(e => e.type === type).length}
                  </span>
                </span>
              ))}
              <span className={css('_textsm') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                {events.length} events
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className={css('_flex _aic _gap2 _wrap')}>
        {eventTypes.map(type => (
          <button
            key={type}
            className="d-annotation"
            onClick={() => toggleFilter(type)}
            style={{
              cursor: 'pointer',
              border: 'none',
              background: activeFilters.has(type)
                ? `color-mix(in srgb, ${EVENT_COLORS[type]} 25%, transparent)`
                : undefined,
              color: activeFilters.has(type) ? EVENT_COLORS[type] : undefined,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: EVENT_COLORS[type] }} />
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Event list with vertical line */}
      <div style={{ position: 'relative', paddingLeft: 32 }}>
        {/* Continuous vertical line */}
        <div
          style={{
            position: 'absolute',
            left: 16,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'var(--d-border)',
          }}
        />

        <div className={css('_flex _col _gap3')}>
          {filtered.map(event => {
            const Icon = EVENT_ICONS[event.type] || Info;
            const color = EVENT_COLORS[event.type];
            const isExpanded = expandedIds.has(event.id);

            return (
              <div key={event.id} className={css('_flex _col')} style={{ position: 'relative' }}>
                {/* Orb on the line */}
                <div
                  style={{
                    position: 'absolute',
                    left: -22,
                    top: 10,
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
                    borderLeft: `3px solid ${color}`,
                    padding: '0.625rem 0.75rem',
                    cursor: event.detail ? 'pointer' : 'default',
                    transition: 'transform 150ms ease-out, border-color 150ms ease-out',
                  }}
                  onClick={() => event.detail && toggleExpand(event.id)}
                >
                  <div className={css('_flex _aic _jcsb _gap2')}>
                    <div className={css('_flex _aic _gap2')}>
                      <Icon size={14} style={{ color, flexShrink: 0 }} />
                      <span className="d-annotation" data-status={event.type === 'error' ? 'error' : event.type === 'decision' ? 'success' : event.type === 'reasoning' ? 'warning' : 'info'}>
                        {event.type.replace('_', ' ')}
                      </span>
                      <span className={css('_textsm')}>{event.summary}</span>
                    </div>
                    <div className={css('_flex _aic _gap2')}>
                      <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                        {event.timestamp}
                      </span>
                      {event.detail && (
                        isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                      )}
                    </div>
                  </div>

                  {isExpanded && event.detail && (
                    <div className="carbon-code" style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
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
