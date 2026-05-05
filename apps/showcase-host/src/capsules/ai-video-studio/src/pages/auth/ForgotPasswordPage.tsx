import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Check your inbox</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>We sent a reset link to your email address.</p>
        <NavLink to="/login" className="d-interactive" data-variant="ghost" style={{ justifyContent: 'center' }}>Back to sign in</NavLink>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Forgot password</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>Enter your email to receive a reset link</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Email</label>
        <input className="d-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="director@studio.ai" />
      </div>
      <button className="d-interactive" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
        Send Reset Link
      </button>
      <NavLink to="/login" style={{ fontSize: '0.8rem', color: 'var(--d-primary)', textDecoration: 'none', textAlign: 'center' }}>Back to sign in</NavLink>
    </form>
  );
}
