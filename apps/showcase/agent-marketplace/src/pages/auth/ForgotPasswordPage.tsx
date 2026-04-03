import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Mail, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  return (
    <form
      className={css('_flex _col _gap4')}
      onSubmit={(e) => e.preventDefault()}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--d-text)', margin: 0 }}>
        Reset Password
      </h1>

      <p className="d-annotation" style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
        Enter your account email. A password reset link will be sent if the account exists.
      </p>

      {/* Email */}
      <div className={css('_flex _col _gap1')}>
        <label className="d-label" htmlFor="forgot-email">
          Email
        </label>
        <div className={css('_flex _aic')} style={{ position: 'relative' }}>
          <Mail
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: 'var(--d-text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            id="forgot-email"
            type="email"
            className="d-control carbon-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Submit */}
      <button type="submit" className="d-interactive neon-glow" style={{ width: '100%' }}>
        Send Reset Link
      </button>

      {/* Back to login */}
      <Link
        to="/login"
        className={css('_flex _aic _jcc _gap1') + ' d-annotation'}
        style={{ fontSize: '0.8125rem', color: 'var(--d-accent)' }}
      >
        <ArrowLeft size={14} />
        Back to Sign In
      </Link>
    </form>
  );
}
