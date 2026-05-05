import { PageHeader } from '@/components/PageHeader';
import { UsageMeterList } from '@/components/UsageMeter';
import { AreaChart } from '@/components/AreaChart';
import { usageMeters, usageCharts } from '@/data/mock';

export function UsagePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Usage"
        description="Current billing period: April 1 – April 30, 2026"
      />

      {/* Meters */}
      <div className="d-surface" style={{ padding: '1.25rem' }}>
        <h3 className="d-label" style={{ marginBottom: '1rem' }}>Current Period</h3>
        <UsageMeterList meters={usageMeters} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
        {usageCharts.map(c => (
          <div key={c.title} className="d-surface" style={{ padding: '1.25rem' }}>
            <h3 className="d-label" style={{ marginBottom: '0.75rem' }}>{c.title}</h3>
            <AreaChart series={c.data} />
          </div>
        ))}
      </div>

      {/* Usage breakdown */}
      <div className="d-surface" style={{ padding: '1.25rem' }}>
        <h3 className="d-label" style={{ marginBottom: '1rem' }}>Usage Breakdown</h3>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Metric</th>
              <th className="d-data-header">Included</th>
              <th className="d-data-header">Used</th>
              <th className="d-data-header">Overage</th>
              <th className="d-data-header">Rate</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {[
              { m: 'API Requests', incl: '1M', used: '847K', over: '0', rate: '$0.50 / 1K', cost: '$0.00' },
              { m: 'Active Users', incl: '5K', used: '3,420', over: '0', rate: '$0.10 / user', cost: '$0.00' },
              { m: 'Webhook Deliveries', incl: '250K', used: '128.4K', over: '0', rate: '$0.20 / 1K', cost: '$0.00' },
              { m: 'Storage', incl: '50 GB', used: '18.4 GB', over: '0 GB', rate: '$0.10 / GB', cost: '$0.00' },
              { m: 'Data Transfer', incl: '500 GB', used: '284 GB', over: '0 GB', rate: '$0.08 / GB', cost: '$0.00' },
              { m: 'Base Enterprise plan', incl: '—', used: '—', over: '—', rate: '—', cost: '$4,158.00' },
            ].map(r => (
              <tr key={r.m} className="d-data-row">
                <td className="d-data-cell" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{r.m}</td>
                <td className="d-data-cell mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{r.incl}</td>
                <td className="d-data-cell mono-data" style={{ fontSize: '0.75rem' }}>{r.used}</td>
                <td className="d-data-cell mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{r.over}</td>
                <td className="d-data-cell mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{r.rate}</td>
                <td className="d-data-cell mono-data" style={{ fontSize: '0.8rem', fontWeight: 500, textAlign: 'right' }}>{r.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
