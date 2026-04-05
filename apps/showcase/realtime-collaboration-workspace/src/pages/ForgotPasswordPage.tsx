import { useState } from 'react';
import { Link } from 'react-router-dom';

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '0.375rem' }}>Reset your password</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.25rem' }}>We'll send you a link to get back in.</p>
      {sent ? (
        <div style={{ padding: '0.875rem', borderRadius: 'var(--d-radius)', background: 'color-mix(in srgb, var(--d-success) 12%, transparent)', fontSize: '0.875rem', color: 'var(--d-success)', marginBottom: '1rem' }}>
          Check your inbox — a reset link is on the way.
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Email</label>
            <input className="paper-input" type="email" placeholder="you@team.com" required />
          </div>
          <button type="submit" className="d-interactive" style={{ justifyContent: 'center', padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'var(--d-primary)', color: '#fff', borderColor: 'var(--d-primary)' }}>
            Send reset link
          </button>
        </form>
      )}
      <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textAlign: 'center', marginTop: '1.25rem' }}>
        <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 500 }}>Back to sign in</Link>
      </p>
    </div>
  );
}
