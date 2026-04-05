import { FileText, Download, Upload } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { tenantDocuments } from '@/data/mock';

const docTypeColor: Record<string, string> = {
  Lease: 'var(--d-primary)',
  Addendum: 'var(--d-info)',
  Receipt: 'var(--d-success)',
  Notice: 'var(--d-warning)',
  Policy: 'var(--d-accent)',
};

export function DocumentsPage() {
  const allDocs = [
    ...tenantDocuments,
    { id: 'd-p-1', name: 'The Meridian — Insurance 2026.pdf', type: 'Policy' as const, size: '412 KB', uploaded: '2026-01-14' },
    { id: 'd-p-2', name: 'Owner Statement March 2026.pdf', type: 'Receipt' as const, size: '98 KB', uploaded: '2026-04-01' },
    { id: 'd-p-3', name: 'Cedar Heights Appraisal 2025.pdf', type: 'Policy' as const, size: '1.2 MB', uploaded: '2025-11-20' },
    { id: 'd-p-4', name: 'Maple Grove — Vendor Agreement.pdf', type: 'Lease' as const, size: '184 KB', uploaded: '2025-09-08' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Documents"
        description="Leases, policies, and portfolio records"
        actions={
          <button className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>
            <Upload size={14} /> Upload file
          </button>
        }
      />

      <div className="pm-card" style={{ padding: 0 }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Name</th>
              <th className="d-data-header">Type</th>
              <th className="d-data-header">Size</th>
              <th className="d-data-header">Uploaded</th>
              <th className="d-data-header"></th>
            </tr>
          </thead>
          <tbody>
            {allDocs.map(d => (
              <tr key={d.id} className="d-data-row">
                <td className="d-data-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <FileText size={16} style={{ color: docTypeColor[d.type] ?? 'var(--d-text-muted)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{d.name}</span>
                </td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{d.type}</td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem', color: 'var(--d-text-muted)' }}>{d.size}</td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem', color: 'var(--d-text-muted)' }}>{d.uploaded}</td>
                <td className="d-data-cell" style={{ textAlign: 'right' }}>
                  <button className="d-interactive" data-variant="ghost" aria-label="Download" style={{ padding: '0.25rem 0.5rem', border: 'none' }}>
                    <Download size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
