import { css } from '@decantr/css';
import { FlaskConical, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function PhoneVerifyPage() {
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
        <h1 style={{ fontWeight: 500, fontSize: '1.125rem' }}>Phone verification</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          Enter the code sent to your phone
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 2, background: 'color-mix(in srgb, var(--d-primary) 8%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Smartphone size={24} style={{ color: 'var(--d-primary)' }} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="phone-code">Verification Code</label>
          <input id="phone-code" type="text" className="d-control" placeholder="000000" value={code} onChange={(e) => setCode(e.target.value)} style={{ borderRadius: 2, textAlign: 'center', letterSpacing: '0.3em', fontFamily: 'ui-monospace, monospace' }} maxLength={6} autoFocus />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 2 }}>
          Verify Phone
        </button>
      </form>

      <button className="d-interactive" data-variant="ghost" style={{ width: '100%', justifyContent: 'center', borderRadius: 2, fontSize: '0.8125rem' }}>
        Resend Code
      </button>
    </div>
  );
}
