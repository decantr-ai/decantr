import type { UsageMeter as UsageMeterData } from '@/data/mock';

interface UsageMeterProps {
  meter: UsageMeterData;
}

function formatValue(v: number): string {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(v >= 10000 ? 0 : 1) + 'K';
  return v.toString();
}

export function UsageMeterBar({ meter }: UsageMeterProps) {
  const pct = Math.min(100, (meter.value / meter.limit) * 100);
  const level: 'safe' | 'warn' | 'critical' = pct >= 90 ? 'critical' : pct >= 75 ? 'warn' : 'safe';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.375rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{meter.label}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>
          {formatValue(meter.value)} / {formatValue(meter.limit)} {meter.unit}
        </span>
      </div>
      <div className="sd-gauge-track">
        <div className="sd-gauge-fill" data-level={level} style={{ width: `${pct}%` }} />
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
        {pct.toFixed(0)}% used
      </div>
    </div>
  );
}
