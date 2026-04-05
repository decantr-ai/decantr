import type { MetricKpi } from '@/data/mock';
import { Sparkline } from './Sparkline';

export function MetricKpiGrid({ items }: { items: MetricKpi[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
      {items.map(item => {
        const pos = item.change >= 0;
        // Latency & error rate: positive change = bad
        const inverted = /latency|error|alert|mttr/i.test(item.label);
        const good = inverted ? !pos : pos;
        const trend = good ? 'up' : 'down';
        const color = good ? 'var(--d-success)' : 'var(--d-error)';
        return (
          <div key={item.label} className="fin-card">
            <div className="fin-label" style={{ marginBottom: 6 }}>{item.label}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div>
                <div className="fin-metric" data-trend="flat">
                  {item.value}
                  {item.unit && <span style={{ fontSize: '0.7em', color: 'var(--d-text-muted)', marginLeft: 4 }}>{item.unit}</span>}
                </div>
                <div style={{ marginTop: 4, fontSize: '0.7rem', fontFamily: 'ui-monospace, monospace', color, fontVariantNumeric: 'tabular-nums' }}>
                  {pos ? '+' : ''}{item.change.toFixed(1)}% <span style={{ color: 'var(--d-text-muted)' }}>{trend === 'up' ? '↑' : '↓'}</span>
                </div>
              </div>
              <Sparkline data={item.sparkline} color={color} width={72} height={28} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
