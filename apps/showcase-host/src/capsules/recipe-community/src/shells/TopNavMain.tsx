import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { ChefHat, Search, LogOut, Plus } from 'lucide-react';
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
    <div className={css('_flex _col')} style={{ height: '100vh' }}>
      <header
        className={css('_flex _aic _jcsb _shrink0')}
        style={{
          height: 52,
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
          position: 'sticky', top: 0, zIndex: 10,
        }}
      >
        <Link to="/recipes" className={css('_flex _aic _gap2')} style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
          <ChefHat size={20} style={{ color: 'var(--d-primary)' }} />
          <span className="serif-display" style={{ fontSize: '1.125rem' }}>Gather</span>
        </Link>

        <nav className={css('_flex _aic _gap6') + ' nav-desktop'}>
          <NavLink to="/recipes" style={linkStyle}>Recipes</NavLink>
          <NavLink to="/feed" style={linkStyle}>Feed</NavLink>
          <NavLink to="/collections" style={linkStyle}>Collections</NavLink>
          <NavLink to="/my-recipes" style={linkStyle}>My Kitchen</NavLink>
        </nav>

        <div className={css('_flex _aic _gap2')}>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem' }} aria-label="Search">
            <Search size={16} />
          </button>
          <Link to="/recipes/create" className="d-interactive" data-variant="primary"
            style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>
            <Plus size={14} /> New
          </Link>
          <button className="d-interactive" data-variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            style={{ padding: '0.375rem' }} aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className={css('_flex _col _gap4')} style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <Outlet />
      </main>

      <style>{`@media (max-width: 767px) { .nav-desktop { display: none !important; } }`}</style>
    </div>
  );
}
