import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
          AUTHENTICATE
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label
            className="d-label"
            htmlFor="login-email"
            style={{
              fontSize: '0.75rem',
              color: 'var(--d-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Email
          </label>
          <input
            id="login-email"
            className="d-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@terminal.dev"
            style={{
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
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label
            className="d-label"
            htmlFor="login-password"
            style={{
              fontSize: '0.75rem',
              color: 'var(--d-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Password
          </label>
          <input
            id="login-password"
            className="d-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            style={{
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
            }}
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
          Access Terminal
        </button>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            marginTop: '0.25rem',
          }}
        >
          <Link to="/register" style={{ color: 'var(--d-accent)' }}>
            Create Account
          </Link>
          <Link to="/forgot-password" style={{ color: 'var(--d-accent)' }}>
            Forgot Password
          </Link>
        </div>
      </form>
    </CenteredShell>
  );
}
