import { NavLink } from 'react-router-dom';
import { Plus, Grid3X3, List } from 'lucide-react';
import { useState } from 'react';
import { projects } from '@/data/mock';

export function ProjectsPage() {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Projects</h1>
        <NavLink to="/projects/templates" className="d-interactive" data-variant="primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          <Plus size={14} /> New Project
        </NavLink>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {['all', 'draft', 'rendering', 'completed'].map(s => (
            <button
              key={s}
              className="d-interactive"
              data-variant={filter === s ? undefined : 'ghost'}
              onClick={() => setFilter(s)}
              style={{ padding: '4px 10px', fontSize: '0.75rem', textTransform: 'capitalize', border: filter === s ? '1px solid var(--d-primary)' : undefined, background: filter === s ? 'color-mix(in srgb, var(--d-primary) 12%, transparent)' : undefined }}
            >{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="d-interactive" data-variant="ghost" onClick={() => setView('grid')} style={{ padding: '4px', border: 'none', color: view === 'grid' ? 'var(--d-primary)' : 'var(--d-text-muted)' }}><Grid3X3 size={14} /></button>
          <button className="d-interactive" data-variant="ghost" onClick={() => setView('table')} style={{ padding: '4px', border: 'none', color: view === 'table' ? 'var(--d-primary)' : 'var(--d-text-muted)' }}><List size={14} /></button>
        </div>
      </div>

      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--d-gap-4)' }}>
          {filtered.map(p => (
            <NavLink key={p.id} to={`/editor/${p.id}`} className="d-surface" data-interactive style={{ textDecoration: 'none', color: 'inherit', padding: 0, overflow: 'hidden' }}>
              <div className="cinema-frame" data-ratio="16:9" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', borderRadius: 0, borderBottom: '1px solid var(--d-border)' }}>
                {p.thumbnail}
              </div>
              <div style={{ padding: 'var(--d-surface-p)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.title}</h3>
                  <span className="status-dot" data-status={p.status} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--d-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                  <span className="cinema-timecode" style={{ padding: '0.1rem 0.35rem' }}>{p.duration}</span>
                  <span>{p.scenes} scenes</span>
                  <span>{p.resolution}</span>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      ) : (
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Project</th>
              <th className="d-data-header">Duration</th>
              <th className="d-data-header">Scenes</th>
              <th className="d-data-header">Resolution</th>
              <th className="d-data-header">Status</th>
              <th className="d-data-header">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="d-data-row" style={{ cursor: 'pointer' }} onClick={() => window.location.hash = `/editor/${p.id}`}>
                <td className="d-data-cell" style={{ fontWeight: 500 }}>{p.thumbnail} {p.title}</td>
                <td className="d-data-cell"><span className="cinema-timecode">{p.duration}</span></td>
                <td className="d-data-cell">{p.scenes}</td>
                <td className="d-data-cell">{p.resolution}</td>
                <td className="d-data-cell"><span className="d-annotation" data-status={p.status === 'completed' ? 'success' : p.status === 'rendering' ? 'warning' : undefined}>{p.status}</span></td>
                <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>{p.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
