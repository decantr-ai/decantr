import { SidebarAsideShell } from '@/components/SidebarAsideShell';
import { PREVIEW_ROWS } from '@/data/mock';

const NAV = [
  { label: 'All Transforms', to: '/transforms' },
  { label: 'Data Preview', to: '/transforms/preview' },
];

export function DataPreviewPage() {
  const cols = Object.keys(PREVIEW_ROWS[0]);

  const aside = (
    <div>
      <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>// SUMMARY</div>
      <pre style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', margin: 0, lineHeight: 1.6 }}>
{`rows:     ${PREVIEW_ROWS.length}
cols:     ${cols.length}
source:   mart_daily_revenue
lag:      real-time
bytes:    1.2KB`}
      </pre>

      <div className="d-label" style={{ color: 'var(--d-accent)', margin: '1rem 0 0.5rem' }}>// COLUMN STATS</div>
      <ul className="term-tree" style={{ fontSize: '0.7rem' }}>
        {cols.map((c) => (
          <li key={c}>
            <span style={{ color: 'var(--d-text)' }}>{c}</span>{' '}
            <span style={{ color: 'var(--d-text-muted)' }}>· {typeof PREVIEW_ROWS[0][c] === 'number' ? 'numeric' : 'text'}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <SidebarAsideShell navItems={NAV} aside={aside}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
        <div className="term-panel" style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
            <span className="term-glow" style={{ color: 'var(--d-primary)', fontWeight: 600 }}>$ SELECT * FROM mart_daily_revenue LIMIT 10</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{PREVIEW_ROWS.length} rows · 4ms</span>
        </div>

        <div className="term-canvas" style={{ flex: 1, border: '1px solid var(--d-border)', overflow: 'auto', minHeight: 0 }}>
          <table className="term-table" style={{ fontSize: '0.7rem' }}>
            <thead>
              <tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {PREVIEW_ROWS.map((row, i) => (
                <tr key={i}>
                  {cols.map((c) => (
                    <td key={c} style={{ color: typeof row[c] === 'number' ? 'var(--d-primary)' : 'var(--d-text)', textAlign: typeof row[c] === 'number' ? 'right' : 'left' }}>
                      {typeof row[c] === 'number' ? (row[c] as number).toLocaleString(undefined, { maximumFractionDigits: 2 }) : row[c]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* JSON view */}
        <div className="term-panel" style={{ padding: '0.5rem', flexShrink: 0, maxHeight: '12rem', overflow: 'auto' }}>
          <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.375rem' }}>// JSON · first row</div>
          <pre style={{ fontSize: '0.7rem', color: 'var(--d-text)', margin: 0, lineHeight: 1.5 }}>
{JSON.stringify(PREVIEW_ROWS[0], null, 2)}
          </pre>
        </div>
      </div>
    </SidebarAsideShell>
  );
}
