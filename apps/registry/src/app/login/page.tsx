'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Suspense } from 'react';

type Mode = 'login' | 'register' | 'forgot-password';

function LoginForm() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get('mode') as Mode) || 'login';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) setError('Authentication failed. Please try again.');
  }, [searchParams]);

  const supabase = createClient();

  async function handleOAuth(provider: 'github' | 'google') {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/dashboard';
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMessage('Check your email for a confirmation link.');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
        });
        if (error) throw error;
        setMessage('Password reset email sent.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<Mode, string> = {
    'login': 'Welcome back',
    'register': 'Create an account',
    'forgot-password': 'Reset your password',
  };

  return (
    <div
      className="lum-orbs flex items-center justify-center"
      style={{ minHeight: '100dvh', background: 'var(--d-bg)', padding: '1.5rem' }}
    >
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div className="d-surface lum-glass" style={{ padding: '2rem' }}>
          {/* Header */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--d-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <h1 className="text-xl font-semibold">{titles[mode]}</h1>
          </div>

          {/* OAuth */}
          {mode !== 'forgot-password' && (
            <>
              <div className="flex flex-col gap-2 mb-4">
                <button
                  className="d-interactive"
                  onClick={() => handleOAuth('github')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
                  Continue with GitHub
                </button>
                <button
                  className="d-interactive"
                  onClick={() => handleOAuth('google')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  Continue with Google
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
                <span className="text-xs" style={{ color: 'var(--d-text-muted)' }}>or continue with email</span>
                <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Email</label>
              <input
                className="d-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {mode !== 'forgot-password' && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Password</label>
                <input
                  className="d-control"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={8}
                />
              </div>
            )}

            {error && <p className="text-sm" style={{ color: 'var(--d-error)' }}>{error}</p>}
            {message && <p className="text-sm" style={{ color: 'var(--d-success)' }}>{message}</p>}

            <button
              className="d-interactive"
              data-variant="primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send reset link'}
            </button>
          </form>

          {/* Footer links */}
          <div className="flex flex-col items-center gap-2 mt-4">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => { setMode('forgot-password'); setError(''); setMessage(''); }}
                  className="text-sm"
                  style={{ background: 'none', border: 'none', color: 'var(--d-text-muted)', cursor: 'pointer' }}
                >
                  Forgot your password?
                </button>
                <button
                  onClick={() => { setMode('register'); setError(''); setMessage(''); }}
                  className="text-sm"
                  style={{ background: 'none', border: 'none', color: 'var(--d-text-muted)', cursor: 'pointer' }}
                >
                  Don&apos;t have an account? <span style={{ color: 'var(--d-accent)' }}>Sign up</span>
                </button>
              </>
            )}
            {mode === 'register' && (
              <button
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className="text-sm"
                style={{ background: 'none', border: 'none', color: 'var(--d-text-muted)', cursor: 'pointer' }}
              >
                Already have an account? <span style={{ color: 'var(--d-accent)' }}>Sign in</span>
              </button>
            )}
            {mode === 'forgot-password' && (
              <button
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className="text-sm"
                style={{ background: 'none', border: 'none', color: 'var(--d-text-muted)', cursor: 'pointer' }}
              >
                Back to <span style={{ color: 'var(--d-accent)' }}>Sign in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center" style={{ minHeight: '100dvh', background: 'var(--d-bg)' }}>
        <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>Loading...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
