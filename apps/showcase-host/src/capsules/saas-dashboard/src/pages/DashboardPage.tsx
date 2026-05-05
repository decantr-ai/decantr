import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { KpiGrid } from '@/components/KpiGrid';
import { Chart } from '@/components/Chart';
import { ActivityFeed } from '@/components/ActivityFeed';
import { dashboardKpis, dashboardCharts, activityEvents, usageMeters } from '@/data/mock';
import { UsageMeterBar } from '@/components/UsageMeter';

export function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Dashboard"
        description="What moved this week across Northwind."
        actions={
          <>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Export</button>
            <Link to="/dashboard/actions" className="sd-button-accent" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              Quick Actions <ArrowRight size={14} />
            </Link>
          </>
        }
      />

      {/* KPIs */}
      <KpiGrid items={dashboardKpis} />

      {/* Charts */}
      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Trends</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--d-content-gap)' }}>
          {dashboardCharts.map(chart => (
            <div key={chart.title} className="sd-card" style={{ padding: 'var(--d-surface-p)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{chart.title}</h3>
                <span className="d-annotation">Last 30 days</span>
              </div>
              <Chart chart={chart} />
            </div>
          ))}
        </div>
      </div>

      {/* Activity + Usage */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--d-content-gap)' }}>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.75rem' }}>Recent Activity</SectionLabel>
          <ActivityFeed events={activityEvents.slice(0, 6)} />
        </div>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.75rem' }}>Usage</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {usageMeters.slice(0, 4).map(m => (
              <UsageMeterBar key={m.label} meter={m} />
            ))}
          </div>
          <Link
            to="/billing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.8rem',
              color: 'var(--d-accent)',
              textDecoration: 'none',
              marginTop: '1rem',
            }}
          >
            View all usage <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
