'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/dashboard/settings/actions';
import { useWorkspaceState } from '@/components/workspace-state-provider';

/* ── Icons ── */

function UserIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ShieldIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function BellIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function AlertTriangleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'security', label: 'Security', icon: ShieldIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangleIcon },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function AccountSettings() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  return (
    <div className="registry-settings-layout">
      <nav className="registry-settings-nav">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="registry-settings-tab"
              data-active={active}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="registry-settings-panel">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'danger' && <DangerTab />}
      </div>
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="registry-settings-field">
      <label className="d-label">{label}</label>
      {children}
    </div>
  );
}

function ProfileTab() {
  const router = useRouter();
  const workspace = useWorkspaceState();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isSaving, startSave] = useTransition();

  useEffect(() => {
    setDisplayName(workspace.identity.displayName ?? '');
    setUsername(workspace.identity.username ?? '');
    setEmail(workspace.identity.email);
    setBio(workspace.identity.bio ?? '');
  }, [workspace.identity]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData();
    formData.set('display_name', displayName);
    formData.set('username', username);
    formData.set('bio', bio);
    startSave(async () => {
      const result = await updateProfile(formData);
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Profile updated.' });
        router.refresh();
      }
    });
  }

  const initials = workspace.identity.initials || 'YO';

  return (
    <form onSubmit={handleSave} className="registry-settings-form">
      <h3 className="registry-settings-section-title">Profile</h3>

      {message && (
        <div
          className="d-annotation registry-settings-message"
          data-status={message.type}
        >
          {message.text}
        </div>
      )}

      {/* Avatar placeholder */}
      <div className="registry-settings-avatar-row">
        <div className="registry-settings-avatar">{initials || 'YO'}</div>
        <button
          type="button"
          className="d-interactive"
          data-variant="ghost"
        >
          Change avatar
        </button>
      </div>

      <FieldGroup label="Name">
        <input
          className="d-control"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your display name"
        />
      </FieldGroup>
      <FieldGroup label="Username">
        <input
          className="d-control"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your-username"
        />
      </FieldGroup>
      <FieldGroup label="Email">
        <input
          className="d-control registry-settings-disabled"
          type="email"
          value={email}
          disabled
        />
      </FieldGroup>
      <FieldGroup label="Bio">
        <textarea
          className="d-control registry-settings-textarea"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Building with Decantr."
        />
      </FieldGroup>

      <button
        type="submit"
        className="d-interactive registry-settings-actions"
        data-variant="primary"
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}

function SecurityTab() {
  return (
    <div className="registry-settings-form">
      <h3 className="registry-settings-section-title">Security</h3>

      <FieldGroup label="Current Password">
        <input
          className="d-control"
          type="password"
          placeholder="Enter current password"
        />
      </FieldGroup>
      <FieldGroup label="New Password">
        <input
          className="d-control"
          type="password"
          placeholder="Enter new password"
        />
      </FieldGroup>
      <FieldGroup label="Confirm New Password">
        <input
          className="d-control"
          type="password"
          placeholder="Confirm new password"
        />
      </FieldGroup>

      <button
        type="button"
        className="d-interactive registry-settings-actions"
        data-variant="primary"
      >
        Update password
      </button>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="registry-settings-form">
      <h3 className="registry-settings-section-title">Notifications</h3>
      {(
        [
          'Email notifications',
          'Download alerts',
          'Review requests',
          'Newsletter',
        ] as const
      ).map((label) => (
        <div
          key={label}
          className="registry-settings-toggle-row"
        >
          <span className="text-sm">{label}</span>
          <input
            type="checkbox"
            defaultChecked
          />
        </div>
      ))}
    </div>
  );
}

function DangerTab() {
  async function handleSignOut() {
    try {
      await fetch('/auth/signout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  }

  return (
    <div className="registry-settings-form">
      <h3 className="registry-settings-section-title registry-settings-danger-title">
        Danger Zone
      </h3>
      <p className="registry-muted-copy">
        Sign out of your account. You will need to log in again.
      </p>
      <button
        type="button"
        className="d-interactive registry-settings-actions"
        data-variant="danger"
        onClick={handleSignOut}
      >
        Sign out
      </button>
    </div>
  );
}
