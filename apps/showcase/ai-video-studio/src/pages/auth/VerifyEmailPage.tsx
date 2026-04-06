import { NavLink } from 'react-router-dom';
import { Mail } from 'lucide-react';

export function VerifyEmailPage() {
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 'var(--d-radius)', background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Mail size={24} style={{ color: 'var(--d-primary)' }} />
      </div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Verify your email</h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', maxWidth: 300 }}>
        We sent a verification link to your email address. Click the link to activate your studio.
      </p>
      <button className="d-interactive" data-variant="ghost" style={{ justifyContent: 'center' }}>Resend verification email</button>
      <NavLink to="/login" style={{ fontSize: '0.8rem', color: 'var(--d-primary)', textDecoration: 'none' }}>Back to sign in</NavLink>
    </div>
  );
}
