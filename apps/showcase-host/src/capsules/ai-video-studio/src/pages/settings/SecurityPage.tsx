import { Shield, Smartphone, Monitor } from 'lucide-react';
import { sessions } from '@/data/mock';
import { SettingsLayout } from '@/components/SettingsLayout';

export function SecurityPage() {
  return (
    <SettingsLayout>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--d-content-gap)' }}>Security</h2>

      <div className="d-surface" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)', marginBottom: 'var(--d-content-gap)' }}>
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>PASSWORD</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Current password</label>
          <input className="d-control" type="password" placeholder="Enter current password" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>New password</label>
          <input className="d-control" type="password" placeholder="Enter new password" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="d-interactive" data-variant="primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Update Password</button>
        </div>
      </div>

      <div className="d-surface" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)', marginBottom: 'var(--d-content-gap)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.25rem' }}>TWO-FACTOR AUTHENTICATION</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>Add an extra layer of security to your account</p>
          </div>
          <Shield size={20} style={{ color: 'var(--d-success)' }} />
        </div>
        <div className="d-annotation" data-status="success" style={{ alignSelf: 'flex-start' }}>Enabled</div>
        <button className="d-interactive" data-variant="ghost" style={{ padding: '6px 16px', fontSize: '0.8rem', alignSelf: 'flex-start' }}>Manage MFA</button>
      </div>

      <div className="d-surface" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>ACTIVE SESSIONS</div>
        {sessions.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--d-border)' }}>
            {s.device.includes('MacBook') ? <Monitor size={16} style={{ color: 'var(--d-text-muted)' }} /> : <Smartphone size={16} style={{ color: 'var(--d-text-muted)' }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.device}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{s.location} &middot; {s.lastActive}</div>
            </div>
            {s.current ? (
              <span className="d-annotation" data-status="success">Current</span>
            ) : (
              <button className="d-interactive" data-variant="ghost" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>Revoke</button>
            )}
          </div>
        ))}
      </div>
    </SettingsLayout>
  );
}
