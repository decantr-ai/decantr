import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Shield } from 'lucide-react';

export function MfaSetupPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className={css('_flex _aic _gap2')}>
        <Shield size={18} style={{ color: 'var(--d-primary)' }} />
        <h1 className="serif-display" style={{ fontSize: '1.5rem' }}>Set up 2-factor</h1>
      </div>
      <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
        Scan this QR code with your authenticator app, then enter the 6-digit code below.
      </p>
      <div style={{ width: 160, height: 160, margin: '0 auto', background:
        'repeating-conic-gradient(var(--d-text) 0% 25%, var(--d-bg) 0% 50%) 50% / 20px 20px',
        border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)' }} aria-label="QR code" />
      <label className={css('_flex _col _gap1')}>
        <span className={css('_textsm _fontmedium')}>Verification code</span>
        <input className="d-control" placeholder="123 456" maxLength={7} />
      </label>
      <button className="d-interactive" data-variant="primary" style={{ justifyContent: 'center' }}>
        Enable 2-factor
      </button>
      <Link to="/recipes" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', textAlign: 'center' }}>
        Skip for now
      </Link>
    </div>
  );
}
