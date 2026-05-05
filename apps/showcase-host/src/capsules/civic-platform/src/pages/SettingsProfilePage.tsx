import { css } from '@decantr/css';
import { useAuth } from '@/hooks/useAuth';
import { NavLink, useLocation } from 'react-router-dom';

const settingsTabs = [
  { to: '/settings/profile', label: 'Profile' },
  { to: '/settings/security', label: 'Security' },
  { to: '/settings/preferences', label: 'Preferences' },
  { to: '/settings/danger', label: 'Danger Zone' },
];

function SettingsNav() {
  const location = useLocation();
  return (
    <nav className={css('_flex _col _gap1')} style={{ minWidth: 180 }} aria-label="Settings navigation">
      {settingsTabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className="d-interactive"
          data-variant="ghost"
          style={{
            textDecoration: 'none',
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem',
            border: 'none',
            borderLeft: location.pathname === tab.to ? '2px solid var(--d-accent)' : '2px solid transparent',
            fontWeight: location.pathname === tab.to ? 600 : 400,
            color: location.pathname === tab.to ? 'var(--d-primary)' : 'var(--d-text)',
            background: location.pathname === tab.to ? 'color-mix(in srgb, var(--d-primary) 5%, transparent)' : 'transparent',
            borderRadius: 0,
          }}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

export { SettingsNav, settingsTabs };

export function SettingsProfilePage() {
  const { user } = useAuth();

  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Settings</h1>

      <div className={css('_flex _gap6')}>
        <SettingsNav />

        <div style={{ flex: 1 }}>
          <div className="d-surface gov-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>Profile Information</h2>

            <div className={css('_flex _aic _gap4 _mb6')}>
              <div style={{
                width: 64, height: 64, borderRadius: 2,
                background: 'var(--d-primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', fontWeight: 700,
              }}>
                {user?.avatar || 'U'}
              </div>
              <div>
                <button className="d-interactive" style={{ fontSize: '0.8125rem' }}>Change Avatar</button>
              </div>
            </div>

            <div className={css('_flex _col _gap4')}>
              <div className={css('_grid')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className={css('_flex _col _gap1')}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Full Name</label>
                  <input type="text" className="d-control gov-input" defaultValue={user?.name || ''} />
                </div>
                <div className={css('_flex _col _gap1')}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email</label>
                  <input type="email" className="d-control gov-input" defaultValue={user?.email || ''} />
                </div>
              </div>
              <div className={css('_flex _col _gap1')}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>District</label>
                <input type="text" className="d-control gov-input" defaultValue={user?.district || ''} />
              </div>
              <div className={css('_flex _col _gap1')}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Bio</label>
                <textarea className="d-control gov-input" rows={3} placeholder="Tell your community about yourself..." style={{ minHeight: '6rem' }} />
              </div>
            </div>

            <div className={css('_flex _jcfe')} style={{ marginTop: '1.5rem', borderTop: '1px solid var(--d-border)', paddingTop: '1rem' }}>
              <button className="d-interactive" data-variant="primary">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
