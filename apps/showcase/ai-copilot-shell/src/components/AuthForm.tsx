import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Github, Chrome } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  mode: 'login' | 'register' | 'forgot-password';
}

const config = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to your workspace',
    submitLabel: 'Sign In',
    footerText: "Don't have an account?",
    footerLink: '/register',
    footerLinkText: 'Register',
    showPassword: true,
    showOAuth: true,
    showForgot: true,
  },
  register: {
    title: 'Create account',
    subtitle: 'Get started with AI Copilot',
    submitLabel: 'Create Account',
    footerText: 'Already have an account?',
    footerLink: '/login',
    footerLinkText: 'Sign in',
    showPassword: true,
    showOAuth: true,
    showForgot: false,
  },
  'forgot-password': {
    title: 'Reset password',
    subtitle: "Enter your email and we'll send a reset link",
    submitLabel: 'Send Reset Link',
    footerText: 'Remember your password?',
    footerLink: '/login',
    footerLinkText: 'Sign in',
    showPassword: false,
    showOAuth: false,
    showForgot: false,
  },
};

export function AuthForm({ mode }: AuthFormProps) {
  const c = config[mode];
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/workspace');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <Sparkles size={32} style={{ color: 'var(--d-accent)', margin: '0 auto 0.75rem' }} />
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{c.title}</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>{c.subtitle}</p>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>Email</label>
          <input
            type="email"
            className="d-control carbon-input"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        {c.showPassword && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Password</label>
              {c.showForgot && (
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.75rem', color: 'var(--d-accent)', textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <input
              type="password"
              className="d-control carbon-input"
              placeholder={mode === 'register' ? 'Create a password' : 'Enter password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="d-interactive"
        data-variant="primary"
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: '0.625rem 1rem',
          fontSize: '0.9375rem',
          fontWeight: 500,
          border: 'none',
        }}
      >
        {c.submitLabel}
      </button>

      {/* OAuth */}
      {c.showOAuth && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <hr className="carbon-divider" style={{ flex: 1 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', whiteSpace: 'nowrap' }}>or continue with</span>
            <hr className="carbon-divider" style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleSubmit}
              className="d-interactive"
              style={{ flex: 1, justifyContent: 'center', border: 'none' }}
            >
              <Github size={16} />
              <span style={{ fontSize: '0.8125rem' }}>GitHub</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="d-interactive"
              style={{ flex: 1, justifyContent: 'center', border: 'none' }}
            >
              <Chrome size={16} />
              <span style={{ fontSize: '0.8125rem' }}>Google</span>
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
        {c.footerText}{' '}
        <Link to={c.footerLink} style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>{c.footerLinkText}</Link>
      </p>
    </form>
  );
}
