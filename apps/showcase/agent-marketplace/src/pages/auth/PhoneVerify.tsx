import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight, RefreshCw } from 'lucide-react';

export function PhoneVerify() {
  return (
    <div className={css('_flex _col _gap5 _wfull') + ' carbon-card ' + css('_p6') + ' fade-in'}>
      <div className={css('_flex _col _aic _gap3 _textc')}>
        <div
          className={css('_flex _aic _jcc _roundedfull') + ' neon-glow'}
          style={{ width: 64, height: 64, background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)' }}
        >
          <Phone size={28} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 className={'font-mono ' + css('_textxl _fontbold')}>Phone verification</h1>
        <p className={'font-mono ' + css('_textsm _fgmuted')}>
          Enter the code sent to <span style={{ color: 'var(--d-text)' }}>+1 (***) ***-4829</span>
        </p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
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
          Verify Phone <ArrowRight size={16} />
        </button>
      </form>

      <div className={css('_flex _aic _jcc _gap2')}>
        <span className={'font-mono ' + css('_textxs _fgmuted')}>
          Did not receive the code?
        </span>
        <button type="button" className="btn btn-ghost btn-sm">
          <RefreshCw size={12} />
          <span className="font-mono">Resend</span>
        </button>
      </div>

      <Link to="/login" className={'font-mono ' + css('_textxs _fgmuted _textc')}>
        Back to sign in
      </Link>
    </div>
  );
}
