'use client';

import { useState } from 'react';
import { KPIGrid, type KPIStat } from '@/components/kpi-grid';
import { inviteMemberAction, removeMemberAction, updateRoleAction } from './actions';

interface TeamMember {
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

const TEAM_KPIS: KPIStat[] = [
  { label: 'Members', value: 0, trend: 0, icon: 'Users' },
  { label: 'Active This Week', value: 0, trend: 0, icon: 'Activity' },
  { label: 'Items Published', value: 0, trend: 0, icon: 'Package' },
  { label: 'Pending Invites', value: 0, trend: 0, icon: 'Mail' },
];

const ROLE_COLORS: Record<string, string> = {
  owner: 'var(--d-primary)',
  admin: 'var(--d-accent)',
  member: 'var(--d-text-muted)',
};

export default function TeamPage() {
  const [members] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const orgSlug = 'default';

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setLoading(true);
    setError('');
    const result = await inviteMemberAction(orgSlug, inviteEmail, inviteRole);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setInviteEmail('');
      window.location.reload();
    }
  }

  async function handleRemove(userId: string) {
    const result = await removeMemberAction(orgSlug, userId);
    if (result?.error) setError(result.error);
    else window.location.reload();
  }

  async function handleRoleChange(userId: string, role: string) {
    const result = await updateRoleAction(orgSlug, userId, role);
    if (result?.error) setError(result.error);
    else window.location.reload();
  }

  const kpis = [...TEAM_KPIS];
  kpis[0] = { ...kpis[0], value: members.length };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold">Team</h3>

      {error && <div className="d-annotation" data-status="error">{error}</div>}

      {/* KPIs */}
      <section className="d-section" data-density="compact">
        <KPIGrid stats={kpis} />
      </section>

      {/* Invite form */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Invite Member
        </span>
        <div className="flex items-center gap-3">
          <input
            className="d-control"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email or @username"
            style={{ maxWidth: 300 }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleInvite(); }}
          />
          <select
            className="d-control"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            style={{ width: 'auto', minWidth: 120 }}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            className="d-interactive"
            data-variant="primary"
            onClick={handleInvite}
            disabled={loading}
            style={{ fontSize: '0.875rem' }}
          >
            {loading ? 'Inviting...' : 'Invite'}
          </button>
        </div>
      </section>

      {/* Members list */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Members
        </span>

        {members.length > 0 ? (
          <div className="d-data">
            {members.map((member) => {
              const initials = member.email.slice(0, 2).toUpperCase();
              return (
                <div
                  key={member.user_id}
                  className="d-data-row flex items-center gap-4"
                  style={{ padding: 'var(--d-data-py) 0' }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--d-surface-raised)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm font-medium">{member.email}</div>
                    <div className="text-xs" style={{ color: 'var(--d-text-muted)' }}>
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className="d-annotation"
                    style={{
                      background: `color-mix(in srgb, ${ROLE_COLORS[member.role] || 'var(--d-text-muted)'} 15%, transparent)`,
                      color: ROLE_COLORS[member.role] || 'var(--d-text-muted)',
                    }}
                  >
                    {member.role}
                  </span>
                  <div className="flex items-center gap-1">
                    <select
                      className="d-control"
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                      style={{ width: 'auto', minWidth: 100, fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      className="d-interactive"
                      data-variant="ghost"
                      onClick={() => handleRemove(member.user_id)}
                      style={{ padding: '0.25rem', color: 'var(--d-error)' }}
                      aria-label="Remove member"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3" style={{ padding: '3rem 0' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--d-text-muted)', opacity: 0.5 }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>No team members yet. Invite someone to get started.</p>
          </div>
        )}
      </section>
    </div>
  );
}
