import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { KpiGrid } from '@/components/KpiGrid';
import { Chart } from '@/components/Chart';
import { Sparkline } from '@/components/Sparkline';
import { UsageMeterBar } from '@/components/UsageMeter';
import { analyticsKpis, analyticsCharts, sparklines, usageMeters } from '@/data/mock';

export function AnalyticsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Analytics"
        description="Funnels, cohorts, and retention across your product."
        actions={
          <>
            <select className="d-control" defaultValue="30d" style={{ width: 'auto', fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="custom">Custom range</option>
            </select>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              <Download size={14} /> Export
            </button>
          </>
        }
      />

      {/* KPIs */}
      <KpiGrid items={analyticsKpis} />

      {/* Charts grid */}
      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Charts</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--d-content-gap)' }}>
          {analyticsCharts.map(chart => (
            <div key={chart.title} className="sd-card" style={{ padding: 'var(--d-surface-p)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{chart.title}</h3>
              </div>
              <Chart chart={chart} />
            </div>
          ))}
        </div>
      </div>

      {/* Sparklines */}
      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Funnel Metrics</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--d-content-gap)' }}>
          {sparklines.map(sp => (
            <div key={sp.label} className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
              <div className="d-label" style={{ marginBottom: '0.5rem' }}>{sp.label}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>
                  {sp.value}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {sp.change >= 0 ? (
                    <TrendingUp size={12} style={{ color: 'var(--d-success)' }} />
                  ) : (
                    <TrendingDown size={12} style={{ color: 'var(--d-error)' }} />
                  )}
                  <span
                    className="d-annotation"
                    data-status={sp.change >= 0 ? 'success' : 'error'}
                  >
                    {sp.change >= 0 ? '+' : ''}{sp.change}%
                  </span>
                </div>
              </div>
              <Sparkline data={sp.data} />
            </div>
          ))}
        </div>
      </div>

      {/* Usage breakdown */}
      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Usage Breakdown</SectionLabel>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {usageMeters.map(m => (
              <UsageMeterBar key={m.label} meter={m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
