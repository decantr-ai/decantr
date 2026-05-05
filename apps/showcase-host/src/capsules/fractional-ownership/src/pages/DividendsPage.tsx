import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { Chart } from '@/components/Chart';
import { dividends, portfolioCharts } from '@/data/mock';
import { formatMoney } from '@/components/Money';

export function DividendsPage() {
  const totalPaid = dividends.filter(d => d.status === 'paid').reduce((s, d) => s + d.amount, 0);
  const totalPending = dividends.filter(d => d.status === 'pending').reduce((s, d) => s + d.amount, 0);
  const divChart = portfolioCharts.find(c => c.type === 'bar');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Dividend Ledger" description="Income distributions from all fractional asset positions." />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--d-content-gap)' }}>
        {[
          { label: 'Total Distributed', value: formatMoney(totalPaid, true) },
          { label: 'Pending', value: formatMoney(totalPending, true) },
          { label: 'Yield (TTM)', value: '6.84%' },
          { label: 'Next Distribution', value: 'Apr 15, 2026' },
        ].map(k => (
          <div key={k.label} className="fo-card fo-kpi-accent" style={{ padding: 'var(--d-surface-p)' }}>
            <div className="d-label" style={{ marginBottom: '0.375rem' }}>{k.label}</div>
            <div className="fo-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {divChart && (
        <div className="fo-card" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.75rem' }}>Quarterly Distributions</SectionLabel>
          <Chart chart={divChart} />
        </div>
      )}

      {/* Ledger table */}
      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--d-surface-p)', borderBottom: '1px solid var(--d-border)' }}>
          <SectionLabel>Full Ledger</SectionLabel>
        </div>
        <table className="d-data" style={{ minWidth: 700 }}>
          <thead>
            <tr>
              <th className="d-data-header">Date</th>
              <th className="d-data-header">Asset</th>
              <th className="d-data-header">Type</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Per Share</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Shares</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Amount</th>
              <th className="d-data-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {dividends.map(d => (
              <tr key={d.id} className="d-data-row fo-dividend-row">
                <td className="d-data-cell fo-mono" style={{ color: 'var(--d-text-muted)' }}>{d.date}</td>
                <td className="d-data-cell" style={{ fontWeight: 500 }}>{d.asset}</td>
                <td className="d-data-cell" style={{ textTransform: 'capitalize', color: 'var(--d-text-muted)' }}>{d.type}</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>${d.perShare.toFixed(2)}</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>{d.shares.toLocaleString()}</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right', fontWeight: 500, color: 'var(--d-success)' }}>
                  +{formatMoney(d.amount)}
                </td>
                <td className="d-data-cell">
                  <span className="fo-pill" data-status={d.status === 'paid' ? 'active' : 'pending'}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
