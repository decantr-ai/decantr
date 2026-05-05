import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Kpi } from '@/data/mock';

interface KpiGridProps {
  items: Kpi[];
}

export function KpiGrid({ items }: KpiGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--d-content-gap)' }}>
      {items.map(item => (
        <div key={item.label} className="sd-card sd-kpi-accent" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>{item.label}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>
            {item.value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {item.change >= 0 ? (
              <TrendingUp size={13} style={{ color: 'var(--d-success)' }} />
            ) : (
              <TrendingDown size={13} style={{ color: 'var(--d-error)' }} />
            )}
            <span
              className="d-annotation"
              data-status={item.change >= 0 ? 'success' : 'error'}
            >
              {item.change >= 0 ? '+' : ''}{item.change}%
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>vs last period</span>
          </div>
        </div>
      ))}
    </div>
  );
}
