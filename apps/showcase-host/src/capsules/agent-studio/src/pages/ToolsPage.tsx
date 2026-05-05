import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { tools } from '@/data/mock';

export function ToolsPage() {
  return (
    <div>
      <PageHeader
        title="Tool Registry"
        description={`${tools.length} tools · centralized schemas`}
        actions={
          <button className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontSize: '0.8rem' }}>
            <Plus size={14} /> Register tool
          </button>
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
        {tools.map(t => (
          <NavLink
            key={t.id}
            to={`/tools/${t.id}`}
            className="carbon-card"
            data-interactive
            style={{ padding: '1rem', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--d-font-mono)' }}>{t.name}</h3>
                  <span className="mono-inline" style={{ fontSize: '0.6rem', color: 'var(--d-text-muted)', borderColor: 'var(--d-border)' }}>{t.category}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', lineHeight: 1.4 }}>
                  {t.description}
                </p>
              </div>
              <span className="mono-inline" style={{ fontSize: '0.65rem', flexShrink: 0 }}>{t.version}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', paddingTop: '0.625rem', borderTop: '1px solid var(--d-border)' }}>
              <ToolStat label="calls" value={t.calls.toLocaleString()} />
              <ToolStat label="avg" value={`${t.avgLatency}ms`} />
              <ToolStat label="err" value={`${t.errorRate}%`} status={t.errorRate > 2 ? 'warn' : undefined} />
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function ToolStat({ label, value, status }: { label: string; value: string; status?: 'warn' }) {
  return (
    <div>
      <div style={{ fontSize: '0.58rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--d-font-mono)', marginBottom: 2 }}>{label}</div>
      <div className="mono-data" style={{ fontSize: '0.78rem', fontWeight: 500, color: status === 'warn' ? 'var(--d-warning)' : undefined }}>{value}</div>
    </div>
  );
}
