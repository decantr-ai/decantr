import { PageHeader } from '@/components/PageHeader';
import { SettingsNav } from '@/components/SettingsNav';
import { SectionLabel } from '@/components/SectionLabel';
import { sessions } from '@/data/mock';

export function SettingsSecurityPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '42rem' }}>
      <PageHeader title="Settings" description="Manage your profile, security, and investment preferences." />
      <SettingsNav />

      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Password</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>Change your password or enable two-factor authentication.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Current password</label>
            <input className="d-control" type="password" placeholder="••••••••" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>New password</label>
            <input className="d-control" type="password" placeholder="••••••••" />
          </div>
          <button className="fo-button-primary" style={{ alignSelf: 'flex-start', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Update password</button>
        </div>
      </div>

      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Two-Factor Authentication</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>Required for all trading and governance actions.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="fo-pill" data-status="active">Enabled</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>Authenticator app configured</span>
        </div>
      </div>

      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '1rem' }}>Active Sessions</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sessions.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 0',
              borderBottom: i < sessions.length - 1 ? '1px solid var(--d-border)' : 'none',
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{s.device}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{s.location} - {s.ip}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="fo-mono" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{s.lastActive}</span>
                {s.current ? (
                  <span className="fo-pill" data-status="active">Current</span>
                ) : (
                  <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Revoke</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
