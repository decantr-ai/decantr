import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

export function MfaVerify() {
  return (
    <div className={css('_flex _col _gap5 _wfull') + ' carbon-card ' + css('_p6') + ' fade-in'}>
      <div className={css('_flex _col _aic _gap3 _textc')}>
        <div
          className={css('_flex _aic _jcc _roundedfull')}
          style={{ width: 64, height: 64, background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)' }}
        >
          <Shield size={28} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 className={'font-mono ' + css('_textxl _fontbold')}>Two-factor verification</h1>
        <p className={'font-mono ' + css('_textsm _fgmuted')}>
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        {/* Code input grid */}
        <div className={css('_grid _gc6 _gap2')}>
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              type="text"
              className="carbon-input font-mono"
              maxLength={1}
              inputMode="numeric"
              style={{ textAlign: 'center', fontSize: '1.5rem', padding: '0.75rem 0' }}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
          Verify <ArrowRight size={16} />
        </button>
      </form>

      <div className="separator" />

      <div className={css('_flex _col _gap2 _textc')}>
        <button type="button" className={'font-mono btn btn-ghost ' + css('_textsm')}>
          Use backup code instead
        </button>
        <Link to="/login" className={'font-mono ' + css('_textxs _fgmuted')}>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
