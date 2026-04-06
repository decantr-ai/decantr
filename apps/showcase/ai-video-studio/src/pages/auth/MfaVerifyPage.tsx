import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function MfaVerifyPage() {
  const [code, setCode] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login('mfa@studio.ai', 'mfa');
    navigate('/projects');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Enter verification code</h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>Enter the 6-digit code from your authenticator app</p>
      <input
        className="d-control"
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="000000"
        maxLength={6}
        style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.5rem', fontFamily: "'JetBrains Mono', monospace" }}
      />
      <button className="d-interactive" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
        Verify
      </button>
    </form>
  );
}
