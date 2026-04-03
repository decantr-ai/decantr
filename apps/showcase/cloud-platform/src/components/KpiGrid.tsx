import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiItem {
  label: string;
  value: string;
  change: number;
  icon: string;
}

interface KpiGridProps {
  items: KpiItem[];
}

export function KpiGrid({ items }: KpiGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--d-content-gap)' }}>
      {items.map(item => (
        <div key={item.label} className="d-surface lp-stat-glow" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>{item.label}</div>
          <div className="mono-data" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {item.value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {item.change >= 0 ? (
              <TrendingUp size={14} style={{ color: 'var(--d-success)' }} />
            ) : (
              <TrendingDown size={14} style={{ color: 'var(--d-error)' }} />
            )}
            <span
              className="d-annotation"
              data-status={item.change >= 0 ? 'success' : 'error'}
            >
              {item.change >= 0 ? '+' : ''}{item.change}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
