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

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login();
    navigate('/pipelines');
  }

  return (
    <CenteredShell>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1
          className="term-glow"
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            textAlign: 'center',
            color: 'var(--d-primary)',
            margin: 0,
            letterSpacing: '0.1em',
          }}
        >
          $ LOGIN
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="email">EMAIL</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.io" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="password">PASSWORD</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" style={inputStyle} />
        </div>
        <button
          type="submit"
          className="d-interactive"
          data-variant="primary"
          style={{ width: '100%', padding: '0.625rem', fontSize: '0.875rem', fontWeight: 600, borderRadius: 0, letterSpacing: '0.05em' }}
        >
          &gt; Execute Login
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <button type="button" onClick={() => { login(); navigate('/pipelines'); }} style={{ ...inputStyle, cursor: 'pointer', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
            Continue with GitHub
          </button>
          <button type="button" onClick={() => { login(); navigate('/pipelines'); }} style={{ ...inputStyle, cursor: 'pointer', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
            Continue with Google
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
          <Link to="/register" style={{ color: 'var(--d-accent)' }}>Create account</Link>
          <Link to="/forgot-password" style={{ color: 'var(--d-accent)' }}>Forgot password?</Link>
        </div>
      </form>
    </CenteredShell>
  );
}
