import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.5rem' }}>Password reset</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>Your password has been updated successfully.</p>
        <Link to="/login" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none' }}>Sign In</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>Reset password</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>Enter your new password</p>
      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap1')}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>New Password</label>
          <input className="d-control earth-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required />
        </div>
        <div className={css('_flex _col _gap1')}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Confirm Password</label>
          <input className="d-control earth-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
          Reset Password
        </button>
      </form>
    </div>
  );
}
