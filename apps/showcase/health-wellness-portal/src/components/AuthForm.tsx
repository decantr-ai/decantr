import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset' | 'verify-email' | 'mfa-setup' | 'mfa-verify' | 'phone-verify';

interface AuthFormProps {
  mode: AuthMode;
}

const titles: Record<AuthMode, string> = {
  login: 'Welcome back to Evergreen',
  register: 'Create your Evergreen account',
  forgot: 'Reset your password',
  reset: 'Choose a new password',
  'verify-email': 'Verify your email',
  'mfa-setup': 'Set up two-factor authentication',
  'mfa-verify': 'Enter your verification code',
  'phone-verify': 'Verify your phone number',
};

const subtitles: Record<AuthMode, string> = {
  login: 'Access your health portal and care team',
  register: 'Join thousands of patients taking charge of their care',
  forgot: 'We will email you a secure reset link',
  reset: 'Choose something strong and memorable',
  'verify-email': 'Check your inbox for a 6-digit code',
  'mfa-setup': 'Scan the QR code with your authenticator app',
  'mfa-verify': 'Enter the 6-digit code from your authenticator',
  'phone-verify': 'Enter the code we texted you',
};

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('amelia.rivera@evergreen.care');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'login') {
      login(email, password);
      navigate('/dashboard');
    } else if (mode === 'register') {
      register(email, password, name);
      navigate('/verify-email');
    } else if (mode === 'forgot') {
      navigate('/reset-password');
    } else if (mode === 'reset') {
      navigate('/login');
    } else if (mode === 'verify-email') {
      navigate('/mfa-setup');
    } else if (mode === 'mfa-setup') {
      navigate('/mfa-verify');
    } else if (mode === 'mfa-verify') {
      navigate('/phone-verify');
    } else if (mode === 'phone-verify') {
      login(email, password);
      navigate('/dashboard');
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--d-radius)',
          background: 'linear-gradient(135deg, var(--d-primary), var(--d-secondary))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }} aria-hidden>
          <Heart size={24} color="#fff" fill="#fff" />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em' }}>{titles[mode]}</h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--d-text-muted)', marginTop: '0.375rem', lineHeight: 1.5 }}>
          {subtitles[mode]}
        </p>
      </div>

      {(mode === 'login' || mode === 'register') && (
        <>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="d-interactive" style={{ flex: 1, justifyContent: 'center', padding: '0.625rem' }}>Apple</button>
            <button type="button" className="d-interactive" style={{ flex: 1, justifyContent: 'center', padding: '0.625rem' }}>Google</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
          </div>
        </>
      )}

      {mode === 'register' && (
        <div>
          <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Full name</label>
          <input id="name" className="d-control" type="text" placeholder="Amelia Rivera" value={name} onChange={e => setName(e.target.value)} />
        </div>
      )}

      {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
        <div>
          <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Email address</label>
          <input id="email" className="d-control" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
      )}

      {(mode === 'login' || mode === 'register' || mode === 'reset') && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.375rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {mode === 'reset' ? 'New password' : 'Password'}
            </label>
            {mode === 'login' && (
              <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
            )}
          </div>
          <input id="password" className="d-control" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
      )}

      {(mode === 'verify-email' || mode === 'mfa-verify' || mode === 'phone-verify') && (
        <div>
          <label htmlFor="code" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
            {mode === 'verify-email' ? 'Email verification code' : mode === 'phone-verify' ? 'Text message code' : 'Authenticator code'}
          </label>
          <input
            id="code"
            className="d-control"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            style={{ fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', fontSize: '1.5rem', letterSpacing: '0.35em', textAlign: 'center' }}
          />
        </div>
      )}

      {mode === 'mfa-setup' && (
        <div style={{
          padding: '1.25rem',
          background: 'var(--d-surface-raised)',
          border: '1px solid var(--d-border)',
          borderRadius: 'var(--d-radius-lg)',
          textAlign: 'center',
        }}>
          <div style={{
            width: 160,
            height: 160,
            margin: '0 auto 0.875rem',
            background: '#fff',
            borderRadius: 'var(--d-radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'repeating-linear-gradient(0deg, #0F172A 0 4px, #fff 4px 8px), repeating-linear-gradient(90deg, #0F172A 0 4px, #fff 4px 8px)',
            backgroundBlendMode: 'difference',
            border: '1px solid var(--d-border)',
          }} aria-hidden />
          <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', letterSpacing: '0.08em' }}>
            EVGR-HIPA-JBSW-Y3DP
          </div>
        </div>
      )}

      <button className="hw-button-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
        {mode === 'login' && 'Sign In'}
        {mode === 'register' && 'Create Account'}
        {mode === 'forgot' && 'Send Reset Link'}
        {mode === 'reset' && 'Update Password'}
        {mode === 'verify-email' && 'Verify Email'}
        {mode === 'mfa-setup' && 'Continue'}
        {mode === 'mfa-verify' && 'Verify'}
        {mode === 'phone-verify' && 'Verify Phone'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
        {mode === 'login' && (
          <>New to Evergreen? <Link to="/register" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 600 }}>Create an account</Link></>
        )}
        {mode === 'register' && (
          <>Already a member? <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link></>
        )}
        {(mode === 'forgot' || mode === 'reset') && (
          <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 600 }}>Back to sign in</Link>
        )}
        {(mode === 'verify-email' || mode === 'mfa-setup' || mode === 'mfa-verify' || mode === 'phone-verify') && (
          <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 600 }}>Cancel setup</Link>
        )}
      </p>
    </form>
  );
}
