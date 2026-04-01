import { useState } from 'react';
import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Simulated login
    navigate('/');
  }

  return (
    <div className={css('_flex _aic _jcc _hscreen _wfull') + ' lum-canvas'}>
      <div className="lum-orbs" />

      <div
        className={css('_flex _col _gap8 _rel') + ' lum-fade-up'}
        style={{ width: '100%', maxWidth: 420, padding: '0 24px', zIndex: 1 }}
      >
        {/* Brand */}
        <div className={css('_textc')}>
          <h1 className={css('_fontsemi _mb2')} style={{ fontSize: '2rem' }}>
            <span className="lum-brand">
              Carbon<span className="accent">AI</span>
            </span>
          </h1>
          <p className={css('_fgmuted _textsm')}>Sign in to your portal</p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          className={css('_flex _col _gap5 _p6') + ' carbon-glass'}
        >
          <div className={css('_flex _col _gap2')}>
            <label htmlFor="login-email" className={css('_textsm _fontmedium')}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className={css('_wfull _px4 _py3 _rounded _textbase')}
              style={{
                background: 'var(--d-surface)',
                border: '1px solid var(--d-border)',
                color: 'var(--d-text)',
                outline: 'none',
              }}
            />
          </div>

          <div className={css('_flex _col _gap2')}>
            <div className={css('_flex _jcsb _aic')}>
              <label htmlFor="login-password" className={css('_textsm _fontmedium')}>
                Password
              </label>
              <button
                type="button"
                className={css('_textxs _fgprimary')}
                style={{ background: 'none', border: 'none' }}
              >
                Forgot password?
              </button>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className={css('_wfull _px4 _py3 _rounded _textbase')}
              style={{
                background: 'var(--d-surface)',
                border: '1px solid var(--d-border)',
                color: 'var(--d-text)',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            className={css('_wfull _py3 _rounded _fontmedium _textbase')}
            style={{
              background: 'var(--d-primary)',
              border: 'none',
              color: '#fff',
              marginTop: 4,
            }}
          >
            Sign In
          </button>

          {/* Divider */}
          <div className={css('_flex _aic _gap3')}>
            <div className={css('_flex1')} style={{ height: 1, background: 'var(--d-border)' }} />
            <span className={css('_textxs _fgmuted')}>or</span>
            <div className={css('_flex1')} style={{ height: 1, background: 'var(--d-border)' }} />
          </div>

          {/* SSO buttons */}
          <div className={css('_flex _col _gap3')}>
            <button
              type="button"
              className={css('_wfull _py3 _rounded _fontmedium _textsm _flex _aic _jcc _gap2')}
              style={{
                background: 'var(--d-surface)',
                border: '1px solid var(--d-border)',
                color: 'var(--d-text)',
              }}
            >
              Continue with Google
            </button>
            <button
              type="button"
              className={css('_wfull _py3 _rounded _fontmedium _textsm _flex _aic _jcc _gap2')}
              style={{
                background: 'var(--d-surface)',
                border: '1px solid var(--d-border)',
                color: 'var(--d-text)',
              }}
            >
              Continue with SSO
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className={css('_textc _textxs _fgmuted')}>
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className={css('_fgprimary _fontmedium')}
            style={{ background: 'none', border: 'none' }}
          >
            Request access
          </button>
        </p>
      </div>
    </div>
  );
}
