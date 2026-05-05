import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { qaThreads } from '@/data/mock';

const priorityColors: Record<string, string> = { high: 'error', medium: 'warning', low: 'info' };
const statusColors: Record<string, string> = { open: 'warning', answered: 'success', closed: undefined as unknown as string };

export function QaPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Q&A Threads"
        description="Diligence questions, responses, and tracking."
        actions={
          <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8rem' }}>
            <Plus size={14} /> New Question
          </button>
        }
      />

      {/* Summary */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {['open', 'answered', 'closed'].map(status => {
          const count = qaThreads.filter(q => q.status === status).length;
          return (
            <div key={status} className="dr-card" style={{ padding: '1rem', flex: '1 1 100px' }}>
              <div className="d-label" style={{ marginBottom: '0.35rem' }}>{status}</div>
              <div className="serif-display" style={{ fontSize: '1.5rem', fontWeight: 600 }}>{count}</div>
            </div>
          );
        })}
      </div>

      <DataTable
        columns={[
          {
            key: 'subject',
            header: 'Subject',
            render: (q) => (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{q.subject}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>{q.category}</div>
              </div>
            ),
          },
          {
            key: 'askedBy',
            header: 'Asked By',
            render: (q) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="dr-monogram" style={{ width: 22, height: 22, fontSize: '0.5rem' }}>{q.askedByAvatar}</div>
                <span style={{ fontSize: '0.8rem' }}>{q.askedBy}</span>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (q) => <span className="d-annotation" data-status={statusColors[q.status]}>{q.status}</span>,
          },
          {
            key: 'priority',
            header: 'Priority',
            render: (q) => <span className="d-annotation" data-status={priorityColors[q.priority]}>{q.priority}</span>,
          },
          { key: 'replies', header: 'Replies', render: (q) => <span className="mono-data">{q.replies}</span> },
          { key: 'assignedTo', header: 'Assigned To', render: (q) => <span style={{ fontSize: '0.8rem' }}>{q.assignedTo}</span> },
          { key: 'createdAt', header: 'Created', render: (q) => <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{q.createdAt}</span> },
        ]}
        rows={qaThreads}
      />
    </div>
  );
}
