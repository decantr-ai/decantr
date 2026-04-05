import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Smartphone } from 'lucide-react';

export function MfaSetupPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 9999, background: 'color-mix(in srgb, var(--d-success) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'var(--d-success)' }}>
        <ShieldCheck size={24} />
      </div>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.375rem' }}>Secure your account</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Add two-factor authentication for safer bookings.</p>
      </div>

      <div style={{ background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius)', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 140, height: 140, background: '#fff', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', padding: '0.5rem', gap: 1 }}>
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: '1', background: ((i * 7 + 3) % 3) !== 0 ? '#111' : '#fff' }} />
          ))}
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
        <Smartphone size={13} /> Scan with Google Authenticator or 1Password
      </div>

      <button className="nm-button-primary" onClick={() => navigate('/mfa-verify')} style={{ width: '100%', padding: '0.75rem' }}>
        I've added it
      </button>
      <Link to="/browse" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>Skip for now</Link>
    </div>
  );
}
