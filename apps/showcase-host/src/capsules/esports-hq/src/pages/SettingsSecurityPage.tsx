export function SettingsSecurityPage() {
  const sessions = [
    { id: 's1', device: 'Chrome on macOS', location: 'San Francisco, CA', lastActive: 'Current session', current: true },
    { id: 's2', device: 'Firefox on Windows', location: 'New York, NY', lastActive: '2h ago', current: false },
    { id: 's3', device: 'Safari on iPhone', location: 'San Francisco, CA', lastActive: '1d ago', current: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)', maxWidth: 600 }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Security</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Manage password, 2FA, and active sessions.</p>
      </div>

      {/* Change password */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>Change Password</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Current Password</label>
          <input className="d-control" type="password" placeholder="Enter current password" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>New Password</label>
          <input className="d-control" type="password" placeholder="Enter new password" />
        </div>
        <div>
          <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8rem' }}>Update Password</button>
        </div>
      </div>

      {/* 2FA */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>Two-Factor Authentication</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Authenticator App</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>Use an app like Google Authenticator or Authy.</div>
          </div>
          <span className="d-annotation" data-status="success" style={{ fontSize: '0.65rem' }}>Enabled</span>
        </div>
      </div>

      {/* Sessions */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>Active Sessions</div>
          <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem', color: 'var(--d-error)' }}>
            Revoke All
          </button>
        </div>
        {sessions.map(session => (
          <div key={session.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.5rem 0', borderBottom: '1px solid var(--d-border)',
          }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{session.device}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{session.location} -- {session.lastActive}</div>
            </div>
            {session.current ? (
              <span className="d-annotation" data-status="success" style={{ fontSize: '0.6rem' }}>Current</span>
            ) : (
              <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Revoke</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
