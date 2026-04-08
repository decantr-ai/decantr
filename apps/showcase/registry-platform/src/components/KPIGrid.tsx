import { useState, useEffect, useRef } from 'react';
import { type KPI } from '../data/mock';

interface KPIGridProps {
  kpis: KPI[];
}

const ICON_MAP: Record<string, string> = {
  grid: '▦',
  palette: '◆',
  layout: '⊞',
  download: '↓',
  package: '◫',
  activity: '⚡',
  star: '★',
  dollar: '$',
  database: '⬡',
  users: '⊕',
  mail: '✉',
};

function useCountUp(target: number, duration: number = 500): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}

function KPICard({ kpi, index }: { kpi: KPI; index: number }) {
  const animatedValue = useCountUp(kpi.value, 500);
  const isPositive = kpi.trend >= 0;
  const trendStatus = isPositive ? 'success' : 'error';

  function formatValue(val: number): string {
    if (kpi.value >= 10000) {
      return `${(val / 1000).toFixed(val >= kpi.value ? 1 : 0)}k`;
    }
    if (kpi.label.includes('Storage')) {
      return `${(val / kpi.value * kpi.value).toFixed(1)}`;
    }
    return String(val);
  }

  return (
    <div
      className="d-surface lum-fade-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--d-gap-3)',
        animationDelay: `${index * 80}ms`,
        animationFillMode: 'backwards',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {/* Icon circle */}
        <div className="lum-stat-glow" style={{ width: 44, height: 44, fontSize: '1rem' }}>
          {ICON_MAP[kpi.icon] ?? '●'}
        </div>

        {/* Trend badge */}
        <span className="d-annotation" data-status={trendStatus}>
          {isPositive ? '↑' : '↓'} {Math.abs(kpi.trend)}%
        </span>
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}
      >
        {kpi.label.includes('Spend') && '$'}
        {kpi.value >= 10000
          ? `${(animatedValue / 1000).toFixed(animatedValue >= kpi.value ? 1 : 0)}k`
          : kpi.label.includes('Storage')
            ? kpi.value.toFixed(1)
            : animatedValue.toLocaleString()}
        {kpi.label.includes('Storage') && ' GB'}
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: '0.8125rem',
          color: 'var(--d-text-muted)',
          fontWeight: 400,
        }}
      >
        {kpi.label}
      </div>
    </div>
  );
}

export function KPIGrid({ kpis }: KPIGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--d-gap-4)',
      }}
    >
      {kpis.map((kpi, i) => (
        <KPICard key={kpi.label} kpi={kpi} index={i} />
      ))}
    </div>
  );
}
