import { useState, useEffect, useRef } from 'react';
import { budgetCategories, totalBudget } from '@/data/mock';

interface SankeyNode {
  label: string;
  value: number;
  color: string;
  x: number;
  y: number;
  height: number;
}

export function BudgetSankey() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredFlow, setHoveredFlow] = useState<string | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const width = 800;
  const height = 400;
  const padding = 40;
  const nodeWidth = 24;

  // Source node (Total Revenue)
  const sourceNode: SankeyNode = {
    label: 'Total Revenue',
    value: totalBudget,
    color: '#1D4ED8',
    x: padding,
    y: padding,
    height: height - 2 * padding,
  };

  // Category nodes (right side)
  const totalAllocated = budgetCategories.reduce((sum, c) => sum + c.allocated, 0);
  let currentY = padding;
  const gap = 6;
  const availableHeight = height - 2 * padding - (budgetCategories.length - 1) * gap;

  const categoryNodes: SankeyNode[] = budgetCategories.map(cat => {
    const nodeHeight = (cat.allocated / totalAllocated) * availableHeight;
    const node: SankeyNode = {
      label: cat.name,
      value: cat.allocated,
      color: cat.color,
      x: width - padding - nodeWidth,
      y: currentY,
      height: nodeHeight,
    };
    currentY += nodeHeight + gap;
    return node;
  });

  // Generate curved paths
  function generatePath(srcY: number, srcH: number, dstY: number, dstH: number) {
    const x1 = sourceNode.x + nodeWidth;
    const x2 = width - padding - nodeWidth;
    const cx = (x1 + x2) / 2;
    return `
      M ${x1} ${srcY}
      C ${cx} ${srcY}, ${cx} ${dstY}, ${x2} ${dstY}
      L ${x2} ${dstY + dstH}
      C ${cx} ${dstY + dstH}, ${cx} ${srcY + srcH}, ${x1} ${srcY + srcH}
      Z
    `;
  }

  let srcCurrentY = sourceNode.y;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', maxWidth: width, height: 'auto' }}
        role="img"
        aria-label="Budget flow diagram showing how total revenue is allocated to city departments"
      >
        {/* Source node */}
        <rect
          x={sourceNode.x}
          y={sourceNode.y}
          width={nodeWidth}
          height={animated ? sourceNode.height : 0}
          fill={sourceNode.color}
          rx={2}
          style={{ transition: 'height 0.8s ease' }}
        />
        <text
          x={sourceNode.x + nodeWidth / 2}
          y={sourceNode.y - 8}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill="var(--d-text)"
        >
          Revenue
        </text>

        {/* Flows and category nodes */}
        {categoryNodes.map((cat, i) => {
          const srcH = (budgetCategories[i].allocated / totalAllocated) * sourceNode.height;
          const srcY = srcCurrentY;
          srcCurrentY += srcH;
          const isHovered = hoveredFlow === cat.label;

          return (
            <g key={cat.label}>
              {/* Flow path */}
              <path
                d={generatePath(srcY, srcH, cat.y, cat.height)}
                fill={cat.color}
                opacity={animated ? (hoveredFlow && !isHovered ? 0.15 : 0.35) : 0}
                style={{ transition: 'opacity 0.6s ease' }}
                onMouseEnter={() => setHoveredFlow(cat.label)}
                onMouseLeave={() => setHoveredFlow(null)}
              />
              {/* Category node */}
              <rect
                x={cat.x}
                y={cat.y}
                width={nodeWidth}
                height={animated ? cat.height : 0}
                fill={cat.color}
                rx={2}
                style={{ transition: 'height 0.8s ease' }}
              />
              {/* Category label */}
              <text
                x={cat.x + nodeWidth + 8}
                y={cat.y + cat.height / 2 + 4}
                fontSize={11}
                fontWeight={isHovered ? 700 : 500}
                fill="var(--d-text)"
                style={{ transition: 'font-weight 0.15s ease' }}
              >
                {cat.label}
              </text>
              <text
                x={cat.x + nodeWidth + 8}
                y={cat.y + cat.height / 2 + 18}
                fontSize={10}
                fill="var(--d-text-muted)"
              >
                ${(budgetCategories[i].allocated / 1_000_000).toFixed(1)}M
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
