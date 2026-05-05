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
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.5rem' }}>Check your email</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
          We sent a password reset link to <strong>{email}</strong>
        </p>
        <Link to="/login" className="d-interactive" data-variant="ghost" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>Forgot password?</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>Enter your email and we will send a reset link</p>
      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap1')}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Email</label>
          <input className="d-control earth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
          Send Reset Link
        </button>
      </form>
      <p style={{ fontSize: '0.8125rem', textAlign: 'center', marginTop: '1.25rem' }}>
        <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>
          <ArrowLeft size={12} style={{ verticalAlign: 'middle' }} /> Back to sign in
        </Link>
      </p>
    </div>
  );
}
