import { css } from '@decantr/css';
import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, Play, Pause, Map as MapIcon, RotateCcw } from 'lucide-react';
import type { Agent } from '../../data/types';

interface AgentSwarmCanvasProps {
  agents: Agent[];
  onSelectAgent: (id: string) => void;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

const CANVAS_W = 1200;
const CANVAS_H = 800;
const NODE_W = 180;
const NODE_H = 80;

/* ── Force-directed layout ───────────────────────────────── */

function computeForceLayout(agents: Agent[]): NodePosition[] {
  if (agents.length === 0) return [];

  // Initialize in a circle
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const radius = Math.min(CANVAS_W, CANVAS_H) * 0.3;
  const nodes: NodePosition[] = agents.map((a, i) => {
    const angle = (2 * Math.PI * i) / agents.length;
    return { id: a.id, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });

  // Build adjacency set for attraction
  const connectedPairs = new Set<string>();
  for (const agent of agents) {
    for (const targetId of agent.connections) {
      const key = [agent.id, targetId].sort().join(':');
      connectedPairs.add(key);
    }
  }

  const repulsionK = 80000;
  const springK = 0.005;
  const restLength = 200;
  const damping = 0.9;
  const velocities = nodes.map(() => ({ vx: 0, vy: 0 }));

  for (let iter = 0; iter < 100; iter++) {
    // Reset forces
    const forces = nodes.map(() => ({ fx: 0, fy: 0 }));

    // Repulsion between all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = repulsionK / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        forces[i].fx -= fx;
        forces[i].fy -= fy;
        forces[j].fx += fx;
        forces[j].fy += fy;
      }
    }

    // Spring attraction for connected nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const key = [nodes[i].id, nodes[j].id].sort().join(':');
        if (!connectedPairs.has(key)) continue;
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = -springK * (dist - restLength);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        forces[i].fx -= fx;
        forces[i].fy -= fy;
        forces[j].fx += fx;
        forces[j].fy += fy;
      }
    }

    // Apply forces
    for (let i = 0; i < nodes.length; i++) {
      velocities[i].vx = (velocities[i].vx + forces[i].fx) * damping;
      velocities[i].vy = (velocities[i].vy + forces[i].fy) * damping;
      nodes[i].x = Math.max(40, Math.min(CANVAS_W - NODE_W - 40, nodes[i].x + velocities[i].vx));
      nodes[i].y = Math.max(40, Math.min(CANVAS_H - NODE_H - 40, nodes[i].y + velocities[i].vy));
    }
  }

  return nodes;
}

/* ── Status color mapping ────────────────────────────────── */

function statusColor(status: Agent['status']): string {
  switch (status) {
    case 'active': return 'var(--d-success)';
    case 'idle': return 'var(--d-text-muted)';
    case 'error': return 'var(--d-error)';
    case 'processing': return 'var(--d-accent)';
  }
}

/* ── Main component ──────────────────────────────────────── */

