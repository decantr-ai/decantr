import { Link } from 'react-router-dom';
import { SidebarMainShell } from '@/components/SidebarMainShell';
import { JOB_RUNS, type JobStatus } from '@/data/mock';

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

const STATUS_GLYPH: Record<JobStatus, string> = {
  success: '●',
  running: '◐',
  failed: '✗',
  queued: '○',
};

function fmtRows(n: number) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}

function fmtDur(s: number): string {
  if (s === 0) return '—';
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m${String(r).padStart(2, '0')}s`;
}

export function JobsPage() {
  const successRate = (JOB_RUNS.filter((j) => j.status === 'success').length / JOB_RUNS.length) * 100;

  return (
    <SidebarMainShell title="JOBS" navItems={NAV}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
        <h1 className="term-glow" style={{ fontSize: '1rem', color: 'var(--d-primary)', margin: 0 }}>
          $ ps runs --watch
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
          <span>{JOB_RUNS.length} runs</span>
          <span style={{ color: 'var(--d-primary)' }}>{JOB_RUNS.filter((j) => j.status === 'success').length} ok</span>
          <span style={{ color: 'var(--d-accent)' }}>{JOB_RUNS.filter((j) => j.status === 'running').length} active</span>
          <span style={{ color: 'var(--d-error)' }}>{JOB_RUNS.filter((j) => j.status === 'failed').length} failed</span>
          <span>success: {successRate.toFixed(1)}%</span>
        </div>
      </div>

      <div className="term-canvas" style={{ border: '1px solid var(--d-border)' }}>
        <table className="term-table" style={{ fontSize: '0.72rem' }}>
          <thead>
            <tr>
              <th style={{ width: '2rem' }}></th>
              <th style={{ width: '6rem' }}>RUN ID</th>
              <th>PIPELINE</th>
              <th style={{ width: '6rem' }}>TRIGGER</th>
              <th style={{ width: '5rem', textAlign: 'right' }}>DURATION</th>
              <th style={{ width: '6rem', textAlign: 'right' }}>ROWS</th>
              <th style={{ width: '7rem' }}>STARTED</th>
              <th style={{ width: '6rem' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {JOB_RUNS.map((j) => (
              <tr key={j.id}>
                <td style={{ color: STATUS_COLOR[j.status], textAlign: 'center' }}>{STATUS_GLYPH[j.status]}</td>
                <td>
                  <Link to={`/jobs/${j.id}`} style={{ color: 'var(--d-accent)', textDecoration: 'underline' }}>
                    {j.id}
                  </Link>
                </td>
                <td style={{ color: 'var(--d-text)' }}>{j.pipelineName}</td>
                <td style={{ color: 'var(--d-text-muted)', textTransform: 'uppercase', fontSize: '0.65rem' }}>{j.trigger}</td>
                <td style={{ textAlign: 'right' }}>{fmtDur(j.durationSec)}</td>
                <td style={{ textAlign: 'right', color: 'var(--d-primary)' }}>{fmtRows(j.rowsProcessed)}</td>
                <td style={{ color: 'var(--d-text-muted)' }}>{new Date(j.startedAt).toLocaleTimeString()}</td>
                <td style={{ color: STATUS_COLOR[j.status], textTransform: 'uppercase', fontWeight: 600 }}>{j.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SidebarMainShell>
  );
}
