import { useNavigate } from 'react-router-dom';
import { AuthForm, AuthFooterLink } from '@/components/AuthForm';

export function MfaSetupPage() {
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/mfa-verify');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '0.375rem' }}>
          Set up two-factor auth
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
          Scan the QR code with your authenticator app.
        </p>
      </div>
      <div
        style={{
          width: 160,
          height: 160,
          background: 'var(--d-surface-raised)',
          border: '1px solid var(--d-border)',
          borderRadius: 'var(--d-radius)',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 2,
          padding: 10,
        }}
        aria-label="QR code"
      >
        {Array.from({ length: 64 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: Math.random() > 0.5 ? 'var(--d-text)' : 'transparent',
              borderRadius: 1,
            }}
          />
        ))}
      </div>
      <p className="mono-data" style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--d-text-muted)' }}>
        JBSWY3DPEHPK3PXP
      </p>
      <AuthForm
        title=""
        fields={[{ id: 'code', label: 'Enter 6-digit code from your app', placeholder: '000000' }]}
        submitLabel="Enable 2FA"
        onSubmit={handleSubmit}
        footer={<AuthFooterLink to="/chat">Skip for now</AuthFooterLink>}
      />
    </div>
  );
}
