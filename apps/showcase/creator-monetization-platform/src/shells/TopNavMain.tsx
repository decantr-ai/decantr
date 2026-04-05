import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Palette, Search, LogOut, Library } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? 'var(--d-primary)' : 'var(--d-text-muted)',
  fontWeight: isActive ? 600 : 500,
  textDecoration: 'none',
  fontSize: '0.875rem',
  fontFamily: 'system-ui, sans-serif',
});

export function TopNavMain() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className={css('_flex _col studio-canvas')} style={{ minHeight: '100vh' }}>
      <header
        className={css('_flex _aic _jcsb _shrink0')}
        style={{
          height: 56,
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}
      >
        <Link to="/library" className={css('_flex _aic _gap2')} style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
          <Palette size={20} style={{ color: 'var(--d-primary)' }} />
          <span className="serif-display" style={{ fontSize: '1.25rem' }}>Canvas</span>
        </Link>

        <nav className={css('_flex _aic _gap6') + ' nav-desktop'}>
          <NavLink to="/library" style={linkStyle} end>Library</NavLink>
          <NavLink to="/library/subscriptions" style={linkStyle}>Subscriptions</NavLink>
          <NavLink to="/creator/mayaink" style={linkStyle}>Discover</NavLink>
          <NavLink to="/settings/profile" style={linkStyle}>Settings</NavLink>
        </nav>

        <div className={css('_flex _aic _gap2')}>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem' }} aria-label="Search">
            <Search size={16} />
          </button>
          <Link to="/dashboard" className="d-interactive" data-variant="ghost"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>
            <Library size={14} /> Dashboard
          </Link>
          <button className="d-interactive" data-variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '0.375rem' }} aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="entrance-fade" style={{ flex: 1, padding: '1.5rem', maxWidth: 1280, width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>

      <style>{`@media (max-width: 767px) { .nav-desktop { display: none !important; } }`}</style>
    </div>
  );
}
