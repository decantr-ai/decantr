import { NavLink } from 'react-router-dom';
import { UserPlus, Key, Zap, Shield, ArrowRight } from 'lucide-react';
import { KpiGrid } from '@/components/KpiGrid';
import { PageHeader } from '@/components/PageHeader';
import { overviewKpis, auditEvents, quickActions } from '@/data/mock';

const iconMap: Record<string, typeof UserPlus> = {
  'user-plus': UserPlus, key: Key, zap: Zap, shield: Shield,
};

export function OverviewPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Overview"
        description="Everything happening across Acme Corp."
      />

      <KpiGrid kpis={overviewKpis} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1rem' }}>
        {/* Activity */}
        <div className="d-surface" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Recent Activity</h2>
            <NavLink to="/audit" style={{ fontSize: '0.75rem', color: 'var(--d-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View all <ArrowRight size={12} />
            </NavLink>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditEvents.slice(0, 6).map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--d-border)' }}>
                <div className="lp-event-dot" data-type={e.type} style={{ marginTop: 6 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--d-text)' }}>
                    <span style={{ fontWeight: 600 }}>{e.actor}</span>
                    <span style={{ color: 'var(--d-text-muted)' }}> {e.action} </span>
                    <span className="mono-data" style={{ color: 'var(--d-primary)' }}>{e.resource}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: 2 }}>
                    {e.timestamp} · {e.ip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="d-surface" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {quickActions.map(a => {
              const Icon = iconMap[a.icon] || Key;
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
    </div>
  );
}
