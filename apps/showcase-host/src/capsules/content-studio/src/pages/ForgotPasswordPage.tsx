import { css } from '@decantr/css';
import { BookOpen, ArrowLeft } from 'lucide-react';
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
          <BookOpen size={28} style={{ color: 'var(--d-accent)' }} />
        </div>
        <h1 style={{ fontWeight: 600, fontSize: '1.25rem' }}>Reset your password</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem', fontFamily: 'system-ui, sans-serif' }}>
          We'll send you a link to reset it.
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
          <div className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium')} htmlFor="reset-email" style={{ fontFamily: 'system-ui, sans-serif' }}>Email</label>
            <input
              id="reset-email"
              type="email"
              className="d-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              style={{ fontFamily: 'system-ui, sans-serif' }}
            />
          </div>
          <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
            Send Reset Link
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '1rem', fontFamily: 'system-ui, sans-serif' }}>
            If an account exists for {email || 'that address'}, you'll receive a reset link shortly.
          </p>
        </div>
      )}

      <p className={css('_textsm')} style={{ textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <a href="#/login" className={css('_flex _aic _center _gap1')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>
          <ArrowLeft size={14} />
          Back to sign in
        </a>
      </p>
    </div>
  );
}
