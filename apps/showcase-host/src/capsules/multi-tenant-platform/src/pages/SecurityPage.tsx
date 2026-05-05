import { ShieldCheck, Monitor } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SettingsTabs } from './ProfilePage';
import { sessions } from '@/data/mock';

export function SecurityPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader title="Settings" description="Manage your account" />
      <SettingsTabs active="/settings/security" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Password */}
        <div className="d-surface" style={{ padding: '1.5rem' }}>
          <h3 className="d-label" style={{ marginBottom: '1rem' }}>Password</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Current password</span>
              <input className="d-control" type="password" placeholder="••••••••" />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>New password</span>
              <input className="d-control" type="password" placeholder="At least 12 characters" />
            </label>
            <div>
              <button className="lp-button-primary" style={{ fontSize: '0.8rem' }}>Change password</button>
            </div>
          </div>
        </div>

        {/* MFA */}
        <div className="d-surface" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 className="d-label">Multi-Factor Authentication</h3>
            <span className="d-annotation" data-status="success" style={{ fontSize: '0.65rem' }}>
              <ShieldCheck size={11} /> Enabled
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>
            Authenticator app (TOTP) — backup codes generated Oct 15, 2025.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="d-interactive" style={{ fontSize: '0.75rem' }}>Reconfigure</button>
            <button className="d-interactive" style={{ fontSize: '0.75rem' }}>Regenerate backup codes</button>
          </div>
        </div>

        {/* Sessions */}
        <div className="d-surface" style={{ padding: '1.5rem' }}>
          <h3 className="d-label" style={{ marginBottom: '1rem' }}>Active Sessions</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sessions.map((s, i) => (
              <div
                key={s.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 0', borderBottom: i < sessions.length - 1 ? '1px solid var(--d-border)' : undefined,
                }}
              >
                <Monitor size={18} style={{ color: 'var(--d-text-muted)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 500 }}>
                    {s.device} · {s.browser}
                    {s.current && (
                      <span className="d-annotation" data-status="success" style={{ marginLeft: '0.5rem', fontSize: '0.6rem' }}>
                        Current
                      </span>
                    )}
                  </div>
                  <div className="mono-data" style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
                    {s.location} · {s.ip} · {s.lastActive}
                  </div>
                </div>
                {!s.current && (
                  <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}>
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="d-interactive" style={{ fontSize: '0.75rem', marginTop: '1rem' }}>
            Sign out all other sessions
          </button>
        </div>
      </div>
    </div>
  );
}
