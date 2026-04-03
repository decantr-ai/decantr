import { css } from '@decantr/css';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div className={css('_flex _center')} style={{ marginBottom: '1rem' }}>
          <BookOpen size={28} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 className={css('_fontsemi _textlg')}>Reset your password</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          {sent ? 'Check your inbox for a reset link.' : 'Enter your email and we will send you a reset link.'}
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
          <div className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium')} htmlFor="fp-email">Email</label>
            <input id="fp-email" type="email" className="d-control" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </div>
          <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
            Send Reset Link
          </button>
        </form>
      ) : (
        <div className="d-surface paper-card" style={{ padding: 'var(--d-surface-p)', textAlign: 'center' }}>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
            If an account exists for <strong>{email}</strong>, you will receive a reset link shortly.
          </p>
        </div>
      )}

      <div className={css('_flex _center')}>
        <a href="#/login" className={css('_flex _aic _gap1 _textsm')} style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>
          <ArrowLeft size={14} />
          Back to sign in
        </a>
      </div>
    </div>
  );
}
