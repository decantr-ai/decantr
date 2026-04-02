import { css } from '@decantr/css';
import { Shield, Smartphone } from 'lucide-react';
import { AuthForm } from '../../components/AuthForm';

export function MfaSetup() {
  return (
    <div className={css('_flex _col _gap4')}>
      <div className={css('_flex _col _aic _gap2 _textc')}>
        <div className="status-ring" data-status="active" style={{ width: '48px', height: '48px' }}>
          <Shield size={22} />
        </div>
        <h1 className={css('_textxl _fontsemi') + ' mono-data neon-text-glow'}>
          Setup 2FA
        </h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.7 }}>
          Scan the QR code with your authenticator app, then enter the verification code.
        </p>
      </div>

      {/* QR code placeholder */}
      <div
        className={css('_flex _aic _jcc _p4 _rounded')}
        style={{ background: '#fff', margin: '0 auto', width: '180px', height: '180px' }}
      >
        <div
          className={css('_flex _col _aic _gap2')}
          style={{ color: '#18181B' }}
        >
          <Smartphone size={32} />
          <span className={css('_textxs') + ' mono-data'}>QR Code</span>
        </div>
      </div>

      <div className={css('_flex _aic _gap2 _p3 _rounded') + ' carbon-code'}>
        <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
          Manual key: JBSW-Y3DP-EHPK-3PXP
        </span>
      </div>

      <AuthForm
        title=""
        fields={[
          { name: 'code', label: 'Verification Code', type: 'text', placeholder: '000000', required: true },
        ]}
        submitLabel="Verify & Enable 2FA"
        footerLinks={[
          { label: 'Skip for now', to: '/agents' },
        ]}
      />
    </div>
  );
}
