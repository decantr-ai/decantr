import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: 2, background: 'var(--d-surface-raised)', border: '1px solid var(--d-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Mail size={20} style={{ color: 'var(--d-primary)' }} />
        </div>
      </div>
      <div>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.25rem' }}>Verify your email</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem' }}>
          We sent a verification link to your inbox. Click to activate your workspace.
        </p>
      </div>
      <button className="d-interactive" data-variant="primary" onClick={() => navigate('/mfa-setup')} style={{ justifyContent: 'center' }}>
        Continue to MFA setup
      </button>
      <button className="d-interactive" data-variant="ghost" style={{ justifyContent: 'center', fontSize: '0.75rem' }}>
        Resend email
      </button>
    </div>
  );
}
