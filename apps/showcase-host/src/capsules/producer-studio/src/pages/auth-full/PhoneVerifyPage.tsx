import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';
import { useAuth } from '@/hooks/useAuth';

export function PhoneVerifyPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [code, setCode] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login();
    navigate('/session');
  }

  return (
    <CenteredShell>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700, textAlign: 'center', color: 'var(--d-primary)', margin: 0 }}>Phone Verification</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>Enter the code sent to your phone</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="code">SMS CODE</label>
          <input id="code" className="d-control" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" maxLength={6} style={{ textAlign: 'center', letterSpacing: '0.25em', fontSize: '1.25rem' }} />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>Verify Phone</button>
        <button type="button" className="d-interactive" data-variant="ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem' }}>Resend Code</button>
      </form>
    </CenteredShell>
  );
}
