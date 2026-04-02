import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button, Card, Input } from '@/components';

export function MfaSetupPage() {
  return (
    <Card className={css('_flex _col _gap6') + ' carbon-fade-slide'}>
      <div className={css('_textc')}>
        <h1 className={css('_heading3')}>Set up two-factor authentication</h1>
        <p className={css('_textsm _fgmuted _mt1')}>
          Scan this QR code with your authenticator app
        </p>
      </div>

      <div className={css('_flex _col _aic _gap4')}>
        <div
          className={css('_flex _aic _jcc _rounded')}
          style={{
            width: 160,
            height: 160,
            background: 'var(--d-surface-raised)',
            border: '1px dashed var(--d-border)',
          }}
        >
          <Shield size={48} style={{ color: 'var(--d-muted)' }} />
        </div>

        <code
          className={css('_textsm _fgmuted')}
          style={{
            fontFamily: 'monospace',
            letterSpacing: '0.08em',
            padding: '8px 16px',
            background: 'var(--d-surface-raised)',
            borderRadius: 'var(--d-radius-sm)',
          }}
        >
          AGNT-HUB2-FA3K-EY42
        </code>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="Verification code" placeholder="000 000" autoComplete="one-time-code" />

        <Button variant="primary" type="submit" className={css('_wfull')}>
          Verify and enable
        </Button>
      </form>

      <div className={css('_textc _textsm _fgmuted')}>
        <Link to="/chat" className={css('_fgprimary')}>Skip for now</Link>
      </div>
    </Card>
  );
}
