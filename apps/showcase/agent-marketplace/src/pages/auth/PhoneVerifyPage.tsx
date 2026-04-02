import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Button, Card, Input } from '@/components';

export function PhoneVerifyPage() {
  return (
    <Card className={css('_flex _col _gap6') + ' carbon-fade-slide'}>
      <div className={css('_textc')}>
        <h1 className={css('_heading3')}>Verify your phone</h1>
        <p className={css('_textsm _fgmuted _mt1')}>Enter the code sent to your phone number</p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="Verification code" placeholder="000 000" autoComplete="one-time-code" />

        <Button variant="primary" type="submit" className={css('_wfull')}>
          Verify phone
        </Button>
      </form>

      <Button variant="secondary" className={css('_wfull')}>
        Resend code
      </Button>

      <div className={css('_textc _textsm _fgmuted')}>
        <Link to="/login" className={css('_fgprimary')}>Back to sign in</Link>
      </div>
    </Card>
  );
}
