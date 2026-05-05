import { css } from '@decantr/css';
import type { LucideIcon } from 'lucide-react';

export function KpiCard({ label, value, sub, icon: Icon, trend }: {
  label: string; value: string; sub?: string; icon?: LucideIcon; trend?: 'up' | 'down' | 'neutral';
}) {
  const trendColor = trend === 'up' ? 'var(--d-success)' : trend === 'down' ? 'var(--d-error)' : 'var(--d-text-muted)';
  return (
    <div className="bistro-warm-card" style={{ cursor: 'default' }}>
      <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
        <span className="d-label">{label}</span>
        {Icon && <Icon size={16} style={{ color: 'var(--d-text-muted)' }} />}
      </div>
      <div className="bistro-handwritten" style={{ fontSize: '1.75rem', lineHeight: 1 }}>{value}</div>
      {sub && (
        <p className={css('_textsm')} style={{ color: trendColor, marginTop: '0.375rem', fontFamily: 'system-ui, sans-serif' }}>{sub}</p>
      )}
    </div>
  );
}
