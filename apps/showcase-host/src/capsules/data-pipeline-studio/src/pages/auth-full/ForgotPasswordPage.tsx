import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <CenteredShell>
      {sent ? (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h1 className="term-glow" style={{ fontSize: '1rem', color: 'var(--d-primary)', margin: 0 }}>$ RESET_LINK_SENT</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
            If an account exists for <span style={{ color: 'var(--d-text)' }}>{email}</span>, a reset link will arrive shortly.
          </p>
          <Link to="/login" style={{ color: 'var(--d-accent)', fontSize: '0.8125rem' }}>&larr; Back to login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h1 className="term-glow" style={{ fontSize: '1rem', textAlign: 'center', color: 'var(--d-primary)', margin: 0 }}>
            $ RESET_PASSWORD
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
            Enter your email to receive a reset link.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.io"
            style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'var(--d-bg)', border: '1px solid var(--d-border)', borderRadius: 0, color: 'var(--d-text)', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }}
          />
          <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', padding: '0.5rem', borderRadius: 0 }}>
            Send Reset Link
          </button>
          <Link to="/login" style={{ color: 'var(--d-accent)', fontSize: '0.75rem', textAlign: 'center' }}>&larr; Back to login</Link>
        </form>
      )}
    </CenteredShell>
  );
}
