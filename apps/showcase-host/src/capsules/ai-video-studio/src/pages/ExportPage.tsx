import { NavLink } from 'react-router-dom';
import { ArrowLeft, Download, Film } from 'lucide-react';

export function ExportPage() {
  const formats = [
    { label: '4K (3840x2160)', codec: 'H.265', size: '~420MB', recommended: true },
    { label: '1080p (1920x1080)', codec: 'H.264', size: '~180MB', recommended: false },
    { label: '720p (1280x720)', codec: 'H.264', size: '~85MB', recommended: false },
    { label: 'Vertical (1080x1920)', codec: 'H.264', size: '~160MB', recommended: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)', maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <NavLink to="/editor" className="d-interactive" data-variant="ghost" style={{ padding: '4px', border: 'none' }}><ArrowLeft size={16} /></NavLink>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Export</h1>
      </div>
      <p style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>Choose a format and resolution for your final render.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {formats.map(f => (
          <div key={f.label} className="d-surface" data-interactive style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', borderColor: f.recommended ? 'var(--d-primary)' : undefined }}>
            <Film size={20} style={{ color: 'var(--d-primary)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {f.label}
                {f.recommended && <span className="d-annotation" data-status="info" style={{ fontSize: '0.6rem' }}>Recommended</span>}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{f.codec} &middot; {f.size}</div>
            </div>
            <button className="d-interactive" data-variant={f.recommended ? 'primary' : 'ghost'} style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
              <Download size={12} /> Export
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
