import { Briefcase, TrendingUp, TrendingDown, FileText, MessageCircle } from 'lucide-react';
import type { Kpi } from '@/data/mock';

const iconMap: Record<string, typeof Briefcase> = {
  'briefcase': Briefcase,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'message-circle': MessageCircle,
};

export function KpiGrid({ kpis }: { kpis: Kpi[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      {kpis.map(kpi => {
        const Icon = iconMap[kpi.icon] || Briefcase;
        const positive = kpi.change >= 0;
        return (
          <div key={kpi.label} className="dr-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{kpi.label}</span>
              <Icon size={15} style={{ color: 'var(--d-text-muted)' }} />
            </div>
            <div className="serif-display" style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--d-text)' }}>
              {kpi.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.7rem', color: positive ? 'var(--d-success)' : 'var(--d-error)' }}>
              {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {positive ? '+' : ''}{kpi.change}%
              <span style={{ color: 'var(--d-text-muted)' }}>vs last quarter</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
