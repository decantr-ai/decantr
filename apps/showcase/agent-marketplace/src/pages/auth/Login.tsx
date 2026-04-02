import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export function Login() {
  return (
    <div className={css('_flex _col _gap5 _wfull') + ' carbon-card ' + css('_p6') + ' fade-in'}>
      <div className={css('_flex _col _gap1 _textc')}>
        <h1 className={'font-mono ' + css('_textxl _fontbold')}>Welcome back</h1>
        <p className={'font-mono ' + css('_textsm _fgmuted')}>
          Sign in to your mission control
        </p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <div className={css('_flex _col _gap1')}>
          <label className={'font-mono ' + css('_textsm _fgmuted')}>Email</label>
          <div className={css('_rel')}>
            <Mail size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--d-text-muted)' }} />
            <input
              type="email"
              className="carbon-input font-mono"
              placeholder="operator@agentctrl.io"
              style={{ paddingLeft: 36 }}
              autoComplete="email"
            />
          </div>
        </div>

        <div className={css('_flex _col _gap1')}>
          <div className={css('_flex _aic _jcsb')}>
            <label className={'font-mono ' + css('_textsm _fgmuted')}>Password</label>
            <Link to="/forgot-password" className={'font-mono ' + css('_textxs _fgprimary')}>
              Forgot password?
            </Link>
          </div>
          <div className={css('_rel')}>
            <Lock size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--d-text-muted)' }} />
            <input
              type="password"
              className="carbon-input font-mono"
              placeholder="Enter password"
              style={{ paddingLeft: 36 }}
              autoComplete="current-password"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
          Sign In <ArrowRight size={16} />
        </button>
      </form>

      <div className="separator" />

      <div className={css('_flex _col _gap3')}>
        <button type="button" className="btn btn-secondary" style={{ width: '100%' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="font-mono">Continue with Google</span>
        </button>
        <button type="button" className="btn btn-secondary" style={{ width: '100%' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span className="font-mono">Continue with GitHub</span>
        </button>
      </div>

      <p className={'font-mono ' + css('_textxs _fgmuted _textc')}>
        New operator?{' '}
        <Link to="/register" className={css('_fgprimary')}>Create account</Link>
      </p>
    </div>
  );
}
