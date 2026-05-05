import { monthlyEmissions } from '@/data/mock';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

export function EmissionsChart() {
  const anim = useAnimatedValue(1, 1200);
  const maxVal = Math.max(...monthlyEmissions.map(m => m.scope1 + m.scope2 + m.scope3));
  const barWidth = 40;
  const gap = 16;
  const chartHeight = 200;
  const chartWidth = monthlyEmissions.length * (barWidth + gap);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${chartWidth + 60} ${chartHeight + 40}`} style={{ width: '100%', maxWidth: chartWidth + 60, height: 'auto' }}>
        {monthlyEmissions.map((m, i) => {
          const x = 40 + i * (barWidth + gap);
          const total = m.scope1 + m.scope2 + m.scope3;
          const h = (total / maxVal) * chartHeight * anim;
          const h1 = (m.scope1 / total) * h;
          const h2 = (m.scope2 / total) * h;
          const h3 = (m.scope3 / total) * h;
          const baseY = chartHeight;

          return (
            <g key={m.month}>
              <rect x={x} y={baseY - h3} width={barWidth} height={h3} rx={2} fill="#65A30D" opacity={0.7} />
              <rect x={x} y={baseY - h3 - h2} width={barWidth} height={h2} rx={0} fill="#D97706" opacity={0.7} />
              <rect x={x} y={baseY - h3 - h2 - h1} width={barWidth} height={h1} rx={2} fill="#DC2626" opacity={0.7} />
              <text x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" fontSize={10} fill="var(--d-text-muted)">
                {m.month}
              </text>
            </g>
          );
        })}
        {/* Y axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => (
          <g key={pct}>
            <line x1={35} y1={chartHeight * (1 - pct)} x2={chartWidth + 40} y2={chartHeight * (1 - pct)} stroke="var(--d-border)" strokeDasharray="4" />
            <text x={30} y={chartHeight * (1 - pct) + 4} textAnchor="end" fontSize={9} fill="var(--d-text-muted)">
              {Math.round(maxVal * pct)}
            </text>
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.75rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#DC2626', display: 'inline-block' }} /> Scope 1
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#D97706', display: 'inline-block' }} /> Scope 2
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#65A30D', display: 'inline-block' }} /> Scope 3
        </span>
      </div>
    </div>
  );
}
