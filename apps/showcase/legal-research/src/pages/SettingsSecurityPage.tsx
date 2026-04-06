import { css } from '@decantr/css';
import { Monitor, Smartphone, Globe, ShieldCheck } from 'lucide-react';
import { securityFields, sessions } from '../data/mock';
import { AccountSettings } from '../components/AccountSettings';

const DEVICE_ICONS: Record<string, React.ElementType> = {
  Chrome: Monitor,
  Safari: Smartphone,
  Firefox: Globe,
};

export function SettingsSecurityPage() {
  return (
    <div className={css('_flex _col _gap6')}>
      <AccountSettings title="Change Password" description="Update your account password." fields={securityFields} />

      {/* MFA */}
      <div className="d-surface" style={{ maxWidth: 600 }}>
        <div className={css('_flex _aic _gap3')} style={{ marginBottom: '1rem' }}>
          <ShieldCheck size={20} style={{ color: 'var(--d-primary)' }} />
          <div>
            <h2 className="counsel-header" style={{ fontSize: '1.125rem' }}>Two-Factor Authentication</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'Georgia, serif' }}>Add an extra layer of security to your account.</p>
          </div>
        </div>
        <div className={css('_flex _aic _jcsb')}>
          <span className="d-annotation" data-status="success">Enabled</span>
          <button className="d-interactive" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>Manage</button>
        </div>
      </div>

      {/* Sessions */}
      <div className="d-surface" style={{ maxWidth: 600 }}>
        <h2 className="counsel-header" style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Active Sessions</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>
          Manage your active sessions across devices.
        </p>
        <div className={css('_flex _col')}>
          {sessions.map((session) => {
            const deviceKey = Object.keys(DEVICE_ICONS).find((k) => session.device.includes(k)) || 'Chrome';
            const Icon = DEVICE_ICONS[deviceKey];
            return (
              <div key={session.id} className={css('_flex _aic _jcsb')} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--d-border)' }}>
                <div className={css('_flex _aic _gap3')}>
                  <Icon size={16} style={{ color: 'var(--d-text-muted)' }} />
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      {session.device}
                      {session.current && <span className="d-annotation" data-status="success" style={{ marginLeft: '0.5rem' }}>Current</span>}
                    </p>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{session.location} &middot; {session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--d-error)' }}>
                    Revoke
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
