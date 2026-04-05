import { useParams, NavLink } from 'react-router-dom';
import { logs, traceSpans } from '@/data/mock';
import { TraceWaterfall } from '@/components/TraceWaterfall';
import { ArrowLeft } from 'lucide-react';

export function LogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const log = logs.find(l => l.id === id) ?? logs[0];
  const total = 412;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <NavLink to="/logs" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--d-text-muted)', textDecoration: 'none', width: 'fit-content' }}>
        <ArrowLeft size={12} /> Back to logs
      </NavLink>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <h1 style={{ fontSize: '1.05rem', fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>log-entry</h1>
        <span className="fin-badge" data-level={log.level}>{log.level}</span>
      </div>

      {/* JSON viewer */}
      <div className="fin-card" style={{ padding: 0 }}>
        <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--d-border)' }}>
          <div className="fin-label">Raw Event</div>
        </div>
        <pre style={{
          padding: '0.75rem',
          margin: 0,
          fontFamily: 'ui-monospace, monospace',
          fontSize: '0.75rem',
          lineHeight: 1.6,
          overflowX: 'auto',
          color: 'var(--d-text)',
        }}>
{`{
  "timestamp": "${log.timestamp}",
  "level": "${log.level}",
  "service": "${log.service}",
  "message": "${log.message}",${log.traceId ? `\n  "trace_id": "${log.traceId}",` : ''}
  "attributes": ${JSON.stringify(log.attrs, null, 2).split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n')}
}`}
        </pre>
      </div>

      {/* Attributes table */}
      <div className="fin-card">
        <div className="fin-label" style={{ marginBottom: 8 }}>Structured Attributes</div>
        <table className="fin-table">
          <thead>
            <tr><th style={{ width: '40%' }}>Key</th><th>Value</th></tr>
          </thead>
          <tbody>
            {Object.entries(log.attrs).map(([k, v]) => (
              <tr key={k}>
                <td style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--d-text-muted)' }}>{k}</td>
                <td style={{ fontFamily: 'ui-monospace, monospace' }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trace context */}
      {log.traceId && (
        <div className="fin-card" style={{ padding: 0 }}>
          <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--d-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="fin-label">Trace Context · {log.traceId}</div>
            <NavLink to={`/traces/${log.traceId}`} style={{ fontSize: '0.7rem', fontFamily: 'ui-monospace, monospace', color: 'var(--d-primary)', textDecoration: 'none' }}>
              Open trace →
            </NavLink>
          </div>
          <TraceWaterfall spans={traceSpans.slice(0, 6)} totalDuration={total} />
        </div>
      )}
    </div>
  );
}
