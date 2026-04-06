import { css } from '@decantr/css';
import { FlaskConical, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function MfaSetupPage() {
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
        <h1 style={{ fontWeight: 500, fontSize: '1.125rem' }}>Set up two-factor auth</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          Scan the QR code with your authenticator app
        </p>
      </div>

      {/* Placeholder QR */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="lab-panel" style={{ width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={48} style={{ color: 'var(--d-border)' }} />
        </div>
      </div>

      <div className="lab-barcode" style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '0.5rem' }}>
        ABCD-EFGH-IJKL-MNOP
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="mfa-code">Verification Code</label>
          <input id="mfa-code" type="text" className="d-control" placeholder="000000" value={code} onChange={(e) => setCode(e.target.value)} style={{ borderRadius: 2, textAlign: 'center', letterSpacing: '0.3em', fontFamily: 'ui-monospace, monospace' }} maxLength={6} autoFocus />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 2 }}>
          Enable Two-Factor
        </button>
      </form>
    </div>
  );
}
