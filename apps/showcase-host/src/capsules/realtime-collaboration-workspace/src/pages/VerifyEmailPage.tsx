import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export function VerifyEmailPage() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
        <Mail size={24} style={{ color: 'var(--d-primary)' }} />
      </div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '0.375rem' }}>Check your inbox</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        We sent a verification link to your email. Click it to activate your workspace.
      </p>
      <button className="d-interactive" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem 1rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
        Resend email
      </button>
      <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
        Wrong address? <Link to="/register" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 500 }}>Start over</Link>
      </p>
    </div>
  );
}
