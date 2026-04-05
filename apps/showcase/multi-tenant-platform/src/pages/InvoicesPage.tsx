import { Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { invoices, type Invoice } from '@/data/mock';

const statusMap: Record<Invoice['status'], 'success' | 'warning' | 'error' | 'info'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'error',
  draft: 'info',
};

export function InvoicesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Invoices"
        description="All invoices for Acme Corp"
        actions={
          <button className="d-interactive" style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
            <Download size={14} /> Export all
          </button>
        }
      />

      <DataTable
        columns={[
          {
            key: 'number', header: 'Invoice',
            render: i => <code className="mono-data" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{i.number}</code>,
          },
          {
            key: 'period', header: 'Period',
            render: i => <span style={{ fontSize: '0.8rem' }}>{i.period}</span>,
          },
          {
            key: 'date', header: 'Date',
            render: i => <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{i.date}</span>,
          },
          {
            key: 'due', header: 'Due Date',
            render: i => <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{i.dueDate}</span>,
          },
          {
            key: 'amount', header: 'Amount',
            render: i => <span className="mono-data" style={{ fontSize: '0.8rem', fontWeight: 500 }}>${i.amount.toLocaleString()}</span>,
          },
          {
            key: 'status', header: 'Status',
            render: i => (
              <span className="d-annotation" data-status={statusMap[i.status]} style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
                {i.status}
              </span>
            ),
          },
          {
            key: 'actions', header: '', width: '80px',
            render: () => (
              <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem', border: 'none' }}>
                <Download size={12} /> PDF
              </button>
            ),
          },
        ]}
        rows={invoices}
      />
    </div>
  );
}
