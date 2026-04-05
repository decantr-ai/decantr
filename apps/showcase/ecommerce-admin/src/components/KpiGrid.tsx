import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Kpi } from '@/data/mock';

export function KpiGrid({ items }: { items: Kpi[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 'var(--d-content-gap)',
    }}>
      {items.map(k => {
        const positive = k.change >= 0;
        return (
          <div
            key={k.label}
            className="ea-card ea-kpi-accent"
            style={{ padding: '1rem' }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {k.label}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.375rem', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>
              {k.value}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              marginTop: '0.375rem',
              color: positive ? 'var(--d-success)' : 'var(--d-error)',
            }}>
              {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {positive ? '+' : ''}{k.change}%
              <span style={{ color: 'var(--d-text-muted)', marginLeft: '0.25rem' }}>vs prev</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
