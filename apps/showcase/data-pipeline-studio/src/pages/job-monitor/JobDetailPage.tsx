import { useState, useEffect, useRef } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { SidebarMainShell } from '@/components/SidebarMainShell';
import { getJobById, LOG_LINES, type JobStatus } from '@/data/mock';

const NAV = [
  { label: 'All Runs', to: '/jobs' },
  { label: 'Failed', to: '/jobs' },
  { label: 'Running', to: '/jobs' },
];

const STATUS_COLOR: Record<JobStatus, string> = {
  success: 'var(--d-primary)',
  running: 'var(--d-accent)',
  failed: 'var(--d-error)',
  queued: 'var(--d-text-muted)',
};

function fmtMs(ms: number): string {
  if (ms === 0) return '—';
  if (ms < 1000) return ms + 'ms';
  return (ms / 1000).toFixed(1) + 's';
}

function logColor(line: string): string {
  if (line.includes('ERROR')) return 'var(--d-error)';
  if (line.includes('WARN')) return 'var(--d-warning)';
  if (line.includes('DEBUG')) return 'var(--d-text-muted)';
  return 'var(--d-text)';
}

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const job = getJobById(id || '');
  const [logs, setLogs] = useState<string[]>(() => LOG_LINES.slice(0, 6));
  const logRef = useRef<HTMLDivElement>(null);
  const idxRef = useRef(6);

  useEffect(() => {
    if (!job || job.status !== 'running') return;
    const int = setInterval(() => {
      setLogs((prev) => {
        if (idxRef.current >= LOG_LINES.length) idxRef.current = 0;
        const next = [...prev, LOG_LINES[idxRef.current++]];
        if (next.length > 200) return next.slice(-200);
        return next;
      });
    }, 900);
    return () => clearInterval(int);
  }, [job]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  if (!job) return <Navigate to="/jobs" replace />;

  const maxStep = Math.max(...job.steps.map((s) => s.durationMs), 1);
  const totalMs = job.steps.reduce((s, st) => s + st.durationMs, 0);

  return (
    <SidebarMainShell title="JOBS" navItems={NAV}>
      <div style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}>
        <Link to="/jobs" style={{ color: 'var(--d-accent)' }}>&larr; runs</Link>
      </div>

      {/* Header */}
      <div className="term-panel" style={{ padding: '0.75rem 1rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="term-glow" style={{ fontSize: '1rem', color: 'var(--d-primary)', margin: '0 0 0.25rem' }}>
              {job.id} · {job.pipelineName}
            </h1>
            <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
              started {new Date(job.startedAt).toLocaleString()} · trigger: {job.trigger}
            </div>
          </div>
          <span
            className="d-annotation"
            data-status={job.status === 'success' ? 'success' : job.status === 'failed' ? 'error' : job.status === 'running' ? 'info' : 'warning'}
            style={{ textTransform: 'uppercase', fontWeight: 600 }}
          >
            ● {job.status}
          </span>
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {[
          { label: 'DURATION', value: job.durationSec > 0 ? `${job.durationSec}s` : '—' },
          { label: 'ROWS', value: job.rowsProcessed.toLocaleString() },
          { label: 'STEPS', value: `${job.steps.filter((s) => s.status === 'success').length}/${job.steps.length}` },
          { label: 'THROUGHPUT', value: job.durationSec > 0 ? `${Math.round(job.rowsProcessed / job.durationSec).toLocaleString()}/s` : '—' },
        ].map((k) => (
          <div key={k.label} className="term-panel" style={{ padding: '0.5rem 0.625rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.25rem' }}>{k.label}</div>
            <div style={{ fontSize: '0.95rem', color: 'var(--d-text)', fontWeight: 600 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Trace waterfall */}
      <div className="term-panel" style={{ padding: '0.75rem', marginBottom: '0.75rem' }}>
        <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>// TRACE WATERFALL</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {job.steps.map((step, i) => {
            const pct = (step.durationMs / maxStep) * 100;
            const offset = job.steps.slice(0, i).reduce((s, st) => s + st.durationMs, 0);
            const offsetPct = (offset / totalMs) * 100;
            return (
              <div key={step.id} style={{ display: 'grid', gridTemplateColumns: '12rem 1fr 5rem 5rem', gap: '0.5rem', alignItems: 'center', fontSize: '0.72rem' }}>
                <div style={{ color: STATUS_COLOR[step.status], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {step.status === 'success' ? '●' : step.status === 'running' ? '◐' : step.status === 'failed' ? '✗' : '○'} {step.name}
                </div>
                <div style={{ position: 'relative', height: '1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--d-border)' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${offsetPct}%`,
                      width: `${Math.max(0.5, pct)}%`,
                      top: 0,
                      bottom: 0,
                      background: STATUS_COLOR[step.status],
                      opacity: 0.7,
                    }}
                  />
                </div>
                <div style={{ color: 'var(--d-text-muted)', textAlign: 'right' }}>{fmtMs(step.durationMs)}</div>
                <div style={{ color: 'var(--d-primary)', textAlign: 'right' }}>
                  {step.rowsOut > 0 ? step.rowsOut.toLocaleString() : '—'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log stream */}
      <div className="term-panel" style={{ padding: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div className="d-label" style={{ color: 'var(--d-accent)' }}>// LOG STREAM</div>
          <span style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
            {logs.length} lines{job.status === 'running' ? ' · streaming' : ''}
          </span>
        </div>
        <div
          ref={logRef}
          className="term-canvas"
          style={{
            height: 200,
            border: '1px solid var(--d-border)',
            padding: '0.5rem',
            overflow: 'auto',
            fontSize: '0.7rem',
            lineHeight: 1.6,
          }}
        >
          {logs.map((line, i) => (
            <div key={i} style={{ color: logColor(line), whiteSpace: 'pre', fontFamily: 'inherit' }}>
              {line}
            </div>
          ))}
          {job.status === 'running' && <span className="term-blink" style={{ color: 'var(--d-primary)' }} />}
        </div>
      </div>
    </SidebarMainShell>
  );
}
