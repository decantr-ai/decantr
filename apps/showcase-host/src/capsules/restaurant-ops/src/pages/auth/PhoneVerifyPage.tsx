import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { useAuth } from '../../hooks/useAuth';

export function PhoneVerifyPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => { e.preventDefault(); login(); navigate('/floor'); };

  return (
    <form onSubmit={onSubmit} className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className={css('_flex _col _gap1')}>
        <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Verify your phone</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>We sent a code to your phone number.</p>
      </div>
      <input className="d-control" placeholder="Enter code" maxLength={6}
        style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.5rem', padding: '0.75rem' }} />
      <button type="submit" className="d-interactive" data-variant="primary" style={{ justifyContent: 'center' }}>Verify Phone</button>
      <p className={css('_textsm')} style={{ textAlign: 'center', color: 'var(--d-text-muted)' }}>
        Didn&apos;t receive it? <a href="#" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Resend code</a>
      </p>
    </form>
  );
}
