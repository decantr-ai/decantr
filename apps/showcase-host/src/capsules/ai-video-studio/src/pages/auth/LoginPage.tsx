import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('maya@cinematic.ai');
  const [password, setPassword] = useState('password');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    navigate('/projects');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Welcome back</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>Sign in to your studio</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Email</label>
        <input className="d-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="director@studio.ai" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Password</label>
        <input className="d-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <NavLink to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--d-primary)', textDecoration: 'none' }}>Forgot password?</NavLink>
      </div>
      <button className="d-interactive" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
        Sign In
      </button>
      <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
        No account? <NavLink to="/register" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Register</NavLink>
      </p>
    </form>
  );
}
