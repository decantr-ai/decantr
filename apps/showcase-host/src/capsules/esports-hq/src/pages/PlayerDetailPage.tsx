import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Sparkline } from '@/components/Sparkline';
import { ChartGrid } from '@/components/ChartGrid';
import { players, activityFeed } from '@/data/mock';
import { ActivityFeed } from '@/components/ActivityFeed';

const moodColors: Record<string, string> = {
  great: 'var(--d-success)',
  good: 'var(--d-info)',
  neutral: 'var(--d-warning)',
  tired: 'var(--d-warning)',
  tilted: 'var(--d-error)',
};

export function PlayerDetailPage() {
  const { id } = useParams();
  const player = players.find(p => p.id === id) || players[0];

  const kdData = player.sparkline.map((v, i) => ({ label: `W${i + 1}`, value: Math.round(v * 100) }));
  const recentActivity = activityFeed.filter(e => e.user === player.name || Math.random() > 0.6).slice(0, 5);

  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      {/* Back link */}
      <Link to="/team/roster" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Roster
      </Link>

      {/* Player header */}
      <div className="d-surface neon-glow" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 'var(--d-radius-full)',
          background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {player.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{player.name}</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>
            <span>{player.role}</span>
            <span>|</span>
            <span>{player.game}</span>
            <span>|</span>
            <span style={{ textTransform: 'capitalize' }}>{player.status}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: moodColors[player.mood] }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textTransform: 'capitalize' }}>{player.mood}</span>
        </div>
      </div>

      {/* Form tracker sparkline + stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--d-gap-4)' }}>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>K/D Trend</div>
          <Sparkline data={player.sparkline} width={160} height={40} />
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--d-font-mono, monospace)', marginTop: '0.5rem' }}>
            {player.kd.toFixed(2)}
          </div>
        </div>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Win Rate</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--d-font-mono, monospace)' }}>
            {player.winRate}%
          </div>
          <div style={{ marginTop: '0.5rem', height: 6, borderRadius: 3, background: 'var(--d-surface-raised)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${player.winRate}%`, background: 'var(--d-primary)', borderRadius: 3, transition: 'width 600ms ease' }} />
          </div>
        </div>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Earnings</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--d-font-mono, monospace)' }}>
            ${player.earnings.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Charts */}
      <ChartGrid title="K/D by Week" data={kdData} />

      {/* Activity */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div className="d-label" style={{ marginBottom: '0.75rem', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
          Recent Activity
        </div>
        <ActivityFeed events={recentActivity} />
      </div>
    </div>
  );
}
