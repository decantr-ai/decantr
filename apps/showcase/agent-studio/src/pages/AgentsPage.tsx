import { NavLink } from 'react-router-dom';
import { Plus, Play, Clock, Gauge } from 'lucide-react';
import { agents } from '@/data/mock';
import { PageHeader } from '@/components/PageHeader';

export function AgentsPage() {
  return (
    <div>
      <PageHeader
        title="Agents"
        description={`${agents.length} agents · ${agents.filter(a => a.status === 'active').length} active`}
        actions={
          <button className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontSize: '0.8rem' }}>
            <Plus size={14} /> New agent
          </button>
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.75rem' }}>
        {agents.map(a => (
          <NavLink
            key={a.id}
            to={`/agents/${a.id}`}
            className="carbon-card"
            data-interactive
            style={{ padding: '1rem', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span className="status-dot" data-status={a.status} />
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--d-font-mono)' }}>{a.name}</h3>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {a.description}
                </p>
              </div>
              <span className="mono-inline" style={{ fontSize: '0.65rem', flexShrink: 0 }}>{a.version}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="mono-inline" style={{ fontSize: '0.68rem', color: 'var(--d-text-muted)', background: '#1F1F23', borderColor: 'var(--d-border)' }}>{a.model}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono)' }}>{a.tools.length} tools</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', paddingTop: '0.625rem', borderTop: '1px solid var(--d-border)' }}>
              <Stat icon={Play} label="runs" value={a.runs.toLocaleString()} />
              <Stat icon={Clock} label="latency" value={`${a.avgLatency}ms`} />
              <Stat icon={Gauge} label="success" value={`${a.successRate}%`} />
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Play; label: string; value: string }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.6rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--d-font-mono)', marginBottom: 2 }}>
        <Icon size={10} /> {label}
      </div>
      <div className="mono-data" style={{ fontSize: '0.82rem', fontWeight: 500 }}>{value}</div>
    </div>
  );
}
