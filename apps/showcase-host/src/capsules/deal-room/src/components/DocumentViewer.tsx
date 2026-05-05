import { FileText, Download, Eye, Lock } from 'lucide-react';

export function DocumentViewer({ name, watermarked }: { name: string; watermarked: boolean }) {
  return (
    <div className={`d-surface ${watermarked ? 'dr-watermark' : ''}`} style={{ padding: '2rem', minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', position: 'relative' }}>
      {watermarked && (
        <div className="dr-confidential-badge" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <Lock size={10} /> Confidential
        </div>
      )}
      <FileText size={48} style={{ color: 'var(--d-text-muted)', opacity: 0.5 }} />
      <div className="serif-display" style={{ fontSize: '1rem', fontWeight: 600, textAlign: 'center' }}>{name}</div>
      <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
        Document preview would render here in a production environment.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button className="d-interactive" style={{ fontSize: '0.8rem' }}>
          <Eye size={14} /> View
        </button>
        <button className="d-interactive" style={{ fontSize: '0.8rem' }}>
          <Download size={14} /> Download
        </button>
      </div>
    </div>
  );
}
