'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/dashboard/settings/actions';
import { changePasswordAction } from '@/app/dashboard/settings/password-actions';

interface Props {
  user: { email?: string; display_name?: string; username?: string };
}

export function AccountSettings({ user }: Props) {
  const [tab, setTab] = useState<'profile' | 'security'>('profile');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [secMsg, setSecMsg] = useState('');
  const [secErr, setSecErr] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setProfileMsg('');
    setProfileErr('');
    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    setSaving(false);
    if (result?.error) setProfileErr(result.error);
    else setProfileMsg('Profile updated successfully.');
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSecMsg('');
    setSecErr('');
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('new_password') as string;
    const result = await changePasswordAction(newPassword);
    setSaving(false);
    if (result?.error) setSecErr(result.error);
    else setSecMsg('Password updated successfully.');
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex items-center gap-0" style={{ borderBottom: '1px solid var(--d-border)' }}>
        {(['profile', 'security'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-sm font-medium"
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--d-accent)' : '2px solid transparent',
              color: tab === t ? 'var(--d-text)' : 'var(--d-text-muted)',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleProfile} className="flex flex-col gap-4" style={{ maxWidth: '40rem' }}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Display Name</label>
            <input
              className="d-control"
              name="display_name"
              defaultValue={user.display_name || ''}
              placeholder="Your display name"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Username</label>
            <input
              className="d-control"
              name="username"
              defaultValue={user.username || ''}
              placeholder="Username"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Email</label>
            <input
              className="d-control"
              value={user.email || ''}
              disabled
              style={{ opacity: 0.6 }}
            />
          </div>
          {profileErr && <p className="text-sm" style={{ color: 'var(--d-error)' }}>{profileErr}</p>}
          {profileMsg && <p className="text-sm" style={{ color: 'var(--d-success)' }}>{profileMsg}</p>}
          <div>
            <button className="d-interactive" data-variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {tab === 'security' && (
        <form onSubmit={handlePassword} className="flex flex-col gap-4" style={{ maxWidth: '40rem' }}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">New Password</label>
            <input
              className="d-control"
              name="new_password"
              type="password"
              placeholder="Enter new password"
              minLength={8}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Confirm Password</label>
            <input
              className="d-control"
              name="confirm_password"
              type="password"
              placeholder="Confirm new password"
              minLength={8}
              required
            />
          </div>
          {secErr && <p className="text-sm" style={{ color: 'var(--d-error)' }}>{secErr}</p>}
          {secMsg && <p className="text-sm" style={{ color: 'var(--d-success)' }}>{secMsg}</p>}
          <div>
            <button className="d-interactive" data-variant="primary" type="submit" disabled={saving}>
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
