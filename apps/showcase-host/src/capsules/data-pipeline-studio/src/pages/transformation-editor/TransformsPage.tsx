import { Link } from 'react-router-dom';
import { SidebarAsideShell } from '@/components/SidebarAsideShell';
import { TRANSFORMATIONS } from '@/data/mock';

const NAV = [
  { label: 'All Transforms', to: '/transforms' },
  { label: 'Data Preview', to: '/transforms/preview' },
];

export function TransformsPage() {
  const aside = (
    <div>
      <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>// RECENT</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {TRANSFORMATIONS.slice(0, 4).map((t) => (
          <li key={t.id} style={{ fontSize: '0.75rem' }}>
            <Link to={`/transforms/${t.id}`} style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>
              {t.name}
            </Link>
            <div style={{ color: 'var(--d-text-muted)', fontSize: '0.65rem' }}>{new Date(t.lastModified).toLocaleDateString()}</div>
          </li>
        ))}
      </ul>

      <div className="d-label" style={{ color: 'var(--d-accent)', margin: '1rem 0 0.5rem' }}>// STATS</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', lineHeight: 1.8 }}>
        <div>total: <span style={{ color: 'var(--d-primary)' }}>{TRANSFORMATIONS.length}</span></div>
        <div>sql: <span style={{ color: 'var(--d-primary)' }}>{TRANSFORMATIONS.filter((t) => t.language === 'sql').length}</span></div>
        <div>python: <span style={{ color: 'var(--d-primary)' }}>{TRANSFORMATIONS.filter((t) => t.language === 'python').length}</span></div>
        <div>runs today: <span style={{ color: 'var(--d-primary)' }}>{TRANSFORMATIONS.reduce((s, t) => s + t.runsToday, 0)}</span></div>
      </div>
    </div>
  );

  return (
    <SidebarAsideShell navItems={NAV} aside={aside}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
        <h1 className="term-glow" style={{ fontSize: '1rem', color: 'var(--d-primary)', margin: 0 }}>
          $ ls transforms/
        </h1>
        <button className="d-interactive" data-variant="primary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.7rem', borderRadius: 0 }}>
          + New Transform
        </button>
      </div>

      <div className="term-canvas" style={{ border: '1px solid var(--d-border)' }}>
        <table className="term-table" style={{ fontSize: '0.75rem' }}>
          <thead>
            <tr>
              <th>NAME</th>
              <th style={{ width: '5rem' }}>LANG</th>
              <th>SOURCE</th>
              <th>TARGET</th>
              <th style={{ width: '5rem', textAlign: 'right' }}>RUNS/D</th>
            </tr>
          </thead>
          <tbody>
            {TRANSFORMATIONS.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link to={`/transforms/${t.id}`} style={{ color: 'var(--d-accent)', textDecoration: 'underline' }}>
                    {t.name}
                  </Link>
                  <div style={{ color: 'var(--d-text-muted)', fontSize: '0.65rem' }}>{t.description}</div>
                </td>
                <td style={{ color: t.language === 'sql' ? 'var(--d-primary)' : 'var(--d-accent)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {t.language}
                </td>
                <td style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem' }}>{t.source}</td>
                <td style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem' }}>{t.target}</td>
                <td style={{ textAlign: 'right' }}>{t.runsToday}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SidebarAsideShell>
  );
}
