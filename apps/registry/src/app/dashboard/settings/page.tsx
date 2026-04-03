'use client';

import { useEffect, useState, useTransition } from 'react';
import { updateProfile, signOut } from './actions';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isSigningOut, startSignOut] = useTransition();

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
        }

        // Try to get profile from API for accurate data
        const token = session?.access_token ?? '';
        if (token) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1'}/me`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.ok) {
            const profile = await res.json();
            if (profile.display_name) setDisplayName(profile.display_name);
            if (profile.username) setUsername(profile.username);
          }
        }
      } catch {
        // Use defaults
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

  function handleSignOut() {
    startSignOut(async () => {
      await signOut();
    });
  }

  return (
    <div className="d-section max-w-2xl" data-density="compact">
      <h1 className="d-label border-l-2 border-d-accent pl-2 text-lg mb-6">
        Account Settings
      </h1>

      {/* Profile section */}
      <form onSubmit={handleSave} className="d-surface rounded-lg p-5 mb-6">
        <h2 className="text-base font-semibold text-d-text mb-4">Profile</h2>

        {message && (
          <div
            className="d-annotation px-3 py-2 rounded text-sm mb-4"
            data-status={message.type === 'success' ? 'success' : 'error'}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-col gap-4 max-w-md">
          {/* Email (read-only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-d-text">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="d-control w-full rounded-md py-2 px-3 text-sm opacity-60 cursor-not-allowed"
            />
          </div>

          {/* Display Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="display_name"
              className="text-sm font-medium text-d-text"
            >
              Display Name
            </label>
            <input
              id="display_name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="d-control w-full rounded-md py-2 px-3 text-sm"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-sm font-medium text-d-text"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-username"
              className="d-control w-full rounded-md py-2 px-3 text-sm"
            />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-d-border/50">
          <button
            type="submit"
            disabled={isSaving}
            className="d-interactive py-2 px-4 text-sm rounded-md disabled:opacity-50"
            data-variant="primary"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="d-surface rounded-lg p-5 border border-d-error/20">
        <h2 className="text-base font-semibold text-d-error mb-2">
          Danger Zone
        </h2>
        <p className="text-sm text-d-muted mb-4">
          Sign out of your account. You will need to log in again.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="d-interactive py-2 px-4 text-sm rounded-md disabled:opacity-50"
          data-variant="danger"
        >
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}
