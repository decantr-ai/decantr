'use client';

import { BentoCard } from './bento-card';

const ROLE_COLORS: Record<string, string> = {
  primary: '#F58882',
  gateway: '#FDA303',
  auxiliary: '#00E0AB',
  public: '#0AF3EB',
};

interface Section {
  id?: string;
  archetype?: string;
  role?: string;
}

interface RouteMapCardProps {
  sections?: Section[];
}

export function RouteMapCard({ sections }: RouteMapCardProps) {
  if (!sections || sections.length < 2) return null;

  const r = 55;
  const cx = 80;
  const cy = 80;
  const nodes = sections.map((s, i) => {
    const angle = (2 * Math.PI * i) / sections.length - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      label: (s.id || s.archetype || '?')[0].toUpperCase(),
      id: s.id || s.archetype || `section-${i}`,
      color: ROLE_COLORS[s.role || ''] || '#A1A1AA',
    };
  });

  return (
    <BentoCard span={1} label="Route map">
      <p className="d-label mb-2">Topology</p>
      <svg
        viewBox="0 0 160 160"
        className="w-full"
        aria-label="Section topology diagram"
      >
        {/* Connection lines */}
        {nodes.map((a, i) =>
          nodes.slice(i + 1).map((b, j) => (
            <line
              key={`${i}-${j}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--d-border)"
              strokeWidth="1"
              opacity="0.5"
            />
          ))
        )}
        {/* Nodes */}
        {nodes.map((node, i) => (
          <g key={i}>
            <circle
              cx={node.x}
              cy={node.y}
              r="16"
              fill={node.color}
              opacity="0.2"
            >
              <animate
                attributeName="r"
                values="16;17;16"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx={node.x} cy={node.y} r="10" fill={node.color} />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#141414"
              fontSize="9"
              fontWeight="600"
            >
              {node.label}
            </text>
            <title>{node.id}</title>
          </g>
        ))}
      </svg>
    </BentoCard>
  );
}
