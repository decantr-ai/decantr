import { Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { auditEntries } from '@/data/mock';

const typeColors: Record<string, string> = {
  view: 'info', download: 'warning', upload: 'success', access: 'info', sign: 'success', comment: undefined as unknown as string,
};

export function AuditPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Audit Trail"
        description="Complete record of all deal room activity. Tamper-proof and exportable."
        actions={
          <button className="d-interactive" style={{ fontSize: '0.8rem' }}>
            <Download size={14} /> Export CSV
          </button>
        }
      />

      <DataTable
        columns={[
          {
            key: 'actor',
            header: 'Actor',
            render: (e) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="dr-monogram" style={{ width: 24, height: 24, fontSize: '0.5rem' }}>{e.actorAvatar}</div>
                <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{e.actor}</span>
              </div>
            ),
          },
          { key: 'action', header: 'Action', render: (e) => <span style={{ fontSize: '0.8rem' }}>{e.action}</span> },
          { key: 'resource', header: 'Resource', render: (e) => <span style={{ fontSize: '0.8rem', color: 'var(--d-primary)' }}>{e.resource}</span> },
          {
            key: 'type',
            header: 'Type',
            render: (e) => <span className="d-annotation" data-status={typeColors[e.type]}>{e.type}</span>,
          },
          { key: 'ip', header: 'IP Address', render: (e) => <span className="mono-data" style={{ fontSize: '0.72rem' }}>{e.ip}</span> },
          { key: 'timestamp', header: 'Timestamp', render: (e) => <span className="mono-data" style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{e.timestamp}</span> },
        ]}
        rows={auditEntries}
      />
    </div>
  );
}
