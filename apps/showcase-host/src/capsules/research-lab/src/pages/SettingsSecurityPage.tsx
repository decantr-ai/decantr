import { css } from '@decantr/css';
import { ShieldCheck, Smartphone, Monitor } from 'lucide-react';
import { SettingsLayout } from '../components/SettingsLayout';

export function SettingsSecurityPage() {
  const sessions = [
    { device: 'MacBook Pro — Chrome', location: 'Cambridge, MA', lastActive: 'Now', current: true },
    { device: 'iPhone 15 — Safari', location: 'Cambridge, MA', lastActive: '2 hours ago', current: false },
    { device: 'Lab Workstation — Firefox', location: 'Room 204', lastActive: '1 day ago', current: false },
  ];

  return (
    <SettingsLayout>
      <h1 style={{ fontWeight: 500, fontSize: '1.25rem', marginBottom: '1.25rem' }}>Security</h1>

      {/* Password */}
      <div className="lab-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <h2 style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Password</h2>
        <div className={css('_flex _col _gap4')}>
          <div className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium')} htmlFor="cur-pw">Current Password</label>
            <input id="cur-pw" type="password" className="d-control" placeholder="Current password" style={{ borderRadius: 2 }} />
          </div>
          <div className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium')} htmlFor="new-pw">New Password</label>
            <input id="new-pw" type="password" className="d-control" placeholder="New password" style={{ borderRadius: 2 }} />
          </div>
          <div>
            <button className="d-interactive" data-variant="primary" style={{ borderRadius: 2 }}>Update Password</button>
          </div>
        </div>
      </div>

      {/* MFA */}
      <div className="lab-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem' }}>
          <h2 style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Two-Factor Authentication</h2>
          <span className="d-annotation" data-status="success"><ShieldCheck size={12} /> Enabled</span>
        </div>
        <div className={css('_flex _col _gap3')}>
          <div className={css('_flex _aic _jcsb')}>
            <div className={css('_flex _aic _gap2')}>
              <Smartphone size={16} style={{ color: 'var(--d-text-muted)' }} />
              <span style={{ fontSize: '0.8125rem' }}>Authenticator App</span>
            </div>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: 2 }}>
              Reconfigure
            </button>
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div className="lab-panel" style={{ padding: '1.25rem' }}>
        <h2 style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Active Sessions</h2>
        <div className={css('_flex _col _gap3')}>
          {sessions.map((s, i) => (
            <div key={i} className={css('_flex _aic _jcsb')} style={{ padding: '0.5rem 0', borderBottom: i < sessions.length - 1 ? '1px solid var(--d-border)' : undefined }}>
              <div className={css('_flex _aic _gap3')}>
                <Monitor size={16} style={{ color: 'var(--d-text-muted)' }} />
                <div>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                    {s.device}
                    {s.current && <span className="d-annotation" data-status="success" style={{ marginLeft: '0.5rem' }}>Current</span>}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{s.location} — {s.lastActive}</p>
                </div>
              </div>
              {!s.current && (
                <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: 2, color: 'var(--d-error)' }}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </SettingsLayout>
  );
}
