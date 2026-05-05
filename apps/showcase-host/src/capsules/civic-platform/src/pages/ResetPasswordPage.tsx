import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate('/login');
  }

  return (
    <form onSubmit={handleSubmit} className="gov-form" role="form" aria-label="Set new password">
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>Reset Password</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
        Choose a new password for your account
      </p>

      <div className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap1')}>
          <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 600 }}>New Password</label>
          <input id="password" type="password" className="d-control gov-input" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className={css('_flex _col _gap1')}>
          <label htmlFor="confirm" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Confirm Password</label>
          <input id="confirm" type="password" className="d-control gov-input" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>
          Reset Password
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontSize: '0.8125rem' }}>Back to Sign In</Link>
      </div>
    </form>
  );
}
