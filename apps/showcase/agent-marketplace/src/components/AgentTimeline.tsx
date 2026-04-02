import { useState } from 'react';
import { css } from '@decantr/css';
import {
  Play,
  GitBranch,
  Wrench,
  AlertTriangle,
  Brain,
  Info,
  ChevronDown,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import type { TimelineEvent } from '../data';
import { SectionLabel } from './SectionLabel';
import { EmptyState } from './EmptyState';

/**
 * Agent timeline per layout_hints:
 * - CONNECTED vertical line (no gaps)
 * - Orbs centered on first text line
 * - Each event type a DISTINCT color
 * - Collapsible detail expansion
 */

const typeConfig: Record<
  TimelineEvent['type'],
  { color: string; icon: typeof Play; label: string }
> = {
  action: { color: 'var(--d-success)', icon: Play, label: 'Action' },
  decision: { color: 'var(--d-accent)', icon: GitBranch, label: 'Decision' },
  tool_call: { color: 'var(--d-info)', icon: Wrench, label: 'Tool Call' },
  error: { color: 'var(--d-error)', icon: AlertTriangle, label: 'Error' },
  reasoning: { color: 'var(--d-warning)', icon: Brain, label: 'Reasoning' },
  info: { color: 'var(--d-text-muted)', icon: Info, label: 'Info' },
};

const filterTypes: TimelineEvent['type'][] = ['action', 'decision', 'tool_call', 'error', 'reasoning', 'info'];

interface AgentTimelineProps {
  events: TimelineEvent[];
  label?: string;
}

export function AgentTimeline({ events, label = 'Activity Feed' }: AgentTimelineProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Set<TimelineEvent['type']>>(new Set(filterTypes));

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleFilter = (type: TimelineEvent['type']) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const filteredEvents = events.filter((e) => activeFilters.has(e.type));

  return (
    <div className="d-section" data-density="compact">
      <SectionLabel>{label}</SectionLabel>

      {/* Filter chips */}
      <div className={css('_flex _wrap _gap2 _mb4')}>
        {filterTypes.map((type) => {
          const config = typeConfig[type];
          const isActive = activeFilters.has(type);
          return (
            <button
              key={type}
              className={css('_textsm _pointer _trans') + ' d-interactive'}
              data-variant="ghost"
              onClick={() => toggleFilter(type)}
              style={{
                borderColor: isActive ? config.color : 'var(--d-border)',
                opacity: isActive ? 1 : 0.5,
                padding: '0.25rem 0.5rem',
              }}
            >
              <config.icon size={12} />
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Timeline — connected vertical line */}
      {filteredEvents.length === 0 ? (
        <EmptyState icon={Inbox} message="No events match the current filters." />
      ) : (
        <div className={css('_rel')} style={{ paddingLeft: '1.5rem' }}>
          {/* Continuous vertical line */}
          <div
            className={css('_abs')}
            style={{
              left: '0.6875rem',
              top: 0,
              bottom: 0,
              width: '2px',
              background: 'var(--d-border)',
            }}
          />

          {filteredEvents.map((event) => {
            const config = typeConfig[event.type];
            const Icon = config.icon;
            const isExpanded = expandedIds.has(event.id);

            return (
              <div
                key={event.id}
                className={css('_rel _flex _gap3 _pb4 _pointer')}
                onClick={() => toggleExpand(event.id)}
              >
                {/* Orb — centered on first text line */}
                <div
                  className={css('_abs _flex _aic _jcc')}
                  style={{
                    left: '-1.5rem',
                    top: '0.125rem',
                    width: '1.375rem',
                    height: '1.375rem',
                    borderRadius: '50%',
                    background: 'var(--d-bg)',
                    border: `2px solid ${config.color}`,
                    zIndex: 1,
                    boxShadow: event.type === 'error' ? `0 0 8px color-mix(in srgb, var(--d-error) 40%, transparent)` : 'none',
                  }}
                >
                  <Icon size={10} style={{ color: config.color }} />
                </div>

                {/* Content */}
                <div className={css('_flex1 _minw0')}>
                  <div className={css('_flex _aic _jcsb _gap2')}>
                    <div className={css('_flex _aic _gap2')}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className={css('_textsm _fontsemi')}>{event.title}</span>
                    </div>
                    <span className={css('_textxs _fgmuted _nowraptext') + ' mono-data'}>
                      {event.timestamp}
                    </span>
                  </div>
                  <span
                    className="d-annotation"
                    data-status={event.type === 'error' ? 'error' : event.type === 'action' ? 'success' : 'info'}
                    style={{ marginTop: '0.25rem' }}
                  >
                    {config.label}
                  </span>
                  {isExpanded && (
                    <p className={css('_textsm _fgmuted _mt2')} style={{ lineHeight: 1.5 }}>
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
