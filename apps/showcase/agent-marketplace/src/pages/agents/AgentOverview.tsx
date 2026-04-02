import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Bot, Wifi, AlertCircle, CheckCircle2, Pause, RotateCcw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { AgentTimeline, generateTimelineEvents } from '../../components/AgentTimeline';

type AgentStatus = 'active' | 'error' | 'idle' | 'warning';

interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  model: string;
  requests: number;
  latency: string;
  x: number;
  y: number;
}

const agents: Agent[] = [
  { id: 'a1', name: 'Classifier-v3', status: 'active', model: 'GPT-4o', requests: 1420, latency: '120ms', x: 15, y: 20 },
  { id: 'a2', name: 'Summarizer-v2', status: 'active', model: 'Claude-3', requests: 892, latency: '340ms', x: 45, y: 15 },
  { id: 'a3', name: 'Router-Alpha', status: 'error', model: 'Mistral-7B', requests: 0, latency: '--', x: 75, y: 25 },
  { id: 'a4', name: 'Embedder-v1', status: 'idle', model: 'text-embed-3', requests: 4100, latency: '45ms', x: 30, y: 55 },
  { id: 'a5', name: 'Guardian-v1', status: 'active', model: 'GPT-4o-mini', requests: 670, latency: '89ms', x: 60, y: 50 },
  { id: 'a6', name: 'Orchestrator', status: 'warning', model: 'Claude-3.5', requests: 2300, latency: '210ms', x: 45, y: 75 },
];

const connections: Array<[string, string, 'active' | 'idle' | 'error']> = [
  ['a1', 'a2', 'active'],
  ['a2', 'a5', 'active'],
  ['a1', 'a4', 'idle'],
  ['a4', 'a6', 'active'],
  ['a5', 'a6', 'active'],
  ['a3', 'a6', 'error'],
];

function AgentNode({ agent }: { agent: Agent }) {
  const statusDot: Record<AgentStatus, string> = {
    active: 'var(--d-success)',
    error: 'var(--d-error)',
    idle: 'var(--d-text-muted)',
    warning: 'var(--d-warning)',
  };

  return (
    <Link
      to={`/agents/${agent.id}`}
      className={css('_abs _flex _col _gap2 _p3') + ' d-surface carbon-glass'}
      data-interactive
      style={{
        left: `${agent.x}%`,
        top: `${agent.y}%`,
        transform: 'translate(-50%, -50%)',
        width: '160px',
        textDecoration: 'none',
        zIndex: 3,
        boxShadow: agent.status === 'error'
          ? '0 0 12px color-mix(in srgb, var(--d-error) 25%, transparent)'
          : undefined,
      }}
    >
      <div className={css('_flex _aic _gap2')}>
        <div className="status-ring" data-status={agent.status} style={{ width: '32px', height: '32px', flexShrink: 0 }}>
          <Bot size={14} />
        </div>
        <div className={css('_flex _col _minw0')}>
          <span className={css('_textsm _fontmedium _truncate')} style={{ color: 'var(--d-text)' }}>
            {agent.name}
          </span>
          <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
            {agent.model}
          </span>
        </div>
      </div>
      <div className={css('_flex _jcsb _textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
        <span>Requests: {agent.requests.toLocaleString()}</span>
        <span>Latency: {agent.latency}</span>
      </div>
      <span className="d-annotation" data-status={agent.status === 'active' ? 'success' : agent.status === 'error' ? 'error' : agent.status === 'warning' ? 'warning' : 'info'}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusDot[agent.status], display: 'inline-block' }} />
        {agent.status}
      </span>
    </Link>
  );
}

