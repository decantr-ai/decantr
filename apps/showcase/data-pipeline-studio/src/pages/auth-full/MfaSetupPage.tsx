import { Link, useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';

export function MfaSetupPage() {
  const navigate = useNavigate();
  const secret = 'JBSWY3DPEHPK3PXP';
  return (
    <CenteredShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 className="term-glow" style={{ fontSize: '1rem', textAlign: 'center', color: 'var(--d-primary)', margin: 0 }}>
          $ MFA_SETUP
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
          Scan the QR code or enter the secret in your authenticator app.
        </p>
        <div
          style={{
            width: 140,
            height: 140,
            margin: '0 auto',
            background: '#fff',
            padding: '0.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(11, 1fr)',
            gap: 0,
          }}
        >
          {Array.from({ length: 121 }, (_, i) => (
            <div
              key={i}
              style={{
                background:
                  [0, 1, 2, 3, 4, 5, 6, 10, 14, 18, 22, 27, 28, 33, 40, 44, 45, 50, 55, 60, 66, 72, 78, 88, 90, 100, 108, 115, 120].includes(i) ||
                  i % 7 === 0
                    ? '#000'
                    : '#fff',
              }}
            />
          ))}
        </div>
        <div className="term-panel" style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem' }}>
          <div className="d-label" style={{ marginBottom: '0.25rem' }}>SECRET</div>
          <code className="term-glow" style={{ color: 'var(--d-primary)', letterSpacing: '0.1em' }}>{secret}</code>
        </div>
        <button onClick={() => navigate('/mfa-verify')} className="d-interactive" data-variant="primary" style={{ padding: '0.5rem', borderRadius: 0 }}>
          I've added it
        </button>
        <Link to="/pipelines" style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem', textAlign: 'center' }}>
          Skip for now
        </Link>
      </div>
    </CenteredShell>
  );
}
