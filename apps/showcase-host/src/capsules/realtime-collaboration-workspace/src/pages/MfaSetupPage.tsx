import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function MfaSetupPage() {
  const navigate = useNavigate();
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Shield size={22} style={{ color: 'var(--d-primary)' }} />
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Set up two-factor</h1>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
        Scan this code with your authenticator app, then enter the 6-digit code below.
      </p>
      <div style={{ padding: '1.25rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius)', border: '1px solid var(--d-border)', marginBottom: '1rem', textAlign: 'center' }}>
        <div style={{ width: 140, height: 140, margin: '0 auto', background: 'repeating-linear-gradient(45deg, var(--d-text) 0, var(--d-text) 4px, var(--d-surface) 4px, var(--d-surface) 8px)', borderRadius: '4px' }} aria-label="QR code" />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); navigate('/home'); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Verification code</label>
          <input className="paper-input" placeholder="123 456" maxLength={7} required style={{ textAlign: 'center', fontSize: '1rem', letterSpacing: '0.2em', fontFamily: 'ui-monospace, monospace' }} />
        </div>
        <button type="submit" className="d-interactive" style={{ justifyContent: 'center', padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'var(--d-primary)', color: '#fff', borderColor: 'var(--d-primary)' }}>
          Verify & enable
        </button>
      </form>
    </div>
  );
}
