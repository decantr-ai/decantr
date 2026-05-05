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
        className="d-surface"
        style={{
          width: '100%',
          maxWidth: '28rem',
          borderRadius: 'var(--d-radius-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: 'var(--d-primary)',
              letterSpacing: '0.05em',
              textDecoration: 'none',
            }}
          >
            <span className="studio-glow-cyan">&#9835;</span> PRODUCER STUDIO
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
