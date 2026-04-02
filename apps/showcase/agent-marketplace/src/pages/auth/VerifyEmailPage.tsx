import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button, Card } from '@/components';

export function VerifyEmailPage() {
  return (
    <Card className={css('_flex _col _aic _gap6 _textc') + ' carbon-fade-slide'}>
      <div
        className={css('_flex _aic _jcc _rounded')}
        style={{
          width: 64,
          height: 64,
          background: 'color-mix(in srgb, var(--d-primary) 15%, var(--d-surface))',
        }}
      >
        <Mail size={32} style={{ color: 'var(--d-primary)' }} />
      </div>

      <div>
        <h1 className={css('_heading3')}>Check your email</h1>
        <p className={css('_textsm _fgmuted _mt2')} style={{ maxWidth: 320 }}>
          We've sent a verification link to your inbox
        </p>
      </div>

      <Button variant="secondary" className={css('_wfull')}>
        Resend email
      </Button>

      <div className={css('_textsm _fgmuted')}>
        <Link to="/login" className={css('_fgprimary')}>Back to sign in</Link>
      </div>
    </Card>
  );
}
