import { css } from '@decantr/css';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatItem {
  label: string;
  value: string;
  trend?: { direction: 'up' | 'down'; percent: string };
}

export function StatsOverview({ stats }: { stats: StatItem[] }) {
  return (
    <div
      className={css('_grid _gap4')}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
      }}
      role="region"
      aria-label="Statistics overview"
    >
      {stats.map(stat => (
        <div key={stat.label} className="d-surface carbon-card" style={{ padding: '1rem 1.25rem' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>
            {stat.label}
          </div>
          <div className={css('_flex _aic _gap3')}>
            <span
              className="mono-data"
              style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--d-text)' }}
            >
              {stat.value}
            </span>
            {stat.trend && (
              <span
                className="d-annotation"
                data-status={stat.trend.direction === 'up' ? 'success' : 'error'}
              >
                {stat.trend.direction === 'up' ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {stat.trend.percent}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
