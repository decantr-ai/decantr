import { css } from '@decantr/css';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MfaSetup() {
  return (
    <div className={css('_flex _col _gap4')}>
      <div className={css('_flex _col _aic _gap2')} style={{ textAlign: 'center', marginBottom: 'var(--d-gap-2)' }}>
        <div className="neon-ring neon-ring-active" style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={24} style={{ color: 'var(--d-accent)' }} />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Enable 2FA</h1>
        <p className="mono-data" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
          Scan the QR code with your authenticator app
        </p>
      </div>

      {/* QR code placeholder */}
      <div
        className="d-surface neon-entrance"
        data-elevation="raised"
        style={{
          width: 180,
          height: 180,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--d-surface-raised)',
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            background: 'repeating-conic-gradient(var(--d-text) 0% 25%, transparent 0% 50%) 0 0 / 14px 14px',
            borderRadius: 'var(--d-radius-sm)',
            opacity: 0.6,
          }}
        />
      </div>

      {/* Recovery code */}
      <div className="carbon-code mono-data" style={{ fontSize: '0.75rem', textAlign: 'center', letterSpacing: '0.15em' }}>
        SWRM-4F2K-9X3P-7H1L
      </div>
      <p className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
        Save this recovery code in a secure location
      </p>

      <Link
        to="/mfa-verify"
        className="d-interactive neon-glow-hover"
        style={{
          width: '100%',
          justifyContent: 'center',
          background: 'var(--d-accent)',
          color: 'var(--d-bg)',
          borderColor: 'var(--d-accent)',
          fontWeight: 500,
          textDecoration: 'none',
        }}
      >
        Continue to Verify
      </Link>
    </div>
  );
}
