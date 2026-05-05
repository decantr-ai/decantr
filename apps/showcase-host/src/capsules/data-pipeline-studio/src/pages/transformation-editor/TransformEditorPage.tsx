import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { SidebarAsideShell } from '@/components/SidebarAsideShell';
import { getTransformById, PREVIEW_ROWS } from '@/data/mock';

const NAV = [
  { label: 'All Transforms', to: '/transforms' },
  { label: 'Data Preview', to: '/transforms/preview' },
];

function syntaxHighlightSQL(code: string) {
  return code
    .split('\n')
    .map((line, i) => {
      // very basic SQL highlighting
      const parts = line.split(/(--.*$|\b(?:SELECT|FROM|WHERE|JOIN|ON|GROUP BY|ORDER BY|WITH|AS|BY|AND|OR|NOT|CASE|WHEN|THEN|ELSE|END|COUNT|SUM|AVG|MIN|MAX|DATE|CAST|WINDOW|PARTITION|OVER|ROW_NUMBER|COALESCE|NULL|TRUE|FALSE|INSERT|UPDATE|DELETE|CREATE|TABLE|IF|EXISTS|DATE_TRUNC|DATE_DIFF|DATEADD|CURRENT_DATE|DESC|ASC|LEFT|RIGHT|INNER|OUTER|USING|DISTINCT|HAVING|UNION|IN|IS|BETWEEN|LIKE|LN|EXP|PERCENTILE_CONT|WITHIN|GROUP)\b)/gi);
      return (
        <div key={i} style={{ display: 'flex' }}>
          <span style={{ color: 'var(--d-text-muted)', width: '2.5rem', textAlign: 'right', paddingRight: '0.75rem', flexShrink: 0, userSelect: 'none', opacity: 0.5 }}>
            {String(i + 1).padStart(2, ' ')}
          </span>
          <span style={{ flex: 1, whiteSpace: 'pre' }}>
            {parts.map((part, j) => {
              if (part.startsWith('--')) return <span key={j} style={{ color: 'var(--d-text-muted)', fontStyle: 'italic' }}>{part}</span>;
              if (/^(SELECT|FROM|WHERE|JOIN|ON|GROUP BY|ORDER BY|WITH|AS|BY|AND|OR|NOT|CASE|WHEN|THEN|ELSE|END|INSERT|UPDATE|DELETE|CREATE|TABLE|IF|EXISTS|DESC|ASC|LEFT|RIGHT|INNER|OUTER|USING|DISTINCT|HAVING|UNION|IN|IS|BETWEEN|LIKE|WITHIN|GROUP|PARTITION|OVER|WINDOW)$/i.test(part)) {
                return <span key={j} style={{ color: 'var(--d-accent)', fontWeight: 600 }}>{part}</span>;
              }
              if (/^(COUNT|SUM|AVG|MIN|MAX|CAST|COALESCE|DATE_TRUNC|DATE_DIFF|DATEADD|CURRENT_DATE|ROW_NUMBER|LN|EXP|PERCENTILE_CONT)$/i.test(part)) {
                return <span key={j} style={{ color: 'var(--d-secondary)' }}>{part}</span>;
              }
              if (/^(NULL|TRUE|FALSE)$/i.test(part)) {
                return <span key={j} style={{ color: 'var(--d-warning)' }}>{part}</span>;
              }
              return <span key={j}>{part}</span>;
            })}
          </span>
        </div>
      );
    });
}

