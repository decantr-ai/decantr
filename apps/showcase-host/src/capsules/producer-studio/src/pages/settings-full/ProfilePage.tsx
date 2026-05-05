import { SidebarAsideShell } from '@/components/SidebarAsideShell';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Session', to: '/session', icon: '&#9835;' },
  { label: 'Tracks', to: '/tracks', icon: '&#9836;' },
  { label: 'Collab', to: '/collab', icon: '&#9834;' },
  { label: 'Rooms', to: '/rooms', icon: '&#127908;' },
];

const SETTINGS_TABS = [
  { label: 'Profile', to: '/settings/profile' },
  { label: 'Security', to: '/settings/security' },
  { label: 'Preferences', to: '/settings/preferences' },
  { label: 'Danger Zone', to: '/settings/danger' },
];

function SettingsNav() {
  const location = useLocation();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>SETTINGS</div>
      {SETTINGS_TABS.map((t) => {
        const active = location.pathname === t.to;
        return (
          <Link
            key={t.to}
            to={t.to}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.8125rem',
              color: active ? 'var(--d-primary)' : 'var(--d-text-muted)',
              borderLeft: active ? '2px solid var(--d-primary)' : '2px solid transparent',
              textDecoration: 'none',
              borderRadius: 'var(--d-radius-sm)',
              background: active ? 'rgba(34, 211, 238, 0.05)' : 'transparent',
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

export function ProfilePage() {
  return (
    <SidebarAsideShell navItems={NAV_ITEMS} aside={<SettingsNav />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 640 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-text)', margin: 0 }}>Profile</h1>

        <div className="d-surface">
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--d-surface-raised)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-primary)',
                border: '2px solid var(--d-primary)',
              }}
            >
              VX
            </div>
            <div>
              <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Change Avatar</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="d-label" htmlFor="name">PRODUCER NAME</label>
              <input id="name" className="d-control" defaultValue="VXNE" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="d-label" htmlFor="email">EMAIL</label>
              <input id="email" type="email" className="d-control" defaultValue="vxne@studio.io" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="d-label" htmlFor="bio">BIO</label>
              <textarea id="bio" className="d-control" rows={3} defaultValue="Electronic music producer. Specializing in deep house and DnB." style={{ resize: 'vertical', minHeight: '6rem' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button className="d-interactive" data-variant="primary" style={{ padding: '0.375rem 1rem', fontSize: '0.8125rem' }}>
              Bounce Changes
            </button>
          </div>
        </div>
      </div>
    </SidebarAsideShell>
  );
}

export { SettingsNav, SETTINGS_TABS, NAV_ITEMS as SETTINGS_NAV_ITEMS };
