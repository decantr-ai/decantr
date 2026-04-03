import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useState } from 'react';

export function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setVerified(true);
  }

  if (verified) {
    return (
      <div className="d-surface carbon-card carbon-fade-slide" style={{ padding: '2rem', textAlign: 'center' }}>
        <MailCheck size={32} style={{ color: 'var(--d-success)', margin: '0 auto 1rem' }} />
        <h1 className={css('_fontsemi _textxl')} style={{ marginBottom: '0.5rem' }}>Email Verified</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
          Your email has been confirmed. You can now log in.
        </p>
        <Link to="/login" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none' }}>Continue to Login</Link>
      </div>
    );
  }

  return (
    <div className="d-surface carbon-card carbon-fade-slide" style={{ padding: '2rem' }}>
      <div className={css('_flex _col _aic _gap1')} style={{ marginBottom: '1.5rem' }}>
        <MailCheck size={24} style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }} />
        <h1 className={css('_fontsemi _textxl')}>Verify your email</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Enter the 6-digit code sent to your email</p>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')} role="form">
        <div className={css('_flex _col _gap1')}>
          <label className={css('_textsm _fontmedium')}>Verification code</label>
          <input
            className="d-control carbon-input mono-data"
            type="text"
            placeholder="000000"
            value={code}
            onChange={e => setCode(e.target.value)}
            maxLength={6}
            style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem' }}
          />
        </div>
        <button className="d-interactive neon-glow-hover" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
          Verify Email
        </button>
      </form>

      <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', marginTop: '1.5rem' }}>
        Didn't receive a code? <button style={{ color: 'var(--d-accent)', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 'inherit' }}>Resend</button>
      </p>
    </div>
  );
}
