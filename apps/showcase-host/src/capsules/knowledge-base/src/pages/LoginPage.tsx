import { css } from '@decantr/css';
import { BookOpen, Github } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    login();
    navigate('/docs');
  };

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div className={css('_flex _center')} style={{ marginBottom: '1rem' }}>
          <BookOpen size={28} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 className={css('_fontsemi _textlg')}>Welcome back</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          Sign in to the knowledge base
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        {error && (
          <div className="d-annotation" data-status="error" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
            {error}
          </div>
        )}
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            className="d-control"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </div>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            className="d-control"
            placeholder="Enter any password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
          Sign In
        </button>
      </form>

      {/* Divider */}
      <div className={css('_flex _aic _gap3')}>
        <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
        <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>or continue with</span>
        <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
      </div>

      {/* OAuth */}
      <div className={css('_flex _gap3')}>
        <button
          className="d-interactive"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => { login(); navigate('/docs'); }}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </button>
        <button
          className="d-interactive"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => { login(); navigate('/docs'); }}
          type="button"
        >
          <Github size={16} />
          GitHub
        </button>
      </div>

      {/* Footer links */}
      <div className={css('_flex _jcsb _textsm')} style={{ color: 'var(--d-text-muted)' }}>
        <a href="#/register" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Create account</a>
        <a href="#/forgot-password" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Forgot password?</a>
      </div>
    </div>
  );
}
