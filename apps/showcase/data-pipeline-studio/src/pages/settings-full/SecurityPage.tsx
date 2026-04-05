import { TerminalSplitShell } from '@/components/TerminalSplitShell';
import { SettingsNav } from './ProfilePage';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.4rem 0.625rem',
  background: 'var(--d-bg)',
  border: '1px solid var(--d-border)',
  color: 'var(--d-text)',
  fontFamily: 'inherit',
  fontSize: '0.8125rem',
  outline: 'none',
  borderRadius: 0,
};

const SESSIONS = [
  { device: 'MacBook Pro · Chrome 132', ip: '10.0.4.28', loc: 'San Francisco, US', last: '2026-04-05 14:22', current: true },
  { device: 'iPhone · Safari iOS 18', ip: '172.56.8.14', loc: 'San Francisco, US', last: '2026-04-05 08:15', current: false },
  { device: 'Linux · Firefox 134', ip: '203.0.113.42', loc: 'Austin, US', last: '2026-04-03 23:40', current: false },
];

export function SecurityPage() {
  return (
    <TerminalSplitShell title="SETTINGS // security">
      <div style={{ flex: 1, display: 'flex', gap: '0.5rem', overflow: 'auto' }}>
        <SettingsNav />
        <div style={{ flex: 1, maxWidth: 720 }}>
          <h1 className="term-glow" style={{ fontSize: '1rem', color: 'var(--d-primary)', margin: '0 0 1rem' }}>
            $ security
          </h1>

          <section className="term-panel" style={{ padding: '0.875rem 1rem', marginBottom: '0.75rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.625rem' }}>// CHANGE PASSWORD</div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <input type="password" placeholder="current password" style={inputStyle} />
              <input type="password" placeholder="new password" style={inputStyle} />
              <input type="password" placeholder="confirm new password" style={inputStyle} />
            </div>
            <button className="d-interactive" data-variant="primary" style={{ marginTop: '0.625rem', padding: '0.25rem 0.625rem', fontSize: '0.75rem', borderRadius: 0 }}>
              &gt; Update Password
            </button>
          </section>

          <section className="term-panel" style={{ padding: '0.875rem 1rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div className="d-label" style={{ color: 'var(--d-accent)' }}>// MFA</div>
              <span className="d-annotation" data-status="success">● enabled · TOTP</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', margin: '0 0 0.5rem' }}>
              Authenticator app configured with backup codes.
            </p>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button className="d-interactive" style={{ padding: '0.25rem 0.625rem', fontSize: '0.7rem', borderRadius: 0 }}>Regenerate Backup Codes</button>
              <button className="d-interactive" style={{ padding: '0.25rem 0.625rem', fontSize: '0.7rem', borderRadius: 0, color: 'var(--d-error)' }}>Disable</button>
            </div>
          </section>

          <section className="term-panel" style={{ padding: '0.875rem 1rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>// ACTIVE SESSIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {SESSIONS.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.375rem 0.5rem', border: '1px solid var(--d-border)', fontSize: '0.72rem' }}>
                  <div>
                    <div style={{ color: 'var(--d-text)' }}>{s.device} {s.current && <span style={{ color: 'var(--d-primary)', fontSize: '0.65rem' }}>[current]</span>}</div>
                    <div style={{ color: 'var(--d-text-muted)', fontSize: '0.65rem' }}>{s.ip} · {s.loc} · last {s.last}</div>
                  </div>
                  {!s.current && (
                    <button style={{ background: 'none', border: '1px solid var(--d-border)', color: 'var(--d-error)', padding: '0.15rem 0.5rem', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </TerminalSplitShell>
  );
}
