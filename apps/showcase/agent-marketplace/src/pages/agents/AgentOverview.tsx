import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Bot, ZoomIn, ZoomOut, Maximize2, Play, Pause } from 'lucide-react';
import { AgentTimeline, type TimelineEvent } from '../../components/AgentTimeline';

/* ── Mock agents ── */
const MOCK_AGENTS = [
  { id: 'agent-001', name: 'DataCrawler', status: 'active' as const, model: 'gpt-4o', tasks: 142, latency: 120, x: 200, y: 150 },
  { id: 'agent-002', name: 'Summarizer', status: 'active' as const, model: 'claude-3', tasks: 89, latency: 340, x: 500, y: 100 },
  { id: 'agent-003', name: 'CodeReviewer', status: 'processing' as const, model: 'gpt-4o', tasks: 56, latency: 890, x: 400, y: 300 },
  { id: 'agent-004', name: 'Sentinel', status: 'error' as const, model: 'mistral-large', tasks: 12, latency: 2100, x: 150, y: 350 },
  { id: 'agent-005', name: 'Dispatcher', status: 'idle' as const, model: 'claude-3', tasks: 0, latency: 0, x: 650, y: 250 },
];

const CONNECTIONS = [
  { from: 'agent-001', to: 'agent-002' },
  { from: 'agent-001', to: 'agent-003' },
  { from: 'agent-003', to: 'agent-004' },
  { from: 'agent-002', to: 'agent-005' },
];

const MOCK_EVENTS: TimelineEvent[] = [
  { id: '1', type: 'action', summary: 'DataCrawler started batch processing', timestamp: '14:23:01', detail: 'Initiated crawl of 500 URLs from queue. Batch ID: batch_7f3a2.' },
  { id: '2', type: 'decision', summary: 'Summarizer selected extraction mode', timestamp: '14:23:12', detail: 'Chose structured extraction over raw text based on content type analysis.' },
  { id: '3', type: 'tool_call', summary: 'CodeReviewer invoked linter', timestamp: '14:23:15', detail: 'eslint --fix applied to 12 files. 3 warnings resolved, 0 errors.' },
  { id: '4', type: 'error', summary: 'Sentinel rate limit exceeded', timestamp: '14:23:18', detail: 'Error: 429 Too Many Requests. Retry after 30s. Agent ID: agent-004.' },
  { id: '5', type: 'reasoning', summary: 'Dispatcher evaluating task queue', timestamp: '14:23:22', detail: 'Analyzing 8 pending tasks. Priority scoring: urgency=0.7, complexity=0.3.' },
  { id: '6', type: 'action', summary: 'DataCrawler completed page extraction', timestamp: '14:23:30' },
  { id: '7', type: 'info', summary: 'System checkpoint saved', timestamp: '14:23:35' },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--d-success)',
  processing: 'var(--d-primary)',
  error: 'var(--d-error)',
  idle: 'var(--d-text-muted)',
};

