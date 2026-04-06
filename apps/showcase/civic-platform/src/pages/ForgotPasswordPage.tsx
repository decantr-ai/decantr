import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.75rem' }}>Check Your Email</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
        </p>
        <Link to="/login" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none' }}>
          Return to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="gov-form" role="form" aria-label="Reset password">
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>Forgot Password</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
        Enter your email and we&apos;ll send a reset link
      </p>

      <div className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap1')}>
          <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email</label>
          <input id="email" type="email" className="d-control gov-input" placeholder="you@example.gov" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>
          Send Reset Link
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </form>
  );
}
