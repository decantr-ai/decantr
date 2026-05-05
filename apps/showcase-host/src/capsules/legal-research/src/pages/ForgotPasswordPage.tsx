import { css } from '@decantr/css';
import { useState } from 'react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="counsel-header" style={{ fontSize: '1.25rem' }}>Forgot password</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem', fontFamily: 'Georgia, serif' }}>
          We will send you a reset link
        </p>
      </div>
      {sent ? (
        <div className="d-annotation" data-status="success" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
          Reset link sent to {email}
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className={css('_flex _col _gap4')}>
          <div className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium')} htmlFor="fp-email">Email</label>
            <input id="fp-email" type="email" className="d-control" placeholder="attorney@firm.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </div>
          <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
            Send Reset Link
          </button>
        </form>
      )}
      <p className={css('_textsm')} style={{ textAlign: 'center' }}>
        <a href="#/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Back to sign in</a>
      </p>
    </div>
  );
}
