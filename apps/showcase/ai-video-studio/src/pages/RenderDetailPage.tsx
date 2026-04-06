import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { renderJobs, renderLogs } from '@/data/mock';

export function RenderDetailPage() {
  const { id } = useParams();
  const job = renderJobs.find(r => r.id === id) || renderJobs[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      {/* Job header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <NavLink to="/renders" className="d-interactive" data-variant="ghost" style={{ padding: '4px', border: 'none' }}><ArrowLeft size={16} /></NavLink>
        <span className="status-dot" data-status={job.status} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{job.projectTitle}</h1>
        <span className="cinema-slate">{job.scene}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--d-gap-4)' }}>
        {[
          { label: 'Status', value: job.status, color: job.status === 'rendering' ? 'var(--d-primary)' : job.status === 'completed' ? 'var(--d-success)' : job.status === 'failed' ? 'var(--d-error)' : 'var(--d-text-muted)' },
          { label: 'Progress', value: `${job.progress}%`, color: 'var(--d-primary)' },
          { label: 'GPU', value: job.gpu, color: 'var(--d-text)' },
          { label: 'Resolution', value: job.resolution, color: 'var(--d-text)' },
          { label: 'Model', value: job.model, color: 'var(--d-text)' },
        ].map(s => (
          <div key={s.label} className="d-surface" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: s.color, textTransform: 'capitalize' }}>{s.value}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {job.status === 'rendering' && (
        <div className="d-surface" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.5rem' }}>
            <span>Rendering scene...</span>
            <span className="cinema-timecode">{job.progress}%</span>
          </div>
          <div className="progress-track" style={{ height: 8 }}>
            <div className="progress-fill" data-status="rendering" style={{ width: `${job.progress}%` }} />
          </div>
        </div>
      )}

      {/* Live logs */}
      <div>
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>LIVE LOGS</div>
        <div className="d-surface" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--d-radius)' }}>
          <div style={{ padding: '0.5rem 0.75rem', background: 'var(--d-surface-raised)', borderBottom: '1px solid var(--d-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--d-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
            <span>render-{job.id}.log</span>
            <span>{renderLogs.length} entries</span>
          </div>
          <div style={{ padding: '0.5rem 0', maxHeight: 400, overflowY: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', lineHeight: 1.8 }}>
            {renderLogs.map((log, i) => (
              <div key={i} style={{ padding: '0.1rem 0.75rem', display: 'flex', gap: '0.75rem', color: log.level === 'warn' ? 'var(--d-warning)' : log.level === 'success' ? 'var(--d-success)' : 'var(--d-text-muted)' }}>
                <span style={{ color: 'var(--d-text-muted)', opacity: 0.5, flexShrink: 0 }}>{log.time}</span>
                <span style={{ flexShrink: 0, width: 40, textAlign: 'right', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 600 }}>{log.level}</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
