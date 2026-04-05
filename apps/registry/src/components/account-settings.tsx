'use client';

import { useEffect, useState, useTransition } from 'react';
import { updateProfile } from '@/app/dashboard/settings/actions';

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
    <>
      <div className="account-settings-layout">
        <nav className="flex flex-col gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2"
                style={{
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  borderLeft: `2px solid ${active ? 'var(--d-accent)' : 'transparent'}`,
                  background: active ? 'var(--d-surface)' : 'transparent',
                  color: active
                    ? 'var(--d-accent)'
                    : 'var(--d-text-muted)',
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

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-1"
      style={{ marginBottom: '1rem' }}
    >
      <label className="d-label">{label}</label>
      {children}
    </div>
  );
}

function ProfileTab() {
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
    async function load() {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setEmail(session.user.email ?? '');
          const meta = session.user.user_metadata;
          setDisplayName((meta?.display_name as string) ?? '');
          setUsername((meta?.username as string) ?? '');
          setBio((meta?.bio as string) ?? '');
        }
      } catch {
        // defaults
      }
    }
    load();
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData();
    formData.set('display_name', displayName);
    formData.set('username', username);
    startSave(async () => {
      const result = await updateProfile(formData);
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Profile updated.' });
      }
    });
  }

  const initials = (displayName || email || 'YO')
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Profile</h3>

      {message && (
        <div
          className="d-annotation"
          data-status={message.type}
          style={{ display: 'block' }}
        >
          {message.text}
        </div>
      )}

      {/* Avatar placeholder */}
      <div className="flex items-center gap-3">
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
          {initials || 'YO'}
        </div>
        <button
          type="button"
          className="d-interactive"
          data-variant="ghost"
          style={{ fontSize: '0.8125rem' }}
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
          className="d-control"
          type="email"
          value={email}
          disabled
          style={{ opacity: 0.6, cursor: 'not-allowed' }}
        />
      </FieldGroup>
      <FieldGroup label="Bio">
        <textarea
          className="d-control"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Building with Decantr."
          style={{ resize: 'vertical' }}
        />
      </FieldGroup>

      <button
        type="submit"
        className="d-interactive"
        data-variant="primary"
        disabled={isSaving}
        style={{ alignSelf: 'flex-start' }}
      >
        {isSaving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}

function SecurityTab() {
  return (
    <div className="flex flex-col gap-4">
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Security</h3>

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
        className="d-interactive"
        data-variant="primary"
        style={{ alignSelf: 'flex-start' }}
      >
        Update password
      </button>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="flex flex-col gap-4">
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Notifications</h3>
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
          className="flex items-center justify-between"
          style={{
            padding: '0.5rem 0',
            borderBottom: '1px solid var(--d-border)',
          }}
        >
          <span className="text-sm">{label}</span>
          <input
            type="checkbox"
            defaultChecked
            style={{ accentColor: 'var(--d-primary)' }}
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
    <div className="flex flex-col gap-4">
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--d-error)',
        }}
      >
        Danger Zone
      </h3>
      <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
        Sign out of your account. You will need to log in again.
      </p>
      <button
        type="button"
        className="d-interactive"
        data-variant="danger"
        onClick={handleSignOut}
        style={{ alignSelf: 'flex-start' }}
      >
        Sign out
      </button>
    </div>
  );
}
