import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
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
          RECOVER ACCESS
        </h1>

        {sent ? (
          <div
            className="d-annotation"
            data-status="success"
            style={{
              padding: '0.75rem',
              border: '1px solid var(--d-primary)',
              fontSize: '0.8125rem',
              color: 'var(--d-primary)',
              textAlign: 'center',
            }}
          >
            Reset code sent to terminal. Check your inbox.
          </div>
        ) : (
          <>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--d-text-muted)',
                margin: 0,
                textAlign: 'center',
              }}
            >
              Enter your email to receive a reset code.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label
                className="d-label"
                htmlFor="forgot-email"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--d-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Email
              </label>
              <input
                id="forgot-email"
                className="d-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@terminal.dev"
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
              Send Reset Code
            </button>
          </>
        )}

        <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
          <Link to="/login" style={{ color: 'var(--d-accent)' }}>
            Back to login
          </Link>
        </div>
      </form>
    </CenteredShell>
  );
}
