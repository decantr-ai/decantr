import { Shield, Smartphone } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsNav } from '@/components/SettingsNav';
import { sessions } from '@/data/mock';

export function SettingsSecurityPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader title="Settings" description="Manage your account and preferences" />
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <SettingsNav />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Password</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: 420 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Current password</label>
                <input className="d-control" type="password" placeholder="••••••••" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>New password</label>
                <input className="d-control" type="password" placeholder="••••••••" />
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>Update password</button>
            </div>
          </div>

          <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Two-Factor Auth</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)' }}>
              <Shield size={18} style={{ color: 'var(--d-success)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Authenticator app enabled</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Last verified 2h ago</div>
              </div>
              <button className="d-interactive" style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}>Reconfigure</button>
            </div>
          </div>

          <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Active Sessions</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {sessions.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)' }}>
                  <Smartphone size={16} style={{ color: 'var(--d-text-muted)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.device} {s.current && <span className="d-annotation" data-status="success" style={{ marginLeft: '0.5rem' }}>current</span>}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{s.location} · {s.ip} · {s.lastActive}</div>
                  </div>
                  {!s.current && <button className="d-interactive" style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}>Revoke</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
