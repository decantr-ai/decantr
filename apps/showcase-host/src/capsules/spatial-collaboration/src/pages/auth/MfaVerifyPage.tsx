import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useState } from 'react';

export function MfaVerifyPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate('/');
  }

  return (
    <div className="d-surface carbon-card carbon-fade-slide" style={{ padding: '2rem' }}>
      <div className={css('_flex _col _aic _gap1')} style={{ marginBottom: '1.5rem' }}>
        <Layers size={24} style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }} />
        <h1 className={css('_fontsemi _textxl')}>Enter verification code</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Open your authenticator app and enter the 6-digit code</p>
      </div>

      {/* Mock QR code area */}
      <div className={css('_flex _jcc')} style={{ marginBottom: '1.5rem' }}>
        <div style={{
          width: 160, height: 160, borderRadius: 'var(--d-radius)',
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0.75rem',
        }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: 4,
            background: `repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 12px 12px`,
          }} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')} role="form">
        <div className={css('_flex _col _gap1')}>
          <label className={css('_textsm _fontmedium')}>Verification Code</label>
          <input
            className="d-control carbon-input"
            placeholder="000000"
            value={code}
            onChange={e => setCode(e.target.value)}
            maxLength={6}
            style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem', fontFamily: 'ui-monospace, monospace' }}
          />
        </div>
        <button className="d-interactive" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
          Verify
        </button>
      </form>
    </div>
  );
}
