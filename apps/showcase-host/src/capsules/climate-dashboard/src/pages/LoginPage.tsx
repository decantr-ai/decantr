import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login(email, password);
    navigate('/emissions');
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>Welcome back</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>Sign in to your ClimateDash account</p>
      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap1')}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Email</label>
          <input className="d-control earth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
        </div>
        <div className={css('_flex _col _gap1')}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Password</label>
          <input className="d-control earth-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
        </div>
        <div className={css('_flex _jcsb _aic')} style={{ fontSize: '0.8125rem' }}>
          <label className={css('_flex _aic _gap2')}>
            <input type="checkbox" /> Remember me
          </label>
          <Link to="/forgot-password" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Forgot password?</Link>
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
          Sign In
        </button>
      </form>
      <p style={{ fontSize: '0.8125rem', textAlign: 'center', marginTop: '1.25rem', color: 'var(--d-text-muted)' }}>
        No account? <Link to="/register" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 500 }}>Create one</Link>
      </p>
    </div>
  );
}
