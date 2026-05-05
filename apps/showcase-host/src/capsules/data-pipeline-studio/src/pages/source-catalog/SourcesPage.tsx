import { Link } from 'react-router-dom';
import { SidebarMainShell } from '@/components/SidebarMainShell';
import { DATA_SOURCES, type SourceStatus } from '@/data/mock';

const NAV = [
  { label: 'All Sources', to: '/sources' },
  { label: 'Connections', to: '/connections' },
];

const KIND_GLYPH: Record<string, string> = {
  postgres: '[PG]',
  mysql: '[MY]',
  kafka: '[KF]',
  s3: '[S3]',
  bigquery: '[BQ]',
  snowflake: '[SF]',
  http: '[HT]',
  mongodb: '[MG]',
};

const STATUS_COLOR: Record<SourceStatus, string> = {
  connected: 'var(--d-primary)',
  syncing: 'var(--d-accent)',
  disconnected: 'var(--d-text-muted)',
  error: 'var(--d-error)',
};

const STATUS_GLYPH: Record<SourceStatus, string> = {
  connected: '●',
  syncing: '◐',
  disconnected: '○',
  error: '✗',
};

function fmt(n: number): string {
  if (n > 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n > 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n > 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

export function SourcesPage() {
  return (
    <SidebarMainShell title="SOURCES" navItems={NAV}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
        <h1 className="term-glow" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--d-primary)', margin: 0 }}>
          $ ls sources/
        </h1>
        <button className="d-interactive" data-variant="primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: 0 }}>
          + Add Source
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.625rem' }}>
        {DATA_SOURCES.map((s) => (
          <Link
            key={s.id}
            to={`/sources/${s.id}`}
            className="term-panel"
            style={{
              padding: '0.75rem',
              textDecoration: 'none',
              color: 'var(--d-text)',
              display: 'block',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--d-accent)', fontWeight: 700, fontSize: '0.75rem' }}>{KIND_GLYPH[s.kind]}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--d-text)', fontWeight: 600 }}>{s.name}</span>
              </div>
              <span style={{ color: STATUS_COLOR[s.status], fontSize: '0.875rem' }}>
                {STATUS_GLYPH[s.status]}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginBottom: '0.5rem', fontFamily: 'inherit' }}>
              {s.host}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
              <span>{s.tables} tables</span>
              <span>{fmt(s.rowsIngested)} rows</span>
              <span style={{ color: STATUS_COLOR[s.status], textTransform: 'uppercase' }}>{s.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </SidebarMainShell>
  );
}
