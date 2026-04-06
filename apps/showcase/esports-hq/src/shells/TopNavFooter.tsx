import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function TopNavFooter() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Top Nav */}
      <header style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        borderBottom: '1px solid var(--d-border)',
        position: 'sticky',
        top: 0,
        background: 'var(--d-bg)',
        zIndex: 40,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-text)' }}>
          <Trophy size={20} style={{ color: 'var(--d-primary)' }} />
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>Esports HQ</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <button
              className="d-interactive"
              data-variant="primary"
              onClick={() => navigate('/team')}
              style={{ fontSize: '0.8rem' }}
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                className="d-interactive"
                data-variant="ghost"
                onClick={() => navigate('/login')}
                style={{ fontSize: '0.8rem' }}
              >
                Sign In
              </button>
              <button
                className="d-interactive"
                data-variant="primary"
                onClick={() => navigate('/register')}
                style={{ fontSize: '0.8rem' }}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--d-border)',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: 'var(--d-text-muted)',
      }}>
        <span>Esports HQ -- Decantr Showcase</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Home</Link>
          <Link to="/login" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
