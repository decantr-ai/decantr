import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Shield } from 'lucide-react';

export function MfaSetupPage() {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 2,
          background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <Shield size={24} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>Set Up MFA</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
          Scan the QR code with your authenticator app
        </p>
      </div>

      <div style={{
        width: 160, height: 160, margin: '0 auto 1.5rem',
        background: 'var(--d-surface-raised)',
        border: '1px solid var(--d-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', color: 'var(--d-text-muted)',
      }}>
        [QR Code]
      </div>

      <div className={css('_flex _col _gap3')}>
        <Link to="/mfa-verify" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', padding: '0.625rem' }}>
          Continue
        </Link>
        <Link to="/engage" className="d-interactive" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', padding: '0.625rem' }}>
          Skip for Now
        </Link>
      </div>
    </div>
  );
}
