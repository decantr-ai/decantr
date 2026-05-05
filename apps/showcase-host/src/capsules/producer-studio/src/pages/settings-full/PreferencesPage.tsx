import { SidebarAsideShell } from '@/components/SidebarAsideShell';
import { SettingsNav, SETTINGS_NAV_ITEMS } from './ProfilePage';

export function PreferencesPage() {
  return (
    <SidebarAsideShell navItems={SETTINGS_NAV_ITEMS} aside={<SettingsNav />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 640 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-text)', margin: 0 }}>Preferences</h1>

        <div className="d-surface">
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--d-text)', margin: '0 0 1rem' }}>Appearance</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--d-text)' }}>Theme</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>Select light or dark mode</div>
              </div>
              <select className="d-control" style={{ width: 'auto', minWidth: 120 }} defaultValue="dark">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--d-text)' }}>Meter Style</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>VU or peak meters</div>
              </div>
              <select className="d-control" style={{ width: 'auto', minWidth: 120 }} defaultValue="vu">
                <option value="vu">VU Meters</option>
                <option value="peak">Peak Meters</option>
              </select>
            </div>
          </div>
        </div>

        <div className="d-surface">
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--d-text)', margin: '0 0 1rem' }}>Notifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['Collaborator joins session', 'New version bounced', 'Split updated', 'Room invite'].map((n) => (
              <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--d-text)' }}>{n}</span>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--d-primary)' }} />
              </div>
            ))}
          </div>
        </div>

        <div className="d-surface">
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--d-text)', margin: '0 0 1rem' }}>Audio</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--d-text)' }}>Sample Rate</div>
              </div>
              <select className="d-control" style={{ width: 'auto', minWidth: 120 }} defaultValue="48000">
                <option value="44100">44.1 kHz</option>
                <option value="48000">48 kHz</option>
                <option value="96000">96 kHz</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--d-text)' }}>Bit Depth</div>
              </div>
              <select className="d-control" style={{ width: 'auto', minWidth: 120 }} defaultValue="24">
                <option value="16">16-bit</option>
                <option value="24">24-bit</option>
                <option value="32">32-bit float</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="d-interactive" data-variant="primary" style={{ padding: '0.375rem 1rem', fontSize: '0.8125rem' }}>
            Bounce Changes
          </button>
        </div>
      </div>
    </SidebarAsideShell>
  );
}
