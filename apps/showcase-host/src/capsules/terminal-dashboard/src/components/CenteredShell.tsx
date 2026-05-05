import { Link } from 'react-router-dom';

export function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 48px)',
        background: 'var(--d-bg)',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '28rem',
          padding: '1.5rem',
          border: '1px solid var(--d-border)',
          borderRadius: 0,
          background: 'var(--d-surface)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <Link
            to="/"
            style={{
              fontWeight: 700,
              fontSize: '0.875rem',
              color: 'var(--d-primary)',
              letterSpacing: '0.08em',
            }}
          >
            <span className="term-glow">TERMINAL</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
