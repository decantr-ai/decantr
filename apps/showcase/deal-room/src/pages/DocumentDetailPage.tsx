import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DocumentViewer } from '@/components/DocumentViewer';
import { documents } from '@/data/mock';

export function DocumentDetailPage() {
  const { id } = useParams();
  const doc = documents.find(d => d.id === id) || documents[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <NavLink to="/documents" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Documents
      </NavLink>

      <PageHeader
        title={doc.name}
        description={`${doc.folder} · Version ${doc.version} · ${doc.size}`}
        actions={
          <span className="d-annotation" data-status={doc.status === 'final' ? 'success' : doc.status === 'draft' ? 'warning' : 'info'}>
            {doc.status.replace('-', ' ')}
          </span>
        }
      />

      <DocumentViewer name={doc.name} watermarked={doc.watermarked} />

      <div className="dr-card" style={{ padding: '1.25rem' }}>
        <h3 className="serif-display" style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Document Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem' }}>
          {[
            ['Type', doc.type],
            ['Folder', doc.folder],
            ['Size', doc.size],
            ['Version', `v${doc.version}`],
            ['Uploaded By', doc.uploadedBy],
            ['Uploaded At', doc.uploadedAt],
            ['Watermarked', doc.watermarked ? 'Yes' : 'No'],
            ['Status', doc.status],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="d-label" style={{ marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ color: 'var(--d-text)' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
