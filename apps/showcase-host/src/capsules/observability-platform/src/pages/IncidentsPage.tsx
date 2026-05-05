import { NavLink } from 'react-router-dom';
import { incidents, incidentActivity } from '@/data/mock';

export function IncidentsPage() {
  const active = incidents.filter(i => i.status !== 'resolved');
  const resolved = incidents.filter(i => i.status === 'resolved');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Incidents</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '0.75rem' }}>
        {/* Timeline */}
        <div className="fin-card">
          <div className="fin-label" style={{ marginBottom: 10 }}>Active — {active.length}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {active.map(inc => (
              <NavLink
                key={inc.id}
                to={`/incidents/${inc.id}`}
                className="fin-alert"
                data-severity={inc.severity}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <span className="fin-badge" style={{ fontWeight: 600 }}>{inc.id.toUpperCase()}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className="fin-badge" data-severity={inc.severity}>{inc.severity}</span>
                    <span className="fin-badge" data-status={inc.status}>{inc.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', fontFamily: 'ui-monospace, monospace', color: 'var(--d-text-muted)', flexWrap: 'wrap' }}>
                  <span>started {inc.startedAt}</span>
                  <span>{inc.duration}</span>
                  <span>cmd: {inc.commander}</span>
                  <span>{inc.updates} updates</span>
                </div>
              </NavLink>
            ))}
          </div>

          <div className="fin-label" style={{ margin: '16px 0 10px' }}>Resolved — {resolved.length}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {resolved.map(inc => (
              <NavLink
                key={inc.id}
                to={`/incidents/${inc.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                  fontSize: '0.75rem', textDecoration: 'none', color: 'var(--d-text-muted)',
                  borderBottom: '1px solid color-mix(in srgb, var(--d-border) 50%, transparent)',
                }}
              >
                <span className="fin-status-dot" data-status="resolved" />
                <span style={{ fontFamily: 'ui-monospace, monospace' }}>{inc.id.toUpperCase()}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.title}</span>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem' }}>{inc.duration}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="fin-card">
          <div className="fin-label" style={{ marginBottom: 10 }}>Activity Feed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {incidentActivity.map(a => (
              <div key={a.id} style={{ display: 'flex', gap: 8, fontSize: '0.75rem' }}>
                <div style={{
                  width: 22, height: 22, flexShrink: 0, borderRadius: 2,
                  background: 'var(--d-surface-raised)', border: '1px solid var(--d-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.55rem', fontWeight: 700,
                }}>{a.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 600 }}>{a.actor}</span>{' '}
                    <span style={{ color: 'var(--d-text-muted)' }}>{a.action}</span>{' '}
                    <span style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--d-primary)' }}>{a.target}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', fontFamily: 'ui-monospace, monospace' }}>{a.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
