import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsNav } from '@/components/SettingsNav';
import { StatusBadge } from '@/components/StatusBadge';
import { sessions } from '@/data/mock';

export function SettingsSecurityPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader title="Settings" description="Password, MFA, and active sessions." />
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 'var(--d-content-gap)' }}>
        <SettingsNav />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
          {/* Password */}
          <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Password</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Current password</label>
                <input className="d-control" type="password" placeholder="••••••••" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>New password</label>
                <input className="d-control" type="password" placeholder="••••••••" />
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="d-interactive" data-variant="primary" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Update password</button>
            </div>
          </div>

          {/* MFA */}
          <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <SectionLabel>Two-Factor Authentication</SectionLabel>
              <StatusBadge status="active">enabled</StatusBadge>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>
              Authenticator app · Added Feb 4, 2026
            </div>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Reconfigure</button>
          </div>

          {/* Sessions */}
          <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
              <SectionLabel>Active Sessions</SectionLabel>
            </div>
            <table className="d-data">
              <thead>
                <tr>
                  <th className="d-data-header">Device</th>
                  <th className="d-data-header">Location</th>
                  <th className="d-data-header">Last Active</th>
                  <th className="d-data-header" style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} className="d-data-row">
                    <td className="d-data-cell" style={{ fontWeight: 500 }}>
                      {s.device} {s.current && <span className="d-annotation" data-status="success" style={{ marginLeft: '0.5rem' }}>current</span>}
                    </td>
                    <td className="d-data-cell" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{s.location} · <span style={{ fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>{s.ip}</span></td>
                    <td className="d-data-cell" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{s.lastActive}</td>
                    <td className="d-data-cell" style={{ textAlign: 'right' }}>
                      {!s.current && (
                        <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--d-error)' }}>Revoke</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
