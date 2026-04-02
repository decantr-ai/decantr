import { css } from '@decantr/css';
import { Bot, ArrowRight, Play, Pause, ZoomIn, ZoomOut } from 'lucide-react';
import { AgentTimeline } from '../../components/AgentTimeline';

interface AgentNode {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'processing';
  type: string;
  requests: number;
  latency: string;
}

const agents: AgentNode[] = [
  { id: 'a1', name: 'Data Ingestion', status: 'active', type: 'Collector', requests: 1420, latency: '45ms' },
  { id: 'a2', name: 'NLP Processor', status: 'active', type: 'Transform', requests: 892, latency: '120ms' },
  { id: 'a3', name: 'Anomaly Detector', status: 'processing', type: 'Analysis', requests: 341, latency: '230ms' },
  { id: 'a4', name: 'Report Generator', status: 'idle', type: 'Output', requests: 67, latency: '89ms' },
  { id: 'a5', name: 'Alert Router', status: 'error', type: 'Dispatch', requests: 0, latency: '--' },
  { id: 'a6', name: 'Cache Manager', status: 'active', type: 'Storage', requests: 2100, latency: '12ms' },
];

export function AgentOverview() {
  return (
    <div className={css('_flex _col _gap6 _p6')}>
      <div className={css('_flex _aic _jcsb')}>
        <h1 className={css('_textxl _fontsemi')}>Agent Swarm</h1>
        <div className={css('_flex _gap2')}>
          <button className={'d-interactive'} data-variant="ghost" aria-label="Zoom in">
            <ZoomIn size={16} />
          </button>
          <button className={'d-interactive'} data-variant="ghost" aria-label="Zoom out">
            <ZoomOut size={16} />
          </button>
          <button className={'d-interactive neon-glow-hover'} data-variant="primary">
            <Play size={14} />
            <span className={css('_textsm')}>Run Swarm</span>
          </button>
        </div>
      </div>

      {/* Swarm canvas */}
      <div
        className={css('_rel _p6') + ' carbon-canvas'}
        style={{
          minHeight: '360px',
          borderRadius: 'var(--d-radius)',
          border: '1px solid var(--d-border)',
        }}
        role="application"
        aria-label="Agent swarm canvas"
      >
        {/* Agent nodes */}
        <div className={css('_grid _gap4')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {agents.map(agent => (
            <a
              key={agent.id}
              href={`#/agents/${agent.id}`}
              className={css('_flex _col _gap3 _p4') + ' d-surface'}
              data-interactive
              style={{
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
                boxShadow: agent.status === 'error'
                  ? '0 0 12px color-mix(in srgb, var(--d-error) 25%, transparent)'
                  : undefined,
              }}
            >
              <div className={css('_flex _aic _jcsb')}>
                <div className={css('_flex _aic _gap2')}>
                  <div className="status-ring" data-status={agent.status} style={{ width: '32px', height: '32px' }}>
                    <Bot size={14} />
                  </div>
                  <div className={css('_flex _col')}>
                    <span className={css('_textsm _fontsemi')}>{agent.name}</span>
                    <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                      {agent.type}
                    </span>
                  </div>
                </div>
                <span className="d-annotation" data-status={
                  agent.status === 'active' ? 'success' :
                  agent.status === 'error' ? 'error' :
                  agent.status === 'processing' ? 'warning' : undefined
                }>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                  {agent.status}
                </span>
              </div>

              <div className={css('_flex _gap4 _textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                <span>Requests: {agent.requests.toLocaleString()}</span>
                <span>Latency: {agent.latency}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div className="d-section" data-density="compact">
        <AgentTimeline title="Activity Feed" />
      </div>
    </div>
  );
}
