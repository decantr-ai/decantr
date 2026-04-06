import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';
import { useAuth } from '@/hooks/useAuth';

export function MfaSetupPage() {
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
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700, textAlign: 'center', color: 'var(--d-primary)', margin: 0 }}>Setup 2FA</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>Scan the QR code with your authenticator app</p>
        <div style={{ width: 160, height: 160, margin: '0 auto', background: 'var(--d-surface-raised)', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>
          QR Code
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="code">VERIFICATION CODE</label>
          <input id="code" className="d-control" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" maxLength={6} style={{ textAlign: 'center', letterSpacing: '0.25em' }} />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>Verify & Activate</button>
      </form>
    </CenteredShell>
  );
}
