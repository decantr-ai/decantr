import { Download, Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge } from '@/components/StatusBadge';
import { expenses } from '@/data/mock';

export function FinancialsExpensesPage() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Expenses"
        description="March 2026"
        actions={
          <>
            <button className="d-interactive" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>
              <Download size={14} /> Export
            </button>
            <button className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>
              <Plus size={14} /> Add expense
            </button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>By Category</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {Object.entries(byCategory).map(([cat, amt]) => {
              const pct = (amt / total) * 100;
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
                    <span>{cat}</span>
                    <span style={{ fontWeight: 600 }}>${amt.toLocaleString()}</span>
                  </div>
                  <div className="pm-occupancy-bar">
                    <div className="pm-occupancy-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--d-primary), var(--d-accent))' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pm-divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
            <span>Total</span>
            <span style={{ color: 'var(--d-primary)' }}>${total.toLocaleString()}</span>
          </div>
        </div>

        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Recent Expenses</SectionLabel>
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Date</th>
                <th className="d-data-header">Category</th>
                <th className="d-data-header">Vendor</th>
                <th className="d-data-header">Property</th>
                <th className="d-data-header">Amount</th>
                <th className="d-data-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} className="d-data-row">
                  <td className="d-data-cell" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{e.date}</td>
                  <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{e.category}</td>
                  <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>
                    {e.vendor}
                    <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{e.description}</div>
                  </td>
                  <td className="d-data-cell" style={{ fontSize: '0.8rem' }}>{e.property}</td>
                  <td className="d-data-cell" style={{ fontSize: '0.825rem', fontWeight: 600 }}>${e.amount.toLocaleString()}</td>
                  <td className="d-data-cell"><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
