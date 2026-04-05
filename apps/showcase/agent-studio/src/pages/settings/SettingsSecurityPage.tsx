import { PageHeader } from '@/components/PageHeader';
import { ShieldCheck, LogOut } from 'lucide-react';

export function SettingsSecurityPage() {
  const sessions = [
    { id: 's1', device: 'MacBook Pro · Chrome', location: 'San Francisco, US', current: true, lastActive: 'Active now' },
    { id: 's2', device: 'iPhone 15 · Safari', location: 'San Francisco, US', current: false, lastActive: '2 hours ago' },
    { id: 's3', device: 'Ubuntu · Firefox', location: 'Remote office', current: false, lastActive: '3 days ago' },
  ];

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader title="Security" description="Password, MFA, and active sessions" />

      <div className="carbon-panel" style={{ marginBottom: '0.75rem' }}>
        <div className="carbon-panel-header">password</div>
        <div style={{ padding: '1rem 1.125rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <PasswordField label="Current password" />
          <PasswordField label="New password" />
          <PasswordField label="Confirm new password" />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontSize: '0.8rem' }}>
              Update password
            </button>
          </div>
        </div>
      </div>

      <div className="carbon-panel" style={{ marginBottom: '0.75rem' }}>
        <div className="carbon-panel-header">multi-factor authentication</div>
        <div style={{ padding: '1rem 1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <ShieldCheck size={18} className="neon-accent" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Authenticator app enabled</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono)' }}>Added 3 months ago</div>
            </div>
          </div>
          <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem' }}>Manage</button>
        </div>
      </div>

      <div className="carbon-panel">
        <div className="carbon-panel-header">active sessions</div>
        <div>
          {sessions.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.125rem', borderBottom: '1px solid var(--d-border)' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {s.device}
                  {s.current && <span className="neon-bg mono-inline" style={{ fontSize: '0.58rem' }}>CURRENT</span>}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono)', marginTop: 2 }}>
                  {s.location} · {s.lastActive}
                </div>
              </div>
              {!s.current && (
                <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.72rem' }}>
                  <LogOut size={11} /> Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PasswordField({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label className="d-label">{label}</label>
      <input type="password" placeholder="••••••••" className="d-control" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.8rem' }} />
    </div>
  );
}
