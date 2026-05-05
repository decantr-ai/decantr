import { Activity, Users, Zap, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import type { Kpi } from '@/data/mock';

const iconMap: Record<string, typeof Activity> = {
  'activity': Activity,
  'users': Users,
  'zap': Zap,
  'dollar-sign': DollarSign,
};

export function KpiGrid({ kpis }: { kpis: Kpi[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
      {kpis.map(kpi => {
        const Icon = iconMap[kpi.icon] || Activity;
        const positive = kpi.change >= 0;
        return (
          <div key={kpi.label} className="lp-stat-glow d-surface" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontWeight: 500 }}>{kpi.label}</span>
              <Icon size={16} style={{ color: 'var(--d-text-muted)' }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--d-text)', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', fontVariantNumeric: 'tabular-nums' }}>
              {kpi.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.75rem', color: positive ? 'var(--d-success)' : 'var(--d-error)' }}>
              {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {positive ? '+' : ''}{kpi.change}%
              <span style={{ color: 'var(--d-text-muted)' }}>vs last period</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
