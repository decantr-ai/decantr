import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { KpiGrid } from '@/components/KpiGrid';
import { StatusBadge } from '@/components/StatusBadge';
import { deals, type Kpi } from '@/data/mock';

export function DealsPage() {
  const open = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const openValue = open.reduce((s, d) => s + d.value, 0);
  const wonCount = deals.filter(d => d.stage === 'won').length;
  const wonValue = deals.filter(d => d.stage === 'won').reduce((s, d) => s + d.value, 0);
  const avgDeal = open.length ? openValue / open.length : 0;

  const kpis: Kpi[] = [
    { label: 'Open Value', value: `$${(openValue / 1000).toFixed(0)}k`, change: 12.4 },
    { label: 'Open Deals', value: `${open.length}`, change: 6.2 },
    { label: 'Avg Deal Size', value: `$${(avgDeal / 1000).toFixed(1)}k`, change: 3.8 },
    { label: 'Won This Qtr', value: `$${(wonValue / 1000).toFixed(0)}k`, change: 18.4 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Deals"
        description={`${deals.length} total · ${wonCount} won · ${open.length} in flight`}
        actions={
          <button className="crm-button-accent" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
            <Plus size={14} /> New deal
          </button>
        }
      />

      <KpiGrid items={kpis} />

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Deal</th>
              <th className="d-data-header">Company</th>
              <th className="d-data-header">Stage</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Value</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Probability</th>
              <th className="d-data-header">Close Date</th>
              <th className="d-data-header">Owner</th>
            </tr>
          </thead>
          <tbody>
            {deals.map(d => (
              <tr key={d.id} className="d-data-row">
                <td className="d-data-cell">
                  <Link to={`/deals/${d.id}`} style={{ color: 'var(--d-text)', textDecoration: 'none', fontSize: '0.825rem', fontWeight: 500 }}>
                    {d.name}
                  </Link>
                </td>
                <td className="d-data-cell" style={{ fontSize: '0.8rem' }}>{d.company}</td>
                <td className="d-data-cell"><StatusBadge status={d.stage} /></td>
                <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono)', fontWeight: 600, color: 'var(--d-accent)' }}>
                  ${(d.value / 1000).toFixed(0)}k
                </td>
                <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono)', fontSize: '0.8rem' }}>{d.probability}%</td>
                <td className="d-data-cell" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{d.closeDate}</td>
                <td className="d-data-cell" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{d.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