export function AgentSwarmCanvas({ agents, onSelectAgent }: AgentSwarmCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState<NodePosition[]>(() => computeForceLayout(agents));
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragDelta, setDragDelta] = useState(0);
  const [showMinimap, setShowMinimap] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Re-run layout when agents change
  useEffect(() => {
    setNodes(computeForceLayout(agents));
  }, [agents]);

  /* ── Lookup helpers ─────────────────────────────────────── */

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const agentMap = new Map(agents.map(a => [a.id, a]));

  // Build connections list
  const connections: { sourceId: string; targetId: string; isActive: boolean }[] = [];
  const seenConnections = new Set<string>();
  for (const agent of agents) {
    for (const targetId of agent.connections) {
      const key = [agent.id, targetId].sort().join(':');
      if (seenConnections.has(key)) continue;
      seenConnections.add(key);
      const target = agentMap.get(targetId);
      const isActive = agent.status === 'active' || (target?.status === 'active');
      connections.push({ sourceId: agent.id, targetId, isActive });
    }
  }

  /* ── Interaction handlers ───────────────────────────────── */

  const handleNodePointerDown = useCallback((e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingNode(nodeId);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragDelta(0);
  }, []);

  const handleContainerPointerDown = useCallback((e: React.PointerEvent) => {
    // Only pan when clicking the background
    if ((e.target as HTMLElement).closest('.canvas-node')) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (draggingNode) {
      const dx = (e.clientX - dragStart.x) / viewport.zoom;
      const dy = (e.clientY - dragStart.y) / viewport.zoom;
      setDragDelta(prev => prev + Math.abs(dx) + Math.abs(dy));
      setDragStart({ x: e.clientX, y: e.clientY });
      setNodes(prev => prev.map(n =>
        n.id === draggingNode
          ? {
              ...n,
              x: Math.max(0, Math.min(CANVAS_W - NODE_W, n.x + dx)),
              y: Math.max(0, Math.min(CANVAS_H - NODE_H, n.y + dy)),
            }
          : n
      ));
    } else if (isPanning) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setDragStart({ x: e.clientX, y: e.clientY });
      setViewport(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    }
  }, [draggingNode, isPanning, dragStart, viewport.zoom]);

  const handlePointerUp = useCallback(() => {
    if (draggingNode && dragDelta < 5) {
      onSelectAgent(draggingNode);
    }
    setDraggingNode(null);
    setIsPanning(false);
    setDragDelta(0);
  }, [draggingNode, dragDelta, onSelectAgent]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(0.3, Math.min(3, prev.zoom + e.deltaY * -0.001)),
    }));
  }, []);

  const handleZoomIn = useCallback(() => {
    setViewport(prev => ({ ...prev, zoom: Math.min(3, prev.zoom + 0.2) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewport(prev => ({ ...prev, zoom: Math.max(0.3, prev.zoom - 0.2) }));
  }, []);

  const handleFitView = useCallback(() => {
    if (nodes.length === 0) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + NODE_W);
      maxY = Math.max(maxY, n.y + NODE_H);
    }

    const padding = 50;
    const contentW = maxX - minX + padding * 2;
    const contentH = maxY - minY + padding * 2;
    const zoom = Math.max(0.3, Math.min(2, Math.min(rect.width / contentW, rect.height / contentH)));
    const x = (rect.width - contentW * zoom) / 2 - (minX - padding) * zoom;
    const y = (rect.height - contentH * zoom) / 2 - (minY - padding) * zoom;

    setViewport({ x, y, zoom });
  }, [nodes]);

  const handleResetLayout = useCallback(() => {
    setNodes(computeForceLayout(agents));
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, [agents]);

  /* ── Status counts ──────────────────────────────────────── */

  const statusCounts = { active: 0, idle: 0, error: 0, processing: 0 };
  for (const a of agents) {
    statusCounts[a.status]++;
  }

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <div
      ref={containerRef}
      className="canvas-container"
      style={{ height: '500px' }}
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* SVG connection layer */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <g transform={`translate(${viewport.x},${viewport.y}) scale(${viewport.zoom})`}>
          {connections.map(conn => {
            const source = nodeMap.get(conn.sourceId);
            const target = nodeMap.get(conn.targetId);
            if (!source || !target) return null;
            const sx = source.x + NODE_W / 2;
            const sy = source.y + NODE_H / 2;
            const tx = target.x + NODE_W / 2;
            const ty = target.y + NODE_H / 2;
            return (
              <path
                key={`${conn.sourceId}-${conn.targetId}`}
                className="canvas-connection"
                data-active={conn.isActive ? '' : undefined}
                d={`M ${sx} ${sy} C ${sx + 50} ${sy}, ${tx - 50} ${ty}, ${tx} ${ty}`}
              />
            );
          })}
        </g>
      </svg>

      {/* Node layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {nodes.map(node => {
          const agent = agentMap.get(node.id);
          if (!agent) return null;
          return (
            <div
              key={node.id}
              className={css('_flex _col _gap1') + ' canvas-node d-surface'}
              data-interactive=""
              data-error={agent.status === 'error' ? '' : undefined}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: NODE_W,
                padding: '12px',
                cursor: draggingNode === node.id ? 'grabbing' : 'grab',
              }}
              onPointerDown={e => handleNodePointerDown(e, node.id)}
            >
              <div className={css('_flex _row _aic _gap2')}>
                <div
                  className="status-ring"
                  data-status={agent.status}
                  style={{ width: 32, height: 32, flexShrink: 0 }}
                />
                <span className={css('_fontbold _truncate _textsm')}>{agent.name}</span>
              </div>
              <div className={css('_flex _row _aic')}>
                <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                  {agent.model}
                </span>
              </div>
              <div className={css('_flex _row _gap3 _aic')}>
                <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                  Req: {agent.metrics.requests}
                </span>
                <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                  Lat: {agent.metrics.latency}ms
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status overlay -- top right */}
      <div className="canvas-status-overlay">
        {(['active', 'processing', 'error', 'idle'] as const).map(status => (
          statusCounts[status] > 0 && (
            <span key={status} className={css('_flex _row _aic _gap1 _px2 _py1 _roundedfull _textsm') + ' d-annotation'} data-status={
              status === 'active' ? 'success' : status === 'error' ? 'error' : status === 'processing' ? 'info' : 'warning'
            }>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: statusColor(status),
                display: 'inline-block',
                flexShrink: 0,
              }} />
              {statusCounts[status]} {status}
            </span>
          )
        ))}
      </div>

      {/* Control bar -- bottom center */}
      <div className="canvas-controls">
        <ControlButton icon={<ZoomIn size={16} />} label="Zoom in" onClick={handleZoomIn} />
        <ControlButton icon={<ZoomOut size={16} />} label="Zoom out" onClick={handleZoomOut} />
        <ControlButton icon={<Maximize size={16} />} label="Fit view" onClick={handleFitView} />
        <ControlButton
          icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
          label={isPlaying ? 'Pause' : 'Play'}
          onClick={() => setIsPlaying(p => !p)}
        />
        <ControlButton
          icon={<MapIcon size={16} />}
          label="Toggle minimap"
          onClick={() => setShowMinimap(p => !p)}
          isActive={showMinimap}
        />
        <ControlButton icon={<RotateCcw size={16} />} label="Reset layout" onClick={handleResetLayout} />
      </div>

      {/* Minimap -- bottom right */}
      {showMinimap && (
        <Minimap
          nodes={nodes}
          agents={agents}
          viewport={viewport}
          containerRef={containerRef}
        />
      )}
    </div>
  );
}

