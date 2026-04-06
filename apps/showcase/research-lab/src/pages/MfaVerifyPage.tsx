import { css } from '@decantr/css';
import { FlaskConical } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function MfaVerifyPage() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/notebook');
  };

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div className={css('_flex _center')} style={{ marginBottom: '0.75rem' }}>
          <FlaskConical size={24} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 style={{ fontWeight: 500, fontSize: '1.125rem' }}>Two-factor verification</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          Enter the code from your authenticator app
        </p>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="mfa-verify-code">6-digit code</label>
          <input id="mfa-verify-code" type="text" className="d-control" placeholder="000000" value={code} onChange={(e) => setCode(e.target.value)} style={{ borderRadius: 2, textAlign: 'center', letterSpacing: '0.3em', fontFamily: 'ui-monospace, monospace', fontSize: '1.25rem' }} maxLength={6} autoFocus />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 2 }}>
          Verify
        </button>
      </form>

      <a href="#/login" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem', textAlign: 'center' }}>
        Use a different method
      </a>
    </div>
  );
}
