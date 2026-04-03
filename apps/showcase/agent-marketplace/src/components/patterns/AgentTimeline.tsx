import { useState, useMemo } from 'react';
import { css } from '@decantr/css';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { TimelineEvent, EventType, AgentStatus } from '../../data/types';

interface AgentTimelineProps {
  events: TimelineEvent[];
  agentName?: string;
  modelId?: string;
  status?: AgentStatus;
  compact?: boolean;
}

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  action: 'var(--d-accent)',
  decision: 'var(--d-success)',
  error: 'var(--d-error)',
  warning: 'var(--d-warning)',
  tool_call: 'var(--d-secondary)',
  reasoning: '#F59E0B',
};

const EVENT_TYPE_LABELS: EventType[] = [
  'action',
  'decision',
  'error',
  'tool_call',
  'reasoning',
  'warning',
];

const STATUS_TO_BADGE: Record<AgentStatus, 'success' | 'error' | 'warning' | 'info'> = {
  active: 'success',
  idle: 'info',
  error: 'error',
  processing: 'warning',
};

function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatElapsed(events: TimelineEvent[]): string {
  if (events.length === 0) return '—';
  const timestamps = events.map((e) => e.timestamp);
  const earliest = Math.min(...timestamps);
  const latest = Math.max(...timestamps);
  const diff = latest - earliest;
  if (diff < 1000) return `${diff}ms`;
  if (diff < 60000) return `${(diff / 1000).toFixed(1)}s`;
  return `${(diff / 60000).toFixed(1)}m`;
}

function estimateTokens(events: TimelineEvent[]): string {
  const total = events.reduce((sum, e) => {
    const words = (e.summary.length + (e.detail?.length || 0)) / 4;
    return sum + Math.round(words);
  }, 0);
  if (total < 1000) return `~${total}`;
  return `~${(total / 1000).toFixed(1)}k`;
}

