import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useState } from 'react';

export function PhoneVerifyPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setCodeSent(true);
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    navigate('/');
  }

  return (
    <div className="d-surface carbon-card carbon-fade-slide" style={{ padding: '2rem' }}>
      <div className={css('_flex _col _aic _gap1')} style={{ marginBottom: '1.5rem' }}>
        <Layers size={24} style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }} />
        <h1 className={css('_fontsemi _textxl')}>Phone verification</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
          {codeSent ? 'Enter the code sent to your phone' : 'Enter your phone number to receive a verification code'}
        </p>
      </div>

      {!codeSent ? (
        <form onSubmit={handleSendCode} className={css('_flex _col _gap4')} role="form">
          <div className={css('_flex _col _gap1')}>
            <label className={css('_textsm _fontmedium')}>Phone Number</label>
            <input className="d-control carbon-input" type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <button className="d-interactive" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
            Send Code
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className={css('_flex _col _gap4')} role="form">
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
          <button
            className="d-interactive"
            data-variant="ghost"
            type="button"
            onClick={() => setCodeSent(false)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Use a different number
          </button>
        </form>
      )}
    </div>
  );
}
