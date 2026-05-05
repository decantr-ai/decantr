import type { ChartDef } from '@/data/mock';

export function Chart({ chart }: { chart: ChartDef }) {
  const values = chart.series[0]?.values ?? [];
  const max = Math.max(...values, 1);
  const color = chart.series[0]?.color ?? 'var(--d-accent)';

  if (chart.type === 'bar') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 160, padding: '0.5rem 0' }}>
          {values.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', height: '100%', justifyContent: 'flex-end' }}>
              <div
                className="ea-chart-bar"
                style={{
                  width: '100%',
                  height: `${(v / max) * 100}%`,
                  background: `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 50%, transparent))`,
                }}
                title={`${chart.labels[i]}: ${v.toLocaleString()}`}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
          {chart.labels.map((l, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>{l}</div>
          ))}
        </div>
      </div>
    );
  }

  // area / line
  const width = 100;
  const height = 40;
  const step = width / Math.max(values.length - 1, 1);
  const points = values.map((v, i) => `${i * step},${height - (v / max) * height}`).join(' ');
  const areaPath = `M 0,${height} L ${points.split(' ').join(' L ')} L ${width},${height} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: 160 }}>
        {chart.type === 'area' && (
          <path d={areaPath} fill={color} opacity="0.2" />
        )}
        <polyline points={points} fill="none" stroke={color} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {values.map((v, i) => (
          <circle key={i} cx={i * step} cy={height - (v / max) * height} r="1" fill={color} />
        ))}
      </svg>
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
        {chart.labels.map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>{l}</div>
        ))}
      </div>
    </div>
  );
}