export function AgentTimeline({
  events,
  agentName,
  modelId,
  status,
  compact,
}: AgentTimelineProps) {
  const [activeFilters, setActiveFilters] = useState<Set<EventType>>(
    () => new Set(EVENT_TYPE_LABELS),
  );
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(() => new Set());

  const filteredEvents = useMemo(
    () => events.filter((e) => activeFilters.has(e.type)),
    [events, activeFilters],
  );

  const eventCounts = useMemo(() => {
    const counts: Partial<Record<EventType, number>> = {};
    for (const e of events) {
      counts[e.type] = (counts[e.type] || 0) + 1;
    }
    return counts;
  }, [events]);

  const latestEventId = useMemo(() => {
    if (filteredEvents.length === 0) return null;
    let latest = filteredEvents[0];
    for (const e of filteredEvents) {
      if (e.timestamp > latest.timestamp) latest = e;
    }
    return latest.id;
  }, [filteredEvents]);

  function toggleFilter(type: EventType) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  function toggleExpand(eventId: string) {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  }

  return (
    <div
      className={css('_flex _col _gap4') + ' d-section'}
      data-density="compact"
      role="feed"
      aria-label={agentName ? `${agentName} timeline` : 'Agent timeline'}
    >
      {/* TimelineSummary */}
      <div
        className={css('_sticky _top0 _z10 _p4 _flex _col _gap3') + ' d-surface carbon-card'}
      >
        <div className={css('_flex _aic _jcsb _gap3 _wrap')}>
          <div className={css('_flex _col _gap1')}>
            <h4 className={css('_heading4')}>{agentName || 'All Agents'}</h4>
            {modelId && (
              <span className={css('_textsm') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                {modelId}
              </span>
            )}
          </div>
          {status && (
            <Badge status={STATUS_TO_BADGE[status]}>{status}</Badge>
          )}
        </div>

        <div className={css('_flex _aic _gap3 _wrap')}>
          {EVENT_TYPE_LABELS.map((type) =>
            eventCounts[type] ? (
              <span
                key={type}
                className={css('_inlineflex _aic _gap1 _textxs _px2 _py1 _rounded') + ' d-annotation'}
                style={{ borderLeft: `3px solid ${EVENT_TYPE_COLORS[type]}` }}
              >
                {type}: {eventCounts[type]}
              </span>
            ) : null,
          )}
        </div>

        <div className={css('_flex _aic _gap4')}>
          <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
            Elapsed: {formatElapsed(events)}
          </span>
          <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
            Tokens: {estimateTokens(events)}
          </span>
        </div>
      </div>

      {/* FilterBar */}
      <div
        className={css('_flex _aic _gap2 _overxauto _px1')}
        role="toolbar"
        aria-label="Filter events by type"
      >
        <Filter size={14} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
        {EVENT_TYPE_LABELS.map((type) => {
          const isActive = activeFilters.has(type);
          return (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={
                css('_inlineflex _aic _gap1 _textxs _px3 _py1 _rounded _pointer _bordernone _shrink0') +
                ' d-annotation'
              }
              style={{
                borderLeft: `3px solid ${EVENT_TYPE_COLORS[type]}`,
                opacity: isActive ? 1 : 0.4,
                background: isActive
                  ? `color-mix(in srgb, ${EVENT_TYPE_COLORS[type]} 10%, transparent)`
                  : undefined,
              }}
              aria-pressed={isActive}
              aria-label={`Filter ${type} events`}
            >
              {type.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* EventList */}
      <div className={css('_flex _col') + ` timeline-track`} style={{ gap: compact ? '0.75rem' : '1rem' }}>
        {filteredEvents.length === 0 && (
          <div className={css('_flex _col _aic _jcc _py12 _gap3')}>
            <Filter size={48} style={{ color: 'var(--d-text-muted)', opacity: 0.4 }} />
            <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
              No events match the current filters
            </span>
          </div>
        )}

        {filteredEvents.map((event) => {
          const isLatest = event.id === latestEventId;
          const isExpanded = expandedEvents.has(event.id);
          const color = EVENT_TYPE_COLORS[event.type];

          return (
            <div
              key={event.id}
              className={css('_rel') + ' timeline-event'}
              role="article"
              aria-label={`${event.type}: ${event.summary}`}
            >
              {/* Orb */}
              <div
                className="timeline-orb"
                data-active={isLatest ? '' : undefined}
                style={{ backgroundColor: color, top: '0.65rem' }}
              />

              {/* Card */}
              <div
                className={css('_flex _col _rounded _overhidden') + ' d-surface'}
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <button
                  onClick={() => toggleExpand(event.id)}
                  className={
                    css('_flex _aic _jcsb _gap3 _p3 _pointer _bordernone _wfull') +
                    ' d-surface'
                  }
                  style={{ borderLeft: 'none', textAlign: 'left', background: 'transparent' }}
                  aria-expanded={isExpanded}
                  aria-controls={`event-detail-${event.id}`}
                >
                  <div className={css('_flex _aic _gap2 _flex1 _minw0')}>
                    <span
                      className={css('_textxs _px2 _py1 _rounded _shrink0') + ' d-annotation'}
                      style={{
                        borderLeft: `2px solid ${color}`,
                        color,
                      }}
                    >
                      {event.type.replace('_', ' ')}
                    </span>
                    <span className={css('_textsm _truncate')}>{event.summary}</span>
                  </div>
                  <div className={css('_flex _aic _gap2 _shrink0')}>
                    <span
                      className={css('_textxs') + ' mono-data'}
                      style={{ color: 'var(--d-text-muted)' }}
                    >
                      {formatTimestamp(event.timestamp)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={14} style={{ color: 'var(--d-text-muted)' }} />
                    ) : (
                      <ChevronDown size={14} style={{ color: 'var(--d-text-muted)' }} />
                    )}
                  </div>
                </button>

                {/* Expandable detail */}
                <div
                  id={`event-detail-${event.id}`}
                  style={{
                    maxHeight: isExpanded ? '500px' : '0',
                    opacity: isExpanded ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease-out, opacity 0.3s ease-out',
                  }}
                >
                  <div className={css('_px3 _pb3 _pt1 _flex _col _gap2') + ' d-data'}>
                    <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
                      {event.detail}
                    </p>
                    {event.duration != null && (
                      <span
                        className={css('_textxs') + ' mono-data'}
                        style={{ color: 'var(--d-text-muted)' }}
                      >
                        Duration: {formatDuration(event.duration)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
