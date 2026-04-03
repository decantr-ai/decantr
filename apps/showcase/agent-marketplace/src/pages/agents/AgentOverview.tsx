import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Activity, AlertTriangle, Circle } from 'lucide-react';
import { AgentTimeline, type TimelineEvent } from '@/components/AgentTimeline';

/* ── Mock Data ── */

interface AgentNode {
  id: string;
  name: string;
  modelId: string;
  status: 'active' | 'idle' | 'error' | 'processing';
  metrics: { requests: number; latency: number };
  position: { top: string; left: string };
}

const AGENTS: AgentNode[] = [
  { id: 'sentinel-alpha', name: 'sentinel-alpha', modelId: 'gpt-4-turbo', status: 'active', metrics: { requests: 1482, latency: 120 }, position: { top: '12%', left: '8%' } },
  { id: 'recon-bravo', name: 'recon-bravo', modelId: 'claude-3', status: 'idle', metrics: { requests: 743, latency: 95 }, position: { top: '55%', left: '22%' } },
  { id: 'analyst-echo', name: 'analyst-echo', modelId: 'gpt-4-turbo', status: 'active', metrics: { requests: 2104, latency: 142 }, position: { top: '18%', left: '48%' } },
  { id: 'monitor-delta', name: 'monitor-delta', modelId: 'mistral-large', status: 'error', metrics: { requests: 389, latency: 310 }, position: { top: '62%', left: '55%' } },
  { id: 'scout-foxtrot', name: 'scout-foxtrot', modelId: 'claude-3', status: 'processing', metrics: { requests: 917, latency: 108 }, position: { top: '30%', left: '75%' } },
  { id: 'dispatch-golf', name: 'dispatch-golf', modelId: 'gpt-4-turbo', status: 'idle', metrics: { requests: 561, latency: 87 }, position: { top: '70%', left: '80%' } },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--d-success)',
  idle: 'var(--d-warning)',
  error: 'var(--d-error)',
  processing: 'var(--d-accent)',
};

const MOCK_EVENTS: TimelineEvent[] = [
  { id: 'ev-01', type: 'action', summary: 'sentinel-alpha started data ingestion pipeline', timestamp: '14:32:07', detail: 'Source: /api/v2/feed\nRecords buffered: 12,480' },
  { id: 'ev-02', type: 'decision', summary: 'analyst-echo selected regression model over classification', timestamp: '14:31:45' },
  { id: 'ev-03', type: 'error', summary: 'monitor-delta health check timeout after 30s', timestamp: '14:30:22', detail: 'Endpoint: health.internal:8080\nRetry count: 3\nLast error: ETIMEDOUT' },
  { id: 'ev-04', type: 'tool_call', summary: 'scout-foxtrot invoked vector_search(query="anomaly detection")', timestamp: '14:29:58', detail: 'Tool: vector_search\nLatency: 82ms\nResults: 24 matches' },
  { id: 'ev-05', type: 'reasoning', summary: 'recon-bravo evaluated 3 extraction strategies', timestamp: '14:28:31' },
  { id: 'ev-06', type: 'info', summary: 'dispatch-golf entered idle state after queue drain', timestamp: '14:27:10' },
  { id: 'ev-07', type: 'action', summary: 'sentinel-alpha committed batch 0x7f2a to storage', timestamp: '14:26:44', detail: 'Batch ID: 0x7f2a\nRows written: 4,096\nDuration: 1.2s' },
  { id: 'ev-08', type: 'tool_call', summary: 'analyst-echo called summarize_metrics(window="1h")', timestamp: '14:25:19' },
];

/* ── Component ── */

export function AgentOverview() {
  const navigate = useNavigate();

  const counts = {
    total: AGENTS.length,
    running: AGENTS.filter(a => a.status === 'active' || a.status === 'processing').length,
    error: AGENTS.filter(a => a.status === 'error').length,
  };

  return (
    <div className={css('_flex _col _gap6')}>
      {/* ── Swarm Canvas ── */}
      <div
        style={{
          position: 'relative',
          minHeight: 420,
          borderRadius: 'var(--d-radius)',
          background: `
            radial-gradient(circle, var(--d-border) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          overflow: 'hidden',
        }}
      >
        {/* Status overlay */}
        <div
          className="d-surface carbon-glass"
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            padding: '0.5rem 0.75rem',
            zIndex: 2,
            fontSize: 12,
          }}
        >
          <div className={css('_flex _aic _gap4')}>
            <span style={{ color: 'var(--d-text-muted)' }}>
              Total: <span className="mono-data" style={{ color: 'var(--d-text)' }}>{counts.total}</span>
            </span>
            <span style={{ color: 'var(--d-text-muted)' }}>
              Running: <span className="mono-data" style={{ color: 'var(--d-success)' }}>{counts.running}</span>
            </span>
            <span style={{ color: 'var(--d-text-muted)' }}>
              Error: <span className="mono-data" style={{ color: 'var(--d-error)' }}>{counts.error}</span>
            </span>
          </div>
        </div>

        {/* Agent nodes */}
        {AGENTS.map(agent => (
          <div
            key={agent.id}
            className="d-surface"
            data-interactive
            onClick={() => navigate(`/agents/${agent.id}`)}
            style={{
              position: 'absolute',
              top: agent.position.top,
              left: agent.position.left,
              cursor: 'pointer',
              padding: '0.625rem 0.875rem',
              minWidth: 200,
              transition: 'transform 150ms ease, box-shadow 150ms ease',
              zIndex: 1,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${STATUS_COLORS[agent.status]}33`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--d-shadow)';
            }}
          >
            <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.375rem' }}>
              <span className="status-ring" style={{ color: STATUS_COLORS[agent.status] }}>
                <Circle size={10} fill="currentColor" />
              </span>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--d-text)' }}>
                {agent.name}
              </span>
            </div>
            <div className="mono-data" style={{ fontSize: 11, color: 'var(--d-text-muted)', marginBottom: '0.375rem' }}>
              {agent.modelId}
            </div>
            <div className={css('_flex _aic _gap3')} style={{ fontSize: 11, color: 'var(--d-text-muted)' }}>
              <span>
                <Activity size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                Requests: <span className="mono-data">{agent.metrics.requests.toLocaleString()}</span>
              </span>
              <span>
                Latency: <span className="mono-data">{agent.metrics.latency}ms</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <div className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          RECENT ACTIVITY
        </div>
        <AgentTimeline events={MOCK_EVENTS} />
      </div>
    </div>
  );
}
