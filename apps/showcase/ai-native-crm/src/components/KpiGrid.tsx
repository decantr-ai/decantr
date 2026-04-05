import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Kpi } from '@/data/mock';

export function KpiGrid({ items }: { items: Kpi[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 'var(--d-content-gap)',
    }}>
      {items.map(k => {
        const positive = k.change >= 0;
        return (
          <div key={k.label} className="glass-card" style={{ padding: '1.125rem' }}>
            <div className="d-label" style={{ fontSize: '0.65rem' }}>{k.label}</div>
            <div style={{
              fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem',
              fontFamily: 'var(--d-font-mono)',
            }}>
              {k.value}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.75rem', marginTop: '0.375rem',
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
