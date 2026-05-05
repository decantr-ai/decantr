import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';
import { useAuth } from '@/hooks/useAuth';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
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
          Create Account
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="name">PRODUCER NAME</label>
          <input id="name" className="d-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="VXNE" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="email">EMAIL</label>
          <input id="email" type="email" className="d-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="producer@studio.io" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="password">PASSWORD</label>
          <input id="password" type="password" className="d-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
        </div>
        <button type="submit" className="d-interactive neon-glow-hover" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem', fontSize: '0.875rem', fontWeight: 600 }}>
          Drop In
        </button>
        <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--d-text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--d-accent)' }}>Sign in</Link>
        </div>
      </form>
    </CenteredShell>
  );
}
