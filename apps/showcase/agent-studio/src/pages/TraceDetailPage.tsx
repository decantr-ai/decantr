import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Play } from 'lucide-react';
import { traces } from '@/data/mock';

export function TraceDetailPage() {
  const { id } = useParams();
  const trace = traces.find(t => t.id === id) || traces[0];
  const [selectedSpan, setSelectedSpan] = useState(trace.spans[0]);

  const totalDuration = trace.duration;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="status-dot" data-status={trace.status} />
            <h1 className="mono-inline" style={{ fontSize: '0.85rem', color: 'var(--d-accent)' }}>{trace.id}</h1>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)' }}>{trace.agent} · {trace.user} · {trace.timestamp}</p>
        </div>
        <button className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontSize: '0.75rem' }}>
          <Play size={12} /> Replay
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <MetricCard label="duration" value={`${trace.duration}ms`} />
        <MetricCard label="tokens" value={trace.tokens.toLocaleString()} />
        <MetricCard label="cost" value={`$${trace.cost.toFixed(4)}`} />
        <MetricCard label="spans" value={`${trace.spans.length}`} />
      </div>

      {/* Waterfall + span detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '0.5rem' }}>
        <div className="carbon-panel">
          <div className="carbon-panel-header">waterfall · {totalDuration}ms</div>
          <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {trace.spans.map(s => {
              const pct = (s.duration / totalDuration) * 100;
              const left = (s.start / totalDuration) * 100;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSpan(s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '3px 4px', borderRadius: 3, background: selectedSpan.id === s.id ? 'color-mix(in srgb, var(--d-accent) 8%, transparent)' : undefined }}
                >
                  <div style={{ paddingLeft: s.depth * 14, width: 180, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontFamily: 'var(--d-font-mono)' }}>
                    <span style={{ fontSize: '0.55rem', padding: '1px 4px', borderRadius: 2, background: 'var(--d-surface-raised)', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.kind}</span>
                    <span style={{ color: s.status === 'error' ? 'var(--d-error)' : 'var(--d-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                  </div>
                  <div className="waterfall-track" style={{ flex: 1 }}>
                    <div
                      className="waterfall-bar"
                      data-kind={s.kind}
                      data-status={s.status}
                      style={{ left: `${left}%`, width: `${pct}%` }}
                    />
                  </div>
                  <span className="mono-data" style={{ width: 56, textAlign: 'right', fontSize: '0.7rem', color: 'var(--d-text-muted)', flexShrink: 0 }}>{s.duration}ms</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Span detail */}
        <div className="carbon-panel">
          <div className="carbon-panel-header">
            <span>{selectedSpan.name}</span>
            <span style={{ fontSize: '0.65rem' }}>{selectedSpan.duration}ms</span>
          </div>
          <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem' }}>
            <div>
              <div className="d-label" style={{ marginBottom: 2 }}>kind</div>
              <span className="mono-inline" style={{ fontSize: '0.7rem' }}>{selectedSpan.kind}</span>
            </div>
            <div>
              <div className="d-label" style={{ marginBottom: 2 }}>status</div>
              <span className="d-annotation" data-status={selectedSpan.status === 'ok' ? 'success' : 'error'} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                {selectedSpan.status}
              </span>
            </div>
            {selectedSpan.tokens && (
              <div>
                <div className="d-label" style={{ marginBottom: 2 }}>tokens</div>
                <div className="mono-data" style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>
                  prompt: {selectedSpan.tokens.prompt} · completion: {selectedSpan.tokens.completion}
                </div>
              </div>
            )}
            {selectedSpan.input && (
              <div>
                <div className="d-label" style={{ marginBottom: 4 }}>input</div>
                <div className="mono-code" style={{ fontSize: '0.7rem', padding: '0.5rem 0.625rem' }}>{selectedSpan.input}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input/output */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
        <div className="carbon-panel">
          <div className="carbon-panel-header">input</div>
          <div className="mono-code" style={{ padding: '0.875rem 1rem', borderRadius: 0, border: 'none', background: '#0F0F12' }}>{trace.input}</div>
        </div>
        <div className="carbon-panel">
          <div className="carbon-panel-header">output</div>
          <div className="mono-code" style={{ padding: '0.875rem 1rem', borderRadius: 0, border: 'none', background: '#0F0F12' }}>{trace.output}</div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="carbon-card" style={{ padding: '0.75rem 0.875rem' }}>
      <div className="d-label" style={{ marginBottom: 4 }}>{label}</div>
      <div className="mono-data" style={{ fontSize: '1.125rem', fontWeight: 600 }}>{value}</div>
    </div>
  );
}
