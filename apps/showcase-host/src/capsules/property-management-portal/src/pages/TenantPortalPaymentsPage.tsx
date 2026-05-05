import { useState } from 'react';
import { CreditCard, Check } from 'lucide-react';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge } from '@/components/StatusBadge';
import { currentTenant } from '@/data/mock';

const paymentHistory = [
  { id: 'p-h-1', month: 'April 2026', dueDate: '2026-04-01', amount: 1850, method: 'ACH', status: 'pending' as const },
  { id: 'p-h-2', month: 'March 2026', dueDate: '2026-03-01', amount: 1850, method: 'ACH', status: 'paid' as const, paidDate: '2026-02-28' },
  { id: 'p-h-3', month: 'February 2026', dueDate: '2026-02-01', amount: 1850, method: 'ACH', status: 'paid' as const, paidDate: '2026-01-30' },
  { id: 'p-h-4', month: 'January 2026', dueDate: '2026-01-01', amount: 1850, method: 'ACH', status: 'paid' as const, paidDate: '2025-12-30' },
  { id: 'p-h-5', month: 'December 2025', dueDate: '2025-12-01', amount: 1850, method: 'ACH', status: 'paid' as const, paidDate: '2025-11-28' },
  { id: 'p-h-6', month: 'November 2025', dueDate: '2025-11-01', amount: 1850, method: 'ACH', status: 'paid' as const, paidDate: '2025-10-30' },
];

export function TenantPortalPaymentsPage() {
  const [autopay, setAutopay] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-primary)' }}>Payments</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          Your rent payments and autopay settings
        </p>
      </div>

      {/* Current rent */}
      <div className="pm-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="d-label" style={{ marginBottom: '0.375rem' }}>April 2026 Rent</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--d-primary)' }}>${currentTenant.rent.toLocaleString()}.00</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>Due April 1 · Auto-pay scheduled</div>
          </div>
          <button className="pm-button-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9rem' }}>
            <CreditCard size={16} /> Pay now
          </button>
        </div>
      </div>

      {/* Autopay */}
      <div className="pm-card" style={{ padding: '1.25rem' }}>
        <SectionLabel style={{ marginBottom: '0.875rem' }}>Autopay</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <button
            onClick={() => setAutopay(!autopay)}
            style={{
              position: 'relative', width: 42, height: 24, borderRadius: 12,
              background: autopay ? 'var(--d-success)' : 'var(--d-border)',
              border: 'none', cursor: 'pointer', transition: 'background 180ms',
              flexShrink: 0,
            }}
            aria-label="Toggle autopay"
          >
            <span style={{
              position: 'absolute', top: 2, left: autopay ? 20 : 2,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left 180ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {autopay ? 'Autopay is enabled' : 'Autopay is off'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
              {autopay ? 'Rent is paid automatically on the 1st from your ACH account ending in 4821.' : 'Pay manually each month.'}
            </div>
          </div>
        </div>
        {autopay && (
          <div style={{ marginTop: '0.875rem', padding: '0.75rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Check size={14} style={{ color: 'var(--d-success)' }} />
            <div style={{ fontSize: '0.8rem' }}>
              Next charge: <strong>May 1, 2026</strong> · $1,850.00 · ACH ****4821
            </div>
          </div>
        )}
      </div>

      {/* History */}
      <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '0.875rem' }}>Payment History</SectionLabel>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Month</th>
              <th className="d-data-header">Amount</th>
              <th className="d-data-header">Method</th>
              <th className="d-data-header">Status</th>
              <th className="d-data-header"></th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.map(p => (
              <tr key={p.id} className="d-data-row">
                <td className="d-data-cell" style={{ fontSize: '0.85rem', fontWeight: 500 }}>{p.month}</td>
                <td className="d-data-cell" style={{ fontSize: '0.85rem', fontWeight: 600 }}>${p.amount.toLocaleString()}</td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{p.method}</td>
                <td className="d-data-cell"><StatusBadge status={p.status} /></td>
                <td className="d-data-cell" style={{ textAlign: 'right' }}>
                  {p.status === 'paid' && <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}>Receipt</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
