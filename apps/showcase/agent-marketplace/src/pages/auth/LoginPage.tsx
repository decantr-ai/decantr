import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Mail, Lock, Eye, EyeOff, Github } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className={css('_flex _col _gap4')}
      onSubmit={(e) => e.preventDefault()}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--d-text)', margin: 0 }}>
        Sign In
      </h1>

      {/* Email */}
      <div className={css('_flex _col _gap1')}>
        <label className="d-label" htmlFor="login-email">
          Email
        </label>
        <div className={css('_flex _aic')} style={{ position: 'relative' }}>
          <Mail
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: 'var(--d-text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            id="login-email"
            type="email"
            className="d-control carbon-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Password */}
      <div className={css('_flex _col _gap1')}>
        <label className="d-label" htmlFor="login-password">
          Password
        </label>
        <div className={css('_flex _aic')} style={{ position: 'relative' }}>
          <Lock
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: 'var(--d-text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            className="d-control carbon-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--d-text-muted)',
              padding: 0,
              display: 'flex',
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Forgot link */}
      <div style={{ textAlign: 'right' }}>
        <Link
          to="/forgot-password"
          className="d-annotation"
          style={{ fontSize: '0.8125rem', color: 'var(--d-accent)' }}
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit */}
      <button type="submit" className="d-interactive neon-glow" style={{ width: '100%' }}>
        Sign In
      </button>

      {/* Divider */}
      <div className={css('_flex _aic _gap3')} role="separator">
        <div className="carbon-divider" style={{ flex: 1 }} />
        <span className="d-annotation" style={{ fontSize: '0.75rem' }}>or</span>
        <div className="carbon-divider" style={{ flex: 1 }} />
      </div>

      {/* GitHub OAuth */}
      <button
        type="button"
        className={css('_flex _aic _jcc _gap2') + ' d-interactive'}
        style={{
          width: '100%',
          background: 'transparent',
          border: '1px solid var(--d-border)',
          color: 'var(--d-text)',
        }}
      >
        <Github size={16} />
        Continue with GitHub
      </button>

      {/* Register link */}
      <p
        className="d-annotation"
        style={{ textAlign: 'center', margin: 0, fontSize: '0.8125rem' }}
      >
        No account?{' '}
        <Link to="/register" style={{ color: 'var(--d-accent)' }}>
          Register
        </Link>
      </p>
    </form>
  );
}
