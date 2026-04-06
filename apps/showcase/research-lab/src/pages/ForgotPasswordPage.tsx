import { css } from '@decantr/css';
import { FlaskConical, ArrowLeft } from 'lucide-react';
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
        <div className={css('_flex _center')} style={{ marginBottom: '0.75rem' }}>
          <FlaskConical size={24} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 style={{ fontWeight: 500, fontSize: '1.125rem' }}>Reset your password</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          {sent ? 'Check your institutional email' : 'Enter your email to receive a reset link'}
        </p>
      </div>

      {sent ? (
        <div className="lab-panel" style={{ padding: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
            If an account exists for <strong>{email}</strong>, a password reset link has been sent.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
          <div className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium')} htmlFor="forgot-email">Email</label>
            <input id="forgot-email" type="email" className="d-control" placeholder="researcher@lab.edu" value={email} onChange={(e) => setEmail(e.target.value)} style={{ borderRadius: 2 }} autoFocus />
          </div>
          <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 2 }}>
            Send Reset Link
          </button>
        </form>
      )}

      <a href="#/login" className={css('_flex _aic _gap1')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem', justifyContent: 'center' }}>
        <ArrowLeft size={14} /> Back to sign in
      </a>
    </div>
  );
}
