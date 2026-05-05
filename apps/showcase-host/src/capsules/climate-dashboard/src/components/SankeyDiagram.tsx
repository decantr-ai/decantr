import { sankeyNodes, sankeyLinks } from '@/data/mock';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

export function SankeyDiagram() {
  const animProgress = useAnimatedValue(1, 1500);

  const sources = sankeyNodes.filter(n => !['scope1', 'scope2', 'scope3'].includes(n.id));
  const scopes = sankeyNodes.filter(n => ['scope1', 'scope2', 'scope3'].includes(n.id));
  const totalValue = scopes.reduce((sum, s) => sum + s.value, 0);

  const width = 700;
  const height = 360;
  const nodeWidth = 18;
  const padding = 12;

  // Position sources on left
  const sourceTotal = sources.reduce((sum, s) => sum + s.value, 0);
  let sourceY = padding;
  const sourcePositions = sources.map(s => {
    const h = Math.max(20, (s.value / sourceTotal) * (height - padding * 2 - (sources.length - 1) * 6));
    const pos = { ...s, x: 40, y: sourceY, h };
    sourceY += h + 6;
    return pos;
  });

  // Position scopes on right
  let scopeY = padding;
  const scopePositions = scopes.map(s => {
    const h = Math.max(20, (s.value / totalValue) * (height - padding * 2 - (scopes.length - 1) * 10));
    const pos = { ...s, x: width - 40 - nodeWidth, y: scopeY, h };
    scopeY += h + 10;
    return pos;
  });

  // Track flow offsets for stacking
  const sourceFlowOffsets: Record<string, number> = {};
  sourcePositions.forEach(s => { sourceFlowOffsets[s.id] = 0; });
  const scopeFlowOffsets: Record<string, number> = {};
  scopePositions.forEach(s => { scopeFlowOffsets[s.id] = 0; });

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: width, height: 'auto' }}>
        <defs>
          {sankeyLinks.map((link, i) => {
            const source = sourcePositions.find(s => s.id === link.source);
            const target = scopePositions.find(s => s.id === link.target);
            if (!source || !target) return null;
            return (
              <linearGradient key={i} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={source.color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={target.color} stopOpacity={0.5} />
              </linearGradient>
            );
          })}
        </defs>

        {/* Links */}
        {sankeyLinks.map((link, i) => {
          const source = sourcePositions.find(s => s.id === link.source);
          const target = scopePositions.find(s => s.id === link.target);
          if (!source || !target) return null;

          const sourceRef = sources.find(s => s.id === link.source);
          const targetRef = scopes.find(s => s.id === link.target);
          if (!sourceRef || !targetRef) return null;

          const linkH_src = (link.value / sourceRef.value) * source.h;
          const linkH_tgt = (link.value / targetRef.value) * target.h;
          const srcOff = sourceFlowOffsets[link.source];
          const tgtOff = scopeFlowOffsets[link.target];
          sourceFlowOffsets[link.source] += linkH_src;
          scopeFlowOffsets[link.target] += linkH_tgt;

          const x0 = source.x + nodeWidth;
          const y0 = source.y + srcOff + linkH_src / 2;
          const x1 = target.x;
          const y1 = target.y + tgtOff + linkH_tgt / 2;
          const midX = (x0 + x1) / 2;
          const thickness = Math.max(2, ((linkH_src + linkH_tgt) / 2) * animProgress);

          return (
            <path
              key={i}
              d={`M${x0},${y0} C${midX},${y0} ${midX},${y1} ${x1},${y1}`}
              fill="none"
              stroke={`url(#grad-${i})`}
              strokeWidth={thickness}
              opacity={0.6 * animProgress}
            />
          );
        })}

        {/* Source nodes */}
        {sourcePositions.map(s => (
          <g key={s.id}>
            <rect
              x={s.x} y={s.y}
              width={nodeWidth} height={s.h * animProgress}
              rx={4}
              fill={s.color}
              opacity={0.85}
            />
            <text
              x={s.x - 6}
              y={s.y + (s.h * animProgress) / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={10}
              fill="var(--d-text)"
            >
              {s.label}
            </text>
          </g>
        ))}

        {/* Scope nodes */}
        {scopePositions.map(s => (
          <g key={s.id}>
            <rect
              x={s.x} y={s.y}
              width={nodeWidth} height={s.h * animProgress}
              rx={4}
              fill={s.color}
              opacity={0.85}
            />
            <text
              x={s.x + nodeWidth + 8}
              y={s.y + (s.h * animProgress) / 2}
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={600}
              fill="var(--d-text)"
            >
              {s.label} ({s.value.toLocaleString()})
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
