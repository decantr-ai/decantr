'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { inviteMemberAction } from '@/app/dashboard/team/actions';

export function InviteMemberForm({ orgSlug }: { orgSlug: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await inviteMemberAction(orgSlug, email.trim(), role);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-48">
        <label className="mb-1 block text-xs text-[var(--fg-muted)]">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="team@company.com"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-[var(--fg-muted)]">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm text-[var(--fg)]"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <Button type="submit" disabled={loading || !email.trim()}>
        {loading ? 'Inviting...' : 'Invite'}
      </Button>
      {error && <p className="w-full text-sm text-[var(--error)]">{error}</p>}
      {success && <p className="w-full text-sm text-[var(--success)]">Invitation sent.</p>}
    </form>
  );
}
