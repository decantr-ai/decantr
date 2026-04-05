interface LineChartProps {
  title: string;
  data: number[];
  unit: string;
  color?: string;
  height?: number;
}

export function LineChart({ title, data, unit, color = 'var(--d-primary)', height = 120 }: LineChartProps) {
  if (!data.length) return null;
  const width = 360;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 10) - 5;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = 'M' + points.join(' L');
  const area = `${path} L${(data.length - 1) * step},${height} L0,${height} Z`;
  const current = data[data.length - 1];
  const prev = data[data.length - 2] ?? current;
  const delta = current - prev;

  return (
    <div className="fin-card">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <div className="fin-label">{title}</div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
          <span className="fin-metric" data-size="sm" style={{ color }}>
            {typeof current === 'number' ? current.toLocaleString(undefined, { maximumFractionDigits: 2 }) : current}
          </span>
          <span className="fin-label">{unit}</span>
          <span style={{ fontSize: '0.65rem', fontFamily: 'ui-monospace, monospace', color: delta >= 0 ? 'var(--d-success)' : 'var(--d-error)', fontVariantNumeric: 'tabular-nums' }}>
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="fin-chart" style={{ height }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ position: 'relative', zIndex: 1 }}>
          <path d={area} fill={color} opacity={0.12} />
          <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
