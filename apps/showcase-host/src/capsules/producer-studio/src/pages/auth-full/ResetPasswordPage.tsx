import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    navigate('/login');
  }

  return (
    <CenteredShell>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700, textAlign: 'center', color: 'var(--d-primary)', margin: 0 }}>New Password</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="pw">NEW PASSWORD</label>
          <input id="pw" type="password" className="d-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="confirm">CONFIRM PASSWORD</label>
          <input id="confirm" type="password" className="d-control" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="********" />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>Reset Password</button>
      </form>
    </CenteredShell>
  );
}
