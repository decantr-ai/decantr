import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login();
    navigate('/session');
  }

  return (
    <CenteredShell>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 className="studio-glow-cyan" style={{ fontSize: '1.125rem', fontWeight: 700, textAlign: 'center', color: 'var(--d-primary)', margin: 0 }}>
          Sign In
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="email">EMAIL</label>
          <input id="email" type="email" className="d-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="producer@studio.io" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="password">PASSWORD</label>
          <input id="password" type="password" className="d-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
        </div>
        <button type="submit" className="d-interactive neon-glow-hover" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem', fontSize: '0.875rem', fontWeight: 600 }}>
          Record Session
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
          <Link to="/register" style={{ color: 'var(--d-accent)' }}>Create account</Link>
          <Link to="/forgot-password" style={{ color: 'var(--d-accent)' }}>Forgot password?</Link>
        </div>
      </form>
    </CenteredShell>
  );
}
