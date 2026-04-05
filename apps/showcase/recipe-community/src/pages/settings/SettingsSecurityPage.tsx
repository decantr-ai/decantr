import { css } from '@decantr/css';
import { Shield, Smartphone, Monitor, LogOut } from 'lucide-react';

const sessions = [
  { id: 's1', device: 'MacBook Pro · Safari', location: 'San Francisco, CA', current: true, icon: Monitor },
  { id: 's2', device: 'iPhone 15 · Gather app', location: 'San Francisco, CA', current: false, icon: Smartphone },
  { id: 's3', device: 'Chrome · Windows', location: 'Brooklyn, NY', current: false, icon: Monitor },
];

export function SettingsSecurityPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1 className="serif-display" style={{ fontSize: '1.5rem' }}>Security</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Password, 2-factor, and active sessions.</p>
      </header>

      <div className="feature-tile">
        <h2 className="serif-display" style={{ fontSize: '1.0625rem', marginBottom: '0.875rem' }}>Change password</h2>
        <div className={css('_flex _col _gap3')}>
          <Field label="Current password" type="password" />
          <Field label="New password" type="password" />
          <Field label="Confirm new password" type="password" />
          <button className="d-interactive" data-variant="primary" style={{ alignSelf: 'flex-start' }}>Update password</button>
        </div>
      </div>

      <div className="feature-tile">
        <div className={css('_flex _aic _jcsb')}>
          <div className={css('_flex _aic _gap2')}>
            <Shield size={16} style={{ color: 'var(--d-primary)' }} />
            <div>
              <h2 className="serif-display" style={{ fontSize: '1.0625rem' }}>Two-factor authentication</h2>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Extra layer of security on sign-in.</p>
            </div>
          </div>
          <span className="d-annotation" data-status="success">Enabled</span>
        </div>
      </div>

      <div className="feature-tile">
        <h2 className="serif-display" style={{ fontSize: '1.0625rem', marginBottom: '0.875rem' }}>Active sessions</h2>
        <ul className={css('_flex _col _gap2')} style={{ listStyle: 'none' }}>
          {sessions.map((s) => (
            <li key={s.id} className={css('_flex _aic _jcsb')}
              style={{ padding: '0.625rem 0', borderBottom: '1px solid var(--d-border)' }}>
              <div className={css('_flex _aic _gap2')}>
                <s.icon size={18} style={{ color: 'var(--d-text-muted)' }} />
                <div>
                  <div className={css('_textsm _fontmedium')}>{s.device}{s.current && ' · Current'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{s.location}</div>
                </div>
              </div>
              {!s.current && (
                <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
                  <LogOut size={12} /> Sign out
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Field({ label, type = 'text' }: { label: string; type?: string }) {
  return (
    <label className={css('_flex _col _gap1')}>
      <span className={css('_textsm _fontmedium')}>{label}</span>
      <input className="d-control" type={type} />
    </label>
  );
}
