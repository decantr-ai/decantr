import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { KpiGrid } from '@/components/KpiGrid';
import { Chart } from '@/components/Chart';
import { StatusBadge } from '@/components/StatusBadge';
import { financialKpis, financialCharts, payments } from '@/data/mock';

export function FinancialsOverviewPage() {
  const recent = payments.slice(0, 8);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Financials"
        description="April 2026 · YTD snapshot"
        actions={
          <>
            <select className="d-control" style={{ width: 140, fontSize: '0.825rem' }} defaultValue="ytd">
              <option value="mtd">Month to date</option>
              <option value="qtd">Quarter to date</option>
              <option value="ytd">Year to date</option>
              <option value="all">All time</option>
            </select>
            <button className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>
              <Download size={14} /> Export P&L
            </button>
          </>
        }
      />

      <KpiGrid items={financialKpis} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--d-content-gap)' }}>
        {financialCharts.map(chart => (
          <div key={chart.title} className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--d-primary)' }}>{chart.title}</h3>
              <span className="d-annotation">2026</span>
            </div>
            <Chart chart={chart} />
          </div>
        ))}
      </div>

      <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
          <SectionLabel>Recent Payments</SectionLabel>
          <Link to="/financials/rent-roll" style={{ fontSize: '0.75rem', color: 'var(--d-accent)', textDecoration: 'none' }}>Full rent roll →</Link>
        </div>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Tenant</th>
              <th className="d-data-header">Property / Unit</th>
              <th className="d-data-header">Amount</th>
              <th className="d-data-header">Method</th>
              <th className="d-data-header">Paid</th>
              <th className="d-data-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(p => (
              <tr key={p.id} className="d-data-row">
                <td className="d-data-cell" style={{ fontSize: '0.825rem', fontWeight: 500 }}>{p.tenantName}</td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{p.propertyName} · {p.unitNumber}</td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem', fontWeight: 600 }}>${p.amount.toLocaleString()}</td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{p.method}</td>
                <td className="d-data-cell" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{p.paidDate ?? '—'}</td>
                <td className="d-data-cell"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
