import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { useAuth } from '../../hooks/useAuth';

export function MfaVerifyPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => { e.preventDefault(); login(); navigate('/floor'); };

  return (
    <form onSubmit={onSubmit} className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className={css('_flex _col _gap1')}>
        <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Enter verification code</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Open your authenticator app and enter the 6-digit code.</p>
      </div>
      <input className="d-control" placeholder="000000" maxLength={6}
        style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.5rem', padding: '0.75rem' }} />
      <button type="submit" className="d-interactive" data-variant="primary" style={{ justifyContent: 'center' }}>Verify</button>
      <p className={css('_textsm')} style={{ textAlign: 'center', color: 'var(--d-text-muted)' }}>
        Lost your device? <a href="#" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Use recovery code</a>
      </p>
    </form>
  );
}
