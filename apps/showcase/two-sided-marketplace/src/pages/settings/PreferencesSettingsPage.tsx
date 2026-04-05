import { SettingsLayout, SettingsSection, FieldRow } from '@/components/SettingsLayout';

export function PreferencesSettingsPage() {
  return (
    <SettingsLayout title="Preferences" description="Language, currency, notifications, and appearance.">
      <SettingsSection title="Appearance">
        <ToggleRow label="Theme" description="Nestable uses a clean light theme. A dark theme is coming soon." right={<span className="nm-badge">Light</span>} />
      </SettingsSection>

      <SettingsSection title="Region">
        <FieldRow label="Language">
          <select className="nm-input" defaultValue="en">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </FieldRow>
        <FieldRow label="Currency">
          <select className="nm-input" defaultValue="USD">
            <option>USD — US Dollar</option>
            <option>EUR — Euro</option>
            <option>GBP — British Pound</option>
            <option>JPY — Japanese Yen</option>
          </select>
        </FieldRow>
      </SettingsSection>

      <SettingsSection title="Notifications">
        <ToggleRow label="Booking confirmations" description="Emails when a trip is booked or modified" checked />
        <ToggleRow label="Host messages" description="Push notifications for new messages" checked />
        <ToggleRow label="Price alerts" description="When saved stays drop in price" checked />
        <ToggleRow label="Marketing emails" description="Trip inspiration and deals" />
      </SettingsSection>
    </SettingsLayout>
  );
}

function ToggleRow({ label, description, checked, right }: { label: string; description?: string; checked?: boolean; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.25rem 0' }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{label}</div>
        {description && <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{description}</div>}
      </div>
      {right ?? (
        <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', position: 'relative', width: 36, height: 20 }}>
          <input type="checkbox" defaultChecked={checked} style={{ opacity: 0, width: 0, height: 0 }} />
          <span style={{ position: 'absolute', inset: 0, background: checked ? 'var(--d-primary)' : 'var(--d-border)', borderRadius: '9999px', transition: 'background 0.15s ease' }} />
          <span style={{ position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16, background: '#fff', borderRadius: '9999px', transition: 'left 0.15s ease' }} />
        </label>
      )}
    </div>
  );
}
