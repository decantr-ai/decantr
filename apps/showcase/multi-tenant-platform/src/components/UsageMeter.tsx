import type { UsageMeter as UM } from '@/data/mock';

export function UsageMeterList({ meters }: { meters: UM[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {meters.map(m => {
        const pct = (m.value / m.limit) * 100;
        const level = pct > 90 ? 'critical' : pct > 70 ? 'warn' : 'safe';
        const formatted = m.value >= 1000 ? `${(m.value / 1000).toFixed(1)}K` : m.value.toString();
        const limitFormatted = m.limit >= 1000 ? `${(m.limit / 1000).toFixed(0)}K` : m.limit.toString();
        return (
          <div key={m.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--d-text)', fontWeight: 500 }}>{m.label}</span>
              <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                <span style={{ color: 'var(--d-text)', fontWeight: 600 }}>{formatted}{m.unit}</span> / {limitFormatted}{m.unit}
                <span style={{ marginLeft: '0.5rem', color: level === 'critical' ? 'var(--d-error)' : level === 'warn' ? 'var(--d-warning)' : 'var(--d-text-muted)' }}>
                  {pct.toFixed(0)}%
                </span>
              </span>
            </div>
            <div className="lp-gauge-track">
              <div className="lp-gauge-fill" data-level={level} style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
