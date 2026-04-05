import type { ChartDef } from '@/data/mock';

interface ChartProps {
  chart: ChartDef;
  height?: number;
}

export function Chart({ chart, height = 180 }: ChartProps) {
  const allValues = chart.series.flatMap(s => s.values);
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const padding = (max - min) * 0.1 || 1;
  const yMax = max + padding;
  const yMin = Math.max(0, min - padding);

  if (chart.type === 'bar') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.375rem', height, padding: '0.25rem 0' }}>
          {chart.series[0].values.map((v, i) => {
            const h = ((v - yMin) / (yMax - yMin)) * 100;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  minHeight: 4,
                  background: `linear-gradient(180deg, ${chart.series[0].color}, color-mix(in srgb, ${chart.series[0].color} 40%, transparent))`,
                  borderRadius: 'var(--d-radius-sm) var(--d-radius-sm) 0 0',
                  transition: 'opacity 150ms ease',
                }}
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

  // area / line — SVG (supports multiple series)
  const width = 600;
  const range = yMax - yMin || 1;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
        <defs>
          {chart.series.map((s, si) => (
            <linearGradient key={si} id={`grad-${chart.title.replace(/\s+/g, '-')}-${si}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* baseline grid */}
        {[0.25, 0.5, 0.75].map(frac => (
          <line
            key={frac}
            x1="0"
            x2={width}
            y1={height * frac}
            y2={height * frac}
            stroke="var(--d-border)"
            strokeWidth="1"
            strokeDasharray="2 4"
            opacity="0.4"
          />
        ))}

        {chart.series.map((s, si) => {
          const stepX = width / (s.values.length - 1 || 1);
          const points = s.values.map((v, i) => {
            const x = i * stepX;
            const y = height - ((v - yMin) / range) * height;
            return { x, y };
          });
          const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + ` ${p.x} ${p.y}`).join(' ');
          const areaD = pathD + ` L ${width} ${height} L 0 ${height} Z`;
          return (
            <g key={si}>
              {chart.type === 'area' && (
                <path d={areaD} fill={`url(#grad-${chart.title.replace(/\s+/g, '-')}-${si})`} />
              )}
              <path
                d={pathD}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem' }}>
        {chart.labels.map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
            {l}
          </div>
        ))}
      </div>
      {chart.series.length > 1 && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', justifyContent: 'center' }}>
          {chart.series.map((s, si) => (
            <div key={si} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
              <span style={{ width: 10, height: 2, background: s.color, display: 'inline-block' }} />
              {s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
