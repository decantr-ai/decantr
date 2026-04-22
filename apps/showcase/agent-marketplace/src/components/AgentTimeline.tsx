import { useMemo, useState } from 'react';
import { AlertTriangle, Brain, ChevronDown, ChevronRight, Cpu, GitBranch, Info, Wrench } from 'lucide-react';
import type { TimelineEvent, TimelineType } from '../data/mock';
import { css } from '@decantr/css';

const EVENT_ICONS = {
  action: Cpu,
  decision: GitBranch,
  error: AlertTriangle,
  tool_call: Wrench,
  reasoning: Brain,
  info: Info,
} satisfies Record<TimelineType, typeof Cpu>;

function annotationStatus(type: TimelineType) {
  if (type === 'decision') return 'success';
  if (type === 'error') return 'error';
  if (type === 'reasoning') return 'warning';
  return 'info';
}

export function AgentTimeline({
  events,
  title,
  agentName,
  modelId,
}: {
  events: TimelineEvent[];
  title?: string;
  agentName?: string;
  modelId?: string;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Set<TimelineType>>(new Set());

  const eventTypes = useMemo(
    () => [...new Set(events.map((event) => event.type))],
    [events],
  );

  const filteredEvents = activeFilters.size === 0
    ? events
    : events.filter((event) => activeFilters.has(event.type));

  function toggleEvent(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleFilter(type: TimelineType) {
    setActiveFilters((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  return (
    <section className="timeline">
      {(title || agentName) ? (
        <div className="d-surface carbon-card timeline__header">
          <div className="timeline__header-copy">
            {title ? <h3 className={css('_fontsemi _textlg')}>{title}</h3> : null}
            {agentName ? (
              <span className={css('_textsm')}>
                <span className="mono-kicker">{agentName}</span>
                {modelId ? ` · ${modelId}` : ''}
              </span>
            ) : null}
          </div>
          <div className="timeline__counts">
            {eventTypes.map((type) => (
              <span key={type} className="status-pill" data-status={type === 'error' ? 'error' : type === 'decision' ? 'active' : type === 'reasoning' ? 'processing' : 'idle'}>
                <span className="status-pill__dot" />
                {events.filter((event) => event.type === type).length} {type.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="timeline__filters">
        {eventTypes.map((type) => (
          <button
            key={type}
            type="button"
            className="timeline__filter"
            data-active={activeFilters.has(type)}
            data-type={type}
            onClick={() => toggleFilter(type)}
          >
            <span className="timeline__dot" data-status={type === 'error' ? 'error' : type === 'decision' ? 'active' : type === 'reasoning' ? 'processing' : 'idle'} />
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="timeline__track">
        {filteredEvents.length === 0 ? (
          <div className="timeline__empty">No events match the current filter set.</div>
        ) : (
          <div className="timeline__events">
            {filteredEvents.map((event) => {
              const Icon = EVENT_ICONS[event.type];
              const isExpanded = expandedIds.has(event.id);

              return (
                <article key={event.id} className="timeline__event" data-type={event.type}>
                  <span className="timeline__event-orb" />
                  <button
                    type="button"
                    className="d-surface carbon-card timeline__card"
                    onClick={() => event.detail ? toggleEvent(event.id) : undefined}
                  >
                    <div className="timeline__card-head">
                      <div className="timeline__card-main">
                        <span className="timeline__type-icon">
                          <Icon size={14} />
                        </span>
                        <div className="timeline__card-copy">
                          <div className={css('_flex _aic _gap2 _wrap')}>
                            <span className="d-annotation" data-status={annotationStatus(event.type)}>
                              {event.type.replace('_', ' ')}
                            </span>
                            <span className="timeline__summary">{event.summary}</span>
                          </div>
                        </div>
                      </div>
                      <div className={css('_flex _aic _gap2')}>
                        <span className="timeline__timestamp">{event.timestamp}</span>
                        {event.detail ? (
                          isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                        ) : null}
                      </div>
                    </div>
                    {isExpanded && event.detail ? (
                      <div className="timeline__detail carbon-code">{event.detail}</div>
                    ) : null}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
