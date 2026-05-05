import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    navigate('/login');
  }

  return (
    <CenteredShell>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 className="term-glow" style={{ fontSize: '1rem', textAlign: 'center', color: 'var(--d-primary)', margin: 0 }}>
          $ SET_NEW_PASSWORD
        </h1>
        <label className="d-label">NEW PASSWORD</label>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} style={{ padding: '0.5rem 0.75rem', background: 'var(--d-bg)', border: '1px solid var(--d-border)', borderRadius: 0, color: 'var(--d-text)', fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none' }} />
        <label className="d-label">CONFIRM</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={{ padding: '0.5rem 0.75rem', background: 'var(--d-bg)', border: '1px solid var(--d-border)', borderRadius: 0, color: 'var(--d-text)', fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none' }} />
        <button type="submit" className="d-interactive" data-variant="primary" style={{ padding: '0.5rem', borderRadius: 0 }}>Update Password</button>
        <Link to="/login" style={{ color: 'var(--d-accent)', fontSize: '0.75rem', textAlign: 'center' }}>&larr; Back to login</Link>
      </form>
    </CenteredShell>
  );
}
