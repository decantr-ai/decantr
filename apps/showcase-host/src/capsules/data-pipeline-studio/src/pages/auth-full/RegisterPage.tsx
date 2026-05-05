import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';
import { useAuth } from '@/hooks/useAuth';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  background: 'var(--d-bg)',
  border: '1px solid var(--d-border)',
  borderRadius: 0,
  color: 'var(--d-text)',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login();
    navigate('/verify-email');
  }

  return (
    <CenteredShell>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 className="term-glow" style={{ fontSize: '1.125rem', textAlign: 'center', color: 'var(--d-primary)', margin: 0 }}>
          $ CREATE_ACCOUNT
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="name">NAME</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="email">EMAIL</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.io" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="password">PASSWORD</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min 8 chars" style={inputStyle} />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', padding: '0.625rem', borderRadius: 0, fontWeight: 600 }}>
          &gt; Provision Account
        </button>
        <div style={{ fontSize: '0.75rem', textAlign: 'center' }}>
          <span style={{ color: 'var(--d-text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--d-accent)' }}>Sign in</Link>
        </div>
      </form>
    </CenteredShell>
  );
}
