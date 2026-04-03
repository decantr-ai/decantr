'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  inviteMemberAction,
  removeMemberAction,
  updateRoleAction,
} from './actions';
import { KPIGrid } from '@/components/kpi-grid';

interface Member {
  user_id: string;
  email: string;
  role: string;
  created_at: string;
  display_name?: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const ROLE_BADGE: Record<string, string> = {
  owner: 'bg-d-primary/15 text-d-primary',
  admin: 'bg-d-amber/15 text-d-amber',
  member: 'bg-d-surface-raised text-d-muted',
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [orgSlug, setOrgSlug] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [error, setError] = useState<string | null>(null);
  const [isInviting, startInvite] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

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
        const token = session?.access_token ?? '';

        // Try to get user's org slug from profile
        const meRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1'}/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (meRes.ok) {
          const me = await meRes.json();
          const slug = me.org_slug || me.username || '';
          setOrgSlug(slug);

          if (slug) {
            const membersRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1'}/orgs/${slug}/members`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (membersRes.ok) {
              const data = await membersRes.json();
              setMembers(data?.members ?? []);
            }
          }
        }
      } catch {
        // Defaults
      }
    }
    load();
  }, []);

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Email or username is required.');
      return;
    }

    startInvite(async () => {
      const result = await inviteMemberAction(
        orgSlug,
        identifier.trim(),
        inviteRole
      );
      if (result?.error) {
        setError(result.error);
      } else {
        setIdentifier('');
        // Reload
        try {
          const { createBrowserClient } = await import('@supabase/ssr');
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const token = session?.access_token ?? '';
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1'}/orgs/${orgSlug}/members`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.ok) {
            const data = await res.json();
            setMembers(data?.members ?? []);
          }
        } catch {
          // Ignore
        }
      }
    });
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId);
    const result = await removeMemberAction(orgSlug, userId);
    if (result?.error) {
      setError(result.error);
    } else {
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    }
    setRemovingId(null);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    const result = await updateRoleAction(orgSlug, userId, newRole);
    if (result?.error) {
      setError(result.error);
    } else {
      setMembers((prev) =>
        prev.map((m) =>
          m.user_id === userId ? { ...m, role: newRole } : m
        )
      );
    }
  }

  const kpiItems = [
    {
      label: 'Team Members',
      value: members.length,
      icon: <UsersIcon />,
    },
    {
      label: 'Pending Invites',
      value: 0,
      icon: <MailIcon />,
    },
  ];

  return (
    <div className="d-section max-w-4xl" data-density="compact">
      <h1 className="d-label border-l-2 border-d-accent pl-2 text-lg mb-6">
        Team
      </h1>

      {/* KPIs */}
      <div className="mb-8">
        <KPIGrid items={kpiItems} />
      </div>

      {error && (
        <div
          className="d-annotation px-3 py-2 rounded text-sm mb-4"
          data-status="error"
        >
          {error}
        </div>
      )}

      {/* Invite Form */}
      <form
        onSubmit={handleInvite}
        className="d-surface rounded-lg p-5 mb-6"
      >
        <h2 className="text-base font-semibold text-d-text mb-3">
          Invite Member
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <label
              htmlFor="invite-id"
              className="text-sm font-medium text-d-text"
            >
              Email or @username
            </label>
            <input
              id="invite-id"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="team@example.com or @username"
              className="d-control w-full rounded-md py-2 px-3 text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="invite-role"
              className="text-sm font-medium text-d-text"
            >
              Role
            </label>
            <select
              id="invite-role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="d-control rounded-md py-2 px-3 text-sm appearance-none bg-d-bg"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isInviting}
            className="d-interactive py-2 px-4 text-sm rounded-md disabled:opacity-50 shrink-0"
            data-variant="primary"
          >
            {isInviting ? 'Inviting...' : 'Invite'}
          </button>
        </div>
      </form>

      {/* Member List */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-d-muted mb-3"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p className="text-sm text-d-muted">
            No team members yet. Invite someone above.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {members.map((member) => {
            const initials = (member.display_name || member.email)
              .split(/[\s@]/)
              .filter(Boolean)
              .slice(0, 2)
              .map((s) => s[0].toUpperCase())
              .join('');

            const badgeColor =
              ROLE_BADGE[member.role] ?? ROLE_BADGE.member;

            return (
              <div
                key={member.user_id}
                className="d-data-row flex items-center gap-4 py-3 px-4 rounded-md"
              >
                {/* Avatar */}
                <div className="shrink-0 w-8 h-8 rounded-full bg-d-primary/15 text-d-primary flex items-center justify-center text-xs font-semibold">
                  {initials}
                </div>

                {/* Identity */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-d-text truncate">
                    {member.display_name || member.email.split('@')[0]}
                  </span>
                  <span className="text-xs text-d-muted truncate">
                    {member.email}
                  </span>
                </div>

                {/* Role badge */}
                <span
                  className={`d-annotation text-xs shrink-0 ${badgeColor}`}
                >
                  {member.role}
                </span>

                {/* Join date */}
                <span className="hidden md:block text-xs text-d-muted shrink-0">
                  Joined {formatDate(member.created_at)}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {member.role !== 'owner' && (
                    <>
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.user_id, e.target.value)
                        }
                        className="d-control rounded py-1 px-2 text-xs appearance-none bg-d-bg"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemove(member.user_id)}
                        disabled={removingId === member.user_id}
                        className="d-interactive py-1 px-2 text-xs rounded disabled:opacity-50"
                        data-variant="danger"
                        title="Remove member"
                      >
                        {removingId === member.user_id ? (
                          '...'
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
