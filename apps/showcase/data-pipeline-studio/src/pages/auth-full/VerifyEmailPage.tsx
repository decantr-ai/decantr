import { Link, useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  return (
    <CenteredShell>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 className="term-glow" style={{ fontSize: '1rem', color: 'var(--d-primary)', margin: 0 }}>$ VERIFY_EMAIL</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
          A 6-digit code was sent to your email. Enter it below to activate the account.
        </p>
        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <input
              key={i}
              maxLength={1}
              defaultValue={['4', '2', '', '', '', ''][i]}
              style={{
                width: '2rem',
                height: '2.5rem',
                textAlign: 'center',
                background: 'var(--d-bg)',
                border: '1px solid var(--d-border)',
                color: 'var(--d-primary)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          ))}
        </div>
        <button onClick={() => navigate('/mfa-setup')} className="d-interactive" data-variant="primary" style={{ padding: '0.5rem', borderRadius: 0 }}>Verify Code</button>
        <Link to="/login" style={{ color: 'var(--d-accent)', fontSize: '0.75rem' }}>Resend Code</Link>
      </div>
    </CenteredShell>
  );
}
