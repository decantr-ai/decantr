import { PageHeader } from '@/components/PageHeader';
import { SettingsTabs } from './ProfilePage';

export function PreferencesPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader title="Settings" description="Manage your account" />
      <SettingsTabs active="/settings/preferences" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="d-surface" style={{ padding: '1.5rem' }}>
          <h3 className="d-label" style={{ marginBottom: '1rem' }}>Appearance</h3>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Theme</span>
            <select className="d-control">
              <option>System</option>
              <option selected>Dark</option>
              <option>Light</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Language</span>
            <select className="d-control">
              <option selected>English (US)</option>
              <option>English (UK)</option>
              <option>Deutsch</option>
              <option>Français</option>
              <option>日本語</option>
            </select>
          </label>
        </div>

        <div className="d-surface" style={{ padding: '1.5rem' }}>
          <h3 className="d-label" style={{ marginBottom: '1rem' }}>Email Notifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Product updates and announcements', enabled: true },
              { label: 'Weekly usage digest', enabled: true },
              { label: 'Webhook delivery failures', enabled: true },
              { label: 'Invoice and billing reminders', enabled: true },
              { label: 'Security alerts', enabled: true },
            ].map(n => (
              <label key={n.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.375rem 0', borderBottom: '1px solid var(--d-border)' }}>
                <input type="checkbox" defaultChecked={n.enabled} />
                <span style={{ flex: 1 }}>{n.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
