import { useNavigate } from 'react-router-dom';
import { Trophy, Shield } from 'lucide-react';

export function MfaSetupPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--d-radius)',
          background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <Shield size={24} color="#fff" />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Set Up 2FA</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Scan the QR code with your authenticator app.</p>
      </div>

      {/* QR placeholder */}
      <div style={{
        width: 180, height: 180, margin: '0 auto',
        background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius)',
        border: '1px solid var(--d-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', color: 'var(--d-text-muted)',
      }}>
        QR Code
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
        Manual key: <code style={{ fontFamily: 'var(--d-font-mono, monospace)', color: 'var(--d-primary)' }}>ABCD-EFGH-IJKL-MNOP</code>
      </div>

      <button className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/mfa-verify')}>
        Continue to Verification
      </button>
    </div>
  );
}
