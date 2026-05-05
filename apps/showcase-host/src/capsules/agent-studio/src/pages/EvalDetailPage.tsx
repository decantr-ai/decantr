import { useParams } from 'react-router-dom';
import { evals } from '@/data/mock';
import { Download, Play } from 'lucide-react';

export function EvalDetailPage() {
  const { id } = useParams();
  const run = evals.find(e => e.id === id) || evals[0];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="status-dot" data-status={run.status} />
            <h1 style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--d-font-mono)' }}>{run.name}</h1>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)' }}>{run.agent} · {run.model} · {run.timestamp}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem' }}><Download size={12} /> Export</button>
          <button className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontSize: '0.75rem' }}>
            <Play size={12} /> Rerun
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <SummaryCard label="score" value={run.score > 0 ? `${run.score}%` : '—'} accent />
        <SummaryCard label="passed" value={`${run.passed}`} color="var(--d-success)" />
        <SummaryCard label="failed" value={`${run.failed}`} color="var(--d-error)" />
        <SummaryCard label="duration" value={`${(run.duration / 1000).toFixed(1)}s`} />
      </div>

      {/* Per-test breakdown */}
      <div className="carbon-panel">
        <div className="carbon-panel-header">
          <span>test cases · {run.cases.length}</span>
          <span style={{ fontSize: '0.65rem' }}>avg {(run.cases.reduce((s, c) => s + c.latency, 0) / run.cases.length).toFixed(0)}ms</span>
        </div>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">#</th>
              <th className="d-data-header">Input</th>
              <th className="d-data-header">Result</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Score</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Latency</th>
            </tr>
          </thead>
          <tbody>
            {run.cases.map((c, i) => (
              <tr key={c.id} className="d-data-row">
                <td className="d-data-cell mono-data" style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>#{i + 1}</td>
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.75rem' }}>{c.input}</td>
                <td className="d-data-cell">
                  <span className="d-annotation" data-status={c.passed ? 'success' : 'error'} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                    {c.passed ? 'PASS' : 'FAIL'}
                  </span>
                </td>
                <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.78rem' }}>{c.score.toFixed(2)}</td>
                <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{c.latency}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color, accent }: { label: string; value: string; color?: string; accent?: boolean }) {
  return (
    <div className="carbon-card" style={{ padding: '0.875rem', borderColor: accent ? 'color-mix(in srgb, var(--d-accent) 30%, var(--d-border))' : undefined }}>
      <div className="d-label" style={{ marginBottom: 4 }}>{label}</div>
      <div className="mono-data" style={{ fontSize: '1.5rem', fontWeight: 600, color: accent ? 'var(--d-accent)' : color }}>{value}</div>
    </div>
  );
}
