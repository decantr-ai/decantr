import { css } from '@decantr/css';
import { SettingsNav } from './SettingsProfilePage';
import { Shield, Smartphone, Monitor, Globe } from 'lucide-react';

const sessions = [
  { id: 's1', device: 'Chrome on macOS', location: 'Oakville, CA', lastActive: '2 minutes ago', current: true, icon: Monitor },
  { id: 's2', device: 'Safari on iPhone', location: 'Oakville, CA', lastActive: '1 hour ago', current: false, icon: Smartphone },
  { id: 's3', device: 'Firefox on Windows', location: 'Portland, OR', lastActive: '3 days ago', current: false, icon: Globe },
];

export function SettingsSecurityPage() {
  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Settings</h1>

      <div className={css('_flex _gap6')}>
        <SettingsNav />

        <div style={{ flex: 1 }} className={css('_flex _col _gap5')}>
          {/* Password */}
          <div className="d-surface gov-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>Change Password</h2>
            <div className={css('_flex _col _gap4')}>
              <div className={css('_flex _col _gap1')}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Current Password</label>
                <input type="password" className="d-control gov-input" placeholder="Enter current password" />
              </div>
              <div className={css('_grid')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className={css('_flex _col _gap1')}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>New Password</label>
                  <input type="password" className="d-control gov-input" placeholder="New password" />
                </div>
                <div className={css('_flex _col _gap1')}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Confirm New Password</label>
                  <input type="password" className="d-control gov-input" placeholder="Confirm password" />
                </div>
              </div>
            </div>
            <div className={css('_flex _jcfe')} style={{ marginTop: '1.25rem' }}>
              <button className="d-interactive" data-variant="primary">Update Password</button>
            </div>
          </div>

          {/* MFA */}
          <div className="d-surface gov-card" style={{ padding: '1.5rem' }}>
            <div className={css('_flex _jcsb _aic _mb4')}>
              <div className={css('_flex _aic _gap3')}>
                <Shield size={20} style={{ color: 'var(--d-primary)' }} />
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Two-Factor Authentication</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>Add an extra layer of security to your account</p>
                </div>
              </div>
              <span className="d-annotation" data-status="warning">Not Enabled</span>
            </div>
            <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.875rem' }}>Enable 2FA</button>
          </div>

          {/* Sessions */}
          <div className="d-surface gov-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>Active Sessions</h2>
            <div className={css('_flex _col _gap3')}>
              {sessions.map(s => (
                <div key={s.id} className={css('_flex _aic _jcsb')} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--d-border)' }}>
                  <div className={css('_flex _aic _gap3')}>
                    <s.icon size={18} style={{ color: 'var(--d-text-muted)' }} />
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                        {s.device}
                        {s.current && <span className="d-annotation" data-status="success" style={{ marginLeft: '0.5rem' }}>Current</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                        {s.location} &middot; {s.lastActive}
                      </div>
                    </div>
                  </div>
                  {!s.current && (
                    <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8125rem', color: 'var(--d-error)' }}>
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
