import { useState } from 'react';
import { alertRules } from '@/data/mock';
import { Plus } from 'lucide-react';

export function AlertRulesPage() {
  const [metric, setMetric] = useState('http.request.duration.p99');
  const [condition, setCondition] = useState('>');
  const [threshold, setThreshold] = useState('500');
  const [window, setWindow] = useState('5m');
  const [severity, setSeverity] = useState('high');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Alert Rules</h1>

      {/* Rule builder */}
      <div className="fin-card">
        <div className="fin-label" style={{ marginBottom: 10 }}>Create Rule</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
          <div>
            <div className="fin-label" style={{ marginBottom: 4 }}>Metric</div>
            <input className="fin-input" value={metric} onChange={e => setMetric(e.target.value)} />
          </div>
          <div>
            <div className="fin-label" style={{ marginBottom: 4 }}>Condition</div>
            <select className="fin-input" value={condition} onChange={e => setCondition(e.target.value)}>
              <option>&gt;</option><option>&lt;</option><option>=</option><option>&gt;=</option>
            </select>
          </div>
          <div>
            <div className="fin-label" style={{ marginBottom: 4 }}>Threshold</div>
            <input className="fin-input" value={threshold} onChange={e => setThreshold(e.target.value)} />
          </div>
          <div>
            <div className="fin-label" style={{ marginBottom: 4 }}>Window</div>
            <select className="fin-input" value={window} onChange={e => setWindow(e.target.value)}>
              <option>1m</option><option>5m</option><option>15m</option><option>1h</option>
            </select>
          </div>
          <div>
            <div className="fin-label" style={{ marginBottom: 4 }}>Severity</div>
            <select className="fin-input" value={severity} onChange={e => setSeverity(e.target.value)}>
              <option>critical</option><option>high</option><option>medium</option><option>low</option>
            </select>
          </div>
          <button className="d-interactive" data-variant="primary" style={{ padding: '6px 12px', fontSize: '0.75rem', height: 30 }}>
            <Plus size={12} /> Add
          </button>
        </div>
        <div style={{ marginTop: 10, padding: '0.5rem 0.625rem', background: 'var(--d-bg)', border: '1px solid var(--d-border)', borderRadius: 2, fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>
          <span style={{ color: 'var(--d-primary)' }}>WHEN</span> {metric} {condition} {threshold} <span style={{ color: 'var(--d-primary)' }}>FOR</span> {window} <span style={{ color: 'var(--d-primary)' }}>SEVERITY</span> {severity}
        </div>
      </div>

      {/* Rules table */}
      <div className="fin-card">
        <div className="fin-label" style={{ marginBottom: 10 }}>Existing Rules — {alertRules.length}</div>
        <table className="fin-table">
          <thead>
            <tr>
              <th>Name</th><th>Metric</th><th>Condition</th><th>Window</th><th>Severity</th><th>Enabled</th><th>Triggers 24h</th>
            </tr>
          </thead>
          <tbody>
            {alertRules.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 500 }}>{r.name}</td>
                <td style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--d-text-muted)', fontSize: '0.7rem' }}>{r.metric}</td>
                <td style={{ fontFamily: 'ui-monospace, monospace' }}>{r.condition} {r.threshold}</td>
                <td style={{ fontFamily: 'ui-monospace, monospace' }}>{r.window}</td>
                <td><span className="fin-badge" data-severity={r.severity}>{r.severity}</span></td>
                <td>
                  <span className="fin-badge" data-severity={r.enabled ? 'info' : undefined} style={{ color: r.enabled ? 'var(--d-success)' : 'var(--d-text-muted)', borderColor: r.enabled ? 'var(--d-success)' : undefined }}>
                    {r.enabled ? 'on' : 'off'}
                  </span>
                </td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>{r.triggers24h}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
