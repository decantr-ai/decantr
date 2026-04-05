import { SettingsLayout, profileNav } from '../components/SettingsLayout';
import { Shield, Monitor, Smartphone, AlertTriangle } from 'lucide-react';

export function ProfileSecurityPage() {
  return (
    <SettingsLayout title="Account" subtitle="Your personal profile and details." nav={profileNav}>
      <section className="paper-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Password</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.875rem' }}>
          <input className="paper-input" type="password" placeholder="Current password" />
          <input className="paper-input" type="password" placeholder="New password" />
          <input className="paper-input" type="password" placeholder="Confirm new password" />
        </div>
        <button className="d-interactive" style={{ padding: '0.4375rem 0.75rem', fontSize: '0.8125rem' }}>Update password</button>
      </section>

      <section className="paper-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={16} style={{ color: 'var(--d-primary)' }} /> Two-factor authentication
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '0.875rem' }}>Add an extra layer of protection to your account.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius)' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Authenticator app</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-success)' }}>Enabled</div>
          </div>
          <button className="d-interactive" style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}>Manage</button>
        </div>
      </section>

      <section className="paper-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.875rem' }}>Active sessions</h2>
        {[
          { icon: Monitor, device: 'MacBook Pro · Chrome', location: 'San Francisco, US', current: true },
          { icon: Smartphone, device: 'iPhone 15 · Lumen iOS', location: 'San Francisco, US', current: false },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderTop: i === 0 ? 'none' : '1px solid var(--d-border)' }}>
              <Icon size={18} style={{ color: 'var(--d-text-muted)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{s.device}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{s.location}</div>
              </div>
              {s.current
                ? <span className="chip chip-primary">This device</span>
                : <button style={{ fontSize: '0.75rem', color: 'var(--d-error)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem' }}>Sign out</button>
              }
            </div>
          );
        })}
      </section>

      <section className="paper-card" style={{ padding: '1.5rem', borderColor: 'color-mix(in srgb, var(--d-error) 30%, var(--d-border))' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--d-error)' }}>
          <AlertTriangle size={16} /> Danger zone
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>Permanently delete your account and all associated data. This can't be undone.</p>
        <button className="d-interactive" style={{ padding: '0.4375rem 0.75rem', fontSize: '0.8125rem', color: 'var(--d-error)', borderColor: 'color-mix(in srgb, var(--d-error) 30%, var(--d-border))' }}>Delete account</button>
      </section>
    </SettingsLayout>
  );
}
