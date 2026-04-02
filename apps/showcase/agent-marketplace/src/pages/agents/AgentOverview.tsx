import { css } from '@decantr/css';
import { Bot, Zap, AlertTriangle, Wifi, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { StatusRing } from '../../components/StatusRing';
import { TimelineEvent } from '../../components/TimelineEvent';

const AGENTS = [
  { id: 'a1', name: 'CodeGen Alpha', model: 'gpt-4o', status: 'active' as const, tasks: 142, latency: '120ms' },
  { id: 'a2', name: 'Data Miner v3', model: 'claude-3.5', status: 'active' as const, tasks: 89, latency: '340ms' },
  { id: 'a3', name: 'Safety Monitor', model: 'gpt-4o-mini', status: 'warning' as const, tasks: 12, latency: '890ms' },
  { id: 'a4', name: 'Search Index', model: 'mistral-large', status: 'idle' as const, tasks: 0, latency: '—' },
  { id: 'a5', name: 'Deploy Bot', model: 'claude-3.5', status: 'error' as const, tasks: 3, latency: '—' },
  { id: 'a6', name: 'Test Runner', model: 'gpt-4o', status: 'active' as const, tasks: 57, latency: '210ms' },
];

const TIMELINE_EVENTS = [
  { type: 'action' as const, title: 'CodeGen Alpha deployed to production', description: 'Automated deployment pipeline triggered after 47 tests passed.', timestamp: '2m ago', duration: '1.2s' },
  { type: 'decision' as const, title: 'Data Miner v3 selected extraction strategy', description: 'Chose parallel chunked processing over sequential for 12GB dataset.', timestamp: '8m ago', duration: '340ms' },
  { type: 'error' as const, title: 'Deploy Bot connection timeout', description: 'Lost WebSocket connection to orchestrator. Retry 3/5 in progress.', timestamp: '12m ago' },
  { type: 'tool_call' as const, title: 'Test Runner invoked pytest suite', description: 'Running 847 unit tests across 12 modules with coverage tracking.', timestamp: '15m ago', duration: '24s' },
  { type: 'reasoning' as const, title: 'Safety Monitor flagged anomalous pattern', description: 'Elevated token consumption rate (3.2x baseline) detected on CodeGen Alpha.', timestamp: '22m ago' },
];

export function AgentOverview() {
  return (
    <>
      <PageHeader
        title="Agent Swarm"
        subtitle="6 agents / 3 active / 1 alert"
        actions={
          <>
            <button className="d-interactive neon-glow-hover" data-variant="ghost" style={{ border: '1px solid transparent' }}>
              <Search size={14} /> Filter
            </button>
            <button className="d-interactive neon-glow-hover" style={{ background: 'var(--d-accent)', color: 'var(--d-bg)', borderColor: 'var(--d-accent)' }}>
              <Plus size={14} /> Deploy Agent
            </button>
          </>
        }
      />

      {/* Swarm topology — node canvas */}
      <section className="d-section" style={{ paddingTop: 0 }}>
        <h2 className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--d-gap-4)' }}>
          Swarm Topology
        </h2>
        <div
          className="d-surface carbon-glass"
          style={{ padding: 'var(--d-gap-6)', position: 'relative', overflow: 'hidden', minHeight: 320 }}
        >
          {/* Grid background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, var(--d-border) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              opacity: 0.3,
            }}
          />

          {/* Agent nodes */}
          <div className={css('_flex _wrap _gap6 _jcc')} style={{ position: 'relative', zIndex: 1 }}>
            {AGENTS.map((agent) => (
              <Link
                key={agent.id}
                to={`/agents/${agent.id}`}
                className={css('_flex _col _aic _gap2') + ' d-surface neon-glow-hover neon-entrance'}
                style={{
                  padding: 'var(--d-gap-4)',
                  minWidth: 140,
                  textDecoration: 'none',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                data-interactive=""
              >
                <StatusRing status={agent.status} size={48}>
                  <Bot size={20} style={{ color: agent.status === 'active' ? 'var(--d-accent)' : agent.status === 'error' ? 'var(--d-error)' : 'var(--d-text-muted)' }} />
                </StatusRing>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{agent.name}</span>
                <span className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{agent.model}</span>
                <div className={css('_flex _aic _gap2')}>
                  <span className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
                    <Zap size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {agent.tasks}
                  </span>
                  <span className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
                    <Wifi size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {agent.latency}
                  </span>
                </div>
                <span
                  className="d-annotation"
                  data-status={agent.status === 'active' ? 'success' : agent.status === 'error' ? 'error' : agent.status === 'warning' ? 'warning' : 'info'}
                >
                  {agent.status === 'active' && '● '}{agent.status}
                </span>
              </Link>
            ))}
          </div>

          {/* Connection lines are decorative SVG */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
            <line x1="25%" y1="40%" x2="50%" y2="30%" stroke="var(--d-accent)" strokeWidth="1" opacity="0.2" />
            <line x1="50%" y1="30%" x2="75%" y2="40%" stroke="var(--d-accent)" strokeWidth="1" opacity="0.2" />
            <line x1="25%" y1="70%" x2="50%" y2="60%" stroke="var(--d-border)" strokeWidth="1" opacity="0.3" />
          </svg>
        </div>
      </section>

      {/* Activity feed — timeline */}
      <section className="d-section">
        <h2 className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--d-gap-4)' }}>
          Activity Feed
        </h2>
        <div className={css('_flex _col')}>
          {TIMELINE_EVENTS.map((event, i) => (
            <TimelineEvent key={i} {...event} />
          ))}
        </div>
      </section>
    </>
  );
}
