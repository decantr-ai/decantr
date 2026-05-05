import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function MfaSetupPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className={css('_flex _col _gap1')}>
        <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Two-factor authentication</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Add an extra layer of security to your account.</p>
      </div>
      <div className={css('_flex _col _aic _gap3')} style={{ padding: '1.5rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius)' }}>
        <ShieldCheck size={40} style={{ color: 'var(--d-primary)' }} />
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textAlign: 'center' }}>
          Scan this QR code with your authenticator app.
        </p>
        <div style={{ width: 160, height: 160, background: 'var(--d-surface)', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', display: 'grid', placeItems: 'center' }}>
          <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>QR Code</span>
        </div>
      </div>
      <input className="d-control" placeholder="Enter 6-digit code" maxLength={6} style={{ textAlign: 'center', letterSpacing: '0.3em' }} />
      <button className="d-interactive" data-variant="primary" style={{ justifyContent: 'center' }}>Verify & Enable</button>
      <Link to="/floor" className={css('_textsm')} style={{ textAlign: 'center', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Skip for now</Link>
    </div>
  );
}
