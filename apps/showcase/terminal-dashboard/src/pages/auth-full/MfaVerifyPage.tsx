import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';

export function MfaVerifyPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [showBackup, setShowBackup] = useState(false);
  const [backupCode, setBackupCode] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    localStorage.setItem('decantr_authenticated', 'true');
    navigate('/app');
  }

  return (
    <CenteredShell>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <h1
          className="term-glow"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            textAlign: 'center',
            color: 'var(--d-primary)',
            margin: 0,
            letterSpacing: '0.1em',
          }}
        >
          MFA VERIFY
        </h1>

        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--d-text-muted)',
            margin: 0,
            textAlign: 'center',
          }}
        >
          Enter the code from your authenticator app.
        </p>

        {showBackup ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label
              className="d-label"
              htmlFor="mfa-backup"
              style={{
                fontSize: '0.75rem',
                color: 'var(--d-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Backup Code
            </label>
            <input
              id="mfa-backup"
              className="d-control"
              type="text"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value)}
              placeholder="xxxx-xxxx-xxxx"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                background: 'var(--d-bg)',
                border: '1px solid var(--d-border)',
                borderRadius: 0,
                color: 'var(--d-text)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label
              className="d-label"
              htmlFor="mfa-verify-code"
              style={{
                fontSize: '0.75rem',
                color: 'var(--d-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              6-Digit Code
            </label>
            <input
              id="mfa-verify-code"
              className="d-control"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                background: 'var(--d-bg)',
                border: '1px solid var(--d-border)',
                borderRadius: 0,
                color: 'var(--d-text)',
                fontSize: '1.25rem',
                fontFamily: 'inherit',
                outline: 'none',
                textAlign: 'center',
                letterSpacing: '0.5em',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <button
          type="submit"
          className="d-interactive"
          data-variant="primary"
          style={{
            width: '100%',
            padding: '0.625rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            borderRadius: 0,
            cursor: 'pointer',
            letterSpacing: '0.05em',
            marginTop: '0.25rem',
          }}
        >
          Verify
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setShowBackup(!showBackup)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--d-accent)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.75rem',
              padding: 0,
            }}
          >
            {showBackup ? 'Use authenticator code' : 'Use backup code'}
          </button>
        </div>
      </form>
    </CenteredShell>
  );
}
