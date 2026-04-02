import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { Phone, ArrowRight } from 'lucide-react';

export function PhoneVerifyPage() {
  return (
    <div className={css('_flex _col _gap6 _wfull')}>
      <div className={css('_flex _col _aic _gap4 _textc')}>
        <div
          className={css('_flex _aic _jcc _roundedfull')}
          style={{
            width: '64px',
            height: '64px',
            background: 'rgba(124,147,176,0.12)',
            color: 'var(--d-primary)',
          }}
        >
          <Phone size={28} />
        </div>
        <h1 className={css('_heading3 _fgtext')}>Verify your phone</h1>
        <p className={css('_textsm _fgmuted')} style={{ maxWidth: '340px' }}>
          Enter the 6-digit code we sent to your phone number to complete verification.
        </p>
      </div>

      <form
        className={css('_flex _col _gap4 _p6 _rounded') + ' carbon-card'}
        onSubmit={(e) => e.preventDefault()}
      >
        <InputField
          label="Verification code"
          type="text"
          placeholder="000000"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
        />
        <Button variant="primary" type="submit" icon={<ArrowRight size={16} />} className={css('_wfull _jcc')}>
          Verify phone
        </Button>
      </form>

      <p className={css('_textsm _fgmuted _textc')}>
        Did not receive the code?{' '}
        <button
          type="button"
          className={css('_fontsemi _fgprimary _bordernone _bgbg _pointer _trans')}
          style={{ background: 'transparent' }}
        >
          Resend code
        </button>
      </p>

      <Link
        to="/login"
        className={css('_textsm _fgmuted _textc _fontsemi _trans') + ' nav-link'}
      >
        Back to sign in
      </Link>
    </div>
  );
}
