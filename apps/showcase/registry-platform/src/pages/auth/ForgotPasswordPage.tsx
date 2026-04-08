import { useState } from 'react';
import { AuthForm } from '../../components/AuthForm';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit() {
    setSent(true);
  }

  if (sent) {
    return (
      <div
        className="d-surface"
        style={{
          borderRadius: 'var(--d-radius-lg)',
          maxWidth: '24rem',
          width: '100%',
          padding: 'var(--d-gap-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--d-gap-4)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            margin: '0 auto',
          }}
        >
          ✓
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Check your email</h2>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--d-text-muted)',
            lineHeight: 1.5,
          }}
        >
          We sent a password reset link to your email address. Click the link to set a new password.
        </p>
      </div>
    );
  }

  return <AuthForm mode="forgot-password" onSubmit={handleSubmit} />;
}
