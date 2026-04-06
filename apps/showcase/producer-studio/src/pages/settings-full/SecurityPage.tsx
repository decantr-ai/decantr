import { SidebarAsideShell } from '@/components/SidebarAsideShell';
import { SettingsNav, SETTINGS_NAV_ITEMS } from './ProfilePage';

const SESSIONS = [
  { device: 'MacBook Pro — Chrome', location: 'Los Angeles, CA', lastActive: '2 min ago', current: true },
  { device: 'iPhone 16 — Safari', location: 'Los Angeles, CA', lastActive: '1 hour ago', current: false },
  { device: 'Windows PC — Firefox', location: 'New York, NY', lastActive: '3 days ago', current: false },
];

export function SecurityPage() {
  return (
    <SidebarAsideShell navItems={SETTINGS_NAV_ITEMS} aside={<SettingsNav />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 640 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-text)', margin: 0 }}>Security</h1>

        {/* Password */}
        <div className="d-surface">
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--d-text)', margin: '0 0 1rem' }}>Change Password</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="d-label" htmlFor="current">CURRENT PASSWORD</label>
              <input id="current" type="password" className="d-control" placeholder="********" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="d-label" htmlFor="newpw">NEW PASSWORD</label>
              <input id="newpw" type="password" className="d-control" placeholder="********" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="d-label" htmlFor="confirm">CONFIRM PASSWORD</label>
              <input id="confirm" type="password" className="d-control" placeholder="********" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="d-interactive" data-variant="primary" style={{ padding: '0.375rem 1rem', fontSize: '0.8125rem' }}>Update Password</button>
          </div>
        </div>

        {/* MFA */}
        <div className="d-surface">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--d-text)', margin: '0 0 0.25rem' }}>Two-Factor Authentication</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', margin: 0 }}>Add an extra layer of security</p>
            </div>
            <span className="d-annotation" data-status="success">Enabled</span>
          </div>
        </div>

        {/* Active sessions */}
        <div className="d-surface">
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--d-text)', margin: '0 0 1rem' }}>Active Sessions</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {SESSIONS.map((s, i) => (
              <div key={i} className="d-data-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--d-text)' }}>
                    {s.device}
                    {s.current && <span className="d-annotation" data-status="success" style={{ marginLeft: '0.5rem' }}>current</span>}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{s.location} &middot; {s.lastActive}</div>
                </div>
                {!s.current && (
                  <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem', color: 'var(--d-error)' }}>
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidebarAsideShell>
  );
}