export function TransformEditorPage() {
  const { id } = useParams<{ id: string }>();
  const tx = getTransformById(id || '');
  const [code, setCode] = useState(tx?.code || '');
  const [view, setView] = useState<'editor' | 'preview'>('editor');

  if (!tx) return <Navigate to="/transforms" replace />;

  const previewCols = Object.keys(PREVIEW_ROWS[0]);

  const aside = (
    <div>
      <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>// METADATA</div>
      <dl style={{ fontSize: '0.7rem', margin: 0, lineHeight: 1.8 }}>
        <div><dt style={{ display: 'inline', color: 'var(--d-text-muted)' }}>owner </dt><dd style={{ display: 'inline', color: 'var(--d-text)' }}>{tx.owner}</dd></div>
        <div><dt style={{ display: 'inline', color: 'var(--d-text-muted)' }}>lang </dt><dd style={{ display: 'inline', color: 'var(--d-primary)' }}>{tx.language}</dd></div>
        <div><dt style={{ display: 'inline', color: 'var(--d-text-muted)' }}>runs </dt><dd style={{ display: 'inline', color: 'var(--d-text)' }}>{tx.runsToday}/day</dd></div>
        <div><dt style={{ display: 'inline', color: 'var(--d-text-muted)' }}>mod </dt><dd style={{ display: 'inline', color: 'var(--d-text)' }}>{new Date(tx.lastModified).toLocaleDateString()}</dd></div>
      </dl>

      <div className="d-label" style={{ color: 'var(--d-accent)', margin: '1rem 0 0.5rem' }}>// SOURCE → TARGET</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', lineHeight: 1.8 }}>
        <div><span style={{ color: 'var(--d-text-muted)' }}>FROM</span> <span style={{ color: 'var(--d-text)' }}>{tx.source}</span></div>
        <div><span style={{ color: 'var(--d-primary)' }}>↓</span></div>
        <div><span style={{ color: 'var(--d-text-muted)' }}>INTO</span> <span style={{ color: 'var(--d-text)' }}>{tx.target}</span></div>
      </div>

      <div className="d-label" style={{ color: 'var(--d-accent)', margin: '1rem 0 0.5rem' }}>// RECENT RUNS</div>
      <ul className="term-tree" style={{ fontSize: '0.7rem' }}>
        <li style={{ color: 'var(--d-primary)' }}>● success · 2s · 28,193 rows</li>
        <li style={{ color: 'var(--d-primary)' }}>● success · 2s · 27,941 rows</li>
        <li style={{ color: 'var(--d-warning)' }}>◐ slow · 8s · 28,012 rows</li>
        <li style={{ color: 'var(--d-primary)' }}>● success · 2s · 27,802 rows</li>
      </ul>
    </div>
  );

  return (
    <SidebarAsideShell navItems={NAV} aside={aside}>
      {/* Split pane: editor top, preview bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
        {/* Toolbar */}
        <div className="term-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
            <Link to="/transforms" style={{ color: 'var(--d-accent)' }}>&larr; transforms</Link>
            <span className="term-glow" style={{ color: 'var(--d-primary)', fontWeight: 600 }}>{tx.name}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={() => setView('editor')}
              className="d-interactive"
              data-variant={view === 'editor' ? 'primary' : 'ghost'}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: 0 }}
            >
              EDITOR
            </button>
            <button
              onClick={() => setView('preview')}
              className="d-interactive"
              data-variant={view === 'preview' ? 'primary' : 'ghost'}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: 0 }}
            >
              PREVIEW
            </button>
            <button className="d-interactive" data-variant="primary" style={{ padding: '0.2rem 0.625rem', fontSize: '0.7rem', borderRadius: 0 }}>
              &gt; Run
            </button>
          </div>
        </div>

        {view === 'editor' ? (
          /* Code editor */
          <div
            className="term-canvas"
            style={{
              flex: 1,
              border: '1px solid var(--d-border)',
              padding: '0.5rem 0',
              overflow: 'auto',
              fontSize: '0.75rem',
              lineHeight: 1.6,
              minHeight: 280,
            }}
          >
            {tx.language === 'sql' ? (
              <div style={{ padding: '0 0.5rem', fontFamily: 'inherit' }}>
                {syntaxHighlightSQL(code)}
              </div>
            ) : (
              <pre style={{ padding: '0 0.5rem', margin: 0, fontFamily: 'inherit', color: 'var(--d-text)' }}>
                {code.split('\n').map((line, i) => (
                  <div key={i} style={{ display: 'flex' }}>
                    <span style={{ color: 'var(--d-text-muted)', width: '2.5rem', textAlign: 'right', paddingRight: '0.75rem', flexShrink: 0, opacity: 0.5 }}>
                      {String(i + 1).padStart(2, ' ')}
                    </span>
                    <span style={{ whiteSpace: 'pre' }}>{line}</span>
                  </div>
                ))}
              </pre>
            )}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label="Edit code"
              style={{
                position: 'absolute',
                left: -99999,
                width: 1,
                height: 1,
              }}
            />
          </div>
        ) : (
          /* Preview table */
          <div
            className="term-canvas"
            style={{ flex: 1, border: '1px solid var(--d-border)', overflow: 'auto', minHeight: 280 }}
          >
            <table className="term-table" style={{ fontSize: '0.7rem' }}>
              <thead>
                <tr>{previewCols.map((c) => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {PREVIEW_ROWS.map((row, i) => (
                  <tr key={i}>
                    {previewCols.map((c) => (
                      <td key={c} style={{ color: typeof row[c] === 'number' ? 'var(--d-primary)' : 'var(--d-text)', textAlign: typeof row[c] === 'number' ? 'right' : 'left' }}>
                        {typeof row[c] === 'number' ? (row[c] as number).toLocaleString(undefined, { maximumFractionDigits: 2 }) : row[c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SidebarAsideShell>
  );
}
