import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');

  return (
    <div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '0.375rem' }}>Welcome back</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.25rem' }}>Sign in to your workspace.</p>
      <form onSubmit={(e) => { e.preventDefault(); login(); navigate('/home'); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Email</label>
          <input className="paper-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@team.com" required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Password</label>
          <input className="paper-input" type="password" placeholder="••••••••" required />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--d-primary)', textDecoration: 'none' }}>Forgot password?</Link>
        </div>
        <button type="submit" className="d-interactive" style={{ justifyContent: 'center', padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'var(--d-primary)', color: '#fff', borderColor: 'var(--d-primary)' }}>
          Sign in
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.25rem 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--d-border)' }} />
          <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--d-border)' }} />
        </div>
        <button type="button" className="d-interactive" style={{ justifyContent: 'center', padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => { login(); navigate('/home'); }}>
          Continue with Google
        </button>
      </form>
      <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textAlign: 'center', marginTop: '1.25rem' }}>
        New here? <Link to="/register" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 500 }}>Create a workspace</Link>
      </p>
    </div>
  );
}
