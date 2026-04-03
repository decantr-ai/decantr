import { css } from '@decantr/css';
import { Hexagon, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';

type AuthMode = 'login' | 'register' | 'forgot-password';

interface Props {
  mode: AuthMode;
}

const MODE_CONFIG = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to your Decantr account',
    cta: 'Sign in',
    altText: "Don't have an account?",
    altLink: '/register',
    altLabel: 'Create one',
  },
  register: {
    title: 'Create account',
    subtitle: 'Join the Decantr design registry',
    cta: 'Create account',
    altText: 'Already have an account?',
    altLink: '/login',
    altLabel: 'Sign in',
  },
  'forgot-password': {
    title: 'Reset password',
    subtitle: 'Enter your email to receive a reset link',
    cta: 'Send reset link',
    altText: 'Remember your password?',
    altLink: '/login',
    altLabel: 'Sign in',
  },
};

export function AuthForm({ mode }: Props) {
  const config = MODE_CONFIG[mode];
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'forgot-password') {
      navigate('/login');
      return;
    }
    login();
    navigate('/dashboard');
  }

  return (
    <div className={css('_flex _col _gap6')}>
      {/* Brand */}
      <div className={css('_flex _col _aic _gap3')} style={{ textAlign: 'center' }}>
        <div
          className={css('_flex _aic _jcc')}
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--d-radius-full)',
            background: 'var(--d-surface)',
            border: '1px solid var(--d-border)',
          }}
        >
          <Hexagon size={24} style={{ color: 'var(--d-accent)' }} />
        </div>
        <div>
          <h1 className={css('_fontbold')} style={{ margin: 0, fontSize: '1.5rem', color: 'var(--d-text)' }}>
            {config.title}
          </h1>
          <p className={css('_textsm')} style={{ margin: '0.25rem 0 0', color: 'var(--d-text-muted)' }}>
            {config.subtitle}
          </p>
        </div>
      </div>

      {/* Form */}
      <form className={css('_flex _col _gap4')} onSubmit={handleSubmit}>
        <div className="d-surface" style={{ padding: '1.5rem' }}>
          <div className={css('_flex _col _gap3')}>
            {mode === 'register' && (
              <div className={css('_flex _col _gap1')}>
                <label className="d-label" htmlFor="auth-name">Name</label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--d-text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="auth-name"
                    className="d-control"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
              </div>
            )}

            <div className={css('_flex _col _gap1')}>
              <label className="d-label" htmlFor="auth-email">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--d-text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="auth-email"
                  className="d-control"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            {mode !== 'forgot-password' && (
              <div className={css('_flex _col _gap1')}>
                <div className={css('_flex _aic _jcsb')}>
                  <label className="d-label" htmlFor="auth-password">Password</label>
                  {mode === 'login' && (
                    <Link
                      to="/forgot-password"
                      className={css('_textxs')}
                      style={{ color: 'var(--d-primary)', textDecoration: 'none' }}
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--d-text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="auth-password"
                    className="d-control"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          className="d-interactive"
          data-variant="primary"
          type="submit"
          style={{ width: '100%', justifyContent: 'center', padding: '0.625rem 1rem' }}
        >
          {config.cta}
          <ArrowRight size={16} />
        </button>
      </form>

      {/* Alt link */}
      <p className={css('_textsm')} style={{ textAlign: 'center', margin: 0, color: 'var(--d-text-muted)' }}>
        {config.altText}{' '}
        <Link to={config.altLink} style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>
          {config.altLabel}
        </Link>
      </p>
    </div>
  );
}
