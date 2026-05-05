import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';

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

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--d-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    localStorage.setItem('decantr_authenticated', 'true');
    navigate('/app');
  }

  return (
    <CenteredShell>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <h1
          className="term-glow"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            textAlign: 'center',
            color: 'var(--d-primary)',
            margin: 0,
            letterSpacing: '0.1em',
          }}
        >
          CREATE ACCOUNT
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="reg-username" style={labelStyle}>
            Username
          </label>
          <input
            id="reg-username"
            className="d-control"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="root"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="reg-email" style={labelStyle}>
            Email
          </label>
          <input
            id="reg-email"
            className="d-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@terminal.dev"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="reg-password" style={labelStyle}>
            Password
          </label>
          <input
            id="reg-password"
            className="d-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="reg-confirm" style={labelStyle}>
            Confirm Password
          </label>
          <input
            id="reg-confirm"
            className="d-control"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="********"
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          className="d-interactive"
          data-variant="primary"
          style={{
            width: '100%',
            padding: '0.625rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            borderRadius: 0,
            cursor: 'pointer',
            letterSpacing: '0.05em',
            marginTop: '0.25rem',
          }}
        >
          Initialize Account
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
          <Link to="/login" style={{ color: 'var(--d-accent)' }}>
            Already have access?
          </Link>
        </div>
      </form>
    </CenteredShell>
  );
}
