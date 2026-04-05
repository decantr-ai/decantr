import type { Allocation } from '@/data/mock';

interface DonutChartProps {
  items: Allocation[];
  size?: number;
  stroke?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ items, size = 180, stroke = 22, centerLabel, centerValue }: DonutChartProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--d-surface-raised)"
          strokeWidth={stroke}
        />
        {items.map(item => {
          const dash = (item.pct / 100) * circumference;
          const segment = (
            <circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              style={{ transition: 'stroke-dashoffset 400ms ease' }}
            />
          );
          offset += dash;
          return segment;
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}>
          {centerLabel && <div className="d-label" style={{ fontSize: '0.65rem' }}>{centerLabel}</div>}
          {centerValue && <div className="fd-mono" style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '0.25rem' }}>{centerValue}</div>}
        </div>
      )}
    </div>
  );
}
