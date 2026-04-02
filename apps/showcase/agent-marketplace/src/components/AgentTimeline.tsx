import { useState } from 'react';
import { css } from '@decantr/css';
import { Zap, Brain, AlertTriangle, AlertCircle, Wrench, Info, ChevronDown, ChevronRight } from 'lucide-react';

type EventType = 'action' | 'decision' | 'error' | 'warning' | 'tool_call' | 'reasoning' | 'info';

interface TimelineEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  timestamp: string;
  detail?: string;
}

const eventConfig: Record<EventType, { color: string; icon: typeof Zap; label: string }> = {
  action: { color: 'var(--d-accent)', icon: Zap, label: 'Action' },
  decision: { color: 'var(--d-success)', icon: Brain, label: 'Decision' },
  error: { color: 'var(--d-error)', icon: AlertCircle, label: 'Error' },
  warning: { color: 'var(--d-warning)', icon: AlertTriangle, label: 'Warning' },
  tool_call: { color: '#a855f7', icon: Wrench, label: 'Tool Call' },
  reasoning: { color: '#f59e0b', icon: Brain, label: 'Reasoning' },
  info: { color: 'var(--d-info)', icon: Info, label: 'Info' },
};

const statusMap: Record<EventType, 'success' | 'error' | 'warning' | 'info'> = {
  action: 'info',
  decision: 'success',
  error: 'error',
  warning: 'warning',
  tool_call: 'info',
  reasoning: 'warning',
  info: 'info',
};

interface Props {
  events: TimelineEvent[];
  title?: string;
}

function TimelineEventItem({ event }: { event: TimelineEvent }) {
  const [expanded, setExpanded] = useState(false);
  const config = eventConfig[event.type];
  const Icon = config.icon;

  return (
    <div
      className={css('_flex _gap3')}
      style={{ paddingLeft: '16px', position: 'relative', minHeight: '3rem' }}
    >
      {/* Orb on the vertical line */}
      <div
        style={{
          position: 'absolute',
          left: '10px',
          top: '4px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: config.color,
          zIndex: 2,
          boxShadow: `0 0 8px ${config.color}`,
        }}
      />

      {/* Event content */}
      <div className={css('_flex _col _gap1 _flex1 _ml4 _pb3')}>
        <div className={css('_flex _aic _gap2 _wrap')}>
          <span className="d-annotation" data-status={statusMap[event.type]}>
            <Icon size={12} />
            {config.label}
          </span>
          <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
            {event.timestamp}
          </span>
        </div>

        <button
          className={css('_flex _aic _gap1 _textleft')}
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--d-text)',
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {event.title}
        </button>

        {expanded && (
          <div className={css('_textsm _mt1')} style={{ color: 'var(--d-text-muted)' }}>
            <p>{event.description}</p>
            {event.detail && (
              <pre className={css('_mt2 _p3 _rounded _textsm') + ' carbon-code'}>
                {event.detail}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AgentTimeline({ events, title = 'Activity Timeline' }: Props) {
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);

  const types = Array.from(new Set(events.map(e => e.type)));

  return (
    <div className={css('_flex _col _gap3')}>
      <div className={css('_flex _aic _jcsb')}>
        <h3
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}
        >
          {title}
        </h3>
        <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
          {filtered.length} events
        </span>
      </div>

      {/* Filter chips */}
      <div className={css('_flex _gap2 _wrap')}>
        <button
          className="d-interactive"
          data-variant={filter === 'all' ? 'primary' : 'ghost'}
          onClick={() => setFilter('all')}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}
        >
          All
        </button>
        {types.map(type => (
          <button
            key={type}
            className="d-interactive"
            data-variant={filter === type ? 'primary' : 'ghost'}
            onClick={() => setFilter(type)}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}
          >
            {eventConfig[type].label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div
        className={css('_flex _col')}
        style={{
          position: 'relative',
          paddingLeft: '0px',
        }}
      >
        {/* Continuous vertical line */}
        <div
          style={{
            position: 'absolute',
            left: '15px',
            top: 0,
            bottom: 0,
            width: '2px',
            background: 'var(--d-border)',
          }}
        />

        {filtered.length === 0 ? (
          <div className={css('_flex _col _aic _jcc _py8')} style={{ color: 'var(--d-text-muted)' }}>
            <Info size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p className={css('_textsm')}>No events match the current filter.</p>
            <button
              className="d-interactive"
              data-variant="ghost"
              onClick={() => setFilter('all')}
              style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map(event => <TimelineEventItem key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}

// Demo data generator
export function generateTimelineEvents(count: number = 12): TimelineEvent[] {
  const types: EventType[] = ['action', 'decision', 'error', 'warning', 'tool_call', 'reasoning', 'info'];
  const titles: Record<EventType, string[]> = {
    action: ['Initiated API call to /v2/predict', 'Spawned sub-agent for data enrichment', 'Queued batch processing job'],
    decision: ['Selected GPT-4o model for context', 'Routed to fallback pipeline', 'Chose high-confidence path'],
    error: ['Rate limit exceeded on endpoint', 'Model inference timeout after 30s', 'Invalid token format detected'],
    warning: ['Token budget at 85% capacity', 'Latency spike detected: 2.1s avg', 'Memory pressure elevated'],
    tool_call: ['search_web("agent orchestration")', 'read_file("/config/agent.yaml")', 'execute_code(python, sanitize)'],
    reasoning: ['Evaluating 3 candidate strategies', 'Confidence threshold met at 0.92', 'Decomposing multi-step task'],
    info: ['Agent v2.4.1 deployed successfully', 'Checkpoint saved at step 1024', 'Model warm-up complete'],
  };

  return Array.from({ length: count }, (_, i) => {
    const type = types[i % types.length];
    const titleOptions = titles[type];
    return {
      id: `evt-${i}`,
      type,
      title: titleOptions[i % titleOptions.length],
      description: `Detailed description for event ${i + 1}. This provides additional context about what happened during this step.`,
      timestamp: `${String(Math.floor(i / 4) + 10).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}`,
      detail: type === 'tool_call' || type === 'error' ? `{\n  "status": "${type === 'error' ? 'failed' : 'ok'}",\n  "duration_ms": ${120 + i * 45},\n  "tokens": ${150 + i * 30}\n}` : undefined,
    };
  });
}
