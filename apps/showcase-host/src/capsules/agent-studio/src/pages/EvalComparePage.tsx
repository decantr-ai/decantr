import { PageHeader } from '@/components/PageHeader';
import { evals, models } from '@/data/mock';

export function EvalComparePage() {
  const testModels = models.slice(0, 4);
  return (
    <div>
      <PageHeader title="Model Comparison" description="Side-by-side eval results across models" />

      <div className="carbon-panel" style={{ marginBottom: '0.75rem' }}>
        <div className="carbon-panel-header">configuration</div>
        <div style={{ padding: '0.875rem 1rem', display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
          <div>
            <span className="d-label" style={{ marginRight: 6 }}>eval</span>
            <span className="mono-inline">{evals[0].name}</span>
          </div>
          <div>
            <span className="d-label" style={{ marginRight: 6 }}>cases</span>
            <span className="mono-inline">50</span>
          </div>
        </div>
      </div>

      {/* Model grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {testModels.map((m, i) => {
          const score = 94.2 - i * 3.8;
          const isBase = i === 0;
          return (
            <div key={m} className="carbon-card" style={{ padding: '0.875rem', borderColor: isBase ? 'color-mix(in srgb, var(--d-accent) 40%, var(--d-border))' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="mono-inline" style={{ fontSize: '0.65rem' }}>{m}</span>
                {isBase && <span className="neon-bg mono-inline" style={{ fontSize: '0.55rem' }}>BASE</span>}
              </div>
              <div className="mono-data" style={{ fontSize: '1.5rem', fontWeight: 600, color: isBase ? 'var(--d-accent)' : undefined }}>{score.toFixed(1)}%</div>
              <div className="progress-track" style={{ marginTop: 6 }}>
                <div className="progress-fill" style={{ width: `${score}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono)', marginTop: 6 }}>
                <span>{Math.floor(50 * score / 100)}/50 pass</span>
                <span>{(2.4 + i * 0.3).toFixed(1)}s avg</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Case-by-case comparison */}
      <div className="carbon-panel">
        <div className="carbon-panel-header">per-case scores</div>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Case</th>
              {testModels.map(m => (
                <th key={m} className="d-data-header" style={{ textAlign: 'right' }}>{m.split('-')[0]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }, (_, i) => (
              <tr key={i} className="d-data-row">
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.75rem' }}>case #{i + 1}</td>
                {testModels.map((m, j) => {
                  const score = 0.72 + Math.random() * 0.25 - j * 0.03;
                  return (
                    <td key={m} className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.78rem', color: j === 0 ? 'var(--d-accent)' : undefined }}>
                      {score.toFixed(3)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
