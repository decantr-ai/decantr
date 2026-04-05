import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function MfaVerifyPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '0.375rem' }}>Enter your code</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.25rem' }}>
        Open your authenticator app and enter the 6-digit code.
      </p>
      <form onSubmit={(e) => { e.preventDefault(); login(); navigate('/home'); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <input className="paper-input" placeholder="000 000" maxLength={7} required style={{ textAlign: 'center', fontSize: '1.125rem', letterSpacing: '0.2em', fontFamily: 'ui-monospace, monospace' }} />
        <button type="submit" className="d-interactive" style={{ justifyContent: 'center', padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'var(--d-primary)', color: '#fff', borderColor: 'var(--d-primary)' }}>
          Verify
        </button>
      </form>
    </div>
  );
}
