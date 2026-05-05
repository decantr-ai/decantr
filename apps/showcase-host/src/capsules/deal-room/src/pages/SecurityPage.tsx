import { Shield, Smartphone, Monitor, Globe } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

const sessions = [
  { id: 's-1', device: 'MacBook Pro 16"', browser: 'Chrome 128', location: 'New York, NY', ip: '203.0.113.42', lastActive: 'now', current: true },
  { id: 's-2', device: 'iPhone 15 Pro', browser: 'Safari 18', location: 'New York, NY', ip: '198.51.100.88', lastActive: '1h ago', current: false },
  { id: 's-3', device: 'Windows Desktop', browser: 'Edge 128', location: 'London, UK', ip: '203.0.113.18', lastActive: '3d ago', current: false },
];

const deviceIcons: Record<string, typeof Monitor> = {
  'MacBook': Monitor,
  'iPhone': Smartphone,
  'Windows': Monitor,
};

export function SecurityPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Security" description="Manage authentication, sessions, and two-factor settings." />

      <div className="dr-card" style={{ padding: '1.5rem' }}>
        <h2 className="serif-display" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Two-Factor Authentication</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--d-radius)', background: 'color-mix(in srgb, var(--d-success) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} style={{ color: 'var(--d-success)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>2FA is enabled</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Authenticator app configured on March 15, 2026</div>
          </div>
          <button className="d-interactive" style={{ fontSize: '0.8rem' }}>Reconfigure</button>
        </div>
      </div>

      <div className="dr-card" style={{ padding: '1.5rem' }}>
        <h2 className="serif-display" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Change Password</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
          <div>
            <label className="d-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Current Password</label>
            <input className="d-control" type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="d-label" style={{ display: 'block', marginBottom: '0.35rem' }}>New Password</label>
            <input className="d-control" type="password" placeholder="••••••••" />
          </div>
          <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8rem', alignSelf: 'flex-start' }}>Update Password</button>
        </div>
      </div>

      <div className="dr-card" style={{ padding: '1.5rem' }}>
        <h2 className="serif-display" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Active Sessions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sessions.map(s => {
            const deviceKey = Object.keys(deviceIcons).find(k => s.device.includes(k)) || 'Windows';
            const Icon = deviceIcons[deviceKey] || Globe;
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--d-border)' }}>
                <Icon size={18} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                    {s.device} · {s.browser}
                    {s.current && <span className="d-annotation" data-status="success" style={{ marginLeft: '0.5rem' }}>Current</span>}
                  </div>
                  <div className="mono-data" style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
                    {s.location} · {s.ip} · {s.lastActive}
                  </div>
                </div>
                {!s.current && (
                  <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.72rem', color: 'var(--d-error)' }}>
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
