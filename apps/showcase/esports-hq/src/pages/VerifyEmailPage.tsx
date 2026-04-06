import { Link } from 'react-router-dom';
import { Trophy, Mail } from 'lucide-react';

export function VerifyEmailPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
      <div>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--d-radius)',
          background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <Mail size={24} color="#fff" />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Verify Your Email</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
          We sent a verification link to your email. Click it to activate your account.
        </p>
      </div>
      <button className="d-interactive" style={{ width: '100%', justifyContent: 'center' }}>
        Resend Verification Email
      </button>
      <Link to="/login" style={{ fontSize: '0.8rem', color: 'var(--d-primary)', textDecoration: 'none' }}>
        Back to Sign In
      </Link>
    </div>
  );
}
