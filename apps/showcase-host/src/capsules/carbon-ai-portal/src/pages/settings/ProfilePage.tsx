import { SettingsSection, FieldRow } from '@/components/SettingsSection';
import { defaultSettings } from '@/data/mock';

export function ProfilePage() {
  const s = defaultSettings;
  return (
    <>
      <SettingsSection title="Public profile" description="This information is visible to teammates in shared workspaces.">
        <FieldRow label="Display name">
          <input className="carbon-input" defaultValue={s.name} style={{ fontSize: '0.875rem' }} />
        </FieldRow>
        <FieldRow label="Email" description="Used for sign-in and notifications.">
          <input className="carbon-input" defaultValue={s.email} type="email" style={{ fontSize: '0.875rem' }} />
        </FieldRow>
        <FieldRow label="Avatar">
          <button className="d-interactive" style={{ fontSize: '0.8125rem' }}>Upload image</button>
        </FieldRow>
      </SettingsSection>

      <SettingsSection title="Regional" description="Set your timezone and language preferences.">
        <FieldRow label="Timezone">
          <select className="carbon-input" defaultValue={s.timezone} style={{ fontSize: '0.875rem' }}>
            <option>America/Los_Angeles</option>
            <option>America/New_York</option>
            <option>Europe/London</option>
            <option>Asia/Tokyo</option>
          </select>
        </FieldRow>
        <FieldRow label="Language">
          <select className="carbon-input" defaultValue={s.language} style={{ fontSize: '0.875rem' }}>
            <option>English</option>
            <option>Español</option>
            <option>Français</option>
            <option>Deutsch</option>
          </select>
        </FieldRow>
      </SettingsSection>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <button className="d-interactive" style={{ fontSize: '0.875rem' }}>Discard</button>
        <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.875rem' }}>Save changes</button>
      </div>
    </>
  );
}
