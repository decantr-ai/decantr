import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { css } from '@decantr/css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login(email, password);
    navigate('/engage');
  }

  return (
    <form onSubmit={handleSubmit} className="gov-form" role="form" aria-label="Sign in">
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>Sign In</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
        Access your civic engagement dashboard
      </p>

      <div className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap1')}>
          <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email</label>
          <input id="email" type="email" className="d-control gov-input" placeholder="you@example.gov" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className={css('_flex _col _gap1')}>
          <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Password</label>
          <input id="password" type="password" className="d-control gov-input" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        <div className={css('_flex _jcsb _aic')} style={{ fontSize: '0.8125rem' }}>
          <label className={css('_flex _aic _gap2')}>
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Forgot password?</Link>
        </div>

        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>
          Sign In
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: '1.25rem' }}>
        Don&apos;t have an account?{' '}
        <Link to="/register" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
      </p>
    </form>
  );
}
