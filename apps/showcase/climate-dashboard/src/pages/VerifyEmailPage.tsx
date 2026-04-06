import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export function VerifyEmailPage() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
        <Mail size={24} style={{ color: 'var(--d-primary)' }} />
      </div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verify your email</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
        We sent a verification link to your email address. Click the link to activate your account.
      </p>
      <button className="d-interactive" style={{ marginBottom: '1rem' }}>Resend Email</button>
      <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
        <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Back to sign in</Link>
      </p>
    </div>
  );
}
