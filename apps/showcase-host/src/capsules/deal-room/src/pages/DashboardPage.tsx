import { NavLink } from 'react-router-dom';
import { Upload, PlusCircle, UserPlus, Shield, ArrowRight } from 'lucide-react';
import { KpiGrid } from '@/components/KpiGrid';
import { PageHeader } from '@/components/PageHeader';
import { overviewKpis, auditEntries, quickActions, pipelineSummary } from '@/data/mock';

const iconMap: Record<string, typeof Upload> = {
  'upload': Upload, 'plus-circle': PlusCircle, 'user-plus': UserPlus, shield: Shield,
};

export function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Dashboard"
        description="Portfolio overview and recent activity."
      />

      <KpiGrid kpis={overviewKpis} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
        {/* Pipeline */}
        <div className="dr-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="serif-display" style={{ fontSize: '0.95rem', fontWeight: 600 }}>Pipeline Summary</h2>
            <NavLink to="/pipeline" style={{ fontSize: '0.7rem', color: 'var(--d-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View all <ArrowRight size={11} />
            </NavLink>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pipelineSummary.map(s => (
              <div key={s.stage} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{s.stage}</span>
                    <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{s.count} deals · {s.value}</span>
                  </div>
                  <div className="dr-gauge-track">
                    <div className="dr-gauge-fill" style={{ width: `${(s.count / 3) * 100}%`, background: s.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dr-card" style={{ padding: '1.25rem' }}>
          <h2 className="serif-display" style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {quickActions.map(a => {
              const Icon = iconMap[a.icon] || Shield;
              return (
                <NavLink
                  key={a.label}
                  to={a.route}
                  className="d-interactive"
                  data-variant="ghost"
                  style={{
                    padding: '0.625rem 0.75rem',
                    justifyContent: 'flex-start',
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    border: '1px solid var(--d-border)',
                  }}
                >
                  <Icon size={14} style={{ color: 'var(--d-primary)' }} />
                  <span style={{ flex: 1, textAlign: 'left' }}>{a.label}</span>
                  <ArrowRight size={12} style={{ color: 'var(--d-text-muted)' }} />
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dr-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="serif-display" style={{ fontSize: '0.95rem', fontWeight: 600 }}>Recent Activity</h2>
          <NavLink to="/audit" style={{ fontSize: '0.7rem', color: 'var(--d-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Full audit trail <ArrowRight size={11} />
          </NavLink>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {auditEntries.slice(0, 6).map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--d-border)' }}>
              <div className="dr-monogram" style={{ width: 24, height: 24, fontSize: '0.5rem', marginTop: 2 }}>{e.actorAvatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--d-text)' }}>
                  <span style={{ fontWeight: 600 }}>{e.actor}</span>
                  <span style={{ color: 'var(--d-text-muted)' }}> {e.action} </span>
                  <span style={{ color: 'var(--d-primary)' }}>{e.resource}</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', marginTop: 2, fontFamily: 'var(--d-font-mono)' }}>
                  {e.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
