'use client';

import { useState } from 'react';

interface ComposeItem {
  archetype: string;
  role?: string;
}

interface Props {
  sections?: (string | ComposeItem)[];
}

const ROLE_COLORS: Record<string, string> = {
  primary: '#F58882',
  gateway: '#FDA303',
  auxiliary: '#00E0AB',
  public: '#0AF3EB',
};

function normalizeSection(item: string | ComposeItem): ComposeItem {
  return typeof item === 'string' ? { archetype: item, role: 'primary' } : item;
}

export function RouteMapCard({ sections }: Props) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  if (!sections || sections.length === 0) return null;

  const items = sections.map(normalizeSection);
  const cx = 100;
  const cy = 80;
  const r = 50;

  return (
    <div
      className="lum-bento-card flex flex-col gap-3"
      role="region"
      aria-label="Route topology"
    >
      <h3 className="d-label accent-left-border">Topology</h3>
      <svg
        viewBox="0 0 200 160"
        className="w-full"
        aria-label="Section topology diagram"
      >
        {/* Connection lines */}
        {items.map((item, i) => {
          const next = items[(i + 1) % items.length];
          const angle1 = (i / items.length) * Math.PI * 2 - Math.PI / 2;
          const angle2 = ((i + 1) / items.length) * Math.PI * 2 - Math.PI / 2;
          const x1 = cx + Math.cos(angle1) * r;
          const y1 = cy + Math.sin(angle1) * r;
          const x2 = cx + Math.cos(angle2) * r;
          const y2 = cy + Math.sin(angle2) * r;
          return (
            <line
              key={`line-${item.archetype}-${next.archetype}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--d-border)"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
          );
        })}

        {/* Nodes */}
        {items.map((item, i) => {
          const angle = (i / items.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          const fill = ROLE_COLORS[item.role || 'primary'] || ROLE_COLORS.primary;
          const initial = item.archetype.charAt(0).toUpperCase();
          const isHovered = hoveredNode === item.archetype;

          return (
            <g
              key={item.archetype}
              className="route-map-node cursor-pointer"
              onMouseEnter={() => setHoveredNode(item.archetype)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 16 : 14}
                fill={fill}
                opacity={0.9}
                className="transition-all"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#141414"
                fontSize="10"
                fontWeight="600"
              >
                {initial}
              </text>
              {isHovered && (
                <text
                  x={x}
                  y={y + 24}
                  textAnchor="middle"
                  fill="var(--d-text-muted)"
                  fontSize="7"
                >
                  {item.archetype}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
