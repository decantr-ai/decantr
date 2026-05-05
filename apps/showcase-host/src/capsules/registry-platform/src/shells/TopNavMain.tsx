import { Outlet, NavLink, useNavigate } from 'react-router-dom';

interface Props {
  onThemeToggle: () => void;
  themeMode: 'dark' | 'light';
  isAuthenticated: boolean;
  onLogout: () => void;
}

export default function TopNavMain({ onThemeToggle, themeMode, isAuthenticated, onLogout }: Props) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header — 52px sticky nav */}
      <header
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          flexShrink: 0,
        }}
      >
        {/* Left: Brand */}
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="lum-brand" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--d-text)' }}>
            decantr<span className="brand-dot">.</span>
          </span>
        </NavLink>

        {/* Center: Nav links */}
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <NavLink to="/" end style={navLinkStyle}>Home</NavLink>
          <NavLink to="/browse" style={navLinkStyle}>Browse</NavLink>
          {isAuthenticated && <NavLink to="/dashboard" style={navLinkStyle}>Dashboard</NavLink>}
        </nav>

        {/* Right: Theme toggle + auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onThemeToggle}
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.375rem 0.5rem', fontSize: '0.875rem', border: 'none' }}
            aria-label="Toggle theme"
          >
            {themeMode === 'dark' ? '☀️' : '🌙'}
          </button>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="d-interactive"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                data-variant="ghost"
              >
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', background: 'var(--d-primary)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6875rem', color: '#fff', fontWeight: 600,
                }}>YO</span>
              </button>
              <button
                onClick={onLogout}
                className="d-interactive"
                data-variant="ghost"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="d-interactive"
              data-variant="primary"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* Body — scrollable main content */}
      <main
        className="lum-canvas"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          position: 'relative',
        }}
      >
        <div className="entrance-fade" style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function navLinkStyle({ isActive }: { isActive: boolean }) {
  return {
    fontSize: '0.875rem',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? 'var(--d-primary)' : 'var(--d-text-muted)',
    textDecoration: isActive ? 'none' : 'none',
    borderBottom: isActive ? '2px solid var(--d-primary)' : '2px solid transparent',
    paddingBottom: '2px',
    transition: 'color 0.15s ease, border-color 0.15s ease',
  };
}
