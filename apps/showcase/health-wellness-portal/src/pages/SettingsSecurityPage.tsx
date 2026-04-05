import { Shield, Smartphone, Monitor, LogOut } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SettingsNav } from '@/components/SettingsNav';
import { SectionLabel } from '@/components/SectionLabel';
import { activeSessions } from '@/data/mock';

export function SettingsSecurityPage() {
  return (
    <div style={{ maxWidth: 800 }}>
      <PageHeader title="Settings" description="Manage your profile, security, and preferences." />
      <div style={{ marginTop: '1.5rem' }}>
        <SettingsNav />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section className="hw-card" style={{ padding: '1.5rem' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Change Password</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--d-text-muted)' }}>Current password</label>
                <input type="password" className="d-control" placeholder="••••••••" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--d-text-muted)' }}>New password</label>
                <input type="password" className="d-control" placeholder="••••••••" />
              </div>
              <button className="hw-button-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', alignSelf: 'flex-start' }}>Update Password</button>
            </div>
          </section>

          <section className="hw-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <SectionLabel style={{ marginBottom: '0.375rem' }}>Two-Factor Authentication</SectionLabel>
                <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Add an extra layer of security to your account.</p>
              </div>
              <span className="d-annotation" data-status="success"><Shield size={12} /> Enabled</span>
            </div>
            <div style={{ padding: '1rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Smartphone size={20} style={{ color: 'var(--d-primary)' }} aria-hidden />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Authenticator App</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Added Oct 4, 2024</div>
              </div>
              <button className="d-interactive" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>Reconfigure</button>
            </div>
          </section>

          <section className="hw-card" style={{ padding: '1.5rem' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Active Sessions</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeSessions.map(s => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.875rem', background: 'var(--d-surface-raised)',
                  borderRadius: 'var(--d-radius)',
                }}>
                  <Monitor size={20} style={{ color: 'var(--d-text-muted)' }} aria-hidden />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.device}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                      {s.location} · {s.lastActive}
                    </div>
                  </div>
                  {s.current ? (
                    <span className="d-annotation" data-status="success">Current</span>
                  ) : (
                    <button className="d-interactive" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      <LogOut size={13} /> Sign out
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
