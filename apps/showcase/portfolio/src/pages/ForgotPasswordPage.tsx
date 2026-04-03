import { css } from '@decantr/css';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div className={css('_flex _center')} style={{ marginBottom: '1rem' }}>
          <Sparkles size={28} style={{ color: 'var(--d-accent)' }} />
        </div>
        <h1 className={css('_fontsemi _textlg')}>Reset Password</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          {submitted
            ? 'Check your email for a reset link.'
            : 'Enter your email and we\'ll send you a reset link.'}
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
          <div className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium')} htmlFor="reset-email">Email</label>
            <input
              id="reset-email"
              type="email"
              className="d-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
            Send Reset Link
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '1rem' }}>
            If an account exists with that email, you'll receive a password reset link shortly.
          </p>
        </div>
      )}

      <div className={css('_flex _center')}>
        <a
          href="#/login"
          className={css('_flex _aic _gap1 _textsm')}
          style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}
        >
          <ArrowLeft size={14} />
          Back to sign in
        </a>
      </div>
    </div>
  );
}
