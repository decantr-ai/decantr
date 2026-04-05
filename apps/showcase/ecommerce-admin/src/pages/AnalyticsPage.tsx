import { Download, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { KpiGrid } from '@/components/KpiGrid';
import { Chart } from '@/components/Chart';
import { Sparkline } from '@/components/Sparkline';
import { analyticsKpis, analyticsCharts, revenueTrends } from '@/data/mock';

export function AnalyticsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Analytics"
        description="Revenue and sales performance across Brightgoods."
        actions={
          <>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              <Calendar size={14} /> Last 90 days
            </button>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              <Download size={14} /> Export CSV
            </button>
          </>
        }
      />

      <KpiGrid items={analyticsKpis} />

      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Charts</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--d-content-gap)' }}>
          {analyticsCharts.map(chart => (
            <div key={chart.title} className="ea-card" style={{ padding: 'var(--d-surface-p)' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>{chart.title}</h3>
              <Chart chart={chart} />
            </div>
          ))}
        </div>
      </div>

      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
          <SectionLabel>Category Trends</SectionLabel>
        </div>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Category</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Revenue (90d)</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Change</th>
              <th className="d-data-header">Trend</th>
            </tr>
          </thead>
          <tbody>
            {revenueTrends.map(row => (
              <tr key={row.label} className="d-data-row">
                <td className="d-data-cell" style={{ fontWeight: 500 }}>{row.label}</td>
                <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', fontWeight: 600 }}>{row.value}</td>
                <td className="d-data-cell" style={{ textAlign: 'right', fontSize: '0.8rem', fontWeight: 500, color: row.change >= 0 ? 'var(--d-success)' : 'var(--d-error)' }}>
                  {row.change >= 0 ? '+' : ''}{row.change}%
                </td>
                <td className="d-data-cell"><Sparkline data={row.data} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
