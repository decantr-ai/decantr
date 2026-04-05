import { Link } from 'react-router-dom';
import { TerminalSplitShell } from '@/components/TerminalSplitShell';
import { PIPELINES } from '@/data/mock';

const STATUS_COLOR: Record<string, string> = {
  active: 'var(--d-primary)',
  paused: 'var(--d-warning)',
  failed: 'var(--d-error)',
  draft: 'var(--d-text-muted)',
};

const STATUS_GLYPH: Record<string, string> = {
  active: '●',
  paused: '❚❚',
  failed: '✗',
  draft: '◦',
};

export function PipelinesPage() {
  return (
    <TerminalSplitShell title="PIPELINES">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 0 }}>
        {/* Header */}
        <div
          className="term-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.75rem',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="d-label term-glow" style={{ color: 'var(--d-primary)' }}>$ ls pipelines/</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
              {PIPELINES.length} entries · {PIPELINES.filter((p) => p.status === 'active').length} active · {PIPELINES.filter((p) => p.status === 'failed').length} failed
            </span>
          </div>
          <button className="d-interactive" data-variant="primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: 0 }}>
            + New Pipeline
          </button>
        </div>

        {/* Table */}
        <div
          className="term-canvas"
          style={{
            flex: 1,
            overflow: 'auto',
            border: '1px solid var(--d-border)',
            minHeight: 0,
          }}
        >
          <table className="term-table" style={{ fontSize: '0.75rem' }}>
            <thead>
              <tr>
                <th style={{ width: '2rem' }}></th>
                <th>NAME</th>
                <th style={{ width: '9rem' }}>SCHEDULE</th>
                <th style={{ width: '7rem' }}>LAST RUN</th>
                <th style={{ width: '5rem', textAlign: 'right' }}>RUNS/D</th>
                <th style={{ width: '6rem', textAlign: 'right' }}>SUCCESS</th>
                <th style={{ width: '6rem' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {PIPELINES.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: STATUS_COLOR[p.status], textAlign: 'center' }}>
                    {STATUS_GLYPH[p.status]}
                  </td>
                  <td>
                    <Link to={`/pipelines/${p.id}`} style={{ color: 'var(--d-accent)', textDecoration: 'underline' }}>
                      {p.name}
                    </Link>
                    <div style={{ color: 'var(--d-text-muted)', fontSize: '0.6875rem', marginTop: '0.125rem' }}>
                      {p.description}
                    </div>
                  </td>
                  <td style={{ color: 'var(--d-text-muted)', fontFamily: 'inherit' }}>{p.schedule}</td>
                  <td style={{ color: 'var(--d-text-muted)' }}>{p.lastRun === '—' ? '—' : new Date(p.lastRun).toLocaleTimeString()}</td>
                  <td style={{ textAlign: 'right' }}>{p.runsToday}</td>
                  <td style={{ textAlign: 'right', color: p.successRate >= 95 ? 'var(--d-primary)' : p.successRate >= 85 ? 'var(--d-warning)' : 'var(--d-error)' }}>
                    {p.successRate.toFixed(1)}%
                  </td>
                  <td>
                    <span style={{ color: STATUS_COLOR[p.status], fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TerminalSplitShell>
  );
}
