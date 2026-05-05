import { SettingsSection, FieldRow } from '@/components/SettingsSection';
import { sessions, defaultSettings } from '@/data/mock';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

export function SecurityPage() {
  const s = defaultSettings;
  return (
    <>
      <SettingsSection title="Password" description="Change your account password.">
        <FieldRow label="Current password">
          <input className="carbon-input" type="password" placeholder="••••••••" style={{ fontSize: '0.875rem' }} />
        </FieldRow>
        <FieldRow label="New password">
          <input className="carbon-input" type="password" placeholder="At least 12 characters" style={{ fontSize: '0.875rem' }} />
        </FieldRow>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem' }}>
          <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.875rem' }}>Update password</button>
        </div>
      </SettingsSection>

      <SettingsSection title="Two-factor authentication" description="Add an extra layer of security to your account.">
        <FieldRow
          label="Authenticator app"
          description={s.mfa.enabled ? 'Active — configured with TOTP' : 'Not configured'}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            {s.mfa.enabled ? (
              <>
                <span className="d-annotation" data-status="success">Enabled</span>
                <button className="d-interactive" style={{ fontSize: '0.8125rem' }}>Reconfigure</button>
              </>
            ) : (
              <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8125rem' }}>Enable</button>
            )}
          </div>
        </FieldRow>
        <FieldRow label="Recovery codes" description="Use these if you lose access to your device.">
          <button className="d-interactive" style={{ fontSize: '0.8125rem' }}>View codes</button>
        </FieldRow>
      </SettingsSection>

      <SettingsSection title="Active sessions" description="Devices currently signed in to your account.">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sessions.map((session) => {
            const Icon = session.device.includes('iPhone')
              ? Smartphone
              : session.device.includes('iPad')
                ? Tablet
                : Monitor;
            return (
              <div
                key={session.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.75rem 0',
                  borderTop: '1px solid var(--d-border)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--d-radius-sm)',
                    background: 'var(--d-surface-raised)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} style={{ color: 'var(--d-text-muted)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {session.device}
                    {session.current && <span className="d-annotation" data-status="success">This device</span>}
                  </div>
                  <div className="mono-data" style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>
                    {session.location} · {session.lastActive}
                  </div>
                </div>
                {!session.current && (
                  <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}>
                    Revoke
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </SettingsSection>
    </>
  );
}
