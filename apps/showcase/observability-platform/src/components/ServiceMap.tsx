import { useState } from 'react';
import type { ServiceNode } from '@/data/mock';

interface ServiceMapProps {
  nodes: ServiceNode[];
  height?: number;
}

const NODE_W = 140;
const NODE_H = 54;

export function ServiceMap({ nodes, height = 500 }: ServiceMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const width = 1020;

  const getNode = (id: string) => nodes.find(n => n.id === id);
  const edges: { from: ServiceNode; to: ServiceNode }[] = [];
  nodes.forEach(node => {
    node.dependsOn.forEach(depId => {
      const to = getNode(depId);
      if (to) edges.push({ from: node, to });
    });
  });

  return (
    <div className="fin-surface" style={{ padding: '0.5rem', overflow: 'auto' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--d-border)" />
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--d-primary)" />
          </marker>
        </defs>
        {/* Edges */}
        {edges.map((e, i) => {
          const x1 = e.from.x + NODE_W;
          const y1 = e.from.y + NODE_H / 2;
          const x2 = e.to.x;
          const y2 = e.to.y + NODE_H / 2;
          const active = hovered === e.from.id || hovered === e.to.id;
          const mx = (x1 + x2) / 2;
          const path = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
          return (
            <path
              key={i}
              d={path}
              fill="none"
              stroke={active ? 'var(--d-primary)' : 'var(--d-border)'}
              strokeWidth={active ? 1.5 : 1}
              markerEnd={active ? 'url(#arrow-active)' : 'url(#arrow)'}
              opacity={active ? 1 : 0.7}
            />
          );
        })}
        {/* Nodes */}
        {nodes.map(n => (
          <g
            key={n.id}
            transform={`translate(${n.x},${n.y})`}
            onMouseEnter={() => setHovered(n.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect
              width={NODE_W}
              height={NODE_H}
              fill="var(--d-surface-raised)"
              stroke={hovered === n.id ? 'var(--d-primary)' : 'var(--d-border)'}
              strokeWidth={hovered === n.id ? 1.5 : 1}
              rx={2}
            />
            <rect
              width={3}
              height={NODE_H}
              fill={n.health === 'healthy' ? 'var(--d-success)' : n.health === 'degraded' ? 'var(--d-warning)' : n.health === 'critical' ? 'var(--d-error)' : 'var(--d-text-muted)'}
            />
            <text x={12} y={18} fontFamily="ui-monospace, monospace" fontSize="11" fontWeight="600" fill="var(--d-text)">{n.name}</text>
            <text x={12} y={32} fontFamily="ui-monospace, monospace" fontSize="9" fill="var(--d-text-muted)" textTransform="uppercase">{n.type}</text>
            <text x={12} y={46} fontFamily="ui-monospace, monospace" fontSize="9" fill="var(--d-text-muted)">
              <tspan fill="var(--d-text)">{n.p99}ms</tspan> p99 · <tspan fill={n.errorRate > 1 ? 'var(--d-error)' : n.errorRate > 0.5 ? 'var(--d-warning)' : 'var(--d-success)'}>{n.errorRate.toFixed(2)}%</tspan>
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
