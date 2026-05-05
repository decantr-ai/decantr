import { css } from '@decantr/css';
import { Shield, Smartphone, Monitor } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';

export function SettingsSecurityPage() {
  return (
    <div>
      <PageHeader title="Security" subtitle="Password, 2FA, and active sessions." />

      <div className={css('_flex _col _gap3')} style={{ maxWidth: 640 }}>
        <div className="studio-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.875rem', fontFamily: 'system-ui, sans-serif' }}>Change password</h3>
          <div className={css('_flex _col _gap3')}>
            <input className="studio-input" type="password" placeholder="Current password" />
            <input className="studio-input" type="password" placeholder="New password" />
            <input className="studio-input" type="password" placeholder="Confirm new password" />
          </div>
          <button className="d-interactive" data-variant="primary" style={{ marginTop: '1rem', fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>Update password</button>
        </div>

        <div className="studio-card" style={{ padding: '1.5rem' }}>
          <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.625rem' }}>
            <div className={css('_flex _aic _gap2')}>
              <Shield size={16} style={{ color: 'var(--d-primary)' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>Two-factor auth</h3>
            </div>
            <span className="d-annotation" data-status="success">Enabled</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>Using authenticator app · added March 14, 2026</p>
        </div>

        <div className="studio-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.875rem', fontFamily: 'system-ui, sans-serif' }}>Active sessions</h3>
          <div className={css('_flex _col _gap2')}>
            {[
              { device: 'MacBook Pro · Safari', where: 'Brooklyn, NY', current: true, icon: Monitor },
              { device: 'iPhone 15 · iOS', where: 'Brooklyn, NY', current: false, icon: Smartphone },
            ].map((s) => (
              <div key={s.device} className={css('_flex _aic _jcsb _gap3')} style={{ padding: '0.75rem', border: '1px solid var(--d-border)', borderRadius: 8, fontFamily: 'system-ui, sans-serif' }}>
                <div className={css('_flex _aic _gap3')}>
                  <s.icon size={16} style={{ color: 'var(--d-text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{s.device}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{s.where}</div>
                  </div>
                </div>
                {s.current ? <span className="d-annotation" data-status="success">This device</span>
                  : <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem' }}>Revoke</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
