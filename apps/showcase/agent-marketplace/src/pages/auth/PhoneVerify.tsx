import { css } from '@decantr/css';
import { Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PhoneVerify() {
  return (
    <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
      <div className={css('_flex _col _aic _gap2')} style={{ textAlign: 'center', marginBottom: 'var(--d-gap-2)' }}>
        <div className="neon-ring neon-ring-active" style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Smartphone size={24} style={{ color: 'var(--d-accent)' }} />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Phone Verification</h1>
        <p className="mono-data" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
          Enter the code sent to +1 ••• •••48
        </p>
      </div>

      {/* Code input */}
      <div className={css('_flex _gap2 _jcc')}>
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            type="text"
            maxLength={1}
            className="d-control mono-data neon-glow-hover"
            style={{
              width: 44,
              height: 52,
              textAlign: 'center',
              fontSize: '1.25rem',
              fontWeight: 600,
              padding: 0,
            }}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      <button
        type="submit"
        className="d-interactive neon-glow-hover"
        style={{
          width: '100%',
          justifyContent: 'center',
          background: 'var(--d-accent)',
          color: 'var(--d-bg)',
          borderColor: 'var(--d-accent)',
          fontWeight: 500,
          marginTop: 'var(--d-gap-2)',
        }}
      >
        Verify Phone
      </button>

      <div className={css('_flex _col _aic _gap2')} style={{ marginTop: 'var(--d-gap-1)' }}>
        <button className="d-interactive" data-variant="ghost" type="button" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', border: '1px solid transparent' }}>
          Resend code
        </button>
        <Link to="/login" className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
