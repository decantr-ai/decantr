import type { ValuationPoint } from '@/data/mock';

interface ValuationChartProps {
  data: ValuationPoint[];
  height?: number;
}

export function ValuationChart({ data, height = 200 }: ValuationChartProps) {
  const width = 600;
  const allValues = data.flatMap(d => [d.low, d.high]);
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const padding = (max - min) * 0.1;
  const yMax = max + padding;
  const yMin = min - padding;
  const range = yMax - yMin || 1;

  const stepX = width / (data.length - 1 || 1);

  const mainPoints = data.map((d, i) => ({
    x: i * stepX,
    y: height - ((d.value - yMin) / range) * height,
  }));
  const highPoints = data.map((d, i) => ({
    x: i * stepX,
    y: height - ((d.high - yMin) / range) * height,
  }));
  const lowPoints = data.map((d, i) => ({
    x: i * stepX,
    y: height - ((d.low - yMin) / range) * height,
  }));

  const mainPath = mainPoints.map((p, i) => (i === 0 ? 'M' : 'L') + ` ${p.x} ${p.y}`).join(' ');
  const bandPath = highPoints.map((p, i) => (i === 0 ? 'M' : 'L') + ` ${p.x} ${p.y}`).join(' ')
    + ' ' + [...lowPoints].reverse().map((p, i) => (i === 0 ? 'L' : 'L') + ` ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
        <defs>
          <linearGradient id="val-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--d-primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--d-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

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
            opacity="0.35"
          />
        ))}

        {/* Confidence band */}
        <path d={bandPath} fill="var(--d-primary)" className="fo-confidence-band" />

        {/* Area fill */}
        <path
          d={mainPath + ` L ${width} ${height} L 0 ${height} Z`}
          fill="url(#val-grad)"
        />

        {/* Main line */}
        <path
          d={mainPath}
          fill="none"
          stroke="var(--d-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
        {data.map((d, i) => (
          <div key={i} style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
            {d.date}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
          <span style={{ width: 10, height: 2, background: 'var(--d-primary)', display: 'inline-block' }} />
          NAV
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
          <span style={{ width: 10, height: 6, background: 'var(--d-primary)', opacity: 0.12, display: 'inline-block', borderRadius: 1 }} />
          Confidence Band
        </div>
      </div>
    </div>
  );
}
