import { css } from '@decantr/css';
import { Mail } from 'lucide-react';
import { AuthForm, AuthLink } from '../../components/AuthForm';

export function VerifyEmail() {
  return (
    <AuthForm
      title="Verify Your Email"
      description="We've sent a verification link to your email address."
      submitLabel="Resend Email"
      footer={
        <>
          Wrong email?{' '}
          <AuthLink to="/register">Go back</AuthLink>
        </>
      }
    >
      <div className={css('_flex _col _aic _gap3 _py4')} style={{ color: 'var(--d-text-muted)' }}>
        <Mail size={48} style={{ opacity: 0.4 }} />
        <p className={css('_textsm _textc')}>
          Check your inbox and click the verification link to activate your account.
        </p>
      </div>
    </AuthForm>
  );
}
