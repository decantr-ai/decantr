import { css } from '@decantr/css';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function MfaVerifyPage() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <ShieldCheck size={40} style={{ color: 'var(--d-primary)', margin: '0 auto 1rem' }} />
        <h1 className="counsel-header" style={{ fontSize: '1.25rem' }}>Two-factor authentication</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem', fontFamily: 'Georgia, serif' }}>
          Enter the code from your authenticator app
        </p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); login(); navigate('/research'); }} className={css('_flex _col _gap4')}>
        <input type="text" className="d-control mono-data" placeholder="000000" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem' }} autoFocus />
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
          Verify
        </button>
      </form>
      <p className={css('_textsm')} style={{ textAlign: 'center', color: 'var(--d-text-muted)' }}>
        <a href="#/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Use a different method</a>
      </p>
    </div>
  );
}
