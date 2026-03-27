'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { removeMemberAction, updateRoleAction } from '@/app/dashboard/team/actions';
import type { OrgMember } from '@/lib/api';

const roleVariant: Record<string, 'official' | 'community' | 'default'> = {
  owner: 'official',
  admin: 'community',
  member: 'default',
};

export function TeamMemberList({
  members,
  orgSlug,
  currentUserRole,
}: {
  members: OrgMember[];
  orgSlug: string;
  currentUserRole: string;
}) {
  const [actionId, setActionId] = useState<string | null>(null);
  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';

  async function handleRemove(userId: string) {
    if (!confirm('Remove this team member?')) return;
    setActionId(userId);
    await removeMemberAction(orgSlug, userId);
    setActionId(null);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setActionId(userId);
    await updateRoleAction(orgSlug, userId, newRole);
    setActionId(null);
  }

  if (members.length === 0) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] p-12 text-center">
        <p className="text-[var(--fg-muted)]">No team members yet. Invite someone to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.user_id}
          className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{member.email}</span>
            <Badge variant={roleVariant[member.role] || 'default'}>{member.role}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--fg-muted)]">
              Joined {new Date(member.created_at).toLocaleDateString()}
            </span>
            {canManage && member.role !== 'owner' && (
              <>
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                  disabled={actionId === member.user_id}
                  className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1 text-xs text-[var(--fg)]"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={actionId === member.user_id}
                  onClick={() => handleRemove(member.user_id)}
                >
                  Remove
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
