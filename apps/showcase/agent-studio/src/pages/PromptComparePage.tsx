import { PageHeader } from '@/components/PageHeader';
import { prompts } from '@/data/mock';

export function PromptComparePage() {
  const prompt = prompts[0];
  const [left, right] = [prompt.versions[1], prompt.versions[0]];

  // Naive diff — line-by-line
  const leftLines = left.content.split('\n');
  const rightLines = right.content.split('\n');

  return (
    <div>
      <PageHeader
        title="Compare Prompts"
        description={`${prompt.name} · ${left.version} → ${right.version}`}
      />
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="d-label">base</span>
          <select className="d-control" defaultValue={left.version} style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.78rem', maxWidth: 160 }}>
            {prompt.versions.map(v => <option key={v.version}>{v.version}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="d-label">compare</span>
          <select className="d-control" defaultValue={right.version} style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.78rem', maxWidth: 160 }}>
            {prompt.versions.map(v => <option key={v.version}>{v.version}</option>)}
          </select>
        </div>
      </div>

      {/* Diff */}
      <div className="carbon-panel" style={{ marginBottom: '0.75rem' }}>
        <div className="carbon-panel-header">
          <span>diff</span>
          <span style={{ fontSize: '0.65rem' }}>
            <span style={{ color: 'var(--d-success)' }}>+{rightLines.length}</span>
            {' '}
            <span style={{ color: 'var(--d-error)' }}>-{leftLines.length}</span>
          </span>
        </div>
        <div style={{ background: '#0F0F12' }}>
          {leftLines.map((line, i) => (
            <div key={`l-${i}`} className="diff-line" data-type="remove">- {line}</div>
          ))}
          {rightLines.map((line, i) => (
            <div key={`r-${i}`} className="diff-line" data-type="add">+ {line}</div>
          ))}
        </div>
      </div>

      {/* Test results */}
      <div className="carbon-panel">
        <div className="carbon-panel-header">
          <span>test results</span>
          <span style={{ fontSize: '0.65rem' }}>10 cases</span>
        </div>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">#</th>
              <th className="d-data-header">Input</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Base</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Compare</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Δ</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, i) => {
              const baseScore = 0.72 + Math.random() * 0.2;
              const compScore = baseScore + (i % 2 === 0 ? 0.08 : -0.03);
              const delta = compScore - baseScore;
              return (
                <tr key={i} className="d-data-row">
                  <td className="d-data-cell mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>#{i + 1}</td>
                  <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.75rem' }}>Summarize paper #{i + 1}</td>
                  <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.78rem' }}>{baseScore.toFixed(3)}</td>
                  <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.78rem' }}>{compScore.toFixed(3)}</td>
                  <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.78rem', color: delta > 0 ? 'var(--d-success)' : 'var(--d-error)' }}>
                    {delta > 0 ? '+' : ''}{delta.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
