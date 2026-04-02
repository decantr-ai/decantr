import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { Button, Card, Input } from '@/components';

export function PhoneVerifyPage() {
  return (
    <Card className={css('_flex _col _gap6') + ' carbon-fade-slide'}>
      <div className={css('_textc')}>
        <div className={css('_flex _jcc _mb3')}>
          <div
            className={css('_flex _aic _jcc _rounded')}
            style={{
              width: 48,
              height: 48,
              background: 'color-mix(in srgb, var(--d-primary) 15%, var(--d-surface))',
            }}
          >
            <Smartphone size={24} style={{ color: 'var(--d-primary)' }} />
          </div>
        </div>
        <h1 className={css('_heading3')}>Verify your phone</h1>
        <p className={css('_textsm _fgmuted _mt1')}>
          We've sent a verification code to your phone number.
        </p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="Verification code" placeholder="000 000" autoComplete="one-time-code" />
        <Button variant="primary" type="submit" className={css('_wfull')}>
          Verify phone
        </Button>
      </form>

      <div className={css('_flex _col _aic _gap2 _textsm _fgmuted')}>
        <button className={css('_fgprimary _pointer') + ' btn-ghost'} style={{ border: 'none', background: 'none', padding: 0, fontSize: 'inherit' }}>
          Resend code
        </button>
        <Link to="/login" className={css('_fgmuted')}>Back to sign in</Link>
      </div>
    </Card>
  );
}
