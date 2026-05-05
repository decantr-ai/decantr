import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Kpi } from '@/data/mock';

interface KpiGridProps {
  items: Kpi[];
}

export function KpiGrid({ items }: KpiGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--d-content-gap)' }}>
      {items.map(item => (
        <div key={item.label} className="fd-card fd-kpi-accent" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>{item.label}</div>
          <div className="fd-mono" style={{ fontSize: '1.625rem', fontWeight: 700, marginBottom: '0.375rem', letterSpacing: '-0.01em' }}>
            {item.value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {item.change >= 0 ? (
              <TrendingUp size={13} style={{ color: 'var(--d-success)' }} />
            ) : (
              <TrendingDown size={13} style={{ color: 'var(--d-error)' }} />
            )}
            <span className="fd-mono" style={{ fontSize: '0.75rem', color: item.change >= 0 ? 'var(--d-success)' : 'var(--d-error)', fontWeight: 500 }}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </span>
            {item.changeAbs && (
              <span className="fd-mono" style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{item.changeAbs}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
