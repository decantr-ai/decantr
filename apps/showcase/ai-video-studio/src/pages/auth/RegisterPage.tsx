import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(email, password, name);
    navigate('/projects');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create your studio</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>Start directing AI video today</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Full name</label>
        <input className="d-control" value={name} onChange={e => setName(e.target.value)} placeholder="Maya Chen" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Email</label>
        <input className="d-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="director@studio.ai" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Password</label>
        <input className="d-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create password" />
      </div>
      <button className="d-interactive" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
        Create Account
      </button>
      <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
        Already have an account? <NavLink to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Sign in</NavLink>
      </p>
    </form>
  );
}
