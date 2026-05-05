import { KPIGrid } from '../../components/KPIGrid';
import ReputationBadge from '../../components/ReputationBadge';
import { ActivityFeed } from '../../components/ActivityFeed';
import { dashboardKPIs, recentActivity } from '../../data/mock';

export default function OverviewPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="d-label" data-anchor="">
        Overview
      </div>

      <KPIGrid kpis={dashboardKPIs} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Your Trust Level</h3>
          <ReputationBadge score={187} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Recent Activity</h3>
        <ActivityFeed events={recentActivity} />
      </div>
    </div>
  );
}
