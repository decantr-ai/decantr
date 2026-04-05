import { useNavigate, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 9999, background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'var(--d-primary)' }}>
        <Mail size={24} />
      </div>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.375rem' }}>Check your email</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>
          We sent a verification link to your inbox. Click it to confirm your address.
        </p>
      </div>
      <button className="ec-button-primary" onClick={() => navigate('/shop')} style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}>
        I've verified my email
      </button>
      <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
        Didn't receive it? <button style={{ color: 'var(--d-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>Resend</button>
      </div>
      <Link to="/login" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>Back to sign in</Link>
    </div>
  );
}
