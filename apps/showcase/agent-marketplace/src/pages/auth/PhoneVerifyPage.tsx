import { useState } from 'react';
import { css } from '@decantr/css';
import { Smartphone } from 'lucide-react';

export function PhoneVerifyPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  return (
    <form
      className={css('_flex _col _gap4')}
      onSubmit={(e) => e.preventDefault()}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--d-text)', margin: 0 }}>
        Phone Verification
      </h1>

      {/* Phone number */}
      <div className={css('_flex _col _gap1')}>
        <label className="d-label" htmlFor="phone-number">
          Phone Number
        </label>
        <div className={css('_flex _aic _gap2')}>
          <span
            className="d-control carbon-input mono-data"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4.5rem',
              flexShrink: 0,
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--d-text-muted)',
            }}
          >
            +1
          </span>
          <div className={css('_flex _aic')} style={{ position: 'relative', flex: 1 }}>
            <Smartphone
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                color: 'var(--d-text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              id="phone-number"
              type="tel"
              className="d-control carbon-input"
              placeholder="(555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
      </div>

      {/* Send Code */}
      <button
        type="button"
        className="d-interactive neon-glow"
        style={{ width: '100%' }}
        onClick={() => setCodeSent(true)}
      >
        Send Code
      </button>

      {/* Verification code (always visible) */}
      <div className={css('_flex _col _gap1')}>
        <label className="d-label" htmlFor="phone-code">
          Verification Code
        </label>
        <input
          id="phone-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          className="d-control carbon-input mono-data"
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          disabled={!codeSent}
          style={{
            width: '100%',
            textAlign: 'center',
            fontSize: '1.5rem',
            letterSpacing: '0.5em',
            opacity: codeSent ? 1 : 0.5,
          }}
        />
      </div>

      {/* Verify */}
      <button
        type="submit"
        className="d-interactive neon-glow"
        style={{ width: '100%', opacity: codeSent ? 1 : 0.5 }}
        disabled={!codeSent}
      >
        Verify
      </button>
    </form>
  );
}
