import { css } from '@decantr/css';
import { ShieldCheck, Monitor, Smartphone } from 'lucide-react';

export function SettingsSecurityPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Security</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Password, MFA, and active sessions.</p>
      </header>

      {/* Password */}
      <div className="bistro-feature-tile">
        <h3 className={css('_fontmedium')} style={{ marginBottom: '0.75rem' }}>Change Password</h3>
        <div className={css('_flex _col _gap3')}>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Current Password</span>
            <input className="d-control" type="password" />
          </label>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>New Password</span>
            <input className="d-control" type="password" />
          </label>
          <button className="d-interactive" data-variant="primary" style={{ alignSelf: 'flex-start' }}>Update Password</button>
        </div>
      </div>

      {/* MFA */}
      <div className="bistro-feature-tile">
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem' }}>
          <div className={css('_flex _aic _gap2')}>
            <ShieldCheck size={18} style={{ color: 'var(--d-success)' }} />
            <h3 className={css('_fontmedium')}>Two-Factor Authentication</h3>
          </div>
          <span className="d-annotation" data-status="success">Enabled</span>
        </div>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>
          Your account is protected with an authenticator app.
        </p>
        <button className="d-interactive" data-variant="ghost">Manage MFA</button>
      </div>

      {/* Sessions */}
      <div className="bistro-feature-tile">
        <h3 className={css('_fontmedium')} style={{ marginBottom: '0.75rem' }}>Active Sessions</h3>
        <div className={css('_flex _col _gap2')}>
          {[
            { device: 'MacBook Pro — Chrome', location: 'New York, NY', icon: Monitor, current: true },
            { device: 'iPhone 16 — Safari', location: 'New York, NY', icon: Smartphone, current: false },
          ].map((s, i) => (
            <div key={i} className={css('_flex _aic _jcsb')} style={{ padding: '0.5rem 0', borderBottom: i === 0 ? '1px solid var(--d-border)' : undefined }}>
              <div className={css('_flex _aic _gap2')}>
                <s.icon size={16} style={{ color: 'var(--d-text-muted)' }} />
                <div>
                  <div className={css('_textsm _fontmedium')}>{s.device}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{s.location}</div>
                </div>
              </div>
              {s.current
                ? <span className="d-annotation" data-status="success">Current</span>
                : <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Revoke</button>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
