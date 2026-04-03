import { css } from '@decantr/css';
import { Trash2 } from 'lucide-react';
import type { TeamMember } from '@/data/mock';
import { getInitials } from '@/data/mock';

const ROLE_STYLES: Record<TeamMember['role'], { bg: string; color: string }> = {
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

interface Props {
  member: TeamMember;
}

export function TeamMemberRow({ member }: Props) {
  const roleStyle = ROLE_STYLES[member.role];

  return (
    <div
      className={css('_flex _aic _gap3') + ' d-data-row'}
      style={{ padding: 'var(--d-data-py) var(--d-content-gap)' }}
    >
      {/* Avatar */}
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
        {getInitials(member.name)}
      </div>

      {/* Name + email */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className={css('_fontmedium _textsm')}>{member.name}</div>
        <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {member.email}
        </div>
      </div>

      {/* Role badge */}
      <span
        className="d-annotation"
        style={{ background: roleStyle.bg, color: roleStyle.color }}
      >
        {member.role}
      </span>

      {/* Joined date */}
      <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }}>
        {member.joinedAt}
      </span>

      {/* Actions */}
      <div className={css('_flex _aic _gap1')}>
        <select
          className="d-control"
          defaultValue={member.role}
          style={{ width: 'auto', minWidth: 100, fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
          disabled={member.role === 'owner'}
        >
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
        {member.role !== 'owner' && (
          <button
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.25rem', color: 'var(--d-error)' }}
            aria-label="Remove member"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
