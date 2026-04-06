import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export function VerifyEmailPage() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 48, height: 48, borderRadius: 2,
        background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1rem',
      }}>
        <Mail size={24} style={{ color: 'var(--d-primary)' }} />
      </div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verify Your Email</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        We sent a verification link to your email address.
        Please check your inbox and click the link to activate your account.
      </p>
      <Link to="/login" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none' }}>
        Return to Sign In
      </Link>
    </div>
  );
}
