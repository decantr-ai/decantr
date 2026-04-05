import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsNav } from '@/components/SettingsNav';
import { Shield, Monitor } from 'lucide-react';

export function SettingsSecurityPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Settings" description="Manage your account and workspace" />
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem' }}>
        <SettingsNav />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Password</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 400 }}>
              <input className="glass-control" type="password" placeholder="Current password" />
              <input className="glass-control" type="password" placeholder="New password" />
              <input className="glass-control" type="password" placeholder="Confirm new password" />
              <button className="crm-button-accent" style={{ fontSize: '0.8rem', alignSelf: 'flex-start' }}>Update password</button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <Shield size={14} style={{ color: 'var(--d-accent)' }} />
              <SectionLabel>Two-Factor Authentication</SectionLabel>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Authenticator app</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>Enabled · using Authy</div>
              </div>
              <button className="d-interactive" style={{ fontSize: '0.78rem' }}>Reconfigure</button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <SectionLabel style={{ marginBottom: '0.875rem' }}>Active Sessions</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { device: 'MacBook Pro · Chrome', location: 'San Francisco, CA', current: true },
                { device: 'iPhone 15 · Safari', location: 'San Francisco, CA', current: false },
                { device: 'Windows · Firefox', location: 'Austin, TX', current: false },
              ].map((s, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem', background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--d-radius-sm)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Monitor size={14} style={{ color: 'var(--d-text-muted)' }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{s.device} {s.current && <span className="crm-ai-badge" style={{ marginLeft: '0.5rem' }}>This device</span>}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{s.location}</div>
                    </div>
                  </div>
                  {!s.current && <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.72rem', padding: '0.25rem 0.625rem' }}>Revoke</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
