import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CenteredShell } from '../shells/centered';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  return (
    <CenteredShell>
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--d-radius)',
            background: 'var(--d-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 700,
            color: '#18181B',
          }}
        >
          C
        </div>
      </div>

      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--d-text)',
          textAlign: 'center' as const,
          marginBottom: '0.5rem',
        }}
      >
        Sign in
      </h1>
      <p
        style={{
          fontSize: 14,
          color: 'var(--d-text-muted)',
          textAlign: 'center' as const,
          marginBottom: '1.5rem',
        }}
      >
        Welcome back to Carbon AI.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); navigate('/chat'); }}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--d-text)',
              marginBottom: '0.375rem',
            }}
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              fontSize: 14,
              color: 'var(--d-text)',
              background: 'var(--d-bg)',
              border: '1px solid var(--d-border)',
              borderRadius: 'var(--d-radius-sm)',
              outline: 'none',
            }}
          />
        </div>

        {/* Password */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.375rem',
            }}
          >
            <label
              htmlFor="login-password"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--d-text)',
              }}
            >
              Password
            </label>
            <span
              style={{
                fontSize: 12,
                color: 'var(--d-primary)',
                cursor: 'pointer',
              }}
            >
              Forgot password?
            </span>
          </div>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              fontSize: 14,
              color: 'var(--d-text)',
              background: 'var(--d-bg)',
              border: '1px solid var(--d-border)',
              borderRadius: 'var(--d-radius-sm)',
              outline: 'none',
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.625rem 0',
            fontSize: 14,
            fontWeight: 600,
            color: '#18181B',
            background: 'var(--d-primary)',
            border: 'none',
            borderRadius: 'var(--d-radius)',
            cursor: 'pointer',
            marginTop: '0.5rem',
          }}
        >
          Sign in
        </button>
      </form>

      {/* Register link */}
      <p
        style={{
          fontSize: 13,
          color: 'var(--d-text-muted)',
          textAlign: 'center' as const,
          marginTop: '1.5rem',
        }}
      >
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          style={{
            color: 'var(--d-primary)',
            fontWeight: 500,
          }}
        >
          Register
        </Link>
      </p>
    </CenteredShell>
  );
}
