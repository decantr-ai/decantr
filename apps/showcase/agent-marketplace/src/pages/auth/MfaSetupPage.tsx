import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export function MfaSetupPage() {
  const [code, setCode] = useState('');

  return (
    <form
      className={css('_flex _col _gap4')}
      onSubmit={(e) => e.preventDefault()}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--d-text)', margin: 0 }}>
        Two-Factor Setup
      </h1>

      {/* QR Code placeholder */}
      <div className={css('_flex _jcc')}>
        <div
          className="d-surface"
          style={{
            width: 160,
            height: 160,
            borderRadius: 'var(--d-radius-md)',
            border: '1px solid var(--d-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldCheck size={40} style={{ color: 'var(--d-text-muted)' }} />
        </div>
      </div>

      <p
        className="d-annotation"
        style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5, textAlign: 'center' }}
      >
        Scan this QR code with your authenticator app, then enter the 6-digit code below to
        confirm setup.
      </p>

      {/* Code input */}
      <div className={css('_flex _col _gap1')}>
        <label className="d-label" htmlFor="mfa-setup-code">
          Verification Code
        </label>
        <input
          id="mfa-setup-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          className="d-control carbon-input mono-data"
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          style={{
            width: '100%',
            textAlign: 'center',
            fontSize: '1.5rem',
            letterSpacing: '0.5em',
          }}
        />
      </div>

      {/* Submit */}
      <button type="submit" className="d-interactive neon-glow" style={{ width: '100%' }}>
        Verify & Enable
      </button>

      {/* Back link */}
      <Link
        to="/login"
        className={css('_flex _aic _jcc _gap1') + ' d-annotation'}
        style={{ fontSize: '0.8125rem', color: 'var(--d-accent)' }}
      >
        <ArrowLeft size={14} />
        Back
      </Link>
    </form>
  );
}
