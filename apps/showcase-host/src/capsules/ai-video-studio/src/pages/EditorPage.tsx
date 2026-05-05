import { NavLink } from 'react-router-dom';
import { Plus, Film } from 'lucide-react';
import { projects } from '@/data/mock';

export function EditorPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Editor</h1>
        <NavLink to="/projects/templates" className="d-interactive" data-variant="primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          <Plus size={14} /> New Project
        </NavLink>
      </div>
      <p style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>Select a project to open in the timeline editor.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--d-gap-4)' }}>
        {projects.map(p => (
          <NavLink key={p.id} to={`/editor/${p.id}`} className="d-surface" data-interactive style={{ textDecoration: 'none', color: 'inherit', padding: 0, overflow: 'hidden' }}>
            <div className="cinema-frame" data-ratio="16:9" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', borderRadius: 0, borderBottom: '1px solid var(--d-border)' }}>
              {p.thumbnail}
            </div>
            <div style={{ padding: 'var(--d-surface-p)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Film size={14} style={{ color: 'var(--d-primary)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.title}</span>
              <span className="cinema-timecode" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>{p.duration}</span>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
