import { FilterBar } from '@/components/FilterBar';
import { teamMembers } from '@/data/mock';

export function TeamPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Team</h1>
        <button className="lp-button-primary" style={{ padding: '0.375rem 1rem', fontSize: '0.875rem' }}>
          Invite Member
        </button>
      </div>

      <FilterBar
        placeholder="Search members..."
        filters={[
          { label: 'Role', options: [{ label: 'Owner', value: 'owner' }, { label: 'Admin', value: 'admin' }, { label: 'Developer', value: 'developer' }, { label: 'Viewer', value: 'viewer' }] },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--d-content-gap)' }}>
        {teamMembers.map(member => (
          <div key={member.id} className="lp-card-elevated" style={{ padding: 'var(--d-surface-p)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--d-radius-full)',
                background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {member.avatar}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{member.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{member.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="d-annotation" data-status={member.role === 'owner' ? 'info' : undefined}>
                {member.role}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                {member.projects} project{member.projects !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
              Active {member.lastActive}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
