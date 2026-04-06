import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { ShieldCheck } from 'lucide-react';

export function MfaVerifyPage() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate('/engage');
  }

  return (
    <form onSubmit={handleSubmit} className="gov-form" role="form" aria-label="Verify MFA code">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 2,
          background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <ShieldCheck size={24} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>Verify Code</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <div className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap1')}>
          <label htmlFor="code" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Verification Code</label>
          <input id="code" type="text" className="d-control gov-input" placeholder="000000" value={code} onChange={e => setCode(e.target.value)} maxLength={6} required style={{ textAlign: 'center', letterSpacing: '0.25em', fontSize: '1.25rem' }} />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>
          Verify
        </button>
      </div>
    </form>
  );
}
