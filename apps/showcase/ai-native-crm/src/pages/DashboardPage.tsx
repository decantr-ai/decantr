import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { KpiGrid } from '@/components/KpiGrid';
import { PipelineBoard } from '@/components/PipelineBoard';
import { ActivityFeed } from '@/components/ActivityFeed';
import { dashboardKpis, deals, activityEvents } from '@/data/mock';

export function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Sales Dashboard"
        description="Your pipeline at a glance. AI is watching 8 deals for signal."
        actions={
          <>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>Export</button>
            <Link to="/pipeline" className="crm-button-accent" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
              Open Pipeline <ArrowRight size={14} />
            </Link>
          </>
        }
      />

      <KpiGrid items={dashboardKpis} />

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <SectionLabel>Pipeline Board</SectionLabel>
          <Link to="/pipeline" style={{ fontSize: '0.75rem', color: 'var(--d-accent)', textDecoration: 'none' }}>Full board →</Link>
        </div>
        <PipelineBoard deals={deals.filter(d => d.stage !== 'won' && d.stage !== 'lost')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--d-content-gap)' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={14} style={{ color: 'var(--d-accent)' }} />
              <SectionLabel>AI Recommendations</SectionLabel>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { deal: 'Northwind Labs — Annual Platform', action: 'Send data residency one-pager before Thursday call', value: '$120k' },
              { deal: 'Plexus Robotics — Gov Contract', action: 'Accelerate proposal — DoD award unlocks budget', value: '$320k' },
              { deal: 'Brightline Fin — Multi-seat', action: 'Counter 18% discount with 3-year term', value: '$36k' },
              { deal: 'Meridian Health — Enterprise', action: 'Prepare SOC2 + SIG-lite for Thursday review', value: '$240k' },
            ].map(r => (
              <div key={r.deal} style={{
                padding: '0.75rem',
                background: 'rgba(167, 139, 250, 0.04)',
                border: '1px solid rgba(167, 139, 250, 0.12)',
                borderRadius: 'var(--d-radius-sm)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{r.deal}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>{r.action}</div>
                </div>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--d-font-mono)', color: 'var(--d-accent)', fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Recent Activity</SectionLabel>
          <ActivityFeed events={activityEvents.slice(0, 6)} />
        </div>
      </div>
    </div>
  );
}
