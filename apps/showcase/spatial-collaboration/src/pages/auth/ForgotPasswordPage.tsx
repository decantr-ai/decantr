import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="d-surface carbon-card carbon-fade-slide" style={{ padding: '2rem' }}>
      <div className={css('_flex _col _aic _gap1')} style={{ marginBottom: '1.5rem' }}>
        <Layers size={24} style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }} />
        <h1 className={css('_fontsemi _textxl')}>Reset password</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
          {sent ? 'Check your email for reset instructions' : 'Enter your email to receive a reset link'}
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className={css('_flex _col _gap4')} role="form">
          <div className={css('_flex _col _gap1')}>
            <label className={css('_textsm _fontmedium')}>Email</label>
            <input className="d-control carbon-input" type="email" placeholder="designer@spatialops.io" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button className="d-interactive" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
            Send Reset Link
          </button>
        </form>
      ) : (
        <div className={css('_flex _col _aic _gap3')} style={{ padding: '1rem 0' }}>
          <div className="d-annotation" data-status="success" style={{ padding: '0.25rem 0.75rem' }}>Email sent</div>
          <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)' }}>
            If an account exists with that email, you will receive password reset instructions.
          </p>
        </div>
      )}

      <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', marginTop: '1.5rem' }}>
        <Link to="/login" className={css('_flex _aic _jcc _gap1')} style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to login
        </Link>
      </p>
    </div>
  );
}
