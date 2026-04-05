import type { ChartSeries } from '@/data/mock';

export function AreaChart({ series, height = 140 }: { series: ChartSeries[]; height?: number }) {
  const max = Math.max(...series.flatMap(s => s.values), 1);
  const count = series[0]?.values.length || 0;
  const width = 100;

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        {series.map((s, si) => {
          const points = s.values.map((v, i) => {
            const x = (i / (count - 1)) * width;
            const y = height - (v / max) * (height - 8) - 4;
            return `${x},${y}`;
          });
          const path = `M ${points.join(' L ')}`;
          const area = `${path} L ${width},${height} L 0,${height} Z`;
          return (
            <g key={si}>
              <path d={area} fill={s.color} opacity={0.12} />
              <path d={path} fill="none" stroke={s.color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        {series.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
