'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { updateProfile, signOut } from './actions';

export default function SettingsPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    const result = await updateProfile(formData);
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Profile updated.' });
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Profile</h2>
        <form action={handleSubmit} className="space-y-4 max-w-sm">
          <div>
            <label className="mb-1 block text-xs text-[var(--fg-muted)]">Display Name</label>
            <Input name="display_name" placeholder="Your name" />
          </div>

          <div>
            <label className="mb-1 block text-xs text-[var(--fg-muted)]">Username</label>
            <Input name="username" placeholder="your-username" />
            <p className="mt-1 text-xs text-[var(--fg-dim)]">
              3-30 characters. Lowercase letters, numbers, and hyphens only. This appears as @username on your content.
            </p>
          </div>

          {message && (
            <p className={`text-sm ${message.type === 'error' ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>
              {message.text}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
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
