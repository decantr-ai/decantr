import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useState } from 'react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="d-surface carbon-card carbon-fade-slide" style={{ padding: '2rem', textAlign: 'center' }}>
        <KeyRound size={32} style={{ color: 'var(--d-accent)', margin: '0 auto 1rem' }} />
        <h1 className={css('_fontsemi _textxl')} style={{ marginBottom: '0.5rem' }}>Check your email</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
          Reset instructions sent to <span className="mono-data">{email || 'your email'}</span>
        </p>
        <Link to="/login" className="d-interactive" data-variant="ghost" style={{ textDecoration: 'none' }}>Back to login</Link>
      </div>
    );
  }

  return (
    <div className="d-surface carbon-card carbon-fade-slide" style={{ padding: '2rem' }}>
      <div className={css('_flex _col _aic _gap1')} style={{ marginBottom: '1.5rem' }}>
        <KeyRound size={24} style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }} />
        <h1 className={css('_fontsemi _textxl')}>Reset password</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Enter your email to receive reset instructions</p>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')} role="form">
        <div className={css('_flex _col _gap1')}>
          <label className={css('_textsm _fontmedium')}>Email</label>
          <input className="d-control carbon-input" type="email" placeholder="operator@agentops.dev" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <button className="d-interactive neon-glow-hover" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
          Send Reset Link
        </button>
      </form>

      <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', marginTop: '1.5rem' }}>
        <Link to="/login" style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>Back to login</Link>
      </p>
    </div>
  );
}
