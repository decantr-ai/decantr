import type { ChartDef } from '@/data/mock';

interface ChartProps {
  chart: ChartDef;
  height?: number;
}

export function Chart({ chart, height = 160 }: ChartProps) {
  const allValues = chart.series.flatMap(s => s.values);
  const max = Math.max(...allValues);
  const min = Math.min(0, ...allValues);

  if (chart.type === 'bar') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.375rem', height, padding: '0.25rem 0' }}>
          {chart.series[0].values.map((v, i) => {
            const h = ((v - min) / (max - min)) * 100;
            return (
              <div
                key={i}
                className="sd-chart-bar"
                style={{ flex: 1, height: `${h}%`, minHeight: 4 }}
                title={`${chart.labels[i]}: ${v.toLocaleString()}`}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem' }}>
          {chart.labels.map((l, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
              {l}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // area / line — SVG
  const width = 600;
  const series = chart.series[0];
  const range = max - min || 1;
  const stepX = width / (series.values.length - 1 || 1);
  const points = series.values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return { x, y };
  });
  const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + ` ${p.x} ${p.y}`).join(' ');
  const areaD = pathD + ` L ${width} ${height} L 0 ${height} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
        <defs>
          <linearGradient id={`grad-${chart.title}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={series.color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={series.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {chart.type === 'area' && (
          <path d={areaD} fill={`url(#grad-${chart.title})`} />
        )}
        <path d={pathD} fill="none" stroke={series.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={series.color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem' }}>
        {chart.labels.map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
