import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../App';

export function MfaVerifyPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [code, setCode] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login();
    navigate('/agents');
  }

  return (
    <div className="d-surface carbon-card carbon-fade-slide" style={{ padding: '2rem' }}>
      <div className={css('_flex _col _aic _gap1')} style={{ marginBottom: '1.5rem' }}>
        <ShieldCheck size={24} style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }} />
        <h1 className={css('_fontsemi _textxl')}>Two-factor verification</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Enter the code from your authenticator app</p>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')} role="form">
        <div className={css('_flex _col _gap1')}>
          <label className={css('_textsm _fontmedium')}>Authentication code</label>
          <input
            className="d-control carbon-input mono-data"
            type="text"
            placeholder="000000"
            value={code}
            onChange={e => setCode(e.target.value)}
            maxLength={6}
            style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem' }}
          />
        </div>
        <button className="d-interactive neon-glow-hover" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
          Verify
        </button>
      </form>

      <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', marginTop: '1.5rem' }}>
        Lost your device? <button style={{ color: 'var(--d-accent)', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 'inherit' }}>Use recovery code</button>
      </p>
    </div>
  );
}
