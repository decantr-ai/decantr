import { css } from '@decantr/css';
import { contractDiffLines } from '../data/mock';
import { ContractDiff } from '../components/ContractDiff';

export function ContractComparePage() {
  const oldLines = contractDiffLines.filter((l) => l.type !== 'add');
  const newLines = contractDiffLines.filter((l) => l.type !== 'remove');

  return (
    <div className={css('_flex _col _gap4')}>
      <div className={css('_flex _aic _jcsb')}>
        <h1 className="counsel-header" style={{ fontSize: '1.25rem' }}>Compare Versions</h1>
        <div className={css('_flex _gap2')}>
          <select className="d-control" defaultValue="v2" style={{ width: 'auto', minWidth: 100 }}>
            <option value="v1">Version 1</option>
            <option value="v2">Version 2</option>
          </select>
          <span style={{ color: 'var(--d-text-muted)', alignSelf: 'center' }}>vs</span>
          <select className="d-control" defaultValue="v3" style={{ width: 'auto', minWidth: 100 }}>
            <option value="v2">Version 2</option>
            <option value="v3">Version 3</option>
          </select>
        </div>
      </div>

      {/* Unified diff */}
      <ContractDiff lines={contractDiffLines} title="Unified Diff View" />

      {/* Side-by-side */}
      <div>
        <p className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
          Side-by-Side Comparison
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p className="d-label" style={{ marginBottom: '0.5rem' }}>Version 2 (Original)</p>
            <div style={{ border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', padding: '1rem', fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem', lineHeight: 1.8, background: 'var(--d-surface)' }}>
              {oldLines.map((line, i) => (
                <div key={i} style={{ color: line.type === 'remove' ? 'var(--d-error)' : 'var(--d-text)', textDecoration: line.type === 'remove' ? 'line-through' : undefined }}>
                  {line.text || '\u00A0'}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="d-label" style={{ marginBottom: '0.5rem' }}>Version 3 (Revised)</p>
            <div style={{ border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', padding: '1rem', fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem', lineHeight: 1.8, background: 'var(--d-surface)' }}>
              {newLines.map((line, i) => (
                <div key={i} style={{ color: line.type === 'add' ? 'var(--d-success)' : 'var(--d-text)', fontWeight: line.type === 'add' ? 600 : undefined }}>
                  {line.text || '\u00A0'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
