import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { useAuth } from '../../hooks/useAuth';

export function MfaVerifyPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    login();
    navigate('/recipes');
  };
  return (
    <form onSubmit={onSubmit} className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <h1 className="serif-display" style={{ fontSize: '1.5rem' }}>Enter your code</h1>
      <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
        Open your authenticator app and enter the 6-digit code.
      </p>
      <input className="d-control" placeholder="000 000" maxLength={7}
        style={{ textAlign: 'center', letterSpacing: '0.25em', fontSize: '1.25rem' }} />
      <button type="submit" className="d-interactive" data-variant="primary" style={{ justifyContent: 'center' }}>
        Verify
      </button>
    </form>
  );
}
