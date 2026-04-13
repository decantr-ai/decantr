import { useState, useCallback } from 'react';
import { KPIGrid } from '../../components/KPIGrid';
import TeamMemberRow from '../../components/TeamMemberRow';
import { teamKPIs, teamMembers as initialMembers, type TeamMember } from '../../data/mock';

export default function TeamPage() {
  const [members, setMembers] = useState(initialMembers);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('member');

  const handleRoleChange = useCallback((id: string, role: TeamMember['role']) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleInvite = useCallback(() => {
    if (!inviteEmail.trim()) return;
    const id = String(Date.now());
    const localPart = inviteEmail.split('@')[0] ?? '';
    const initials = localPart.slice(0, 2).toUpperCase();
    setMembers((prev) => [
      ...prev,
      {
        id,
        name: localPart,
        email: inviteEmail.trim(),
        role: inviteRole,
        joinedAt: new Date().toISOString().split('T')[0] ?? '',
        initials,
      },
    ]);
    setInviteEmail('');
    setInviteRole('member');
    setShowInvite(false);
  }, [inviteEmail, inviteRole]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="d-label" data-anchor="">
        Team
      </div>

      <KPIGrid kpis={teamKPIs} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Members</h3>
        <button
          type="button"
          className="d-interactive"
          data-variant="primary"
          onClick={() => setShowInvite((v) => !v)}
          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
        >
          Invite Member
        </button>
      </div>

      {showInvite && (
        <div
          className="d-surface"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
          }}
        >
          <input
            type="email"
            className="d-control"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@example.com"
            style={{ flex: 1, maxWidth: '320px' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInvite();
            }}
          />
          <select
            className="d-control"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
            style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.375rem 0.5rem' }}
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
          <button
            type="button"
            className="d-interactive"
            data-variant="primary"
            onClick={handleInvite}
            style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
          >
            Invite
          </button>
          <button
            type="button"
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setShowInvite(false)}
            style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
          >
            Cancel
          </button>
        </div>
      )}

      <div
        className="d-surface"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {members.map((member) => (
          <TeamMemberRow
            key={member.id}
            member={member}
            onRoleChange={handleRoleChange}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
}
