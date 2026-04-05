import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset' | 'verify-email' | 'mfa-setup' | 'mfa-verify' | 'phone-verify';

interface AuthFormProps {
  mode: AuthMode;
}

const titles: Record<AuthMode, string> = {
  login: 'Sign in to Atlas Wealth',
  register: 'Open your account',
  forgot: 'Reset your password',
  reset: 'Choose a new password',
  'verify-email': 'Verify your email',
  'mfa-setup': 'Set up two-factor auth',
  'mfa-verify': 'Enter verification code',
  'phone-verify': 'Verify your phone',
};

const subtitles: Record<AuthMode, string> = {
  login: 'Access your portfolio and accounts',
  register: 'Track your wealth with precision',
  forgot: "We'll send a reset link to your email",
  reset: 'Pick something strong and memorable',
  'verify-email': 'Check your inbox for a 6-digit code',
  'mfa-setup': 'Scan the QR code with your authenticator app',
  'mfa-verify': 'Enter the code from your authenticator',
  'phone-verify': 'Confirm the code sent via SMS',
};

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('morgan@atlaswealth.com');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+1 (415) 555-0142');
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
      navigate('/phone-verify');
    } else if (mode === 'phone-verify') {
      navigate('/mfa-setup');
    } else if (mode === 'mfa-setup') {
      navigate('/mfa-verify');
    } else if (mode === 'mfa-verify') {
      login(email, password);
      navigate('/dashboard');
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--d-radius)',
          background: 'linear-gradient(135deg, var(--d-accent), var(--d-primary))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem',
        }}>
          <Wallet size={20} color="#fff" />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{titles[mode]}</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          {subtitles[mode]}
        </p>
      </div>

      {(mode === 'login' || mode === 'register') && (
        <>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="d-interactive" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem' }}>Google</button>
            <button type="button" className="d-interactive" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem' }}>Apple</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
          </div>
        </>
      )}

      {mode === 'register' && (
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Full name</label>
          <input className="d-control" type="text" placeholder="Morgan Ellis" value={name} onChange={e => setName(e.target.value)} />
        </div>
      )}

      {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email</label>
          <input className="d-control" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
      )}

      {(mode === 'login' || mode === 'register' || mode === 'reset') && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>{mode === 'reset' ? 'New password' : 'Password'}</label>
            {mode === 'login' && (
              <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--d-accent)', textDecoration: 'none' }}>Forgot?</Link>
            )}
          </div>
          <input className="d-control" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
      )}

      {mode === 'phone-verify' && (
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Phone number</label>
          <input className="d-control" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
      )}

      {(mode === 'verify-email' || mode === 'mfa-verify' || mode === 'phone-verify') && (
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>
            {mode === 'verify-email' ? 'Email code' : mode === 'phone-verify' ? 'SMS code' : 'Authenticator code'}
          </label>
          <input
            className="d-control fd-mono"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            style={{ fontSize: '1.25rem', letterSpacing: '0.25em', textAlign: 'center' }}
          />
        </div>
      )}

      {mode === 'mfa-setup' && (
        <div style={{
          padding: '1rem',
          background: 'var(--d-surface-raised)',
          border: '1px solid var(--d-border)',
          borderRadius: 'var(--d-radius)',
          textAlign: 'center',
        }}>
          <div style={{
            width: 140,
            height: 140,
            margin: '0 auto 0.75rem',
            background: '#fff',
            borderRadius: 'var(--d-radius-sm)',
            backgroundImage: 'repeating-linear-gradient(0deg, #000 0 4px, #fff 4px 8px), repeating-linear-gradient(90deg, #000 0 4px, #fff 4px 8px)',
            backgroundBlendMode: 'difference',
          }} aria-hidden />
          <div className="fd-mono" style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
            ATLAS2FA8JKMXP9Q
          </div>
        </div>
      )}

      <button className="fd-button-accent" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}>
        {mode === 'login' && 'Sign in'}
        {mode === 'register' && 'Create account'}
        {mode === 'forgot' && 'Send reset link'}
        {mode === 'reset' && 'Update password'}
        {mode === 'verify-email' && 'Verify email'}
        {mode === 'phone-verify' && 'Verify phone'}
        {mode === 'mfa-setup' && 'Continue'}
        {mode === 'mfa-verify' && 'Verify'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
        {mode === 'login' && (
          <>Don't have an account? <Link to="/register" style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>Open one</Link></>
        )}
        {mode === 'register' && (
          <>Already have an account? <Link to="/login" style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>Sign in</Link></>
        )}
        {(mode === 'forgot' || mode === 'reset') && (
          <Link to="/login" style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>Back to sign in</Link>
        )}
        {(mode === 'verify-email' || mode === 'mfa-setup' || mode === 'mfa-verify' || mode === 'phone-verify') && (
          <Link to="/login" style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>Cancel</Link>
        )}
      </p>
    </form>
  );
}
