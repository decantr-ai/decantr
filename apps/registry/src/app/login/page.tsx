'use client';

import { useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'login' | 'register' | 'forgot-password';

function GitHubIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const authConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  function getSupabaseClient() {
    if (!authConfigured) {
      setError('Authentication is unavailable in this environment.');
      return null;
    }

    try {
      return createClient();
    } catch {
      setError('Authentication is unavailable in this environment.');
      return null;
    }
  }

  async function handleOAuth(provider: 'github' | 'google') {
    setError('');
    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return;
      }

      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) {
          setError(err.message);
        } else {
          window.location.href = '/dashboard';
          return;
        }
      } else if (mode === 'register') {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username,
              user_name: username,
              display_name: username,
            },
          },
        });
        if (err) {
          setError(err.message);
        } else {
          setMessage('Check your email for a confirmation link.');
        }
      } else if (mode === 'forgot-password') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
        });
        if (err) {
          setError(err.message);
        } else {
          setMessage('Password reset link sent. Check your email.');
        }
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    setError('');
    setMessage('');
  }

  const titles: Record<AuthMode, string> = {
    login: 'Welcome back',
    register: 'Create an account',
    'forgot-password': 'Reset your password',
  };

  const submitLabels: Record<AuthMode, string> = {
    login: 'Sign In',
    register: 'Create Account',
    'forgot-password': 'Send Reset Link',
  };

  return (
    <div className="lum-orbs flex items-center justify-center min-h-dvh bg-d-bg p-4">
      <div className="d-surface lum-glass w-full max-w-md p-8 rounded-xl">
        {/* Brand */}
        <div className="text-center mb-6">
          <h1 className="lum-brand text-2xl font-bold mb-2">
            decantr<span className="punct">.</span>
          </h1>
          <p className="text-sm text-d-muted">{titles[mode]}</p>
        </div>

        {/* OAuth (not shown for forgot-password) */}
        {mode !== 'forgot-password' && (
          <>
            <div className="flex flex-col gap-2.5 mb-5">
              <button
                type="button"
                className="d-interactive w-full flex items-center justify-center gap-2.5 text-sm py-2.5"
                data-variant="ghost"
                disabled={!authConfigured}
                onClick={() => handleOAuth('github')}
              >
                <GitHubIcon />
                Continue with GitHub
              </button>
              <button
                type="button"
                className="d-interactive w-full flex items-center justify-center gap-2.5 text-sm py-2.5"
                data-variant="ghost"
                disabled={!authConfigured}
                onClick={() => handleOAuth('google')}
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 border-t border-d-border" />
              <span className="text-xs text-d-muted">or continue with</span>
              <div className="flex-1 border-t border-d-border" />
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'register' && (
            <div>
              <label
                htmlFor="username"
                className="block text-xs text-d-muted mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-username"
                className="d-control w-full text-sm rounded-md"
                required
                autoComplete="username"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-xs text-d-muted mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="d-control w-full text-sm rounded-md"
              required
              autoComplete="email"
            />
          </div>

          {mode !== 'forgot-password' && (
            <div>
              <label
                htmlFor="password"
                className="block text-xs text-d-muted mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="d-control w-full text-sm rounded-md"
                required
                minLength={6}
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
              />
            </div>
          )}

          {/* Forgot password link (login mode only) */}
          {mode === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-d-accent hover:underline"
                onClick={() => switchMode('forgot-password')}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-d-error" role="alert">
              {error}
            </p>
          )}

          {/* Success message */}
          {message && (
            <p className="text-sm text-d-green" role="status">
              {message}
            </p>
          )}

          {!authConfigured && (
            <p className="text-xs text-d-muted" role="status">
              Authentication controls are unavailable until Supabase public env is configured.
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="d-interactive w-full text-sm py-2.5 mt-1 flex items-center justify-center gap-2"
            data-variant="primary"
            disabled={loading || !authConfigured}
          >
            {loading && <Spinner />}
            {submitLabels[mode]}
          </button>
        </form>

        {/* Mode toggle */}
        <div className="mt-6 text-center text-xs text-d-muted">
          {mode === 'login' && (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="text-d-accent hover:underline"
                onClick={() => switchMode('register')}
              >
                Sign up
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="text-d-accent hover:underline"
                onClick={() => switchMode('login')}
              >
                Sign in
              </button>
            </p>
          )}
          {mode === 'forgot-password' && (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                className="text-d-accent hover:underline"
                onClick={() => switchMode('login')}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