function CanvasControls() {
  return (
    <div
      className={css('_abs _flex _aic _gap1 _p2 _rounded') + ' d-surface carbon-glass'}
      style={{ bottom: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}
    >
      <button className="d-interactive" data-variant="ghost" aria-label="Zoom in" style={{ padding: '0.375rem' }}>
        <ZoomIn size={16} />
      </button>
      <button className="d-interactive" data-variant="ghost" aria-label="Zoom out" style={{ padding: '0.375rem' }}>
        <ZoomOut size={16} />
      </button>
      <button className="d-interactive" data-variant="ghost" aria-label="Fit to view" style={{ padding: '0.375rem' }}>
        <Maximize2 size={16} />
      </button>
      <div style={{ width: '1px', height: '20px', background: 'var(--d-border)' }} />
      <button className="d-interactive" data-variant="ghost" aria-label="Pause swarm" style={{ padding: '0.375rem' }}>
        <Pause size={16} />
      </button>
      <button className="d-interactive" data-variant="ghost" aria-label="Reset layout" style={{ padding: '0.375rem' }}>
        <RotateCcw size={16} />
      </button>
    </div>
  );
}

function StatusOverlay() {
  const running = agents.filter(a => a.status === 'active').length;
  const errors = agents.filter(a => a.status === 'error').length;

  return (
    <div
      className={css('_abs _flex _col _gap2 _p3 _roundedlg') + ' d-surface carbon-glass'}
      style={{ top: '1rem', right: '1rem', zIndex: 5, minWidth: '180px' }}
    >
      <span className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
        Swarm Status
      </span>
      <div className={css('_flex _col _gap1 _textxs') + ' mono-data'}>
        <div className={css('_flex _jcsb')}>
          <span style={{ color: 'var(--d-text-muted)' }}>Total Agents</span>
          <span>{agents.length}</span>
        </div>
        <div className={css('_flex _jcsb')}>
          <span style={{ color: 'var(--d-text-muted)' }}>Running</span>
          <span style={{ color: 'var(--d-success)' }}>{running}</span>
        </div>
        <div className={css('_flex _jcsb')}>
          <span style={{ color: 'var(--d-text-muted)' }}>Errors</span>
          <span style={{ color: 'var(--d-error)' }}>{errors}</span>
        </div>
        {/* Progress bar */}
        <div style={{ height: '3px', borderRadius: '2px', background: 'var(--d-border)', marginTop: '0.25rem' }}>
          <div style={{ width: `${(running / agents.length) * 100}%`, height: '100%', borderRadius: '2px', background: 'var(--d-success)', transition: 'width 0.3s ease' }} />
        </div>
      </div>
    </div>
  );
}

function SwarmCanvas() {
  return (
    <div
      className={css('_rel _wfull _rounded') + ' carbon-canvas'}
      style={{
        height: '460px',
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle, var(--d-border) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
      role="application"
      aria-label="Agent orchestration canvas"
    >
      {/* Connection SVG layer */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
      >
        {connections.map(([from, to, status]) => {
          const fromAgent = agents.find(a => a.id === from)!;
          const toAgent = agents.find(a => a.id === to)!;
          const colors = { active: 'var(--d-accent)', idle: 'var(--d-border)', error: 'var(--d-error)' };
          return (
            <line
              key={`${from}-${to}`}
              x1={`${fromAgent.x}%`} y1={`${fromAgent.y}%`}
              x2={`${toAgent.x}%`} y2={`${toAgent.y}%`}
              stroke={colors[status]}
              strokeWidth="2"
              strokeDasharray={status === 'idle' ? '6 4' : status === 'error' ? '4 4' : 'none'}
              opacity={status === 'idle' ? 0.4 : 0.6}
            />
          );
        })}
      </svg>

      {/* Agent nodes */}
      {agents.map(agent => (
        <AgentNode key={agent.id} agent={agent} />
      ))}

      <StatusOverlay />
      <CanvasControls />

      {/* Minimap placeholder */}
      <div
        className={css('_abs _rounded') + ' d-surface carbon-glass'}
        style={{
          bottom: '1rem',
          right: '1rem',
          width: '160px',
          height: '100px',
          zIndex: 5,
          opacity: 0.8,
          overflow: 'hidden',
        }}
      >
        <div className={css('_p2 _textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
          Minimap
        </div>
        {agents.map(a => (
          <div
            key={a.id}
            style={{
              position: 'absolute',
              left: `${a.x * 0.95}%`,
              top: `${a.y * 0.95}%`,
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: a.status === 'active' ? 'var(--d-success)' : a.status === 'error' ? 'var(--d-error)' : 'var(--d-text-muted)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

const events = generateTimelineEvents(10);

export function AgentOverview() {
  return (
    <div className={css('_flex _col _gap6')}>
      {/* Swarm canvas — full bleed, no card wrapper */}
      <section>
        <h2
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}
        >
          Swarm Topology
        </h2>
        <SwarmCanvas />
      </section>

      {/* Activity feed */}
      <section className="d-section" data-density="compact">
        <AgentTimeline events={events} title="Activity Feed" />
      </section>
    </div>
  );
}
