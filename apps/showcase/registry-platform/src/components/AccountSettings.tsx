import { css } from '@decantr/css';
import { useState } from 'react';
import { User, Shield, Bell, AlertTriangle } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function AccountSettings() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  return (
    <>
      <div className="account-settings-layout">
        {/* Sidebar tabs */}
        <nav className={css('_flex _col _gap1')}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={css('_flex _aic _gap2')}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  borderLeft: `2px solid ${active ? 'var(--d-accent)' : 'transparent'}`,
                  background: active ? 'var(--d-surface)' : 'transparent',
                  color: active ? 'var(--d-accent)' : 'var(--d-text-muted)',
                  cursor: 'pointer',
                  borderRadius: '0 var(--d-radius-sm) var(--d-radius-sm) 0',
                  fontSize: '0.875rem',
                  fontWeight: active ? 500 : 400,
                  textAlign: 'left',
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'danger' && <DangerTab />}
        </div>
      </div>

      <style>{`
        .account-settings-layout {
          display: flex;
          gap: 2rem;
        }
        .account-settings-layout > nav {
          min-width: 180px;
        }
        @media (max-width: 639px) {
          .account-settings-layout {
            flex-direction: column;
          }
          .account-settings-layout > nav {
            flex-direction: row;
            overflow-x: auto;
            min-width: unset;
          }
          .account-settings-layout > nav > button {
            border-left: none !important;
            border-bottom: 2px solid transparent;
            white-space: nowrap;
          }
        }
      `}</style>
    </>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={css('_flex _col _gap1')} style={{ marginBottom: '1rem' }}>
      <label className="d-label">{label}</label>
      {children}
    </div>
  );
}

function ProfileTab() {
  return (
    <div className={css('_flex _col _gap4')}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Profile</h3>

      {/* Avatar placeholder */}
      <div className={css('_flex _aic _gap3')}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--d-surface-raised)',
            border: '2px solid var(--d-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 600,
          }}
        >
          YO
        </div>
        <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8125rem' }}>
          Change avatar
        </button>
      </div>

      <FieldGroup label="Name">
        <input className="d-control" type="text" defaultValue="You" />
      </FieldGroup>
      <FieldGroup label="Email">
        <input className="d-control" type="email" defaultValue="you@decantr.dev" />
      </FieldGroup>
      <FieldGroup label="Bio">
        <textarea
          className="d-control"
          rows={3}
          defaultValue="Building with Decantr."
          style={{ resize: 'vertical' }}
        />
      </FieldGroup>

      <button className="d-interactive" data-variant="primary" style={{ alignSelf: 'flex-start' }}>
        Save changes
      </button>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className={css('_flex _col _gap4')}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Security</h3>

      <FieldGroup label="Current Password">
        <input className="d-control" type="password" placeholder="Enter current password" />
      </FieldGroup>
      <FieldGroup label="New Password">
        <input className="d-control" type="password" placeholder="Enter new password" />
      </FieldGroup>
      <FieldGroup label="Confirm New Password">
        <input className="d-control" type="password" placeholder="Confirm new password" />
      </FieldGroup>

      <button className="d-interactive" data-variant="primary" style={{ alignSelf: 'flex-start' }}>
        Update password
      </button>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className={css('_flex _col _gap4')}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Notifications</h3>

      {(['Email notifications', 'Download alerts', 'Review requests', 'Newsletter'] as const).map((label) => (
        <div key={label} className={css('_flex _aic _jcsb')} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--d-border)' }}>
          <span className={css('_textsm')}>{label}</span>
          <input type="checkbox" defaultChecked style={{ accentColor: 'var(--d-primary)' }} />
        </div>
      ))}
    </div>
  );
}

function DangerTab() {
  return (
    <div className={css('_flex _col _gap4')}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--d-error)' }}>Danger Zone</h3>
      <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
        Once you delete your account, there is no going back. Please be certain.
      </p>
      <button className="d-interactive" data-variant="danger" style={{ alignSelf: 'flex-start' }}>
        Delete account
      </button>
    </div>
  );
}
