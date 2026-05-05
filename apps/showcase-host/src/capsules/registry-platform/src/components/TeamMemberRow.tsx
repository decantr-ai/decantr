import { useCallback } from 'react';
import type { TeamMember } from '../data/mock';

interface TeamMemberRowProps {
  member: TeamMember;
  onRoleChange?: (id: string, role: TeamMember['role']) => void;
  onRemove?: (id: string) => void;
}

const ROLE_STYLES: Record<TeamMember['role'], { bg: string; color: string; border: string }> = {
  owner: { bg: 'rgba(254, 68, 116, 0.15)', color: 'var(--d-primary)', border: 'transparent' },
  admin: { bg: 'rgba(253, 163, 3, 0.12)', color: 'var(--d-accent)', border: 'transparent' },
  member: { bg: 'transparent', color: 'var(--d-text-muted)', border: 'var(--d-border)' },
};

export default function TeamMemberRow({ member, onRoleChange, onRemove }: TeamMemberRowProps) {
  const roleStyle = ROLE_STYLES[member.role];

  const handleRoleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onRoleChange?.(member.id, e.target.value as TeamMember['role']);
    },
    [onRoleChange, member.id],
  );

  const handleRemove = useCallback(() => {
    onRemove?.(member.id);
  }, [onRemove, member.id]);

  return (
    <div
      className="d-data-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        gap: '1rem',
        transition: 'background 0.15s ease',
      }}
    >
      {/* Avatar + name/email */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 0', minWidth: 0 }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
            letterSpacing: '0.02em',
          }}
        >
          {member.initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--d-text)' }}>{member.name}</div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--d-text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {member.email}
          </div>
        </div>
      </div>

      {/* Role badge */}
      <span
        className="d-annotation"
        style={{
          background: roleStyle.bg,
          color: roleStyle.color,
          border: `1px solid ${roleStyle.border}`,
          textTransform: 'capitalize',
          flexShrink: 0,
        }}
      >
        {member.role}
      </span>

      {/* Join date */}
      <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {member.joinedAt}
      </span>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <select
          className="d-control"
          value={member.role}
          onChange={handleRoleChange}
          disabled={member.role === 'owner'}
          aria-label={`Change role for ${member.name}`}
          style={{
            width: 'auto',
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            cursor: member.role === 'owner' ? 'not-allowed' : 'pointer',
          }}
        >
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
        <button
          type="button"
          className="d-interactive"
          data-variant="ghost"
          onClick={handleRemove}
          disabled={member.role === 'owner'}
          style={{
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            color: member.role === 'owner' ? 'var(--d-text-muted)' : 'var(--d-error)',
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
