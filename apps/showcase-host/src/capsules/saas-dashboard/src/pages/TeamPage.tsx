import { useState } from 'react';
import { Search, UserPlus, MoreHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { teamMembers } from '@/data/mock';

export function TeamPage() {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filtered = teamMembers.filter(m => {
    const matchesQuery = !query || m.name.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Team"
        description={`${teamMembers.length} members · 9 active, 1 invited, 1 suspended`}
        actions={
          <button className="sd-button-accent" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
            <UserPlus size={14} /> Invite member
          </button>
        }
      />

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input
            className="d-control"
            placeholder="Search members..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 32, fontSize: '0.875rem' }}
          />
        </div>
        <select
          className="d-control"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{ width: 'auto', fontSize: '0.875rem' }}
        >
          <option value="all">All roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      {/* Team table */}
      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="d-data" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th className="d-data-header">Member</th>
                <th className="d-data-header">Role</th>
                <th className="d-data-header">Status</th>
                <th className="d-data-header">Last active</th>
                <th className="d-data-header">Joined</th>
                <th className="d-data-header" style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="d-data-row">
                  <td className="d-data-cell">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div className="sd-avatar" style={{ width: 30, height: 30, fontSize: '0.65rem' }}>
                        {m.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="d-data-cell">
                    <span className="d-annotation sd-role-badge" data-role={m.role}>
                      {m.role}
                    </span>
                  </td>
                  <td className="d-data-cell">
                    <span
                      className="d-annotation"
                      data-status={m.status === 'active' ? 'success' : m.status === 'invited' ? 'info' : 'warning'}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="d-data-cell" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{m.lastActive}</td>
                  <td className="d-data-cell" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>{m.joined}</td>
                  <td className="d-data-cell">
                    <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem', border: 'none' }} aria-label="Actions">
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
              No members match your filters.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
