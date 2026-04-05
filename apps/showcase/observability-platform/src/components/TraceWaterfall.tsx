import type { TraceSpan } from '@/data/mock';

export function TraceWaterfall({ spans, totalDuration }: { spans: TraceSpan[]; totalDuration: number }) {
  return (
    <div className="fin-surface" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 120px 1fr',
        padding: '0.5rem 0.75rem',
        borderBottom: '1px solid var(--d-border)',
        background: 'var(--d-surface)',
      }}>
        <div className="fin-label">Service · Operation</div>
        <div className="fin-label">Duration</div>
        <div className="fin-label">Timeline — {totalDuration}ms total</div>
      </div>
      <div>
        {spans.map(span => {
          const offsetPct = (span.start / totalDuration) * 100;
          const widthPct = Math.max((span.duration / totalDuration) * 100, 0.5);
          return (
            <div key={span.id} style={{
              display: 'grid',
              gridTemplateColumns: '280px 120px 1fr',
              alignItems: 'center',
              padding: '0.375rem 0.75rem',
              borderBottom: '1px solid color-mix(in srgb, var(--d-border) 50%, transparent)',
              fontSize: '0.75rem',
              fontFamily: 'ui-monospace, monospace',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', paddingLeft: span.depth * 14, overflow: 'hidden' }}>
                <span className="fin-status-dot" data-health={span.status === 'error' ? 'critical' : span.status === 'slow' ? 'degraded' : 'healthy'} />
                <span style={{ color: 'var(--d-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--d-text)' }}>{span.service}</span>
                  <span style={{ opacity: 0.5 }}> · </span>
                  {span.operation}
                </span>
              </div>
              <div style={{ color: span.status === 'error' ? 'var(--d-error)' : span.status === 'slow' ? 'var(--d-warning)' : 'var(--d-text)', fontVariantNumeric: 'tabular-nums' }}>
                {span.duration}ms
              </div>
              <div style={{ position: 'relative', height: 18 }}>
                <div style={{ position: 'absolute', left: `${offsetPct}%`, width: `${widthPct}%` }}>
                  <div className="fin-span-bar" data-status={span.status} data-kind={span.kind} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
