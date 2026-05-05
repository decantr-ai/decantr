import { UserPlus, MoreHorizontal, Shield, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { members, type Member } from '@/data/mock';

const roleColors: Record<Member['role'], string> = {
  owner: 'var(--d-primary)',
  admin: 'var(--d-accent)',
  developer: 'var(--d-info)',
  billing: 'var(--d-warning)',
  viewer: 'var(--d-text-muted)',
};

export function MembersPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Members"
        description={`${members.length} members · 1 pending invitation`}
        actions={
          <button className="lp-button-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
            <UserPlus size={14} /> Invite member
          </button>
        }
      />

      {/* Permissions quick-reference */}
      <div className="d-surface" style={{ padding: '1rem' }}>
        <h3 className="d-label" style={{ marginBottom: '0.75rem' }}>Role Permissions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.75rem' }}>
          {[
            { role: 'Owner', perms: 'Full access · Billing · Delete' },
            { role: 'Admin', perms: 'Manage members · Settings' },
            { role: 'Developer', perms: 'API keys · Webhooks' },
            { role: 'Billing', perms: 'Invoices · Payment' },
            { role: 'Viewer', perms: 'Read-only access' },
          ].map(p => (
            <div key={p.role} style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius-sm)' }}>
              <div style={{ fontWeight: 600, color: 'var(--d-text)', marginBottom: 2 }}>{p.role}</div>
              <div style={{ color: 'var(--d-text-muted)' }}>{p.perms}</div>
            </div>
          ))}
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: 'member', header: 'Member',
            render: m => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, color: '#fff',
                }}>
                  {m.avatar}
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{m.name}</div>
                  <div className="mono-data" style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{m.email}</div>
                </div>
              </div>
            ),
          },
          {
            key: 'role', header: 'Role',
            render: m => (
              <span style={{ fontSize: '0.75rem', color: roleColors[m.role], fontWeight: 500, textTransform: 'capitalize' }}>
                {m.role}
              </span>
            ),
          },
          {
            key: 'status', header: 'Status',
            render: m => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                <span className="lp-status-dot" data-status={m.status} />
                {m.status}
              </span>
            ),
          },
          {
            key: 'mfa', header: 'MFA', width: '60px',
            render: m => m.mfa
              ? <ShieldCheck size={14} style={{ color: 'var(--d-success)' }} />
              : <Shield size={14} style={{ color: 'var(--d-text-muted)', opacity: 0.5 }} />,
          },
          {
            key: 'lastActive', header: 'Last Active',
            render: m => <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{m.lastActive}</span>,
          },
          {
            key: 'joined', header: 'Joined',
            render: m => <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{m.joinedAt}</span>,
          },
          {
            key: 'actions', header: '', width: '40px',
            render: () => (
              <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem', border: 'none' }} aria-label="More actions">
                <MoreHorizontal size={14} />
              </button>
            ),
          },
        ]}
        rows={members}
      />
    </div>
  );
}
