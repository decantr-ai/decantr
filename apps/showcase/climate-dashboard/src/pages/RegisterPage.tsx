import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { useAuth } from '@/hooks/useAuth';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    register(email, password, name);
    navigate('/emissions');
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>Create account</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>Start tracking your carbon footprint today</p>
      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap1')}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Full Name</label>
          <input className="d-control earth-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Elena Vasquez" required />
        </div>
        <div className={css('_flex _col _gap1')}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Work Email</label>
          <input className="d-control earth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
        </div>
        <div className={css('_flex _col _gap1')}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Password</label>
          <input className="d-control earth-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
          Create Account
        </button>
      </form>
      <p style={{ fontSize: '0.8125rem', textAlign: 'center', marginTop: '1.25rem', color: 'var(--d-text-muted)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
      </p>
    </div>
  );
}
