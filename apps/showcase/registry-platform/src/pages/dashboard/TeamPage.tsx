import { useState } from 'react';
import { css } from '@decantr/css';
import { UserPlus, Users } from 'lucide-react';
import { KPIGrid } from '@/components/KPIGrid';
import { TeamMemberRow } from '@/components/TeamMemberRow';
import { TEAM_KPIS, TEAM_MEMBERS } from '@/data/mock';

export function TeamPage() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  return (
    <div className={css('_flex _col _gap6')}>
      <h3 className={css('_textlg _fontsemi')}>Team</h3>

      {/* KPIs */}
      <section className="d-section" data-density="compact">
        <KPIGrid kpis={TEAM_KPIS} />
      </section>

      {/* Members */}
      <section className="d-section" data-density="compact">
        <span
          className={css('_db _mb4') + ' d-label'}
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Members
        </span>

        {/* Invite form */}
        <div className={css('_flex _aic _gap3 _mb4')}>
          <input
            className="d-control"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{ maxWidth: '20rem' }}
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
          <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.875rem' }}>
            <UserPlus size={16} />
            Invite
          </button>
        </div>

        {/* Team table */}
        {TEAM_MEMBERS.length > 0 ? (
          <div className="d-data" role="table">
            {/* Header */}
            <div
              className={css('_grid _aic')}
              style={{ gridTemplateColumns: '2fr 1fr 1fr 0.75fr' }}
              role="row"
            >
              <span className="d-data-header" role="columnheader">Member</span>
              <span className="d-data-header" role="columnheader">Role</span>
              <span className="d-data-header" role="columnheader">Joined</span>
              <span className="d-data-header" role="columnheader">Actions</span>
            </div>

            {/* Rows */}
            {TEAM_MEMBERS.map((member) => (
              <TeamMemberRow key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className={css('_flex _col _aic _jcc _gap3')} style={{ padding: '3rem 0' }}>
            <Users size={48} style={{ color: 'var(--d-text-muted)', opacity: 0.5 }} />
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
              No team members yet.
            </p>
            <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.875rem' }}>
              Invite Your First Member
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
