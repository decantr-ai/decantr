import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { css } from '@decantr/css';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    register(email, password, name);
    navigate('/engage');
  }

  return (
    <form onSubmit={handleSubmit} className="gov-form" role="form" aria-label="Create account">
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>Create Account</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
        Join your community&apos;s civic platform
      </p>

      <div className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap1')}>
          <label htmlFor="name" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Full Name <span style={{ color: 'var(--d-error)' }}>*</span></label>
          <input id="name" type="text" className="d-control gov-input" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className={css('_flex _col _gap1')}>
          <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email <span style={{ color: 'var(--d-error)' }}>*</span></label>
          <input id="email" type="email" className="d-control gov-input" placeholder="you@example.gov" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className={css('_flex _col _gap1')}>
          <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Password <span style={{ color: 'var(--d-error)' }}>*</span></label>
          <input id="password" type="password" className="d-control gov-input" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>
          Create Account
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: '1.25rem' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
      </p>
    </form>
  );
}
