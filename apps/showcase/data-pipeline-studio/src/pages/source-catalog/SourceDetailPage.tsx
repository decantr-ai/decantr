import { Link, useParams, Navigate } from 'react-router-dom';
import { SidebarMainShell } from '@/components/SidebarMainShell';
import { getSourceById } from '@/data/mock';

const NAV = [
  { label: 'All Sources', to: '/sources' },
  { label: 'Connections', to: '/connections' },
];

export function SourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const source = getSourceById(id || '');
  if (!source) return <Navigate to="/sources" replace />;

  return (
    <SidebarMainShell title="SOURCES" navItems={NAV}>
      <div style={{ marginBottom: '1rem', fontSize: '0.75rem' }}>
        <Link to="/sources" style={{ color: 'var(--d-accent)' }}>&larr; sources</Link>
      </div>

      <div className="term-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="term-glow" style={{ fontSize: '1.125rem', color: 'var(--d-primary)', margin: '0 0 0.25rem' }}>
              {source.name}
            </h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
              {source.kind} · {source.host}
            </div>
          </div>
          <span
            className="d-annotation"
            data-status={source.status === 'connected' ? 'success' : source.status === 'error' ? 'error' : 'info'}
          >
            ● {source.status}
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { label: 'TABLES', value: source.tables },
          { label: 'ROWS INGESTED', value: source.rowsIngested.toLocaleString() },
          { label: 'LAST SYNC', value: source.lastSync === '—' ? '—' : new Date(source.lastSync).toLocaleTimeString() },
          { label: 'STATUS', value: source.status.toUpperCase() },
        ].map((k) => (
          <div key={k.label} className="term-panel" style={{ padding: '0.625rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.25rem' }}>{k.label}</div>
            <div style={{ fontSize: '1rem', color: 'var(--d-text)', fontWeight: 600 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Schema JSON viewer */}
      <div className="term-panel" style={{ padding: '0.75rem' }}>
        <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>// SCHEMA</div>
        <pre
          className="term-canvas"
          style={{
            fontSize: '0.75rem',
            color: 'var(--d-text)',
            padding: '0.75rem',
            border: '1px solid var(--d-border)',
            margin: 0,
            overflow: 'auto',
            lineHeight: 1.6,
          }}
        >
{JSON.stringify(source.schema, null, 2)}
        </pre>
      </div>

      {/* Actions */}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button className="d-interactive" data-variant="primary" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', borderRadius: 0 }}>
          &gt; Sync Now
        </button>
        <button className="d-interactive" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', borderRadius: 0 }}>
          Test Connection
        </button>
        <button className="d-interactive" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', borderRadius: 0 }}>
          Edit Config
        </button>
      </div>
    </SidebarMainShell>
  );
}
