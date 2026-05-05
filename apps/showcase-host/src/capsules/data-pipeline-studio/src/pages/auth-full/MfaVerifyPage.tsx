import { useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';
import { useAuth } from '@/hooks/useAuth';

export function MfaVerifyPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  return (
    <CenteredShell>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 className="term-glow" style={{ fontSize: '1rem', color: 'var(--d-primary)', margin: 0 }}>$ MFA_VERIFY</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>Enter the 6-digit code from your authenticator app.</p>
        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <input
              key={i}
              maxLength={1}
              style={{
                width: '2rem', height: '2.5rem', textAlign: 'center',
                background: 'var(--d-bg)', border: '1px solid var(--d-border)',
                color: 'var(--d-primary)', fontFamily: 'inherit', fontSize: '1rem', outline: 'none',
              }}
            />
          ))}
        </div>
        <button onClick={() => { login(); navigate('/pipelines'); }} className="d-interactive" data-variant="primary" style={{ padding: '0.5rem', borderRadius: 0 }}>
          Verify &amp; Continue
        </button>
      </div>
    </CenteredShell>
  );
}
