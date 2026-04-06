import { SettingsLayout } from '@/components/SettingsLayout';

export function PreferencesPage() {
  return (
    <SettingsLayout>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--d-content-gap)' }}>Preferences</h2>
      <div className="d-surface" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>APPEARANCE</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Theme</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Choose your preferred color scheme</div>
          </div>
          <select className="d-control" style={{ width: 'auto' }} defaultValue="dark">
            <option value="dark">Dark (Cinema)</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Language</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Set your display language</div>
          </div>
          <select className="d-control" style={{ width: 'auto' }} defaultValue="en">
            <option value="en">English</option>
            <option value="es">Espanol</option>
            <option value="ja">Japanese</option>
          </select>
        </div>

        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginTop: '0.5rem' }}>NOTIFICATIONS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Render notifications</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Get notified when renders complete or fail</div>
          </div>
          <input type="checkbox" defaultChecked style={{ accentColor: 'var(--d-primary)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Email updates</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Receive product updates and tips</div>
          </div>
          <input type="checkbox" style={{ accentColor: 'var(--d-primary)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="d-interactive" data-variant="primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Save Preferences</button>
        </div>
      </div>
    </SettingsLayout>
  );
}
