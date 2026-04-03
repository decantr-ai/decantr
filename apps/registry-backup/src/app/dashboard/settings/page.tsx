'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/api';
import { updateProfile, signOut } from './actions';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const me = await api.getMe(session.access_token);
          setDisplayName(me.display_name || '');
          setUsername(me.username || '');
          setEmail(me.email || '');
        }
      } catch {
        // Failed to load profile
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setMessage(null);
    const result = await updateProfile(formData);
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Profile updated.' });
    }
    setSaving(false);
  }

  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Card>
          <p className="text-[var(--fg-muted)]">Loading profile...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Profile</h2>
        <form action={handleSubmit} className="space-y-4 max-w-sm">
          <div>
            <label className="mb-1 block text-xs text-[var(--fg-muted)]">Email</label>
            <p className="text-sm text-[var(--fg)]">{email}</p>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[var(--fg-muted)]">Display Name</label>
            <Input
              name="display_name"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-[var(--fg-muted)]">Username</label>
            <Input
              name="username"
              placeholder="your-username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
            />
            <p className="mt-1 text-xs text-[var(--fg-dim)]">
              3-30 characters. Lowercase letters, numbers, and hyphens only. Shows as @{username || 'username'} on your content.
            </p>
          </div>

          {message && (
            <p className={`text-sm ${message.type === 'error' ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>
              {message.text}
            </p>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Account</h2>
        <form action={signOut}>
          <Button type="submit" variant="danger">Sign Out</Button>
        </form>
      </Card>
    </div>
  );
}
