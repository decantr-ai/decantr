import { css } from '@decantr/css';
import { useState, useRef, type FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

type AuthVariant =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'verify-email'
  | 'mfa-setup'
  | 'mfa-verify'
  | 'phone-verify';

interface AuthFormProps {
  variant: AuthVariant;
  onSubmit?: (email: string, password: string) => Promise<void>;
}

export function AuthForm({ variant, onSubmit }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shakeFields, setShakeFields] = useState<Set<string>>(new Set());
  const [phoneSent, setPhoneSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function triggerShake(fields: string[]) {
    setShakeFields(new Set(fields));
    setTimeout(() => setShakeFields(new Set()), 300);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);

    if (variant === 'login' || variant === 'register') {
      const email = (data.get('email') as string) || '';
      const password = (data.get('password') as string) || '';
      const empty: string[] = [];
      if (!email) empty.push('email');
      if (!password) empty.push('password');
      if (variant === 'register') {
        if (!data.get('name')) empty.push('name');
        if (!data.get('confirm-password')) empty.push('confirm-password');
      }
      if (empty.length > 0) {
        triggerShake(empty);
        return;
      }
      setLoading(true);
      try {
        if (onSubmit) await onSubmit(email, password);
      } finally {
        setLoading(false);
      }
      return;
    }

    // All other variants: simulate success
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);
  }

  function shakeClass(field: string) {
    return shakeFields.has(field) ? ' auth-shake' : '';
  }

  if (success) {
    return (
      <div className={css('_flex _col _aic _gap4 _p6') + ' d-surface carbon-card auth-card carbon-fade-slide'}>
        <div className="mono-data neon-text-glow" style={{ color: 'var(--d-accent)', fontSize: '1.5rem' }}>
          AgentMKT
        </div>
        <p style={{ color: 'var(--d-text)', textAlign: 'center' }}>
          {variant === 'forgot-password' && 'Reset link sent. Check your email.'}
          {variant === 'reset-password' && 'Password reset successfully.'}
          {variant === 'verify-email' && 'Email verified successfully.'}
          {variant === 'mfa-setup' && '2FA activated successfully.'}
          {variant === 'mfa-verify' && 'Verified successfully.'}
          {variant === 'phone-verify' && 'Phone verified successfully.'}
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={css('_flex _col _gap4 _p6') + ' d-surface carbon-card auth-card'}
      role="form"
      noValidate
    >
      <div className={css('_flex _col _aic _gap1')}>
        <div className="mono-data neon-text-glow" style={{ color: 'var(--d-accent)', fontSize: '1.5rem' }}>
          AgentMKT
        </div>
      </div>

      {variant === 'login' && <LoginFields shakeClass={shakeClass} loading={loading} />}
      {variant === 'register' && <RegisterFields shakeClass={shakeClass} loading={loading} />}
      {variant === 'forgot-password' && <ForgotPasswordFields loading={loading} />}
      {variant === 'reset-password' && <ResetPasswordFields loading={loading} />}
      {variant === 'verify-email' && <VerifyEmailFields loading={loading} />}
      {variant === 'mfa-setup' && <MfaSetupFields loading={loading} />}
      {variant === 'mfa-verify' && <MfaVerifyFields loading={loading} />}
      {variant === 'phone-verify' && <PhoneVerifyFields loading={loading} phoneSent={phoneSent} onSendCode={() => setPhoneSent(true)} />}

      <style>{`
        .auth-card { max-width: 28rem; width: 100%; }
        .auth-shake { animation: shake 300ms ease-out; }
        .auth-link { color: var(--d-accent); background: none; border: none; cursor: pointer; font-size: 0.875rem; padding: 0; text-decoration: none; }
        .auth-link:hover { text-decoration: underline; }
        .auth-divider { display: flex; align-items: center; gap: 0.75rem; color: var(--d-text-muted); font-size: 0.75rem; }
        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--d-border); }
        .auth-oauth-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.5rem 1rem; border: 1px solid var(--d-border); border-radius: 6px; background: transparent; color: var(--d-text); cursor: pointer; font-size: 0.875rem; transition: border-color 150ms; }
        .auth-oauth-btn:hover { border-color: var(--d-text-muted); }
        .auth-qr-placeholder { display: flex; align-items: center; justify-content: center; width: 12rem; height: 12rem; border: 1px dashed var(--d-border); border-radius: 8px; color: var(--d-text-muted); font-size: 0.75rem; text-align: center; margin: 0 auto; }
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </form>
  );
}

function OAuthButtons() {
  return (
    <>
      <div className="auth-divider">or continue with</div>
      <div className={css('_flex _gap2')}>
        <button type="button" className="auth-oauth-btn" style={{ flex: 1 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </button>
        <button type="button" className="auth-oauth-btn" style={{ flex: 1 }}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </button>
      </div>
    </>
  );
}

function LoginFields({ shakeClass, loading }: { shakeClass: (f: string) => string; loading: boolean }) {
  return (
    <>
      <div className={shakeClass('email')}>
        <Input label="Email" name="email" type="email" placeholder="operator@agency.dev" autoComplete="email" />
      </div>
      <div className={shakeClass('password')}>
        <Input label="Password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" />
      </div>
      <div className={css('_flex _jce')}>
        <a href="#/forgot-password" className="auth-link">Forgot password?</a>
      </div>
      <Button variant="primary" type="submit" fullWidth disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      <OAuthButtons />
      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
        Don&apos;t have an account?{' '}
        <a href="#/register" className="auth-link">Register</a>
      </p>
    </>
  );
}

function RegisterFields({ shakeClass, loading }: { shakeClass: (f: string) => string; loading: boolean }) {
  return (
    <>
      <div className={shakeClass('name')}>
        <Input label="Name" name="name" type="text" placeholder="Operator" autoComplete="name" />
      </div>
      <div className={shakeClass('email')}>
        <Input label="Email" name="email" type="email" placeholder="operator@agency.dev" autoComplete="email" />
      </div>
      <div className={shakeClass('password')}>
        <Input label="Password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" />
      </div>
      <div className={shakeClass('confirm-password')}>
        <Input label="Confirm Password" name="confirm-password" type="password" placeholder="••••••••" autoComplete="new-password" />
      </div>
      <Button variant="primary" type="submit" fullWidth disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
      <OAuthButtons />
      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
        Already have an account?{' '}
        <a href="#/login" className="auth-link">Sign In</a>
      </p>
    </>
  );
}

function ForgotPasswordFields({ loading }: { loading: boolean }) {
  return (
    <>
      <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <Input label="Email" name="email" type="email" placeholder="operator@agency.dev" autoComplete="email" />
      <Button variant="primary" type="submit" fullWidth disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>
      <div style={{ textAlign: 'center' }}>
        <a href="#/login" className="auth-link">Back to Sign In</a>
      </div>
    </>
  );
}

function ResetPasswordFields({ loading }: { loading: boolean }) {
  return (
    <>
      <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
        Enter your new password.
      </p>
      <Input label="Password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" />
      <Input label="Confirm Password" name="confirm-password" type="password" placeholder="••••••••" autoComplete="new-password" />
      <Button variant="primary" type="submit" fullWidth disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </>
  );
}

function VerifyEmailFields({ loading }: { loading: boolean }) {
  return (
    <>
      <h2 style={{ color: 'var(--d-text)', textAlign: 'center', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
        Check your email
      </h2>
      <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
        We sent a 6-digit verification code to your email.
      </p>
      <Input label="Verification Code" name="code" type="text" placeholder="000000" maxLength={6} inputMode="numeric" autoComplete="one-time-code" style={{ textAlign: 'center', letterSpacing: '0.5em', fontFamily: 'var(--d-font-mono, monospace)' }} />
      <Button variant="primary" type="submit" fullWidth disabled={loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </Button>
      <div style={{ textAlign: 'center' }}>
        <button type="button" className="auth-link">Resend code</button>
      </div>
    </>
  );
}

function MfaSetupFields({ loading }: { loading: boolean }) {
  return (
    <>
      <h2 style={{ color: 'var(--d-text)', textAlign: 'center', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
        Set up 2FA
      </h2>
      <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
        Scan the QR code with your authenticator app, then enter the code below.
      </p>
      <div className="auth-qr-placeholder">Scan with authenticator app</div>
      <Input label="Verification Code" name="code" type="text" placeholder="000000" maxLength={6} inputMode="numeric" autoComplete="one-time-code" style={{ textAlign: 'center', letterSpacing: '0.5em', fontFamily: 'var(--d-font-mono, monospace)' }} />
      <Button variant="primary" type="submit" fullWidth disabled={loading}>
        {loading ? 'Activating...' : 'Activate'}
      </Button>
    </>
  );
}

function MfaVerifyFields({ loading }: { loading: boolean }) {
  return (
    <>
      <h2 style={{ color: 'var(--d-text)', textAlign: 'center', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
        Two-factor authentication
      </h2>
      <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
        Enter the 6-digit code from your authenticator app.
      </p>
      <Input label="Verification Code" name="code" type="text" placeholder="000000" maxLength={6} inputMode="numeric" autoComplete="one-time-code" style={{ textAlign: 'center', letterSpacing: '0.5em', fontFamily: 'var(--d-font-mono, monospace)' }} />
      <Button variant="primary" type="submit" fullWidth disabled={loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </Button>
      <div style={{ textAlign: 'center' }}>
        <button type="button" className="auth-link">Use backup code</button>
      </div>
    </>
  );
}

function PhoneVerifyFields({ loading, phoneSent, onSendCode }: { loading: boolean; phoneSent: boolean; onSendCode: () => void }) {
  return (
    <>
      <h2 style={{ color: 'var(--d-text)', textAlign: 'center', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
        Verify phone number
      </h2>
      {!phoneSent ? (
        <>
          <Input label="Phone Number" name="phone" type="tel" placeholder="+1 (555) 000-0000" autoComplete="tel" />
          <Button variant="primary" type="button" fullWidth disabled={loading} onClick={onSendCode}>
            Send Code
          </Button>
        </>
      ) : (
        <>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
            Enter the code sent to your phone.
          </p>
          <Input label="Verification Code" name="code" type="text" placeholder="000000" maxLength={6} inputMode="numeric" autoComplete="one-time-code" style={{ textAlign: 'center', letterSpacing: '0.5em', fontFamily: 'var(--d-font-mono, monospace)' }} />
          <Button variant="primary" type="submit" fullWidth disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </>
      )}
    </>
  );
}
