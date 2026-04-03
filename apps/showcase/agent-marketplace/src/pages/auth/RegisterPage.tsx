import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);

  return (
    <form
      className={css('_flex _col _gap4')}
      onSubmit={(e) => e.preventDefault()}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--d-text)', margin: 0 }}>
        Create Account
      </h1>

      {/* Name */}
      <div className={css('_flex _col _gap1')}>
        <label className="d-label" htmlFor="register-name">
          Name
        </label>
        <input
          id="register-name"
          type="text"
          className="d-control carbon-input"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      {/* Email */}
      <div className={css('_flex _col _gap1')}>
        <label className="d-label" htmlFor="register-email">
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
            id="register-email"
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
        <label className="d-label" htmlFor="register-password">
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
            id="register-password"
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

      {/* Confirm Password */}
      <div className={css('_flex _col _gap1')}>
        <label className="d-label" htmlFor="register-confirm">
          Confirm Password
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
            id="register-confirm"
            type={showPassword ? 'text' : 'password'}
            className="d-control carbon-input"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Terms checkbox */}
      <label className={css('_flex _aic _gap2')} style={{ cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="d-control"
        />
        <span className="d-annotation" style={{ fontSize: '0.8125rem' }}>
          I agree to the Terms of Service and Privacy Policy
        </span>
      </label>

      {/* Submit */}
      <button type="submit" className="d-interactive neon-glow" style={{ width: '100%' }}>
        Create Account
      </button>

      {/* Sign in link */}
      <p
        className="d-annotation"
        style={{ textAlign: 'center', margin: 0, fontSize: '0.8125rem' }}
      >
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--d-accent)' }}>
          Sign In
        </Link>
      </p>
    </form>
  );
}
