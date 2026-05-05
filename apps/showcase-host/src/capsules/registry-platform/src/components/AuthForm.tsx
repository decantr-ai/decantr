import { useState } from 'react';

interface AuthFormProps {
  mode: 'login' | 'register' | 'forgot-password';
  onSubmit: () => void;
}

const MODE_CONFIG = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to your account',
    submitLabel: 'Sign In',
  },
  register: {
    title: 'Create an account',
    subtitle: 'Get started with Decantr',
    submitLabel: 'Create Account',
  },
  'forgot-password': {
    title: 'Reset password',
    subtitle: 'We\'ll send you a reset link',
    submitLabel: 'Send Reset Link',
  },
} as const;

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const config = MODE_CONFIG[mode];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--d-gap-2)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'var(--d-text)',
  };

  return (
    <div
      className="d-surface"
      style={{
        borderRadius: 'var(--d-radius-lg)',
        maxWidth: '24rem',
        width: '100%',
        padding: 'var(--d-gap-8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--d-gap-6)',
      }}
    >
      {/* Brand + Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-3)', textAlign: 'center' }}>
        <div
          className="lum-brand"
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            letterSpacing: '-0.04em',
          }}
        >
          decantr<span className="brand-dot">.</span>
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.3 }}>
            {config.title}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: 'var(--d-gap-1)' }}>
            {config.subtitle}
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-4)' }}
      >
        {/* Name field (register only) */}
        {mode === 'register' && (
          <div style={fieldStyle}>
            <label htmlFor="auth-name" style={labelStyle}>
              Name
            </label>
            <input
              id="auth-name"
              type="text"
              className="d-control"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
        )}

        {/* Email field */}
        <div style={fieldStyle}>
          <label htmlFor="auth-email" style={labelStyle}>
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            className="d-control"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {/* Password field (not for forgot-password) */}
        {mode !== 'forgot-password' && (
          <div style={fieldStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="auth-password" style={labelStyle}>
                Password
              </label>
              {mode === 'login' && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--d-primary)',
                    cursor: 'pointer',
                    transition: 'color 0.15s',
                  }}
                >
                  Forgot password?
                </span>
              )}
            </div>
            <input
              id="auth-password"
              type="password"
              className="d-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="d-interactive"
          data-variant="primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '0.625rem 1rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderRadius: 'var(--d-radius)',
            marginTop: 'var(--d-gap-2)',
          }}
        >
          {config.submitLabel}
        </button>
      </form>

      {/* Divider (not for forgot-password) */}
      {mode !== 'forgot-password' && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--d-gap-3)',
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', whiteSpace: 'nowrap' }}>
              or continue with
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
          </div>

          {/* OAuth buttons */}
          <div style={{ display: 'flex', gap: 'var(--d-gap-3)' }}>
            <button
              type="button"
              className="d-interactive"
              data-variant="ghost"
              style={{
                flex: 1,
                justifyContent: 'center',
                borderRadius: 'var(--d-radius-full)',
                padding: '0.5rem 1rem',
                fontSize: '0.8125rem',
                border: '1px solid var(--d-border)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
            <button
              type="button"
              className="d-interactive"
              data-variant="ghost"
              style={{
                flex: 1,
                justifyContent: 'center',
                borderRadius: 'var(--d-radius-full)',
                padding: '0.5rem 1rem',
                fontSize: '0.8125rem',
                border: '1px solid var(--d-border)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>
        </>
      )}

      {/* Footer links */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: 'var(--d-text-muted)',
        }}
      >
        {mode === 'login' && (
          <span>
            Don't have an account?{' '}
            <span style={{ color: 'var(--d-primary)', cursor: 'pointer', fontWeight: 500 }}>
              Sign up
            </span>
          </span>
        )}
        {mode === 'register' && (
          <span>
            Already have an account?{' '}
            <span style={{ color: 'var(--d-primary)', cursor: 'pointer', fontWeight: 500 }}>
              Sign in
            </span>
          </span>
        )}
        {mode === 'forgot-password' && (
          <span>
            Remember your password?{' '}
            <span style={{ color: 'var(--d-primary)', cursor: 'pointer', fontWeight: 500 }}>
              Back to sign in
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
