import { SettingsSection, FieldRow } from '@/components/SettingsSection';
import { defaultSettings } from '@/data/mock';
import { useState } from 'react';

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      role="switch"
      aria-checked={on}
      style={{
        width: 36,
        height: 20,
        borderRadius: 20,
        background: on ? 'var(--d-primary)' : 'var(--d-surface-raised)',
        border: '1px solid var(--d-border)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        float: 'right',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 1,
          left: on ? 17 : 1,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.15s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

export function PreferencesPage() {
  const s = defaultSettings;
  return (
    <>
      <SettingsSection title="Appearance" description="Customize how Carbon looks for you.">
        <FieldRow label="Theme" description="Dark mode is the default for chat interfaces.">
          <select className="carbon-input" defaultValue={s.theme} style={{ fontSize: '0.875rem' }}>
            <option value="carbon">Carbon (dark)</option>
            <option value="light">Light</option>
          </select>
        </FieldRow>
        <FieldRow label="Message density">
          <select className="carbon-input" defaultValue="comfortable" style={{ fontSize: '0.875rem' }}>
            <option>Comfortable</option>
            <option>Compact</option>
          </select>
        </FieldRow>
      </SettingsSection>

      <SettingsSection title="Notifications" description="Choose what you want to be notified about.">
        <FieldRow label="Email updates" description="Product updates, features, and release notes.">
          <Toggle defaultOn={s.notifications.email} />
        </FieldRow>
        <FieldRow label="Product announcements" description="Occasional news about Carbon.">
          <Toggle defaultOn={s.notifications.product} />
        </FieldRow>
        <FieldRow label="Security alerts" description="Sign-in notifications and account changes. Recommended.">
          <Toggle defaultOn={s.notifications.security} />
        </FieldRow>
      </SettingsSection>

      <SettingsSection title="Chat behaviour" description="Tune how conversations feel.">
        <FieldRow label="Stream responses" description="Show tokens as they are generated.">
          <Toggle defaultOn />
        </FieldRow>
        <FieldRow label="Auto-title conversations" description="Let Carbon name your conversations.">
          <Toggle defaultOn />
        </FieldRow>
      </SettingsSection>
    </>
  );
}
