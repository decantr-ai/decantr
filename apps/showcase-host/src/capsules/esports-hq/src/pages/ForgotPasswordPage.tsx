import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--d-radius)',
          background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <Trophy size={24} color="#fff" />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Reset Password</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
          {sent ? 'Check your email for the reset link.' : 'Enter your email to receive a reset link.'}
        </p>
      </div>
      {!sent && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Email</label>
            <input className="d-control" type="email" placeholder="coach@shadowlegion.gg" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSent(true)}>
            Send Reset Link
          </button>
        </>
      )}
      <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Sign In
      </Link>
    </div>
  );
}
