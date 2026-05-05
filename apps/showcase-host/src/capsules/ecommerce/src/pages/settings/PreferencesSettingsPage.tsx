import { SettingsLayout, SettingsSection } from '@/components/SettingsLayout';

export function PreferencesSettingsPage() {
  return (
    <SettingsLayout title="Preferences" description="Tune Vinea to your taste.">
      <SettingsSection title="Appearance">
        <Row label="Theme" hint="Light, dark, or sync with system">
          <select className="ec-input" defaultValue="light" style={{ width: 180 }}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </Row>
        <Row label="Language">
          <select className="ec-input" defaultValue="en" style={{ width: 180 }}>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </Row>
        <Row label="Currency">
          <select className="ec-input" defaultValue="USD" style={{ width: 180 }}>
            <option value="USD">USD · $</option>
            <option value="EUR">EUR · €</option>
            <option value="GBP">GBP · £</option>
          </select>
        </Row>
      </SettingsSection>

      <SettingsSection title="Notifications">
        <Toggle label="Order updates" desc="Shipping, delivery, and refund notifications" defaultChecked />
        <Toggle label="New arrivals" desc="Weekly digest of what's new in the shop" defaultChecked />
        <Toggle label="Promotions" desc="Sales and exclusive offers" />
        <Toggle label="Product recommendations" desc="Items you might like based on your taste" defaultChecked />
      </SettingsSection>
    </SettingsLayout>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
        {hint && <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', cursor: 'pointer' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{desc}</div>
      </div>
      <input type="checkbox" defaultChecked={defaultChecked} style={{ width: 18, height: 18, accentColor: 'var(--d-primary)' }} />
    </label>
  );
}
