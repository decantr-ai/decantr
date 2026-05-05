import { Download, CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { invoices } from '@/data/mock';

export function InvoicesPage() {
  const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Invoices"
        description={`${invoices.length} invoices · $${paid.toFixed(2)} total paid`}
        actions={
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
            <Download size={14} /> Export all
          </button>
        }
      />

      {/* Payment method */}
      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Payment Method</SectionLabel>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: 44,
              height: 32,
              borderRadius: 'var(--d-radius-sm)',
              background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CreditCard size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: '0.875rem', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>
                •••• •••• •••• 4242
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                Visa · Expires 08/28 · Sarah Chen
              </div>
            </div>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Invoice table */}
      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Invoice History</SectionLabel>
        <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="d-data" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th className="d-data-header">Invoice</th>
                  <th className="d-data-header">Date</th>
                  <th className="d-data-header">Period</th>
                  <th className="d-data-header" style={{ textAlign: 'right' }}>Amount</th>
                  <th className="d-data-header">Status</th>
                  <th className="d-data-header" style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="d-data-row">
                    <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', fontSize: '0.8rem' }}>
                      {inv.number}
                    </td>
                    <td className="d-data-cell" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>
                      {inv.date}
                    </td>
                    <td className="d-data-cell" style={{ fontSize: '0.875rem' }}>{inv.period}</td>
                    <td className="d-data-cell" style={{ textAlign: 'right', fontWeight: 500, fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="d-data-cell">
                      <span
                        className="d-annotation"
                        data-status={
                          inv.status === 'paid' ? 'success'
                          : inv.status === 'pending' ? 'warning'
                          : inv.status === 'overdue' ? 'error'
                          : undefined
                        }
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="d-data-cell">
                      <a href={inv.downloadUrl} className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem', border: 'none' }} aria-label="Download">
                        <Download size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
