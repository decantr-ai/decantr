import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Phone } from 'lucide-react';

export function PhoneVerifyPage() {
  const [code, setCode] = useState('');

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Phone size={24} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>Verify phone number</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Enter the code we sent to your phone</p>
      </div>
      <form className={css('_flex _col _gap4')} onSubmit={e => e.preventDefault()}>
        <input className="d-control earth-input" type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="000000" maxLength={6} style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.25rem' }} />
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
          Verify Phone
        </button>
      </form>
      <p style={{ fontSize: '0.8125rem', textAlign: 'center', marginTop: '1rem', color: 'var(--d-text-muted)' }}>
        <button className="d-interactive" data-variant="ghost" style={{ border: 'none', fontSize: '0.8125rem' }}>Resend code</button>
        {' | '}
        <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Back to sign in</Link>
      </p>
    </div>
  );
}
