import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { KpiGrid } from '@/components/KpiGrid';
import { RelationshipGraph } from '@/components/RelationshipGraph';
import { Sparkline } from '@/components/Sparkline';
import { pipelineByMonth, winRateTrend, type Kpi } from '@/data/mock';

export function InsightsPage() {
  const kpis: Kpi[] = [
    { label: 'Forecast (Q2)', value: '$1.48M', change: 18.2 },
    { label: 'Win Rate', value: '34%', change: 3.2 },
    { label: 'Pipeline Velocity', value: '22d', change: -8.1 },
    { label: 'AI Coverage', value: '94%', change: 12.0 },
  ];

  const maxMonth = Math.max(...pipelineByMonth.map(p => p.value));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="AI Insights"
        description="Sales intelligence powered by Lumen AI · updated every 6 hours"
      />

      <KpiGrid items={kpis} />

      {/* AI Narrative */}
      <div className="glass-panel" style={{
        padding: '1.25rem',
        background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.06), rgba(96, 165, 250, 0.04))',
        border: '1px solid rgba(167, 139, 250, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Sparkles size={14} style={{ color: 'var(--d-accent)' }} />
          <SectionLabel>This Week's AI Briefing</SectionLabel>
        </div>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>
          Your pipeline grew <strong style={{ color: 'var(--d-success)' }}>+12.4% WoW</strong> to $1.24M.
          The Plexus Robotics deal ($320k) is your biggest lever — DoD contract win unlocks budget.
          Three deals show champion fatigue signals: follow up this week.
          Brightline Fin needs a counter on discount.
        </p>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--d-content-gap)' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.875rem' }}>
            <SectionLabel>Pipeline by Month</SectionLabel>
            <span style={{ fontSize: '0.72rem', color: 'var(--d-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={12} /> +82%
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.625rem', height: 160 }}>
            {pipelineByMonth.map(p => (
              <div key={p.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                <div className="crm-chart-bar" style={{ width: '100%', height: `${(p.value / maxMonth) * 100}%`, minHeight: 4 }} />
                <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{p.month}</div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--d-font-mono)', fontWeight: 600 }}>${p.value}k</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.875rem' }}>
            <SectionLabel>Win Rate Trend</SectionLabel>
            <span style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>last 9 weeks</span>
          </div>
          <Sparkline data={winRateTrend} height={120} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>
            <span>28%</span><span style={{ fontFamily: 'var(--d-font-mono)', color: 'var(--d-accent)', fontWeight: 600 }}>34%</span><span>41%</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
            <AlertTriangle size={13} style={{ color: 'var(--d-warning)' }} />
            <SectionLabel>Risk Signals</SectionLabel>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { deal: 'Axiom Retail', reason: 'CEO budget pause', level: 'high' },
              { deal: 'Vector Studio', reason: 'Acquisition rumor', level: 'medium' },
              { deal: 'Cobalt Industries', reason: 'Gatekeeper only', level: 'medium' },
            ].map(r => (
              <div key={r.deal} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.5rem 0.625rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 'var(--d-radius-sm)', fontSize: '0.78rem',
              }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{r.deal}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{r.reason}</div>
                </div>
                <span style={{
                  fontSize: '0.65rem', padding: '0.125rem 0.5rem',
                  background: r.level === 'high' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)',
                  color: r.level === 'high' ? 'var(--d-error)' : 'var(--d-warning)',
                  borderRadius: 'var(--d-radius-full)', fontWeight: 600, textTransform: 'uppercase',
                }}>{r.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
          <SectionLabel>Relationship Graph</SectionLabel>
          <span style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>drag nodes · hover edges to reveal</span>
        </div>
        <RelationshipGraph height={540} />
      </div>
    </div>
  );
}
