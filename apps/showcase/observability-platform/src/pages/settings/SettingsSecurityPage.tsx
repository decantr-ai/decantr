import { SettingsNav } from '@/components/SettingsNav';

const sessions = [
  { id: 's-1', device: 'MacBook Pro · Chrome', location: 'San Francisco, CA', ip: '192.168.4.102', lastActive: 'Now · this session', current: true },
  { id: 's-2', device: 'iPhone 15 · Safari', location: 'San Francisco, CA', ip: '172.19.8.44', lastActive: '2h ago', current: false },
  { id: 's-3', device: 'ThinkPad · Firefox', location: 'Austin, TX', ip: '10.0.12.8', lastActive: '2d ago', current: false },
];

export function SettingsSecurityPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>Settings</h1>
      <SettingsNav />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="fin-card">
          <div className="fin-label" style={{ marginBottom: 10 }}>Change Password</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <label><div className="fin-label" style={{ marginBottom: 4 }}>Current password</div><input className="fin-input" type="password" /></label>
            <div />
            <label><div className="fin-label" style={{ marginBottom: 4 }}>New password</div><input className="fin-input" type="password" /></label>
            <label><div className="fin-label" style={{ marginBottom: 4 }}>Confirm</div><input className="fin-input" type="password" /></label>
          </div>
          <button className="d-interactive" data-variant="primary" style={{ padding: '6px 12px', fontSize: '0.75rem', marginTop: 12 }}>Update password</button>
        </div>

        <div className="fin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="fin-label">Multi-Factor Authentication</div>
            <span className="fin-badge" data-severity="info" style={{ color: 'var(--d-success)', borderColor: 'var(--d-success)' }}>Enabled</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--d-surface-raised)', border: '1px solid var(--d-border)', borderRadius: 2 }}>
              <span>Authenticator app (TOTP)</span>
              <button className="d-interactive" data-variant="ghost" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Reconfigure</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--d-surface-raised)', border: '1px solid var(--d-border)', borderRadius: 2 }}>
              <span>SMS · +1 ••• ••• 4402</span>
              <button className="d-interactive" data-variant="ghost" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Remove</button>
            </div>
          </div>
        </div>

        <div className="fin-card">
          <div className="fin-label" style={{ marginBottom: 10 }}>Active Sessions</div>
          <table className="fin-table">
            <thead><tr><th>Device</th><th>Location</th><th>IP</th><th>Last active</th><th></th></tr></thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>
                    {s.device}
                    {s.current && <span className="fin-badge" data-severity="info" style={{ marginLeft: 8 }}>Current</span>}
                  </td>
                  <td style={{ color: 'var(--d-text-muted)' }}>{s.location}</td>
                  <td style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--d-text-muted)' }}>{s.ip}</td>
                  <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem' }}>{s.lastActive}</td>
                  <td>{!s.current && <button className="d-interactive" data-variant="ghost" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Revoke</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
