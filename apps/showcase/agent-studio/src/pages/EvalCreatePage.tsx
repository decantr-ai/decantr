import { PageHeader } from '@/components/PageHeader';
import { agents, models } from '@/data/mock';
import { Play, Plus, Trash2 } from 'lucide-react';

export function EvalCreatePage() {
  const testCases = [
    { input: 'Summarize paper on transformers', expected: 'Structured 4-section brief' },
    { input: 'Compare RLHF vs DPO methods', expected: 'Bullet list of differences' },
    { input: 'Explain flash attention', expected: 'Technical explanation with formulas' },
    { input: 'Summarize MoE routing strategies', expected: 'Comparison table' },
  ];

  return (
    <div>
      <PageHeader
        title="New Eval Run"
        description="Configure a test suite and add cases"
        actions={
          <button className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontSize: '0.8rem' }}>
            <Play size={14} /> Launch run
          </button>
        }
      />

      {/* Config */}
      <div className="carbon-panel" style={{ marginBottom: '0.75rem' }}>
        <div className="carbon-panel-header">configuration</div>
        <div style={{ padding: '0.875rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label className="d-label">Name</label>
            <input className="d-control" defaultValue="research-synth.accuracy" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.78rem' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label className="d-label">Agent</label>
            <select className="d-control" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.78rem' }}>
              {agents.map(a => <option key={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label className="d-label">Model</label>
            <select className="d-control" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.78rem' }}>
              {models.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label className="d-label">Scorer</label>
            <select className="d-control" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.78rem' }}>
              <option>semantic-similarity</option>
              <option>llm-judge</option>
              <option>exact-match</option>
              <option>rouge-l</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test cases */}
      <div className="carbon-panel">
        <div className="carbon-panel-header">
          <span>test cases · {testCases.length}</span>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '2px 8px', fontSize: '0.65rem', border: 'none' }}>
            <Plus size={10} /> Add
          </button>
        </div>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header" style={{ width: 40 }}>#</th>
              <th className="d-data-header">Input</th>
              <th className="d-data-header">Expected</th>
              <th className="d-data-header" style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((c, i) => (
              <tr key={i} className="d-data-row">
                <td className="d-data-cell mono-data" style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>#{i + 1}</td>
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.75rem' }}>{c.input}</td>
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{c.expected}</td>
                <td className="d-data-cell">
                  <button className="d-interactive" data-variant="ghost" style={{ padding: '2px 6px', border: 'none' }}>
                    <Trash2 size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
