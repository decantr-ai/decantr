import { useState, useCallback } from 'react';

const TABS = ['Profile', 'Security', 'Notifications', 'Danger Zone'] as const;
type Tab = (typeof TABS)[number];

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('Profile');
  const [name, setName] = useState('You');
  const [email, setEmail] = useState('you@decantr.ai');
  const [bio, setBio] = useState('');

  const handleTabClick = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <div style={{ display: 'flex', gap: '2rem', minHeight: '480px' }}>
      {/* Tab nav */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          width: '180px',
          flexShrink: 0,
          paddingTop: '0.25rem',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const isDanger = tab === 'Danger Zone';
          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              style={{
                display: 'block',
                textAlign: 'left',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                color: isDanger
                  ? 'var(--d-error)'
                  : isActive
                    ? 'var(--d-accent)'
                    : 'var(--d-text-muted)',
                background: isActive ? 'rgba(253, 163, 3, 0.06)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '2px solid var(--d-accent)' : '2px solid transparent',
                borderRadius: '0 var(--d-radius-sm) var(--d-radius-sm) 0',
                cursor: 'pointer',
                transition: 'color 0.15s ease, background 0.15s ease, border-color 0.15s ease',
              }}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {activeTab === 'Profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Profile</h3>

            {/* Avatar upload */}
            <div>
              <label className="d-label">Avatar</label>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--d-surface)',
                  border: '2px dashed var(--d-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--d-text-muted)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
              >
                YO
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="d-label" htmlFor="settings-name">
                Display Name
              </label>
              <input
                id="settings-name"
                type="text"
                className="d-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ maxWidth: '360px' }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="d-label" htmlFor="settings-email">
                Email
              </label>
              <input
                id="settings-email"
                type="email"
                className="d-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ maxWidth: '360px' }}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="d-label" htmlFor="settings-bio">
                Bio
              </label>
              <textarea
                id="settings-bio"
                className="d-control"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell us about yourself..."
                style={{ maxWidth: '360px', resize: 'vertical' }}
              />
            </div>

            <div>
              <button type="button" className="d-interactive" data-variant="primary">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Security</h3>
            <div>
              <label className="d-label" htmlFor="settings-current-pw">
                Current Password
              </label>
              <input
                id="settings-current-pw"
                type="password"
                className="d-control"
                placeholder="Enter current password"
                style={{ maxWidth: '360px' }}
              />
            </div>
            <div>
              <label className="d-label" htmlFor="settings-new-pw">
                New Password
              </label>
              <input
                id="settings-new-pw"
                type="password"
                className="d-control"
                placeholder="Enter new password"
                style={{ maxWidth: '360px' }}
              />
            </div>
            <div>
              <button type="button" className="d-interactive" data-variant="primary">
                Update Password
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Notifications</h3>
            <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>
              Configure how you receive notifications about registry activity.
            </p>
            {['Email on new download', 'Email on content approved', 'Weekly digest', 'Security alerts'].map(
              (label) => (
                <label
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    style={{ accentColor: 'var(--d-primary)', width: '1rem', height: '1rem' }}
                  />
                  {label}
                </label>
              ),
            )}
          </div>
        )}

        {activeTab === 'Danger Zone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, color: 'var(--d-error)' }}>
              Danger Zone
            </h3>
            <div
              className="d-surface"
              style={{ borderColor: 'var(--d-error)', borderLeftWidth: '3px' }}
            >
              <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                Permanently delete your account and all associated content. This action cannot be undone.
              </p>
              <button type="button" className="d-interactive" data-variant="danger">
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
