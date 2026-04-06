import { useState, useCallback } from 'react';
import { css } from '@decantr/css';
import { buildCitationGraph, type GraphNode, type GraphEdge } from '../data/mock';

const STATUS_COLORS: Record<string, string> = {
  'good-law': 'var(--d-success)',
  'caution': 'var(--d-warning)',
  'overruled': 'var(--d-error)',
  'superseded': 'var(--d-text-muted)',
};

interface CitationGraphProps {
  caseIds?: string[];
  onNodeClick?: (id: string) => void;
  height?: number;
}

export function CitationGraph({ caseIds, onNodeClick, height = 360 }: CitationGraphProps) {
  const { nodes, edges } = buildCitationGraph(caseIds);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const map: Record<string, { x: number; y: number }> = {};
    for (const n of nodes) map[n.id] = { x: n.x, y: n.y };
    return map;
  });

  const getPos = (id: string) => positions[id] || { x: 0, y: 0 };

  const handlePointerDown = useCallback((id: string) => {
    setDragNode(id);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragNode) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPositions((prev) => ({ ...prev, [dragNode]: { x, y } }));
  }, [dragNode]);

  const handlePointerUp = useCallback(() => {
    setDragNode(null);
  }, []);

  return (
    <div style={{ border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', background: 'var(--d-surface)', overflow: 'hidden' }}>
      <div className={css('_flex _aic _jcsb')} style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--d-border)' }}>
        <span className="d-label">Citation Network</span>
        <div className={css('_flex _aic _gap3')}>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <span key={status} className={css('_flex _aic _gap1')} style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
              {status.replace('-', ' ')}
            </span>
          ))}
        </div>
      </div>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 900 ${height}`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: dragNode ? 'grabbing' : 'default' }}
      >
        {/* Edges */}
        {edges.map((edge, i) => {
          const from = getPos(edge.from);
          const to = getPos(edge.to);
          const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to;
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isHighlighted ? 'var(--d-primary)' : 'var(--d-border)'}
              strokeWidth={isHighlighted ? 2 : 1}
              markerEnd="url(#arrowhead)"
              style={{ transition: 'stroke 0.15s ease, stroke-width 0.15s ease' }}
            />
          );
        })}

        {/* Arrow marker */}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="var(--d-border)" />
          </marker>
        </defs>

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = getPos(node.id);
          const isHovered = hoveredNode === node.id;
          const statusColor = STATUS_COLORS[node.status] || 'var(--d-border)';
          return (
            <g
              key={node.id}
              onPointerDown={() => handlePointerDown(node.id)}
              onPointerEnter={() => setHoveredNode(node.id)}
              onPointerLeave={() => setHoveredNode(null)}
              onClick={() => onNodeClick?.(node.id)}
              style={{ cursor: dragNode === node.id ? 'grabbing' : 'grab' }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? 32 : 28}
                fill="var(--d-surface)"
                stroke={isHovered ? 'var(--d-primary)' : statusColor}
                strokeWidth={isHovered ? 2.5 : 1.5}
                style={{ transition: 'r 0.15s ease, stroke-width 0.15s ease', filter: isHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' : undefined }}
              />
              <text
                x={pos.x}
                y={pos.y - 4}
                textAnchor="middle"
                fill="var(--d-text)"
                fontSize="8"
                fontFamily="Georgia, serif"
                fontWeight={600}
              >
                {node.label}
              </text>
              <text
                x={pos.x}
                y={pos.y + 8}
                textAnchor="middle"
                fill="var(--d-text-muted)"
                fontSize="6.5"
                fontFamily="ui-monospace, monospace"
              >
                {node.citation.length > 22 ? node.citation.slice(0, 20) + '...' : node.citation}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
