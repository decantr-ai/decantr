import { useState, useRef, useEffect } from 'react';
import { graphNodes, graphEdges, type GraphNode } from '@/data/mock';

const nodeColors = {
  contact: '#a78bfa',
  company: '#60a5fa',
  deal: '#34d399',
};

export function RelationshipGraph({ height = 540 }: { height?: number }) {
  const [nodes, setNodes] = useState<GraphNode[]>(graphNodes);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const offset = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    function move(e: PointerEvent) {
      if (!dragId || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - offset.current.x;
      const y = e.clientY - rect.top - offset.current.y;
      setNodes(ns => ns.map(n => (n.id === dragId ? { ...n, x, y } : n)));
    }
    function up() { setDragId(null); }
    if (dragId) {
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    }
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [dragId]);

  function startDrag(e: React.PointerEvent, node: GraphNode) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y,
    };
    setDragId(node.id);
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      style={{ display: 'block', borderRadius: 'var(--d-radius)' }}
    >
      <defs>
        <radialGradient id="graph-glow">
          <stop offset="0%" stopColor="var(--d-accent)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--d-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Edges */}
      {graphEdges.map((edge, i) => {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) return null;
        const active = hoverId === edge.from || hoverId === edge.to;
        return (
          <g key={i}>
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={active ? 'var(--d-accent)' : 'rgba(255,255,255,0.12)'}
              strokeWidth={active ? 1.5 : 1}
              strokeDasharray={edge.strength < 0.5 ? '4 4' : undefined}
              style={{ transition: 'stroke 150ms ease' }}
            />
            {edge.label && active && (
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 4}
                fill="var(--d-text-muted)"
                fontSize="10"
                textAnchor="middle"
              >{edge.label}</text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const color = nodeColors[node.type];
        const isHover = hoverId === node.id;
        const radius = node.type === 'company' ? 28 : node.type === 'deal' ? 22 : 20;
        return (
          <g
            key={node.id}
            className="crm-graph-node"
            transform={`translate(${node.x}, ${node.y})`}
            onPointerDown={(e) => startDrag(e, node)}
            onPointerEnter={() => setHoverId(node.id)}
            onPointerLeave={() => setHoverId(null)}
          >
            <circle r={radius + 8} fill="url(#graph-glow)" opacity={isHover ? 1 : 0} style={{ transition: 'opacity 200ms ease' }} />
            <circle
              r={radius}
              fill={`${color}22`}
              stroke={color}
              strokeWidth={isHover ? 2 : 1.5}
              style={{ transition: 'all 150ms ease' }}
            />
            <text
              y={4}
              fill="var(--d-text)"
              fontSize="10"
              fontWeight="600"
              textAnchor="middle"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {node.label.length > 12 ? node.label.slice(0, 12) + '…' : node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
