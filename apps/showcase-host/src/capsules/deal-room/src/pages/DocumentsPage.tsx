import { Upload, FileText, Lock, FolderOpen } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { documents, folders } from '@/data/mock';

const statusColors: Record<string, string> = { 'final': 'success', 'draft': 'warning', 'under-review': 'info' };

export function DocumentsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Document Vault"
        description="All documents across active deals. Watermarked and access-tracked."
        actions={
          <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8rem' }}>
            <Upload size={14} /> Upload
          </button>
        }
      />

      {/* Folders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {folders.map(f => (
          <div key={f.name} className="dr-card" data-interactive style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <FolderOpen size={18} style={{ color: 'var(--d-primary)' }} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{f.name}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>{f.count} files</div>
            </div>
          </div>
        ))}
      </div>

      <DataTable
        columns={[
          {
            key: 'name',
            header: 'Document',
            render: (d) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="dr-doc-icon" data-type={d.type}><FileText size={16} /></div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{d.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>{d.folder} · {d.size}</div>
                </div>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (d) => <span className="d-annotation" data-status={statusColors[d.status]}>{d.status.replace('-', ' ')}</span>,
          },
          { key: 'version', header: 'Version', render: (d) => <span className="mono-data">v{d.version}</span> },
          {
            key: 'watermark',
            header: 'Watermark',
            render: (d) => d.watermarked ? <Lock size={14} style={{ color: 'var(--d-primary)' }} /> : <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>--</span>,
          },
          { key: 'uploadedBy', header: 'Uploaded By', render: (d) => <span style={{ fontSize: '0.8rem' }}>{d.uploadedBy}</span> },
          { key: 'uploadedAt', header: 'Date', render: (d) => <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{d.uploadedAt}</span> },
        ]}
        rows={documents}
      />
    </div>
  );
}
