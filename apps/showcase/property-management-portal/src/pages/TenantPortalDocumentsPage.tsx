import { FileText, Download } from 'lucide-react';
import { SectionLabel } from '@/components/SectionLabel';
import { tenantDocuments } from '@/data/mock';

const typeColor: Record<string, string> = {
  Lease: 'var(--d-primary)',
  Addendum: 'var(--d-info)',
  Receipt: 'var(--d-success)',
  Notice: 'var(--d-warning)',
  Policy: 'var(--d-accent)',
};

export function TenantPortalDocumentsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-primary)' }}>Documents</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          Your lease, addendums, receipts, and policies
        </p>
      </div>

      <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '0.875rem' }}>All Documents</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tenantDocuments.map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)' }}>
              <FileText size={18} style={{ color: typeColor[d.type] ?? 'var(--d-text-muted)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{d.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{d.type} · {d.size} · {d.uploaded}</div>
              </div>
              <button className="d-interactive" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                <Download size={13} /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
