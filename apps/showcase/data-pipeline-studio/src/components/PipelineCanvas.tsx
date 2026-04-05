import { useState, useRef, useCallback, useEffect } from 'react';
import type { PipelineNode, PipelineEdge, NodeType } from '@/data/mock';

const NODE_W = 140;
const NODE_H = 56;

const TYPE_COLOR: Record<NodeType, string> = {
  source: 'var(--d-accent)',
  filter: 'var(--d-warning)',
  transform: 'var(--d-primary)',
  join: 'var(--d-secondary)',
  sink: 'var(--d-primary)',
};

const TYPE_GLYPH: Record<NodeType, string> = {
  source: '[IN]',
  filter: '[FI]',
  transform: '[FX]',
  join: '[JN]',
  sink: '[OU]',
};

export function PipelineCanvas({
  nodes: initialNodes,
  edges,
  selectedId,
  onSelect,
  animated = true,
}: {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  animated?: boolean;
}) {
  const [nodes, setNodes] = useState(initialNodes);
  const [dragId, setDragId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [tick, setTick] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  useEffect(() => {
    if (!animated) return;
    const int = setInterval(() => setTick((t) => (t + 1) % 1000), 80);
    return () => clearInterval(int);
  }, [animated]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, node: PipelineNode) => {
      e.stopPropagation();
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setDragId(node.id);
      setOffset({ x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      onSelect?.(node.id);
    },
    [onSelect],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragId || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, e.clientX - rect.left - offset.x);
      const y = Math.max(0, e.clientY - rect.top - offset.y);
      setNodes((prev) => prev.map((n) => (n.id === dragId ? { ...n, x, y } : n)));
    },
    [dragId, offset],
  );

  const onPointerUp = useCallback(() => setDragId(null), []);

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div
      ref={canvasRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={() => onSelect?.('')}
      className="term-canvas term-scanlines"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 360,
        background: '#000',
        backgroundImage:
          'radial-gradient(circle, #0a2a0a 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        overflow: 'auto',
        border: '1px solid var(--d-border)',
        cursor: dragId ? 'grabbing' : 'default',
      }}
    >
      {/* Edges */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="var(--d-primary)" />
          </marker>
        </defs>
        {edges.map((edge) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) return null;
          const x1 = from.x + NODE_W;
          const y1 = from.y + NODE_H / 2;
          const x2 = to.x;
          const y2 = to.y + NODE_H / 2;
          const midX = (x1 + x2) / 2;
          const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
          return (
            <g key={edge.id}>
              <path
                d={path}
                stroke="var(--d-primary)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.55"
                markerEnd="url(#arrowhead)"
              />
              {animated && (
                <circle r="3" fill="var(--d-accent)">
                  <animateMotion dur="2.5s" repeatCount="indefinite" path={path} />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => {
        const color = TYPE_COLOR[node.type];
        const isSelected = selectedId === node.id;
        const isActive = animated && (tick + node.id.charCodeAt(node.id.length - 1)) % 10 < 3;
        return (
          <div
            key={node.id}
            onPointerDown={(e) => onPointerDown(e, node)}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: node.x,
              top: node.y,
              width: NODE_W,
              height: NODE_H,
              background: 'var(--d-bg)',
              border: `1px solid ${isSelected ? color : 'var(--d-border)'}`,
              outline: isSelected ? `1px solid ${color}` : 'none',
              outlineOffset: 2,
              padding: '0.375rem 0.5rem',
              cursor: dragId === node.id ? 'grabbing' : 'grab',
              userSelect: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: isActive ? `0 0 8px ${color}` : 'none',
              transition: 'box-shadow 120ms linear, border-color 120ms linear',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.65rem' }}>
              <span style={{ color, fontWeight: 700 }}>{TYPE_GLYPH[node.type]}</span>
              <span style={{ color: 'var(--d-text-muted)', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                {node.type}
              </span>
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--d-text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {node.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
