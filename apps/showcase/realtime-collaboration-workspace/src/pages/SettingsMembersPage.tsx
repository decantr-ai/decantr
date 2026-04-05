import { SettingsLayout, workspaceNav } from '../components/SettingsLayout';
import { members } from '../data/mock';
import { UserPlus, MoreHorizontal } from 'lucide-react';

export function SettingsMembersPage() {
  return (
    <SettingsLayout title="Workspace settings" subtitle="Manage your team's shared space." nav={workspaceNav}>
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Members</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{members.length} people on this workspace</p>
          </div>
          <button className="d-interactive" style={{ padding: '0.4375rem 0.75rem', fontSize: '0.8125rem', background: 'var(--d-primary)', color: '#fff', borderColor: 'var(--d-primary)' }}>
            <UserPlus size={14} /> Invite members
          </button>
        </div>
        <div className="paper-card">
          {members.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', borderTop: i === 0 ? 'none' : '1px solid var(--d-border)' }}>
              <span className="presence-avatar" style={{ background: m.color, flexShrink: 0 }}>{m.initials}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{m.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{m.email}</div>
              </div>
              <span className="chip" style={{ minWidth: 60, justifyContent: 'center' }}>{m.role}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', width: 100, textAlign: 'right' }}>{m.lastActive}</span>
              <button style={{ background: 'transparent', border: 'none', padding: '0.25rem', cursor: 'pointer', color: 'var(--d-text-muted)', borderRadius: 'var(--d-radius-sm)' }}>
                <MoreHorizontal size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </SettingsLayout>
  );
}
