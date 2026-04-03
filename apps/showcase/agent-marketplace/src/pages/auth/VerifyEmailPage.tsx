import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Mail } from 'lucide-react';

export function VerifyEmailPage() {
  const [code, setCode] = useState('');

  return (
    <form
      className={css('_flex _col _gap4')}
      onSubmit={(e) => e.preventDefault()}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--d-text)', margin: 0 }}>
        Verify Email
      </h1>

      <div className={css('_flex _col _aic _gap2')}>
        <Mail size={32} style={{ color: 'var(--d-accent)' }} />
        <p
          className="d-annotation"
          style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5, textAlign: 'center' }}
        >
          A 6-digit verification code was sent to your inbox. Check spam if it does not arrive
          within a few minutes.
        </p>
      </div>

      {/* Code input */}
      <div className={css('_flex _col _gap1')}>
        <label className="d-label" htmlFor="verify-code">
          Verification Code
        </label>
        <input
          id="verify-code"
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
        Verify
      </button>

      {/* Resend */}
      <p
        className="d-annotation"
        style={{ textAlign: 'center', margin: 0, fontSize: '0.8125rem' }}
      >
        <Link to="#" style={{ color: 'var(--d-accent)' }}>
          Resend code
        </Link>
      </p>
    </form>
  );
}
