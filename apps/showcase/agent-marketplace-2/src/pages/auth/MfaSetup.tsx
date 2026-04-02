import { css } from '@decantr/css';
import { Shield } from 'lucide-react';
import { AuthForm, FormField, AuthLink } from '../../components/AuthForm';

export function MfaSetup() {
  return (
    <AuthForm
      title="Set Up MFA"
      description="Secure your account with two-factor authentication."
      submitLabel="Enable MFA"
      footer={
        <>
          <AuthLink to="/agents">Skip for now</AuthLink>
        </>
      }
    >
      <div className={css('_flex _col _aic _gap3 _py4')}>
        <div
          className="neon-glow"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: 'var(--d-radius)',
            background: 'var(--d-surface-raised)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Shield size={48} style={{ color: 'var(--d-accent)', opacity: 0.5 }} />
        </div>
        <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)' }}>
          Scan this QR code with your authenticator app.
        </p>
      </div>
      <FormField label="Verification Code" placeholder="Enter 6-digit code" />
    </AuthForm>
  );
}
