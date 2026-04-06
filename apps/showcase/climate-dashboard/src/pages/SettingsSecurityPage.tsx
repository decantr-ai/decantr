import { css } from '@decantr/css';
import { Lock, Shield, Monitor, Smartphone, Save } from 'lucide-react';

const sessions = [
  { device: 'MacBook Pro', location: 'San Francisco, CA', lastActive: 'Now', current: true },
  { device: 'iPhone 15', location: 'San Francisco, CA', lastActive: '2 hours ago', current: false },
  { device: 'Chrome on Windows', location: 'New York, NY', lastActive: '3 days ago', current: false },
];

export function SettingsSecurityPage() {
  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Security</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Manage your password, MFA, and active sessions</p>
      </div>

      {/* Change Password */}
      <div className="d-surface earth-card">
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
          <Lock size={18} style={{ color: 'var(--d-primary)' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Change Password</h2>
        </div>
        <form className={css('_flex _col _gap4')} onSubmit={e => e.preventDefault()}>
          <div className={css('_flex _col _gap1')}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Current Password</label>
            <input className="d-control earth-input" type="password" placeholder="Enter current password" />
          </div>
          <div className={css('_grid _gc1 sm:_gc2 _gap4')}>
            <div className={css('_flex _col _gap1')}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>New Password</label>
              <input className="d-control earth-input" type="password" placeholder="Min 8 characters" />
            </div>
            <div className={css('_flex _col _gap1')}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Confirm</label>
              <input className="d-control earth-input" type="password" placeholder="Repeat password" />
            </div>
          </div>
          <div>
            <button type="submit" className="d-interactive" data-variant="primary">
              <Save size={14} /> Update Password
            </button>
          </div>
        </form>
      </div>

      {/* MFA */}
      <div className="d-surface earth-card">
        <div className={css('_flex _jcsb _aic')} style={{ marginBottom: '1rem' }}>
          <div className={css('_flex _aic _gap2')}>
            <Shield size={18} style={{ color: 'var(--d-primary)' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Two-Factor Authentication</h2>
          </div>
          <span className="d-annotation" data-status="success">Enabled</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>
          Your account is protected with authenticator-app-based 2FA.
        </p>
        <div className={css('_flex _gap3')}>
          <button className="d-interactive">Regenerate Codes</button>
          <button className="d-interactive" data-variant="danger">Disable 2FA</button>
        </div>
      </div>

      {/* Sessions */}
      <div className="d-surface earth-card">
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
          <Monitor size={18} style={{ color: 'var(--d-primary)' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Active Sessions</h2>
        </div>
        <div className={css('_flex _col _gap3')}>
          {sessions.map((s, i) => (
            <div key={i} className={css('_flex _jcsb _aic')} style={{ padding: '0.75rem', background: s.current ? 'color-mix(in srgb, var(--d-primary) 8%, transparent)' : 'var(--d-bg)', borderRadius: 'var(--d-radius-sm)' }}>
              <div className={css('_flex _aic _gap3')}>
                {s.device.includes('iPhone') ? <Smartphone size={16} style={{ color: 'var(--d-text-muted)' }} /> : <Monitor size={16} style={{ color: 'var(--d-text-muted)' }} />}
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {s.device}
                    {s.current && <span className="d-annotation" data-status="success" style={{ marginLeft: '0.5rem' }}>Current</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{s.location} &middot; {s.lastActive}</div>
                </div>
              </div>
              {!s.current && (
                <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
