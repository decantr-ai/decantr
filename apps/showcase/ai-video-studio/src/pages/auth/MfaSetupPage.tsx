import { NavLink } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function MfaSetupPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 'var(--d-radius)', background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Shield size={24} style={{ color: 'var(--d-primary)' }} />
      </div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Set up two-factor auth</h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>Scan this QR code with your authenticator app</p>
      <div style={{ width: 160, height: 160, background: 'var(--d-surface-raised)', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
        QR Code
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--d-primary)' }}>ABCD-EFGH-IJKL-MNOP</div>
      <NavLink to="/mfa-verify" className="d-interactive" data-variant="primary" style={{ justifyContent: 'center', width: '100%', padding: '0.5rem' }}>
        Continue
      </NavLink>
    </div>
  );
}
