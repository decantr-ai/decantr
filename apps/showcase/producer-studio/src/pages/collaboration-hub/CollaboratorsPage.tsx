import { SidebarMainShell } from '@/components/SidebarMainShell';
import { COLLABORATORS } from '@/data/mock';

const NAV_ITEMS = [
  { label: 'Session', to: '/session', icon: '&#9835;' },
  { label: 'Tracks', to: '/tracks', icon: '&#9836;' },
  { label: 'Collab', to: '/collab', icon: '&#9834;' },
  { label: 'Rooms', to: '/rooms', icon: '&#127908;' },
];

const ROLE_COLORS: Record<string, string> = {
  producer: '#D946EF',
  songwriter: '#3B82F6',
  performer: '#FBBF24',
  engineer: '#A8A29E',
  mixer: '#22D3EE',
};

export function CollaboratorsPage() {
  return (
    <SidebarMainShell navItems={NAV_ITEMS}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-text)', margin: 0 }}>Collaborators</h1>
          <button className="d-interactive" data-variant="primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
            + Invite
          </button>
        </div>

        {/* Card grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {COLLABORATORS.map((c) => (
            <div key={c.id} className="d-surface" data-interactive style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'var(--d-surface-raised)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem', fontWeight: 700, color: 'var(--d-primary)',
                    border: '2px solid var(--d-primary)',
                  }}
                >
                  {c.avatar}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--d-text)' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{c.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span
                  className="d-annotation"
                  style={{ background: `color-mix(in srgb, ${ROLE_COLORS[c.role]} 15%, transparent)`, color: ROLE_COLORS[c.role] }}
                >
                  {c.role}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
                  {c.tracksContributed} track{c.tracksContributed !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
                <span>Joined {new Date(c.joinedAt).toLocaleDateString()}</span>
                <span style={{ color: 'var(--d-primary)', fontWeight: 600 }}>{c.splitPercent}% avg split</span>
              </div>
            </div>
          ))}
        </div>

        {/* Team member list */}
        <div>
          <div className="d-label" style={{ color: 'var(--d-accent)', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            MEMBER LIST
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {COLLABORATORS.map((c) => (
              <div key={c.id} className="d-data-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0' }}>
                <div
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--d-surface-raised)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontWeight: 700, color: 'var(--d-primary)',
                    flexShrink: 0,
                  }}
                >
                  {c.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--d-text)' }}>{c.name}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{c.email}</div>
                </div>
                <span className="d-annotation" style={{ background: `color-mix(in srgb, ${ROLE_COLORS[c.role]} 15%, transparent)`, color: ROLE_COLORS[c.role] }}>
                  {c.role}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', minWidth: 80 }}>
                  {new Date(c.joinedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidebarMainShell>
  );
}
