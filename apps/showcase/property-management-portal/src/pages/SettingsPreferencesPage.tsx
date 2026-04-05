import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsNav } from '@/components/SettingsNav';

export function SettingsPreferencesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader title="Settings" description="Manage your account and preferences" />
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <SettingsNav />
        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '1rem' }}>Preferences</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Theme</label>
              <select className="d-control" defaultValue="light">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Language</label>
              <select className="d-control" defaultValue="en">
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Timezone</label>
              <select className="d-control" defaultValue="pst">
                <option value="pst">Pacific (UTC-8)</option>
                <option value="mst">Mountain (UTC-7)</option>
                <option value="cst">Central (UTC-6)</option>
                <option value="est">Eastern (UTC-5)</option>
              </select>
            </div>
            <div className="pm-divider" />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Notifications</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { label: 'New maintenance tickets', checked: true },
                  { label: 'Rent payment receipts', checked: true },
                  { label: 'Lease expiration warnings', checked: true },
                  { label: 'Monthly owner statements', checked: true },
                  { label: 'Marketing emails', checked: false },
                ].map(n => (
                  <label key={n.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={n.checked} />
                    {n.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--d-border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>Save preferences</button>
          </div>
        </div>
      </div>
    </div>
  );
}