/* ── ControlButton ────────────────────────────────────────── */

function ControlButton({ icon, label, onClick, isActive }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}) {
  return (
    <button
      className={css('_flex _aic _jcc _p1 _rounded') + ' d-interactive'}
      style={{
        width: 32,
        height: 32,
        background: isActive ? 'var(--d-primary)' : 'transparent',
        color: isActive ? '#fff' : 'var(--d-text-muted)',
        border: 'none',
      }}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

/* ── Minimap ──────────────────────────────────────────────── */

function Minimap({ nodes, agents, viewport, containerRef }: {
  nodes: NodePosition[];
  agents: Agent[];
  viewport: { x: number; y: number; zoom: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const agentMap = new Map(agents.map(a => [a.id, a]));

  const mapW = 160;
  const mapH = 120;
  const scaleX = mapW / CANVAS_W;
  const scaleY = mapH / CANVAS_H;

  // Viewport rectangle
  const container = containerRef.current;
  const cw = container?.clientWidth ?? 800;
  const ch = container?.clientHeight ?? 500;

  const vpLeft = (-viewport.x / viewport.zoom) * scaleX;
  const vpTop = (-viewport.y / viewport.zoom) * scaleY;
  const vpW = (cw / viewport.zoom) * scaleX;
  const vpH = (ch / viewport.zoom) * scaleY;

  return (
    <div className="canvas-minimap">
      <svg width={mapW} height={mapH}>
        {/* Node dots */}
        {nodes.map(node => {
          const agent = agentMap.get(node.id);
          return (
            <circle
              key={node.id}
              cx={(node.x + NODE_W / 2) * scaleX}
              cy={(node.y + NODE_H / 2) * scaleY}
              r={4}
              fill={agent ? statusColor(agent.status) : 'var(--d-text-muted)'}
            />
          );
        })}

        {/* Viewport rectangle */}
        <rect
          x={Math.max(0, vpLeft)}
          y={Math.max(0, vpTop)}
          width={Math.min(mapW, vpW)}
          height={Math.min(mapH, vpH)}
          fill="none"
          stroke="var(--d-accent)"
          strokeWidth={1.5}
          rx={2}
        />
      </svg>
    </div>
  );
}
