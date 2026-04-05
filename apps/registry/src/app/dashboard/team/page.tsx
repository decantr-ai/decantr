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

/* ── Icons ── */

function UserPlusIcon({ size = 16 }: { size?: number }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" x2="20" y1="8" y2="14" />
      <line x1="23" x2="17" y1="11" y2="11" />
    </svg>
  );
}

function UsersIcon({ size = 18 }: { size?: number }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ActivityIcon({ size = 18 }: { size?: number }) {
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
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function PackageIcon({ size = 18 }: { size?: number }) {
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
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function MailIcon({ size = 18 }: { size?: number }) {
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
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function TrashIcon({ size = 14 }: { size?: number }) {
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
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function UsersLgIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/* ── Role styling ── */

const ROLE_STYLES: Record<string, { bg: string; color: string }> = {
  owner: {
    bg: 'color-mix(in srgb, var(--d-primary) 15%, transparent)',
    color: 'var(--d-primary)',
  },
  admin: {
    bg: 'color-mix(in srgb, var(--d-secondary) 15%, transparent)',
    color: 'var(--d-secondary)',
  },
  member: {
    bg: 'var(--d-surface)',
    color: 'var(--d-text-muted)',
  },
};

function getInitials(name: string): string {
  return name
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function TeamMemberRow({
  member,
  onRemove,
  onRoleChange,
  removingId,
}: {
  member: Member;
  onRemove: (userId: string) => void;
  onRoleChange: (userId: string, role: string) => void;
  removingId: string | null;
}) {
  const roleStyle = ROLE_STYLES[member.role] ?? ROLE_STYLES.member;
  return (
    <div
      className="d-data-row flex items-center gap-3"
      style={{ padding: 'var(--d-data-py) var(--d-content-gap)' }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--d-surface-raised)',
          border: '1px solid var(--d-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.6875rem',
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {getInitials(member.display_name || member.email)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-medium text-sm">
          {member.display_name || member.email.split('@')[0]}
        </div>
        <div
          className="text-sm"
          style={{
            color: 'var(--d-text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {member.email}
        </div>
      </div>

      <span
        className="d-annotation"
        style={{ background: roleStyle.bg, color: roleStyle.color }}
      >
        {member.role}
      </span>

      <span
        className="text-sm"
        style={{ color: 'var(--d-text-muted)', flexShrink: 0 }}
      >
        {formatDate(member.created_at)}
      </span>

      <div className="flex items-center gap-1">
        <select
          className="d-control"
          defaultValue={member.role}
          disabled={member.role === 'owner'}
          onChange={(e) => onRoleChange(member.user_id, e.target.value)}
          style={{
            width: 'auto',
            minWidth: 100,
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
          }}
        >
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
        {member.role !== 'owner' && (
          <button
            type="button"
            className="d-interactive"
            data-variant="ghost"
            onClick={() => onRemove(member.user_id)}
            disabled={removingId === member.user_id}
            style={{ padding: '0.25rem', color: 'var(--d-error)' }}
            aria-label="Remove member"
          >
            <TrashIcon size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [orgSlug, setOrgSlug] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
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
        // defaults
      }
    }
    load();
  }, []);

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!inviteEmail.trim()) {
      setError('Email or username is required.');
      return;
    }
    startInvite(async () => {
      const result = await inviteMemberAction(
        orgSlug,
        inviteEmail.trim(),
        inviteRole
      );
      if (result?.error) {
        setError(result.error);
      } else {
        setInviteEmail('');
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
          // ignore
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
        prev.map((m) => (m.user_id === userId ? { ...m, role: newRole } : m))
      );
    }
  }

  const kpiItems = [
    {
      label: 'Members',
      value: members.length,
      icon: <UsersIcon size={18} />,
    },
    {
      label: 'Active This Week',
      value: members.length,
      icon: <ActivityIcon size={18} />,
    },
    {
      label: 'Items Published',
      value: 0,
      icon: <PackageIcon size={18} />,
    },
    {
      label: 'Pending Invites',
      value: 0,
      icon: <MailIcon size={18} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold">Team</h3>

      {error && (
        <div className="d-annotation" data-status="error" style={{ display: 'block' }}>
          {error}
        </div>
      )}

      {/* KPIs */}
      <section className="d-section" data-density="compact">
        <KPIGrid items={kpiItems} />
      </section>

      {/* Members */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{
            paddingLeft: '0.75rem',
            borderLeft: '2px solid var(--d-accent)',
          }}
        >
          Members
        </span>

        {/* Invite form */}
        <form
          onSubmit={handleInvite}
          className="flex items-center gap-3 mb-4"
        >
          <input
            className="d-control"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{ maxWidth: '20rem', flex: 1 }}
          />
          <select
            className="d-control"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            style={{ maxWidth: '8rem' }}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="d-interactive"
            data-variant="primary"
            disabled={isInviting}
            style={{
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <UserPlusIcon size={16} />
            {isInviting ? 'Inviting...' : 'Invite'}
          </button>
        </form>

        {members.length > 0 ? (
          <div className="d-data">
            {members.map((member) => (
              <TeamMemberRow
                key={member.user_id}
                member={member}
                onRemove={handleRemove}
                onRoleChange={handleRoleChange}
                removingId={removingId}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '3rem 0',
            }}
          >
            <span style={{ color: 'var(--d-text-muted)', opacity: 0.5 }}>
              <UsersLgIcon size={48} />
            </span>
            <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
              No team members yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
