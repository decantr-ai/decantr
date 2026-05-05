import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Shield } from 'lucide-react';

export function MfaSetupPage() {
  const [code, setCode] = useState('');

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Shield size={24} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>Set up 2FA</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Scan the QR code with your authenticator app</p>
      </div>
      <div style={{ width: 160, height: 160, background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--d-border)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>QR Code</span>
      </div>
      <form className={css('_flex _col _gap4')} onSubmit={e => e.preventDefault()}>
        <div className={css('_flex _col _gap1')}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Verification Code</label>
          <input className="d-control earth-input" type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="000000" maxLength={6} style={{ textAlign: 'center', letterSpacing: '0.3em' }} />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
          Verify & Enable
        </button>
      </form>
      <p style={{ fontSize: '0.8125rem', textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Skip for now</Link>
      </p>
    </div>
  );
}
