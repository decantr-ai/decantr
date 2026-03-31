import { useParams } from 'react-router-dom';
import { SidebarSettingsShell } from '../shells/sidebar-settings';
import { settingsSections } from '../mock-data';

export function SettingsPage() {
  const { section } = useParams<{ section?: string }>();
  const activeSection = section || settingsSections[0].id;
  const current = settingsSections.find((s) => s.id === activeSection);

  return (
    <SidebarSettingsShell activeSection={activeSection}>
      <div style={{ maxWidth: 640 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--d-text)',
            marginBottom: '0.5rem',
          }}
        >
          {current?.label || 'Settings'}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--d-text-muted)',
            marginBottom: '2rem',
          }}
        >
          {current?.description || 'Manage your account settings.'}
        </p>

        {/* Settings cards */}
        {settingsSections
          .filter((s) => s.id === activeSection)
          .map((s) => (
            <div key={s.id}>
              {/* Example form fields for the active section */}
              {s.id === 'profile' && (
                <SettingsCard title="Display Name" description="Your public display name.">
                  <SettingsInput placeholder="Enter your name" defaultValue="User" />
                </SettingsCard>
              )}
              {s.id === 'profile' && (
                <SettingsCard title="Email" description="Your email address for notifications.">
                  <SettingsInput placeholder="user@example.com" defaultValue="user@example.com" />
                </SettingsCard>
              )}
              {s.id === 'api-keys' && (
                <SettingsCard title="API Keys" description="Manage your API keys for programmatic access.">
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'var(--d-bg)',
                      borderRadius: 'var(--d-radius-sm)',
                      border: '1px solid var(--d-border)',
                      fontSize: 13,
                      color: 'var(--d-text-muted)',
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                    }}
                  >
                    sk-****-****-****-7f3a
                  </div>
                </SettingsCard>
              )}
              {s.id === 'team' && (
                <SettingsCard title="Team Members" description="Invite and manage team members.">
                  <SettingsInput placeholder="teammate@example.com" />
                </SettingsCard>
              )}
              {s.id === 'billing' && (
                <SettingsCard title="Current Plan" description="Your current subscription plan.">
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'var(--d-bg)',
                      borderRadius: 'var(--d-radius-sm)',
                      border: '1px solid var(--d-border)',
                      fontSize: 14,
                      color: 'var(--d-text)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>Free Plan</span>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--d-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Upgrade
                    </span>
                  </div>
                </SettingsCard>
              )}
              {s.id === 'notifications' && (
                <SettingsCard title="Email Notifications" description="Choose which notifications you receive.">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {['Product updates', 'Security alerts', 'Weekly digest'].map(
                      (label) => (
                        <label
                          key={label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: 13,
                            color: 'var(--d-text)',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            defaultChecked
                            style={{ accentColor: 'var(--d-primary)' }}
                          />
                          {label}
                        </label>
                      ),
                    )}
                  </div>
                </SettingsCard>
              )}
            </div>
          ))}
      </div>
    </SidebarSettingsShell>
  );
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: 'var(--d-surface)',
        border: '1px solid var(--d-border)',
        borderRadius: 'var(--d-radius)',
        padding: '1.25rem',
        marginBottom: '1rem',
      }}
    >
      <h3
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--d-text)',
          marginBottom: '0.25rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: 'var(--d-text-muted)',
          marginBottom: '1rem',
        }}
      >
        {description}
      </p>
      {children}
    </div>
  );
}

function SettingsInput({
  placeholder,
  defaultValue,
}: {
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      defaultValue={defaultValue}
      style={{
        width: '100%',
        padding: '0.625rem 0.75rem',
        fontSize: 14,
        color: 'var(--d-text)',
        background: 'var(--d-bg)',
        border: '1px solid var(--d-border)',
        borderRadius: 'var(--d-radius-sm)',
        outline: 'none',
      }}
    />
  );
}
