import { css } from '@decantr/css';
import { Monitor, Smartphone, ShieldCheck } from 'lucide-react';

const sessions = [
  { device: 'MacBook Pro', location: 'Brooklyn, NY', current: true, icon: Monitor, lastActive: 'Active now' },
  { device: 'iPhone 15', location: 'Brooklyn, NY', current: false, icon: Smartphone, lastActive: '2 hours ago' },
  { device: 'Chrome on Windows', location: 'Austin, TX', current: false, icon: Monitor, lastActive: '3 days ago' },
];

export function SettingsSecurityPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1 className="display-heading" style={{ fontSize: '1.5rem' }}>Security</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Keep your account locked down.</p>
      </header>

      <div className="feature-tile">
        <h2 className="display-heading" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Change password</h2>
        <div className={css('_flex _col _gap3')}>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Current password</span>
            <input className="d-control" type="password" />
          </label>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>New password</span>
            <input className="d-control" type="password" />
          </label>
          <button className="d-interactive cta-glossy" style={{ alignSelf: 'flex-start' }}>Update Password</button>
        </div>
      </div>

      <div className="feature-tile">
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
          <div className={css('_flex _aic _gap2')}>
            <ShieldCheck size={18} style={{ color: 'var(--d-secondary)' }} />
            <h2 className="display-heading" style={{ fontSize: '1rem' }}>Two-factor authentication</h2>
          </div>
          <span className="d-annotation" data-status="success">Enabled</span>
        </div>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '0.875rem' }}>Authenticator app active.</p>
        <button className="d-interactive" data-variant="ghost">Manage MFA</button>
      </div>

      <div className="feature-tile">
        <h2 className="display-heading" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Active sessions</h2>
        <div className={css('_flex _col _gap2')}>
          {sessions.map((s, i) => (
            <div key={i} className={css('_flex _aic _jcsb')} style={{ padding: '0.75rem', background: 'var(--d-bg)', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)' }}>
              <div className={css('_flex _aic _gap3')}>
                <s.icon size={18} style={{ color: 'var(--d-text-muted)' }} />
                <div>
                  <div className={css('_textsm _fontmedium')}>
                    {s.device} {s.current && <span className="cat-chip" data-tone="green" style={{ marginLeft: '0.5rem' }}>This device</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{s.location} · {s.lastActive}</div>
                </div>
              </div>
              {!s.current && <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}>Revoke</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
