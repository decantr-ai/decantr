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
          <div style={{ fontSize: '2rem' }}>&#9993;</div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--d-text)' }}>Check your inbox</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>Reset link sent to {email || 'your email'}</p>
          <Link to="/login" style={{ color: 'var(--d-accent)', fontSize: '0.8125rem' }}>Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, textAlign: 'center', color: 'var(--d-primary)', margin: 0 }}>Reset Password</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>Enter your email and we'll send a reset link</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label className="d-label" htmlFor="email">EMAIL</label>
            <input id="email" type="email" className="d-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="producer@studio.io" />
          </div>
          <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>Send Reset Link</button>
          <Link to="/login" style={{ color: 'var(--d-accent)', fontSize: '0.75rem', textAlign: 'center' }}>Back to sign in</Link>
        </form>
      )}
    </CenteredShell>
  );
}
