import { Shield, Smartphone, Monitor, X } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SettingsNav } from '@/components/SettingsNav';
import { sessions } from '@/data/mock';

export function SettingsSecurityPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '42rem' }}>
      <PageHeader title="Settings" description="Manage your profile, security, and workspace." />
      <SettingsNav />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Password */}
        <form onSubmit={e => e.preventDefault()} className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Password</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>Use at least 12 characters with a mix of cases, numbers, and symbols.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Current password</label>
              <input className="d-control" type="password" placeholder="••••••••" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>New password</label>
              <input className="d-control" type="password" placeholder="••••••••" />
            </div>
          </div>
          <button className="sd-button-accent" type="submit" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Update password</button>
        </form>

        {/* MFA */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Two-factor authentication</h2>
                <span className="d-annotation" data-status="success">Enabled</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
                <Shield size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Using authenticator app · 8 backup codes remaining
              </p>
            </div>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              Regenerate codes
            </button>
          </div>
        </div>

        {/* Sessions */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Active sessions</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>Devices signed in to your account.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sessions.map(s => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: 'var(--d-surface-raised)',
                  borderRadius: 'var(--d-radius-sm)',
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--d-radius-sm)',
                  background: 'color-mix(in srgb, var(--d-accent) 12%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--d-accent)',
                  flexShrink: 0,
                }}>
                  {s.device.includes('iPhone') || s.device.includes('iPad') ? <Smartphone size={15} /> : <Monitor size={15} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {s.device}
                    {s.current && <span className="d-annotation" data-status="success">Current</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                    {s.location} · {s.ip} · {s.lastActive}
                  </div>
                </div>
                {!s.current && (
                  <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem', border: 'none' }} aria-label="Revoke session">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="d-interactive" data-variant="ghost" style={{ marginTop: '0.75rem', padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
            Sign out all other sessions
          </button>
        </div>
      </div>
    </div>
  );
}
