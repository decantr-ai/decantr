import { TrendingUp, TrendingDown, Users, Swords, Trophy, Target, Video, Handshake } from 'lucide-react';
import type { TeamKpi } from '@/data/mock';

const iconMap: Record<string, typeof Users> = {
  users: Users,
  swords: Swords,
  'trending-up': Target,
  trophy: Trophy,
  video: Video,
  handshake: Handshake,
};

export function KpiGrid({ stats }: { stats: TeamKpi[] }) {
  return (
    <div className="d-section" data-density="compact">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--d-gap-4)',
      }}>
        {stats.map((stat, i) => {
          const Icon = iconMap[stat.icon] || Target;
          const positive = stat.change >= 0;
          return (
            <div
              key={stat.label}
              className="d-surface gg-stat-pulse"
              style={{
                padding: 'var(--d-surface-p)',
                animationDelay: `${i * 80}ms`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--d-radius)',
                  background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={18} style={{ color: 'var(--d-primary)' }} />
                </div>
              </div>
              <div className="d-label" style={{ marginBottom: '0.25rem' }}>{stat.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                {stat.value}
              </div>
              {stat.change !== 0 && (
                <span
                  className="d-annotation"
                  data-status={positive ? 'success' : 'error'}
                  style={{ fontSize: '0.7rem' }}
                >
                  {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {positive ? '+' : ''}{stat.change}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
