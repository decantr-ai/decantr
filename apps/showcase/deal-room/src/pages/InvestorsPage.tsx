import { UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { investors } from '@/data/mock';

const roleColors: Record<string, string> = { lead: 'info', 'co-investor': 'success', observer: 'warning', advisor: undefined as unknown as string };

export function InvestorsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Investor Portal"
        description="Manage investor access, NDA status, and engagement."
        actions={
          <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8rem' }}>
            <UserPlus size={14} /> Invite Investor
          </button>
        }
      />

      <DataTable
        columns={[
          {
            key: 'name',
            header: 'Investor',
            render: (inv) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="dr-monogram">{inv.initials}</div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, fontFamily: 'var(--d-font-display)' }}>{inv.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>{inv.firm}</div>
                </div>
              </div>
            ),
          },
          {
            key: 'role',
            header: 'Role',
            render: (inv) => <span className="d-annotation" data-status={roleColors[inv.role]}>{inv.role}</span>,
          },
          {
            key: 'status',
            header: 'Status',
            render: (inv) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="dr-status-dot" data-status={inv.status} />
                <span style={{ fontSize: '0.8rem' }}>{inv.status}</span>
              </div>
            ),
          },
          {
            key: 'nda',
            header: 'NDA',
            render: (inv) => (
              <span className="d-annotation" data-status={inv.ndaSigned ? 'success' : 'error'}>
                {inv.ndaSigned ? 'Signed' : 'Pending'}
              </span>
            ),
          },
          { key: 'documentsViewed', header: 'Docs Viewed', render: (inv) => <span className="mono-data">{inv.documentsViewed}</span> },
          { key: 'lastAccess', header: 'Last Access', render: (inv) => <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{inv.lastAccess}</span> },
        ]}
        rows={investors}
      />
    </div>
  );
}
