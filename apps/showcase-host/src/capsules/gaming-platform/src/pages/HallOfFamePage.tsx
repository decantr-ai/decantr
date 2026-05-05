import { leaderboard, hallOfFameStats, hallOfFameTimeline } from '@/data/mock';
import { Timeline } from '@/components/Timeline';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HallOfFamePage() {
  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Hall of Fame</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Legends of the guild. Top warriors across all seasons.</p>
      </div>

      {/* Stats Bar */}
      <div className="d-surface" style={{
        display: 'flex',
        flexWrap: 'wrap',
        padding: 0,
      }}>
        {hallOfFameStats.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: '1 1 150px',
              padding: '1rem 1.25rem',
              textAlign: 'center',
              borderRight: i < hallOfFameStats.length - 1 ? '1px solid var(--d-border)' : 'none',
            }}
          >
            <div className="d-label" style={{ marginBottom: '0.25rem' }}>{stat.label}</div>
            <div className="gg-stat-pulse" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Guild Leaderboard */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          Global Leaderboard
        </div>
        <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="d-data" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th className="d-data-header" style={{ width: 60 }}>Rank</th>
                <th className="d-data-header">Player</th>
                <th className="d-data-header" style={{ textAlign: 'right' }}>Score</th>
                <th className="d-data-header" style={{ textAlign: 'right' }}>Wins</th>
                <th className="d-data-header" style={{ textAlign: 'right' }}>Win Rate</th>
                <th className="d-data-header" style={{ width: 50, textAlign: 'center' }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(entry => (
                <tr key={entry.rank} className="d-data-row">
                  <td className="d-data-cell">
                    <span
                      className="gg-rank-badge"
                      data-rank={entry.rank <= 3 ? String(entry.rank) : 'default'}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="d-data-cell">
                    <Link
                      to={`/community/members/u${entry.rank}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}
                    >
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
                        {entry.avatar}
                      </div>
                      <span style={{ fontWeight: 500 }}>{entry.name}</span>
                    </Link>
                  </td>
                  <td className="d-data-cell gg-stat-pulse" style={{ textAlign: 'right', fontWeight: 600 }}>
                    {entry.score.toLocaleString()}
                  </td>
                  <td className="d-data-cell" style={{ textAlign: 'right' }}>{entry.wins}</td>
                  <td className="d-data-cell" style={{ textAlign: 'right' }}>{entry.winRate}%</td>
                  <td className="d-data-cell" style={{ textAlign: 'center' }}>
                    {entry.change === 'up' && <TrendingUp size={14} style={{ color: 'var(--d-success)' }} />}
                    {entry.change === 'down' && <TrendingDown size={14} style={{ color: 'var(--d-error)' }} />}
                    {entry.change === 'same' && <Minus size={14} style={{ color: 'var(--d-text-muted)' }} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          Guild History
        </div>
        <Timeline entries={hallOfFameTimeline} />
      </div>
    </div>
  );
}
