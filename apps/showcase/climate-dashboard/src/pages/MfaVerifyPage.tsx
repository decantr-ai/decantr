import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function MfaVerifyPage() {
  const [code, setCode] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login('user@example.com', 'pass');
    navigate('/emissions');
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Shield size={24} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>Two-factor authentication</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Enter the 6-digit code from your authenticator</p>
      </div>
      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <input className="d-control earth-input" type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="000000" maxLength={6} style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.25rem' }} />
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
          Verify
        </button>
      </form>
    </div>
  );
}
