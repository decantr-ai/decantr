import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export function MfaSetupPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate('/mfa-verify');
  }

  return (
    <div className="d-surface carbon-card carbon-fade-slide" style={{ padding: '2rem' }}>
      <div className={css('_flex _col _aic _gap1')} style={{ marginBottom: '1.5rem' }}>
        <ShieldCheck size={24} style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }} />
        <h1 className={css('_fontsemi _textxl')}>Set up 2FA</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Scan the QR code with your authenticator app</p>
      </div>

      {/* Mock QR code */}
      <div className={css('_flex _jcc')} style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            width: 160,
            height: 160,
            background: '#fff',
            borderRadius: 'var(--d-radius)',
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridTemplateRows: 'repeat(8, 1fr)',
            gap: 2,
            padding: 8,
          }}
        >
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} style={{ background: Math.random() > 0.5 ? '#000' : '#fff', borderRadius: 1 }} />
          ))}
        </div>
      </div>

      <div className="carbon-code" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <span className={css('_textsm') + ' mono-data'}>JBSWY3DPEHPK3PXP</span>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')} role="form">
        <div className={css('_flex _col _gap1')}>
          <label className={css('_textsm _fontmedium')}>Verification code</label>
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
          Activate 2FA
        </button>
      </form>
    </div>
  );
}
