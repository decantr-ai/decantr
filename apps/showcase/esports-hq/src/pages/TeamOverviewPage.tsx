import { KpiGrid } from '@/components/KpiGrid';
import { Scoreboard } from '@/components/Scoreboard';
import { ActivityFeed } from '@/components/ActivityFeed';
import { teamKpis, scrims, activityFeed } from '@/data/mock';

export function TeamOverviewPage() {
  const liveOrRecent = scrims.filter(s => s.status === 'live' || s.status === 'completed').slice(0, 2);

  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Team Overview</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Shadow Legion operations at a glance.</p>
      </div>

      <KpiGrid stats={teamKpis} />

      {/* Live / Recent Scoreboards */}
      <div>
        <div className="d-label" style={{ marginBottom: '0.75rem', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
          Live &amp; Recent Matches
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-3)' }}>
          {liveOrRecent.map(scrim => (
            <Scoreboard key={scrim.id} scrim={scrim} />
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div className="d-label" style={{ marginBottom: '0.75rem', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
          Recent Activity
        </div>
        <ActivityFeed events={activityFeed} />
      </div>
    </div>
  );
}
