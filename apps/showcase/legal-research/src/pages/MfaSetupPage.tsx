import { css } from '@decantr/css';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function MfaSetupPage() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <ShieldCheck size={40} style={{ color: 'var(--d-primary)', margin: '0 auto 1rem' }} />
        <h1 className="counsel-header" style={{ fontSize: '1.25rem' }}>Set up MFA</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem', fontFamily: 'Georgia, serif' }}>
          Scan the QR code with your authenticator app
        </p>
      </div>
      <div style={{ width: 160, height: 160, margin: '0 auto', background: 'var(--d-surface-raised)', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', display: 'grid', placeItems: 'center' }}>
        <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>QR Code</span>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); login(); navigate('/research'); }} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="mfa-code">Verification Code</label>
          <input id="mfa-code" type="text" className="d-control mono-data" placeholder="000000" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} style={{ textAlign: 'center', letterSpacing: '0.5em' }} autoFocus />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
          Verify & Enable
        </button>
      </form>
    </div>
  );
}
