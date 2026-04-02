import { css } from '@decantr/css';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MfaVerify() {
  return (
    <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
      <div className={css('_flex _col _aic _gap2')} style={{ textAlign: 'center', marginBottom: 'var(--d-gap-2)' }}>
        <ShieldCheck size={28} style={{ color: 'var(--d-accent)' }} />
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Verify 2FA</h1>
        <p className="mono-data" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
          Enter the 6-digit code from your authenticator
        </p>
      </div>

      {/* Code input boxes */}
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
        Verify
      </button>

      <div className={css('_flex _col _aic _gap2')} style={{ marginTop: 'var(--d-gap-1)' }}>
        <Link to="/login" className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
          Use recovery code instead
        </Link>
      </div>
    </form>
  );
}
