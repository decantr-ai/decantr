import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Reset password</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>Choose a new password for your account</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>New password</label>
        <input className="d-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Confirm password</label>
        <input className="d-control" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" />
      </div>
      <button className="d-interactive" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
        Reset Password
      </button>
    </form>
  );
}
