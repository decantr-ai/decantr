import { useParams, NavLink } from 'react-router-dom';
import { traces, traceSpans } from '@/data/mock';
import { TraceWaterfall } from '@/components/TraceWaterfall';
import { ArrowLeft } from 'lucide-react';

export function TraceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const trace = traces.find(t => t.id === id) ?? traces[0];
  const total = 412;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <NavLink to="/traces" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--d-text-muted)', textDecoration: 'none', width: 'fit-content' }}>
        <ArrowLeft size={12} /> Back to traces
      </NavLink>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '1.05rem', fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>{trace.id}</h1>
        <span className="fin-badge" data-severity={trace.status === 'error' ? 'high' : 'info'}>{trace.status}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'ui-monospace, monospace' }}>
          {trace.rootService} · {trace.operation}
        </span>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
        {[
          { label: 'Duration', value: `${total}ms` },
          { label: 'Spans', value: traceSpans.length.toString() },
          { label: 'Services', value: '5' },
          { label: 'Errors', value: '2', color: 'var(--d-error)' },
          { label: 'Warnings', value: '1', color: 'var(--d-warning)' },
        ].map(s => (
          <div key={s.label} className="fin-card" style={{ padding: '0.625rem' }}>
            <div className="fin-label">{s.label}</div>
            <div className="fin-metric" data-size="sm" style={{ color: s.color, marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <TraceWaterfall spans={traceSpans} totalDuration={total} />
    </div>
  );
}
