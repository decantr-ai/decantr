import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Bot, Zap, AlertTriangle, Clock, Inbox } from 'lucide-react';
import { agents, timelineEvents } from '../../data';
import { StatusRing } from '../../components/StatusRing';
import { AgentTimeline } from '../../components/AgentTimeline';
import { SectionLabel } from '../../components/SectionLabel';
import { EmptyState } from '../../components/EmptyState';

/**
 * Agent overview page — agent-swarm-canvas + agent-timeline.
 * Per layout_hints:
 * - Borderless canvas visualization, no outer card
 * - Metrics with LABELS not just icons
 * - Status badges consistent with dots
 * - Error agents get red glow
 */
export function AgentOverviewPage() {
  const activeCount = agents.filter((a) => a.status === 'active').length;
  const errorCount = agents.filter((a) => a.status === 'error').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasksCompleted, 0);

  return (
    <div className={css('_flex _col _gap6')}>
      {/* Swarm topology — borderless canvas */}
      <div className="d-section" data-density="compact">
        <SectionLabel>Swarm Topology</SectionLabel>

        {/* KPI metrics with labels */}
        <div className={css('_grid _gc2 _md:gc4 _gap3 _mb4')}>
          <MetricTile icon={Bot} label="Active Agents" value={String(activeCount)} color="var(--d-success)" />
          <MetricTile icon={AlertTriangle} label="Errors" value={String(errorCount)} color="var(--d-error)" />
          <MetricTile icon={Zap} label="Tasks Done" value={totalTasks.toLocaleString()} color="var(--d-accent)" />
          <MetricTile icon={Clock} label="Avg Response" value="142ms" color="var(--d-info)" />
        </div>

        {/* Agent canvas — no outer card, borderless */}
        {agents.length === 0 ? (
          <EmptyState icon={Inbox} message="No agents deployed. Deploy your first agent to see the swarm." />
        ) : (
          <div
            className={css('_rel _w100 _rounded')}
            style={{
              height: '20rem',
              background: 'var(--d-bg)',
              overflow: 'hidden',
            }}
          >
            {/* Grid pattern background */}
            <div
              className={css('_abs _inset0')}
              style={{
                backgroundImage: `radial-gradient(circle, var(--d-border) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
                opacity: 0.3,
              }}
            />

            {/* Agent nodes */}
            {agents.map((agent, i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              const x = 15 + col * 30 + (row % 2 === 1 ? 15 : 0);
              const y = 20 + row * 45;

              return (
                <Link
                  key={agent.id}
                  to={`/agents/${agent.id}`}
                  className={css('_abs _flex _col _aic _gap2 _pointer _trans')}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    textDecoration: 'none',
                    zIndex: 1,
                  }}
                >
                  <StatusRing status={agent.status} size={44}>
                    <Bot
                      size={18}
                      style={{
                        color: agent.status === 'error'
                          ? 'var(--d-error)'
                          : agent.status === 'active'
                          ? 'var(--d-success)'
                          : 'var(--d-text-muted)',
                      }}
                    />
                  </StatusRing>
                  <span className={css('_textxs _fontsemi _nowraptext') + ' mono-data'}>
                    {agent.name}
                  </span>
                  <span
                    className="d-annotation"
                    data-status={agent.status === 'active' ? 'success' : agent.status === 'error' ? 'error' : agent.status === 'warning' ? 'warning' : undefined}
                  >
                    {agent.status}
                  </span>
                </Link>
              );
            })}

            {/* Connection lines between some agents */}
            <svg
              className={css('_abs _inset0')}
              style={{ pointerEvents: 'none', width: '100%', height: '100%' }}
            >
              <line x1="15%" y1="20%" x2="45%" y2="20%" stroke="var(--d-border)" strokeWidth="1" strokeDasharray="4" opacity="0.4" />
              <line x1="45%" y1="20%" x2="75%" y2="20%" stroke="var(--d-border)" strokeWidth="1" strokeDasharray="4" opacity="0.4" />
              <line x1="30%" y1="65%" x2="60%" y2="65%" stroke="var(--d-border)" strokeWidth="1" strokeDasharray="4" opacity="0.4" />
              <line x1="15%" y1="20%" x2="30%" y2="65%" stroke="var(--d-border)" strokeWidth="1" strokeDasharray="4" opacity="0.3" />
              <line x1="75%" y1="20%" x2="60%" y2="65%" stroke="var(--d-border)" strokeWidth="1" strokeDasharray="4" opacity="0.3" />
            </svg>
          </div>
        )}
      </div>

      {/* Activity feed timeline */}
      <AgentTimeline events={timelineEvents} label="Activity Feed" />
    </div>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Bot;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={css('_flex _col _gap1 _p3') + ' d-surface carbon-card'}>
      <div className={css('_flex _aic _gap2')}>
        <Icon size={14} style={{ color }} />
        <span className={css('_textxs _fgmuted') + ' d-label'}>{label}</span>
      </div>
      <span className={css('_textxl _fontsemi') + ' mono-data neon-text-glow'}>{value}</span>
    </div>
  );
}
