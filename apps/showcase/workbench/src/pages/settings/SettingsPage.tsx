import { useState } from 'react';
import { User, Bell, Palette, Code } from 'lucide-react';
import { FormSections, type FormSection } from '@/components/FormSections';
import { appSettings } from '@/data/mock';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'editor', label: 'Editor', icon: Code },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const profileSections: FormSection[] = [
  {
    title: 'Profile',
    description: 'Your personal information.',
    fields: [
      { label: 'Display Name', type: 'text' as const, value: appSettings.displayName },
      { label: 'Email', type: 'email' as const, value: appSettings.email },
      { label: 'Timezone', type: 'select' as const, value: appSettings.timezone, options: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo'] },
    ],
  },
];

const editorSections: FormSection[] = [
  {
    title: 'Editor',
    description: 'Configure the code editor experience.',
    fields: [
      { label: 'Font Family', type: 'select' as const, value: appSettings.editorFont, options: ['Geist Mono', 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code'] },
      { label: 'Font Size', type: 'number' as const, value: appSettings.fontSize },
      { label: 'Tab Size', type: 'select' as const, value: String(appSettings.tabSize), options: ['2', '4', '8'] },
      { label: 'Auto Save', type: 'toggle' as const, value: appSettings.autoSave, description: 'Automatically save changes while editing.' },
    ],
  },
];

const notificationSections: FormSection[] = [
  {
    title: 'Notifications',
    description: 'Control how you receive updates.',
    fields: [
      { label: 'Email Notifications', type: 'toggle' as const, value: appSettings.notifications, description: 'Receive email digests for workspace activity.' },
      { label: 'Desktop Notifications', type: 'toggle' as const, value: true, description: 'Show browser notifications for real-time updates.' },
      { label: 'Component Updates', type: 'toggle' as const, value: true, description: 'Get notified when components you use are updated.' },
    ],
  },
];

const appearanceSections: FormSection[] = [
  {
    title: 'Appearance',
    description: 'Customize the visual experience.',
    fields: [
      { label: 'Theme', type: 'select' as const, value: appSettings.theme, options: ['dark', 'light', 'system'] },
      { label: 'Compact Mode', type: 'toggle' as const, value: appSettings.compactMode, description: 'Reduce spacing and padding for denser layouts.' },
    ],
  },
];

const tabContent: Record<string, FormSection[]> = {
  profile: profileSections,
  editor: editorSections,
  notifications: notificationSections,
  appearance: appearanceSections,
};

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Settings</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          Manage your account and workbench preferences.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Vertical tabs */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 160, flexShrink: 0 }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="d-interactive"
                data-variant="ghost"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  border: 'none',
                  borderLeft: isActive ? '2px solid var(--d-accent)' : '2px solid transparent',
                  color: isActive ? 'var(--d-text)' : 'var(--d-text-muted)',
                  background: isActive ? 'var(--d-surface)' : 'transparent',
                  borderRadius: '0 var(--d-radius-sm) var(--d-radius-sm) 0',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Form */}
        <div className="entrance-fade" key={activeTab} style={{ flex: 1 }}>
          <FormSections sections={tabContent[activeTab]} />
        </div>
      </div>
    </div>
  );
}
