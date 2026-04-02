import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export function MfaVerifyPage() {
  return (
    <div className={css('_flex _col _gap6 _wfull')}>
      <div className={css('_flex _col _aic _gap3 _textc')}>
        <div
          className={css('_flex _aic _jcc _roundedfull')}
          style={{
            width: '56px',
            height: '56px',
            background: 'rgba(124,147,176,0.12)',
            color: 'var(--d-primary)',
          }}
        >
          <ShieldCheck size={24} />
        </div>
        <h1 className={css('_heading3 _fgtext')}>Enter verification code</h1>
        <p className={css('_textsm _fgmuted')}>
          Open your authenticator app and enter the 6-digit code.
        </p>
      </div>

      <form
        className={css('_flex _col _gap4 _p6 _rounded') + ' carbon-card'}
        onSubmit={(e) => e.preventDefault()}
      >
        <div className={css('_flex _gap2 _jcc')}>
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              className={css('_textc _text2xl _fontbold _rounded _trans') + ' carbon-input'}
              style={{ width: '48px', height: '56px', padding: 0 }}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        <Button variant="primary" icon={<ShieldCheck size={16} />} type="submit" className={css('_wfull _jcc')}>
          Verify
        </Button>

        <p className={css('_textxs _fgmuted _textc')}>
          Lost your authenticator? Use a{' '}
          <button type="button" className={css('_fgprimary _bordernone _bgbg _pointer _textxs')}>
            recovery code
          </button>
          {' '}instead.
        </p>
      </form>

      <Link
        to="/login"
        className={css('_flex _aic _jcc _gap2 _textsm _fontsemi _fgmuted _trans') + ' nav-link'}
      >
        <ArrowLeft size={14} />
        Back to sign in
      </Link>
    </div>
  );
}