export function AgentOverview() {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [running, setRunning] = useState(true);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(2, Math.max(0.3, z - e.deltaY * 0.001)));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-agent-node]')) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning) return;
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    });
  }, [isPanning]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Agent positions
  const getAgentPos = (id: string) => {
    const a = MOCK_AGENTS.find(a => a.id === id);
    return a ? { x: a.x, y: a.y } : { x: 0, y: 0 };
  };

  return (
    <div className={css('_flex _col _gap6')}>
      {/* Status bar */}
      <div className={css('_flex _aic _jcsb _wrap _gap3')}>
        <div>
          <h1 className={css('_fontsemi _textxl')} style={{ marginBottom: '0.25rem' }}>Agent Swarm</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
            <span className="mono-data">{MOCK_AGENTS.length}</span> agents deployed
          </p>
        </div>
        <div className={css('_flex _aic _gap3')}>
          {['active', 'processing', 'error', 'idle'].map(status => {
            const count = MOCK_AGENTS.filter(a => a.status === status).length;
            return (
              <span key={status} className={css('_flex _aic _gap1')}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[status] }} />
                <span className={css('_textsm') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>{count} {status}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Swarm Canvas */}
      <div className="d-section" data-density="compact" style={{ padding: 0, position: 'relative' }}>
        <div
          ref={canvasRef}
          className="carbon-canvas"
          style={{
            height: 480,
            borderRadius: 'var(--d-radius)',
            border: '1px solid var(--d-border)',
            overflow: 'hidden',
            cursor: isPanning ? 'grabbing' : 'grab',
            position: 'relative',
            backgroundImage: `radial-gradient(circle, var(--d-border) 1px, transparent 1px)`,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="application"
          aria-label="Agent swarm canvas"
        >
          {/* SVG connections */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {CONNECTIONS.map(conn => {
                const from = getAgentPos(conn.from);
                const to = getAgentPos(conn.to);
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2 - 30;
                return (
                  <path
                    key={`${conn.from}-${conn.to}`}
                    d={`M ${from.x + 100} ${from.y + 40} Q ${midX} ${midY} ${to.x + 100} ${to.y + 40}`}
                    fill="none"
                    stroke="var(--d-border)"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    opacity="0.6"
                    style={{ animation: 'dash-flow 3s linear infinite' }}
                  />
                );
              })}
            </g>
          </svg>

          {/* Agent nodes */}
          <div
            style={{
              position: 'absolute',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {MOCK_AGENTS.map(agent => (
              <div
                key={agent.id}
                data-agent-node
                className="d-surface carbon-card"
                data-interactive
                onClick={() => navigate(`/agents/${agent.id}`)}
                title={agent.name}
                style={{
                  position: 'absolute',
                  left: agent.x,
                  top: agent.y,
                  minWidth: 180,
                  maxWidth: 240,
                  padding: '0.75rem',
                  cursor: 'pointer',
                  transition: 'transform 200ms ease-out, box-shadow 200ms ease-out',
                  boxShadow: agent.status === 'error'
                    ? '0 0 12px color-mix(in srgb, var(--d-error) 25%, transparent)'
                    : undefined,
                }}
              >
                {/* Row 1: Avatar + Name/ID */}
                <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
                  <div className="status-ring" data-status={agent.status} style={{ width: 40, height: 40, flexShrink: 0 }}>
                    <Bot size={16} />
                  </div>
                  <div className={css('_flex _col')} style={{ minWidth: 0 }}>
                    <span className={css('_textsm _fontsemi')} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</span>
                    <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>{agent.id}</span>
                  </div>
                </div>

                {/* Row 2: Status badge — full width, own row */}
                <div className={css('_flex _gap2 _aic')} style={{ marginBottom: '0.5rem' }}>
                  <span
                    className="d-annotation"
                    data-status={
                      agent.status === 'active' ? 'success' :
                      agent.status === 'error' ? 'error' :
                      agent.status === 'processing' ? 'info' : 'warning'
                    }
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[agent.status], flexShrink: 0 }} />
                    {agent.status}
                  </span>
                </div>

                {/* Metrics — stacked vertically, mono-data */}
                <div className={css('_flex _col _gap1')}>
                  <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                    Requests: {agent.tasks}
                  </span>
                  {agent.latency > 0 && (
                    <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                      Latency: {agent.latency}ms
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Control bar */}
          <div
            className="carbon-glass"
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '0.25rem',
              padding: '0.25rem',
              borderRadius: 'var(--d-radius)',
              zIndex: 2,
            }}
          >
            <button className="d-interactive" data-variant="ghost" onClick={() => setZoom(z => Math.min(2, z + 0.2))} style={{ padding: '0.25rem 0.5rem' }} aria-label="Zoom in"><ZoomIn size={14} /></button>
            <button className="d-interactive" data-variant="ghost" onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} style={{ padding: '0.25rem 0.5rem' }} aria-label="Zoom out"><ZoomOut size={14} /></button>
            <button className="d-interactive" data-variant="ghost" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} style={{ padding: '0.25rem 0.5rem' }} aria-label="Fit view"><Maximize2 size={14} /></button>
            <button className="d-interactive" data-variant="ghost" onClick={() => setRunning(!running)} style={{ padding: '0.25rem 0.5rem' }} aria-label={running ? 'Pause' : 'Play'}>
              {running ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <span className={css('_textxs _flex _aic') + ' mono-data'} style={{ color: 'var(--d-text-muted)', padding: '0 0.5rem' }}>
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <span className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem', display: 'block' }}>
          Activity Feed
        </span>
        <AgentTimeline events={MOCK_EVENTS} />
      </div>

      <style>{`
        @keyframes dash-flow {
          to { stroke-dashoffset: -20; }
        }
        [data-agent-node]:hover {
          transform: scale(1.05) !important;
          z-index: 10;
        }
      `}</style>
    </div>
  );
}
