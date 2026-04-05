import { ShieldCheck, Smartphone, Monitor } from 'lucide-react';
import { SettingsLayout, SettingsSection, FieldRow } from '@/components/SettingsLayout';

export function SecuritySettingsPage() {
  return (
    <SettingsLayout title="Security" description="Password, two-factor, and active sessions.">
      <SettingsSection title="Change password" footer={<button className="nm-button-primary">Update password</button>}>
        <FieldRow label="Current password"><input className="nm-input" type="password" /></FieldRow>
        <FieldRow label="New password"><input className="nm-input" type="password" /></FieldRow>
        <FieldRow label="Confirm new password"><input className="nm-input" type="password" /></FieldRow>
      </SettingsSection>

      <SettingsSection title="Two-factor authentication">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--d-radius)', background: 'color-mix(in srgb, var(--d-success) 12%, transparent)', color: 'var(--d-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Authenticator app</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)' }}>Enabled · Last used 2 days ago</div>
            </div>
          </div>
          <span className="nm-badge" data-tone="success">Active</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--d-border)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--d-radius)', background: 'var(--d-surface-raised)', color: 'var(--d-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>SMS backup</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)' }}>Not configured</div>
            </div>
          </div>
          <button className="d-interactive" style={{ background: 'var(--d-surface)' }}>Set up</button>
        </div>
      </SettingsSection>

      <SettingsSection title="Active sessions" description="Devices currently signed in">
        {[
          { device: 'MacBook Pro · Safari', location: 'Brooklyn, NY', last: 'Active now', current: true },
          { device: 'iPhone 15 · Nestable app', location: 'Brooklyn, NY', last: '2 hours ago' },
          { device: 'iPad · Chrome', location: 'Montauk, NY', last: '3 days ago' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingTop: i > 0 ? '0.75rem' : 0, borderTop: i > 0 ? '1px solid var(--d-border)' : 'none' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Monitor size={16} style={{ color: 'var(--d-text-muted)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {s.device} {s.current && <span className="nm-badge" style={{ marginLeft: '0.375rem' }}>This device</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{s.location} · {s.last}</div>
              </div>
            </div>
            {!s.current && <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8rem' }}>Sign out</button>}
          </div>
        ))}
      </SettingsSection>
    </SettingsLayout>
  );
}
