import { Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge } from '@/components/StatusBadge';
import { tenants, properties, payments } from '@/data/mock';

export function FinancialsRentRollPage() {
  const total = tenants.reduce((sum, t) => sum + t.rent, 0);
  const collected = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const outstanding = total - collected;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Rent Roll"
        description="April 2026"
        actions={
          <>
            <select className="d-control" style={{ width: 160, fontSize: '0.825rem' }} defaultValue="all">
              <option value="all">All properties</option>
              {properties.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
            <button className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>
              <Download size={14} /> Export CSV
            </button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="pm-card" style={{ padding: '1.125rem' }}>
          <div className="d-label">Expected Rent</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-primary)', marginTop: '0.375rem' }}>${total.toLocaleString()}</div>
        </div>
        <div className="pm-card" style={{ padding: '1.125rem' }}>
          <div className="d-label">Collected</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-success)', marginTop: '0.375rem' }}>${collected.toLocaleString()}</div>
        </div>
        <div className="pm-card" style={{ padding: '1.125rem' }}>
          <div className="d-label">Outstanding</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: outstanding > 0 ? 'var(--d-warning)' : 'var(--d-text-muted)', marginTop: '0.375rem' }}>${outstanding.toLocaleString()}</div>
        </div>
      </div>

      <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '0.875rem' }}>April 2026 Rent Roll</SectionLabel>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Property</th>
              <th className="d-data-header">Unit</th>
              <th className="d-data-header">Tenant</th>
              <th className="d-data-header">Rent</th>
              <th className="d-data-header">Due</th>
              <th className="d-data-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="d-data-row">
                <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{p.propertyName}</td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem', fontWeight: 500 }}>{p.unitNumber}</td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{p.tenantName}</td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem', fontWeight: 600 }}>${p.amount.toLocaleString()}</td>
                <td className="d-data-cell" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{p.dueDate}</td>
                <td className="d-data-cell"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--d-border)' }}>
              <td colSpan={3} className="d-data-cell" style={{ fontSize: '0.825rem', fontWeight: 600 }}>Total</td>
              <td className="d-data-cell" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--d-primary)' }}>${payments.reduce((s, p) => s + p.amount, 0).toLocaleString()}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
