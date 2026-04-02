import { css } from '@decantr/css';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ label, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className={css('_flex _col _gap2') + ' d-surface carbon-glass neon-glow-hover neon-entrance'}>
      <div className={css('_flex _jcsb _aic')}>
        <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <Icon size={16} style={{ color: 'var(--d-accent)' }} />
      </div>
      <span className="mono-data" style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--d-text)' }}>
        {value}
      </span>
      {trend && (
        <span
          className="mono-data"
          style={{
            fontSize: '0.75rem',
            color: trendUp ? 'var(--d-success)' : 'var(--d-error)',
          }}
        >
          {trendUp ? '+' : ''}{trend}
        </span>
      )}
    </div>
  );
}
