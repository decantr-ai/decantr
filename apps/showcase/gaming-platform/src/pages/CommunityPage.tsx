import { Link } from 'react-router-dom';
import { Hero } from '@/components/Hero';
import { KpiGrid } from '@/components/KpiGrid';
import { ActivityFeed } from '@/components/ActivityFeed';
import { guildStats, activityFeed, leaderboard } from '@/data/mock';
import { ArrowRight } from 'lucide-react';

export function CommunityPage() {
  const topPlayers = leaderboard.slice(0, 5);

  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      {/* Guild Hero */}
      <Hero
        badge="Season 4 Active"
        headline="Welcome to the Guild"
        description="Your hub for competitive gaming. Track stats, climb ranks, and dominate the leaderboard."
      >
        <Link to="/games" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none' }}>
          Explore Games <ArrowRight size={16} />
        </Link>
        <Link to="/community/hall-of-fame" className="d-interactive" data-variant="ghost" style={{ textDecoration: 'none' }}>
          Hall of Fame
        </Link>
      </Hero>

      {/* KPI Grid */}
      <KpiGrid stats={guildStats} />

      {/* Two-column: Activity Feed + Top Players */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 'var(--d-gap-4)',
      }}>
        {/* Activity Feed */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <ActivityFeed events={activityFeed} />
        </div>

        {/* Top Players */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
            Top Players
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {topPlayers.map(player => (
              <Link
                key={player.rank}
                to={`/community/members/u${player.rank}`}
                className="d-data-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: 'var(--d-data-py) 0',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <span
                  className="gg-rank-badge"
                  data-rank={player.rank <= 3 ? String(player.rank) : 'default'}
                  style={{ minWidth: 28, textAlign: 'center' }}
                >
                  {player.rank}
                </span>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--d-radius-full)',
                  background: 'var(--d-surface-raised)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'var(--d-text-muted)',
                }}>
                  {player.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{player.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                    {player.winRate}% WR
                  </div>
                </div>
                <div className="gg-stat-pulse" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {player.score.toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
