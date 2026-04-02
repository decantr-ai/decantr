import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import {
  Cpu, Zap, AlertTriangle, Clock,
  ArrowUpRight, ArrowDownRight, Minus,
  ChevronRight, Circle,
} from 'lucide-react';

const agents = [
  { id: 'agent-001', name: 'Sentinel-Alpha', type: 'Monitor', status: 'online' as const, cpu: 23, tasks: 147, uptime: '99.97%', lastAction: '2s ago' },
  { id: 'agent-002', name: 'Parser-Beta', type: 'ETL', status: 'online' as const, cpu: 67, tasks: 89, uptime: '99.91%', lastAction: '14s ago' },
  { id: 'agent-003', name: 'Curator-Gamma', type: 'Classifier', status: 'warning' as const, cpu: 92, tasks: 203, uptime: '98.44%', lastAction: '1m ago' },
  { id: 'agent-004', name: 'Router-Delta', type: 'Orchestrator', status: 'online' as const, cpu: 45, tasks: 512, uptime: '99.99%', lastAction: '0s ago' },
  { id: 'agent-005', name: 'Analyst-Epsilon', type: 'Inference', status: 'error' as const, cpu: 0, tasks: 31, uptime: '87.22%', lastAction: '5m ago' },
  { id: 'agent-006', name: 'Guard-Zeta', type: 'Security', status: 'offline' as const, cpu: 0, tasks: 0, uptime: '—', lastAction: '2h ago' },
];

const timeline = [
  { time: '14:32:01', agent: 'Router-Delta', event: 'Routed 48 tasks to Parser-Beta cluster', type: 'action' as const },
  { time: '14:31:47', agent: 'Sentinel-Alpha', event: 'Anomaly detected in request latency — p99 > 400ms', type: 'warning' as const },
  { time: '14:31:22', agent: 'Curator-Gamma', event: 'Classification confidence dropped below 0.85 threshold', type: 'warning' as const },
  { time: '14:30:58', agent: 'Parser-Beta', event: 'Batch #4782 processed — 89 records transformed', type: 'action' as const },
  { time: '14:30:15', agent: 'Analyst-Epsilon', event: 'Process crashed: OOM at inference step 3', type: 'error' as const },
  { time: '14:29:44', agent: 'Router-Delta', event: 'Load balancer reweighted: shifted 20% to Sentinel cluster', type: 'action' as const },
];

const stats: { label: string; value: string; change: string; trend: 'up' | 'down' | 'flat'; icon: typeof Cpu }[] = [
  { label: 'Active Agents', value: '4', change: '+1', trend: 'up', icon: Cpu },
  { label: 'Tasks / min', value: '847', change: '+12%', trend: 'up', icon: Zap },
  { label: 'Alerts', value: '3', change: '+2', trend: 'down', icon: AlertTriangle },
  { label: 'Avg Latency', value: '124ms', change: '-8ms', trend: 'up', icon: Clock },
];

function StatusDot({ status }: { status: 'online' | 'offline' | 'warning' | 'error' }) {
  const cls = status === 'online' ? 'status-online pulse' :
              status === 'warning' ? 'status-warning pulse' :
              status === 'error' ? 'status-error' : 'status-offline';
  return <span className={'status-ring ' + cls} />;
}

export function AgentOverview() {
  return (
    <div className={css('_flex _col _gap6') + ' fade-in'}>
      {/* Page header */}
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className={'font-mono ' + css('_text2xl _fontbold')}>Agent Swarm</h1>
          <p className={'font-mono ' + css('_textsm _fgmuted _mt1')}>
            Real-time orchestration overview
          </p>
        </div>
        <div className={css('_flex _aic _gap2')}>
          <span className={'status-ring status-online pulse'} />
          <span className={'font-mono ' + css('_textxs _fgsuccess')}>SYSTEM NOMINAL</span>
        </div>
      </div>

      {/* Stats row */}
      <div className={css('_grid _gc2 _lg:gc4 _gap4')}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={css('_flex _col _gap2 _p4') + ' carbon-card'}>
              <div className={css('_flex _aic _jcsb')}>
                <Icon size={16} style={{ color: 'var(--d-text-muted)' }} />
                {s.trend === 'up' ? (
                  <span className={css('_flex _aic _gap1 _textxs _fgsuccess')}>
                    <ArrowUpRight size={12} />{s.change}
                  </span>
                ) : s.trend === 'down' ? (
                  <span className={css('_flex _aic _gap1 _textxs _fgerror')}>
                    <ArrowDownRight size={12} />{s.change}
                  </span>
                ) : (
                  <span className={css('_flex _aic _gap1 _textxs _fgmuted')}>
                    <Minus size={12} />{s.change}
                  </span>
                )}
              </div>
              <span className="metric-value">{s.value}</span>
              <span className={'font-mono ' + css('_textxs _fgmuted _uppercase')}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Agent topology / table */}
      <div className={css('_flex _col _gap3')}>
        <div className={css('_flex _aic _jcsb')}>
          <h2 className={'font-mono ' + css('_textsm _fontbold _uppercase')}>Agent Fleet</h2>
          <span className={'font-mono badge badge-info'}>6 registered</span>
        </div>
        <div className={css('_overauto') + ' carbon-card'} style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Agent</th>
                <th>Type</th>
                <th>CPU</th>
                <th>Tasks</th>
                <th>Uptime</th>
                <th>Last Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.id}>
                  <td><StatusDot status={a.status} /></td>
                  <td>
                    <Link to={`/agents/${a.id}`} className={'font-mono ' + css('_fgtext')}>
                      {a.name}
                    </Link>
                  </td>
                  <td><span className="badge badge-muted">{a.type}</span></td>
                  <td>
                    <div className={css('_flex _aic _gap2')}>
                      <div className="progress-bar" style={{ width: 48 }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${a.cpu}%`,
                            background: a.cpu > 80 ? 'var(--d-warning)' : 'var(--d-primary)',
                          }}
                        />
                      </div>
                      <span className={'font-mono ' + css('_textxs _fgmuted')}>{a.cpu}%</span>
                    </div>
                  </td>
                  <td><span className="font-mono">{a.tasks.toLocaleString()}</span></td>
                  <td><span className="font-mono">{a.uptime}</span></td>
                  <td><span className={'font-mono ' + css('_fgmuted')}>{a.lastAction}</span></td>
                  <td>
                    <Link to={`/agents/${a.id}`} className="btn btn-ghost btn-sm">
                      <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity timeline */}
      <div className={css('_flex _col _gap3')}>
        <h2 className={'font-mono ' + css('_textsm _fontbold _uppercase')}>Activity Feed</h2>
        <div className={css('_flex _col _gap2')}>
          {timeline.map((evt, i) => (
            <div key={i} className={css('_flex _aic _gap3 _p3') + ' carbon-card'}>
              <span className={'font-mono ' + css('_textxs _fgmuted _shrink0')} style={{ width: 72 }}>
                {evt.time}
              </span>
              <Circle
                size={8}
                fill={
                  evt.type === 'error' ? 'var(--d-error)' :
                  evt.type === 'warning' ? 'var(--d-warning)' : 'var(--d-primary)'
                }
                stroke="none"
              />
              <span className={'font-mono badge ' + (
                evt.type === 'error' ? 'badge-error' :
                evt.type === 'warning' ? 'badge-warning' : 'badge-info'
              )}>
                {evt.agent}
              </span>
              <span className={'font-mono ' + css('_textsm _fgmuted _flex1')}>{evt.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
