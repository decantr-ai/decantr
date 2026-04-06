import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { renderJobs } from '@/data/mock';

export function RendersPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? renderJobs : renderJobs.filter(r => r.status === filter);

  const stats = {
    active: renderJobs.filter(r => r.status === 'rendering').length,
    queued: renderJobs.filter(r => r.status === 'queued').length,
    completed: renderJobs.filter(r => r.status === 'completed').length,
    failed: renderJobs.filter(r => r.status === 'failed').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Render Queue</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--d-gap-4)' }}>
        {[
          { label: 'Rendering', value: stats.active, color: 'var(--d-primary)' },
          { label: 'Queued', value: stats.queued, color: 'var(--d-text-muted)' },
          { label: 'Completed', value: stats.completed, color: 'var(--d-success)' },
          { label: 'Failed', value: stats.failed, color: 'var(--d-error)' },
        ].map(s => (
          <div key={s.label} className="d-surface" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {['all', 'rendering', 'queued', 'completed', 'failed'].map(s => (
          <button
            key={s}
            className="d-interactive"
            data-variant={filter === s ? undefined : 'ghost'}
            onClick={() => setFilter(s)}
            style={{ padding: '4px 10px', fontSize: '0.75rem', textTransform: 'capitalize', border: filter === s ? '1px solid var(--d-primary)' : undefined, background: filter === s ? 'color-mix(in srgb, var(--d-primary) 12%, transparent)' : undefined }}
          >{s}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map(job => (
          <NavLink key={job.id} to={`/renders/${job.id}`} className="d-surface" data-interactive style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="status-dot" data-status={job.status} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{job.projectTitle} &mdash; {job.scene}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                <span>{job.model}</span>
                <span>{job.resolution}</span>
                <span>{job.gpu}</span>
              </div>
            </div>
            {job.status === 'rendering' && (
              <div style={{ width: 120, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div className="progress-track">
                  <div className="progress-fill" data-status="rendering" style={{ width: `${job.progress}%` }} />
                </div>
                <span className="cinema-timecode" style={{ fontSize: '0.65rem' }}>{job.progress}%</span>
              </div>
            )}
            {job.status === 'completed' && <span className="cinema-timecode">{job.duration}</span>}
            {job.status === 'failed' && <span className="d-annotation" data-status="error">Failed</span>}
            {job.status === 'queued' && <span className="d-annotation">Queued</span>}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
